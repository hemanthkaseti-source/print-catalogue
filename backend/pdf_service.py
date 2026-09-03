import asyncio
import io
import os
import time
from pathlib import Path
import pymupdf
from PIL import Image
from playwright.async_api import async_playwright

PDF_PATH = Path(os.environ.get("PDF_CACHE_PATH", "/tmp/sbg-catalogue.pdf"))
PDF_TTL_SECONDS = int(os.environ.get("PDF_TTL_SECONDS", "21600"))
_lock = asyncio.Lock()

SCROLL_SCRIPT = """
async () => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const step = Math.max(400, Math.floor(window.innerHeight * 0.7));
  const total = document.documentElement.scrollHeight;
  for (let y = 0; y <= total; y += step) { window.scrollTo(0, y); await sleep(140); }
  window.scrollTo(0, total); await sleep(600);
  window.scrollTo(0, 0); await sleep(400);
}
"""


def cache_is_fresh() -> bool:
    return PDF_PATH.exists() and (time.time() - PDF_PATH.stat().st_mtime) < PDF_TTL_SECONDS


async def render_catalogue_pdf(url: str, force: bool = False) -> Path:
    async with _lock:
        if cache_is_fresh() and not force:
            return PDF_PATH
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                executable_path=os.environ.get("CHROME_PATH") or None,
                args=["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
            )
            page = await browser.new_page(viewport={"width": 1701, "height": 1203}, device_scale_factor=1)
            await page.goto(url, wait_until="load", timeout=90000)
            await page.wait_for_function(
                "() => Array.from(document.images).every(i => i.complete) && (!document.fonts || document.fonts.status === 'loaded')",
                timeout=45000,
            )
            await page.wait_for_timeout(1200)
            await page.evaluate(SCROLL_SCRIPT)
            await page.wait_for_timeout(1500)
            tmp = PDF_PATH.with_suffix(".tmp.pdf")
            await page.pdf(
                path=str(tmp),
                prefer_css_page_size=True,
                print_background=True,
                scale=0.66,
                margin={"top": "0", "right": "0", "bottom": "0", "left": "0"},
            )
            await browser.close()
        compress_pdf(tmp)
        tmp.replace(PDF_PATH)
        return PDF_PATH


def compress_pdf(path: Path, max_width: int = 1100, quality: int = 72) -> None:
    doc = pymupdf.open(str(path))
    seen = set()
    for page in doc:
        for info in page.get_images(full=True):
            xref = info[0]
            if xref in seen:
                continue
            seen.add(xref)
            base = doc.extract_image(xref)
            if not base or base.get("ext") not in ("jpeg", "jpg", "png", "jpx"):
                continue
            im = Image.open(io.BytesIO(base["image"])).convert("RGB")
            if im.width > max_width:
                im = im.resize((max_width, int(im.height * max_width / im.width)), Image.LANCZOS)
            buf = io.BytesIO()
            im.save(buf, "JPEG", quality=quality, optimize=True, progressive=True)
            page.replace_image(xref, stream=buf.getvalue())
    out = path.with_suffix(".min.pdf")
    doc.save(str(out), garbage=3, deflate=True)
    doc.close()
    out.replace(path)
