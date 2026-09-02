from fastapi import FastAPI, APIRouter, HTTPException, Request
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr, BeforeValidator
from typing import List, Optional, Annotated, Any
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from pdf_service import render_catalogue_pdf  # noqa: E402

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Sree Bloomy Graphics API")
api_router = APIRouter(prefix="/api")

PyObjectId = Annotated[str, BeforeValidator(lambda v: str(v) if isinstance(v, ObjectId) else v)]


class BaseDocument(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")
    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    def to_mongo(self) -> dict:
        data = self.model_dump(by_alias=True, exclude_none=True)
        data.pop("_id", None)
        return data

    @classmethod
    def from_mongo(cls, doc: dict):
        return cls.model_validate(doc)


class EnquiryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    company: str = Field(min_length=2, max_length=160)
    email: EmailStr
    phone: Optional[str] = Field(default=None, max_length=40)
    country: Optional[str] = Field(default=None, max_length=80)
    application: Optional[str] = Field(default=None, max_length=80)
    message: str = Field(min_length=5, max_length=3000)
    source: str = "web-catalogue"


class Enquiry(BaseDocument, EnquiryCreate):
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    status: str = "new"


class EventCreate(BaseModel):
    event: str = Field(min_length=2, max_length=60)
    meta: dict[str, Any] = Field(default_factory=dict)


class Event(BaseDocument, EventCreate):
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


@api_router.get("/")
async def root():
    return {"service": "Sree Bloomy Graphics Pvt. Ltd.", "status": "ok"}


@api_router.post("/enquiries", response_model=Enquiry, status_code=201, response_model_by_alias=False)
async def create_enquiry(payload: EnquiryCreate):
    enquiry = Enquiry(**payload.model_dump())
    result = await db.enquiries.insert_one(enquiry.to_mongo())
    enquiry.id = str(result.inserted_id)
    return enquiry


@api_router.get("/enquiries", response_model=List[Enquiry], response_model_by_alias=False)
async def list_enquiries(limit: int = 100):
    docs = await db.enquiries.find().sort("created_at", -1).to_list(min(limit, 500))
    return [Enquiry.from_mongo(d) for d in docs]


@api_router.get("/enquiries/{enquiry_id}", response_model=Enquiry, response_model_by_alias=False)
async def get_enquiry(enquiry_id: str):
    if not ObjectId.is_valid(enquiry_id):
        raise HTTPException(status_code=404, detail="Enquiry not found")
    doc = await db.enquiries.find_one({"_id": ObjectId(enquiry_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return Enquiry.from_mongo(doc)


@api_router.post("/analytics/events", response_model=Event, status_code=201, response_model_by_alias=False)
async def track_event(payload: EventCreate):
    event = Event(**payload.model_dump())
    result = await db.events.insert_one(event.to_mongo())
    event.id = str(result.inserted_id)
    return event


@api_router.get("/analytics/summary")
async def analytics_summary():
    pipeline = [{"$group": {"_id": "$event", "count": {"$sum": 1}}}]
    rows = await db.events.aggregate(pipeline).to_list(100)
    enquiries = await db.enquiries.count_documents({})
    return {"events": {r["_id"]: r["count"] for r in rows}, "enquiries": enquiries}


@api_router.get("/catalogue.pdf")
async def catalogue_pdf(request: Request, refresh: int = 0):
    base = os.environ.get("FRONTEND_URL") or request.headers.get("origin")
    if not base:
        raise HTTPException(status_code=500, detail="FRONTEND_URL not configured")
    try:
        path = await render_catalogue_pdf(base.rstrip("/"), force=bool(refresh))
    except Exception as exc:
        logger.exception("PDF render failed")
        raise HTTPException(status_code=502, detail=f"PDF generation failed: {exc}")
    return FileResponse(
        path,
        media_type="application/pdf",
        filename="Sree-Bloomy-Graphics-Catalogue.pdf",
        headers={"Cache-Control": "no-store"},
    )


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
