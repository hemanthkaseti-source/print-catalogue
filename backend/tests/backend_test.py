"""Backend API tests for Sree Bloomy Graphics."""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://bloomy-catalogue.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---- Enquiries ----
class TestEnquiries:
    def test_create_valid(self, client):
        payload = {
            "name": "TEST User",
            "company": "TEST Corp",
            "email": "test@example.com",
            "phone": "+91 99999",
            "country": "IN",
            "application": "labels",
            "message": "Please share catalogue"
        }
        r = client.post(f"{API}/enquiries", json=payload)
        assert r.status_code == 201, r.text
        data = r.json()
        assert isinstance(data.get("id"), str) and len(data["id"]) > 0
        assert data["email"] == payload["email"]
        assert data["name"] == payload["name"]
        assert "created_at" in data
        pytest.enquiry_id = data["id"]

    def test_get_by_id(self, client):
        r = client.get(f"{API}/enquiries/{pytest.enquiry_id}")
        assert r.status_code == 200
        assert r.json()["id"] == pytest.enquiry_id

    def test_list_newest_first(self, client):
        r = client.get(f"{API}/enquiries")
        assert r.status_code == 200
        arr = r.json()
        assert isinstance(arr, list) and len(arr) >= 1
        # newest first: created_at descending
        if len(arr) >= 2:
            assert arr[0]["created_at"] >= arr[1]["created_at"]

    def test_invalid_email_422(self, client):
        r = client.post(f"{API}/enquiries", json={
            "name": "TEST", "company": "TEST Corp",
            "email": "not-an-email", "message": "Please share more"
        })
        assert r.status_code == 422

    def test_short_message_422(self, client):
        r = client.post(f"{API}/enquiries", json={
            "name": "TEST", "company": "TEST Corp",
            "email": "test2@example.com", "message": "hi"
        })
        assert r.status_code == 422

    def test_get_badid_404(self, client):
        r = client.get(f"{API}/enquiries/badid")
        assert r.status_code == 404


# ---- Analytics ----
class TestAnalytics:
    def test_track_event(self, client):
        r = client.post(f"{API}/analytics/events", json={"event": "pdf_download", "meta": {"path": "/"}})
        assert r.status_code == 201
        d = r.json()
        assert d["event"] == "pdf_download"
        assert isinstance(d.get("id"), str)

    def test_summary(self, client):
        r = client.get(f"{API}/analytics/summary")
        assert r.status_code == 200
        d = r.json()
        assert "events" in d and isinstance(d["events"], dict)
        assert "enquiries" in d and isinstance(d["enquiries"], int)
        assert d["events"].get("pdf_download", 0) >= 1
