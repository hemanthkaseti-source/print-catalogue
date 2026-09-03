"""Iteration 3 tests: PDF content assertions + enquiry alert graceful skip."""
import os
import time
import io
import pytest
import requests
import pymupdf

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def pdf_bytes():
    s = requests.Session()
    t0 = time.time()
    r = s.get(f"{API}/catalogue.pdf", params={"refresh": 1}, timeout=120)
    dt = time.time() - t0
    print(f"[pdf] refresh took {dt:.2f}s status={r.status_code} size={len(r.content)}")
    assert r.status_code == 200
    assert r.headers.get("Content-Type", "").startswith("application/pdf")
    return r.content


class TestCataloguePdfContent:
    def test_size_range(self, pdf_bytes):
        n = len(pdf_bytes)
        assert 1_000_000 <= n <= 4_000_000, f"PDF size out of range: {n}"

    def test_starts_with_pdf_header(self, pdf_bytes):
        assert pdf_bytes[:4] == b"%PDF"

    def test_page_count_is_17(self, pdf_bytes):
        doc = pymupdf.open(stream=pdf_bytes, filetype="pdf")
        try:
            assert doc.page_count == 17, f"expected 17 pages, got {doc.page_count}"
        finally:
            doc.close()

    def test_cover_page_text(self, pdf_bytes):
        doc = pymupdf.open(stream=pdf_bytes, filetype="pdf")
        try:
            text = doc[0].get_text()
        finally:
            doc.close()
        # CSS letter-spacing on eyebrow lines makes pymupdf emit spaced-out glyphs;
        # normalize by collapsing single-char gaps then lower-casing.
        norm = "".join(text.split()).lower()
        assert "precisionprepress" in norm, f"missing 'Precision Prepress'; head={text[:400]!r}"
        assert "companyprofile" in norm, f"missing 'Company profile'; head={text[:400]!r}"

    def test_contents_page_text(self, pdf_bytes):
        doc = pymupdf.open(stream=pdf_bytes, filetype="pdf")
        try:
            text = doc[1].get_text()
        finally:
            doc.close()
        norm = "".join(text.split()).lower()
        assert "whatsinside" in norm or ("what" in norm and "inside" in norm), f"missing 'What's inside'; head={text[:400]!r}"
        assert "kodakflexcelnx" in norm, f"missing 'Kodak Flexcel NX'; head={text[:400]!r}"


class TestEnquiryAlertSkip:
    def test_enquiry_created_and_alert_skipped(self):
        payload = {
            "name": "TEST Iter3 QA",
            "company": "TEST Iter3 Co",
            "email": "TEST_iter3@example.com",
            "phone": "+91-9999999999",
            "country": "India",
            "application": "Flexo prepress",
            "message": "iteration 3 alert-skip check",
            "source": "iter3-test",
        }
        r = requests.post(f"{API}/enquiries", json=payload, timeout=30)
        assert r.status_code == 201, f"status={r.status_code} body={r.text[:400]}"
        eid = r.json().get("id")
        assert eid, r.json()

        # verify GET returns it
        g = requests.get(f"{API}/enquiries/{eid}", timeout=30)
        # some backends only list -- accept either
        if g.status_code == 404:
            gl = requests.get(f"{API}/enquiries", timeout=30)
            assert gl.status_code == 200
            ids = [x.get("id") for x in gl.json()]
            assert eid in ids
        else:
            assert g.status_code == 200
            assert g.json().get("email") == payload["email"]

        # give BackgroundTask a moment to log
        time.sleep(2)
        log_path = "/var/log/supervisor/backend.err.log"
        assert os.path.exists(log_path), f"log missing: {log_path}"
        with open(log_path, "r", errors="ignore") as f:
            content = f.read()[-20000:]
        assert "Enquiry alert skipped" in content, "expected 'Enquiry alert skipped' warning in backend.err.log"
        # ensure no 500 crash in most recent tail from this test window
        assert "Enquiry alert failed" not in content[-5000:], "unexpected 'Enquiry alert failed' present"
