import asyncio
import html
import logging
import os
import resend

logger = logging.getLogger(__name__)


def _configured() -> bool:
    key = os.environ.get("RESEND_API_KEY")
    if key:
        resend.api_key = key
    return bool(key and os.environ.get("NOTIFY_EMAIL"))


def _row(label: str, value: str) -> str:
    return (
        f'<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#55555C;font-size:12px;text-transform:uppercase;letter-spacing:.08em;width:140px">{label}</td>'
        f'<td style="padding:8px 12px;border-bottom:1px solid #eee;color:#0E0E10;font-size:14px">{html.escape(value or "—")}</td></tr>'
    )


def build_enquiry_html(e: dict) -> str:
    rows = "".join([
        _row("Name", e.get("name", "")), _row("Company", e.get("company", "")), _row("Email", e.get("email", "")),
        _row("Phone", e.get("phone") or ""), _row("Country", e.get("country") or ""), _row("Application", e.get("application") or ""),
        _row("Source", e.get("source", "")), _row("Received", e.get("created_at", "")),
    ])
    message = html.escape(e.get("message", "")).replace("\n", "<br/>")
    return f"""
<table width="100%" cellpadding="0" cellspacing="0" style="font-family:Inter,Arial,sans-serif;background:#F9F8F5;padding:32px 0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e6e6e6">
<tr><td style="background:#0E0E10;color:#F9F8F5;padding:20px 24px;font-size:13px;letter-spacing:.14em;text-transform:uppercase">Sree Bloomy Graphics · New enquiry</td></tr>
<tr><td style="padding:24px"><table width="100%" cellpadding="0" cellspacing="0">{rows}</table>
<div style="margin-top:20px;color:#55555C;font-size:12px;text-transform:uppercase;letter-spacing:.08em">Message</div>
<div style="margin-top:8px;color:#0E0E10;font-size:15px;line-height:1.6">{message}</div>
<div style="margin-top:24px"><a href="mailto:{html.escape(e.get('email', ''))}" style="background:#0E0E10;color:#F9F8F5;padding:12px 18px;text-decoration:none;font-size:12px;letter-spacing:.14em;text-transform:uppercase">Reply to {html.escape(e.get('name', ''))}</a></div>
</td></tr></table></td></tr></table>"""


async def send_enquiry_alert(enquiry: dict) -> None:
    if not _configured():
        logger.warning("Enquiry alert skipped: RESEND_API_KEY / NOTIFY_EMAIL not configured")
        return
    params = {
        "from": os.environ.get("SENDER_EMAIL", "onboarding@resend.dev"),
        "to": [os.environ["NOTIFY_EMAIL"]],
        "reply_to": enquiry.get("email"),
        "subject": f"New enquiry — {enquiry.get('company')} ({enquiry.get('country') or 'country n/a'})",
        "html": build_enquiry_html(enquiry),
    }
    try:
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info("Enquiry alert sent: %s", result.get("id") if isinstance(result, dict) else result)
    except Exception as exc:
        logger.error("Enquiry alert failed: %s", exc)
