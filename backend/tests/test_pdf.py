"""Tests for GET /api/catalogue.pdf endpoint."""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://bloomy-catalogue.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    return s


class TestCataloguePdf:
    def test_first_call_generates_pdf(self, session):
        # Force refresh once to guarantee regeneration path is exercised
        t0 = time.time()
        r = session.get(f"{API}/catalogue.pdf", params={"refresh": 1}, timeout=120)
        dt = time.time() - t0
        assert r.status_code == 200, f"status={r.status_code} body={r.text[:400]}"
        assert r.headers.get("Content-Type", "").startswith("application/pdf")
        cd = r.headers.get("Content-Disposition", "")
        assert "attachment" in cd.lower()
        assert "Sree-Bloomy-Graphics-Catalogue.pdf" in cd
        body = r.content
        assert body[:4] == b"%PDF", f"body head={body[:16]!r}"
        assert len(body) > 1_000_000, f"PDF too small: {len(body)} bytes"
        print(f"[pdf] refresh generation took {dt:.2f}s size={len(body)/1024:.0f}KB")

    def test_second_call_uses_cache(self, session):
        t0 = time.time()
        r = session.get(f"{API}/catalogue.pdf", timeout=30)
        dt = time.time() - t0
        assert r.status_code == 200
        assert r.headers.get("Content-Type", "").startswith("application/pdf")
        assert r.content[:4] == b"%PDF"
        assert len(r.content) > 1_000_000
        print(f"[pdf] cached fetch took {dt:.2f}s")
        assert dt < 5.0, f"Cached fetch too slow: {dt:.2f}s"
