from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from bson import ObjectId
from passlib.context import CryptContext
from jose import JWTError, jwt
import re

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'kinesio_crm')]

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET', 'kinesio-crm-super-secret-key-2024')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Create the main app
app = FastAPI(title="KinesioCRM API")

# Create router with /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== HELPER FUNCTIONS ====================

def serialize_doc(doc):
    """Convert MongoDB document to JSON-serializable dict"""
    if doc is None:
        return None
    if isinstance(doc, list):
        return [serialize_doc(d) for d in doc]
    if isinstance(doc, dict):
        result = {}
        for key, value in doc.items():
            if key == '_id':
                result['id'] = str(value)
            elif isinstance(value, ObjectId):
                result[key] = str(value)
            elif isinstance(value, datetime):
                result[key] = value.isoformat()
            elif isinstance(value, dict):
                result[key] = serialize_doc(value)
            elif isinstance(value, list):
                result[key] = [serialize_doc(v) if isinstance(v, dict) else v for v in value]
            else:
                result[key] = value
        return result
    return doc

def format_client_name(client):
    """Format client name with optional middle name"""
    parts = [client.get('first_name', '')]
    if client.get('middle_name'):
        parts.append(client['middle_name'])
    parts.append(client.get('last_name', ''))
    return ' '.join(parts)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"email": email})
    if user is None:
        raise credentials_exception
    return serialize_doc(user)

# ==================== PYDANTIC MODELS ====================

# Auth Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: str
    email: str
    created_at: str

# Client Models
class ClientCreate(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    middle_name: Optional[str] = Field(None, max_length=100)  # Отчество
    last_name: str = Field(..., min_length=1, max_length=100)
    dob: str  # ISO date string YYYY-MM-DD

class ClientUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    middle_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    dob: Optional[str] = None

# Visit Models
DEFAULT_PRICE = 15000  # Default price in rubles
AVAILABLE_PRACTICES = ["Коррекция", "ТСЯ", "Лепило"]  # Available practices

class VisitCreate(BaseModel):
    date: str  # ISO date string YYYY-MM-DD
    topic: str = Field(..., min_length=1, max_length=200)
    practices: List[str] = Field(default=[])  # Selected practices
    notes: Optional[str] = Field(None, max_length=5000)
    price: int = Field(default=DEFAULT_PRICE, ge=0)  # Price in rubles
    tips: int = Field(default=0, ge=0)  # Tips in rubles

class VisitUpdate(BaseModel):
    date: Optional[str] = None
    topic: Optional[str] = Field(None, min_length=1, max_length=200)
    practices: Optional[List[str]] = None
    notes: Optional[str] = Field(None, max_length=5000)
    price: Optional[int] = Field(None, ge=0)
    tips: Optional[int] = Field(None, ge=0)

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if any user exists (only allow first registration)
    existing_user = await db.users.find_one({})
    if existing_user:
        raise HTTPException(status_code=400, detail="Admin user already exists. Registration disabled.")
    
    # Check if email already exists
    if await db.users.find_one({"email": user_data.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_doc = {
        "email": user_data.email,
        "password_hash": get_password_hash(user_data.password),
        "created_at": datetime.now(timezone.utc)
    }
    result = await db.users.insert_one(user_doc)
    
    # Create and return token
    access_token = create_access_token(data={"sub": user_data.email})
    return Token(access_token=access_token)

@api_router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": user_data.email})
    return Token(access_token=access_token)

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        created_at=current_user["created_at"]
    )

# ==================== CLIENT ROUTES ====================

@api_router.get("/clients")
async def get_clients(
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    sort_by: str = "last_name",
    sort_order: str = "asc",
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if search:
        # Case-insensitive search on first_name or last_name
        search_regex = {"$regex": search, "$options": "i"}
        query["$or"] = [
            {"first_name": search_regex},
            {"last_name": search_regex}
        ]
    
    # Sorting
    sort_direction = 1 if sort_order == "asc" else -1
    
    # Get total count
    total = await db.clients.count_documents(query)
    
    # Get paginated results
    skip = (page - 1) * page_size
    cursor = db.clients.find(query).sort(sort_by, sort_direction).skip(skip).limit(page_size)
    clients = await cursor.to_list(length=page_size)
    
    return {
        "clients": serialize_doc(clients),
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }

@api_router.post("/clients")
async def create_client(
    client_data: ClientCreate,
    current_user: dict = Depends(get_current_user)
):
    client_doc = {
        "first_name": client_data.first_name,
        "middle_name": client_data.middle_name or "",
        "last_name": client_data.last_name,
        "dob": client_data.dob,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    result = await db.clients.insert_one(client_doc)
    client_doc["_id"] = result.inserted_id
    return serialize_doc(client_doc)

@api_router.get("/clients/{client_id}")
async def get_client(
    client_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        client = await db.clients.find_one({"_id": ObjectId(client_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid client ID format")
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Get visit count for this client
    visit_count = await db.visits.count_documents({"client_id": client_id})
    client_data = serialize_doc(client)
    client_data["visit_count"] = visit_count
    
    return client_data

@api_router.put("/clients/{client_id}")
async def update_client(
    client_id: str,
    client_data: ClientUpdate,
    current_user: dict = Depends(get_current_user)
):
    try:
        client = await db.clients.find_one({"_id": ObjectId(client_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid client ID format")
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    update_data = {k: v for k, v in client_data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    await db.clients.update_one(
        {"_id": ObjectId(client_id)},
        {"$set": update_data}
    )
    
    updated_client = await db.clients.find_one({"_id": ObjectId(client_id)})
    return serialize_doc(updated_client)

@api_router.delete("/clients/{client_id}")
async def delete_client(
    client_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        client = await db.clients.find_one({"_id": ObjectId(client_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid client ID format")
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Delete all visits for this client
    await db.visits.delete_many({"client_id": client_id})
    
    # Delete the client
    await db.clients.delete_one({"_id": ObjectId(client_id)})
    
    return {"message": "Client and all visits deleted successfully"}

# ==================== VISIT ROUTES ====================

@api_router.get("/clients/{client_id}/visits")
async def get_client_visits(
    client_id: str,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    topic: Optional[str] = None,
    page: int = 1,
    page_size: int = 50,
    current_user: dict = Depends(get_current_user)
):
    # Verify client exists
    try:
        client = await db.clients.find_one({"_id": ObjectId(client_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid client ID format")
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    query = {"client_id": client_id}
    
    if date_from or date_to:
        date_filter = {}
        if date_from:
            date_filter["$gte"] = date_from
        if date_to:
            date_filter["$lte"] = date_to
        query["date"] = date_filter
    
    if topic:
        query["topic"] = {"$regex": topic, "$options": "i"}
    
    total = await db.visits.count_documents(query)
    skip = (page - 1) * page_size
    
    cursor = db.visits.find(query).sort("date", -1).skip(skip).limit(page_size)
    visits = await cursor.to_list(length=page_size)
    
    return {
        "visits": serialize_doc(visits),
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }

@api_router.post("/clients/{client_id}/visits")
async def create_visit(
    client_id: str,
    visit_data: VisitCreate,
    current_user: dict = Depends(get_current_user)
):
    # Verify client exists
    try:
        client = await db.clients.find_one({"_id": ObjectId(client_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid client ID format")
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    visit_doc = {
        "client_id": client_id,
        "date": visit_data.date,
        "topic": visit_data.topic,
        "practices": visit_data.practices or [],
        "notes": visit_data.notes or "",
        "price": visit_data.price,
        "tips": visit_data.tips,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    result = await db.visits.insert_one(visit_doc)
    visit_doc["_id"] = result.inserted_id
    return serialize_doc(visit_doc)

@api_router.put("/visits/{visit_id}")
async def update_visit(
    visit_id: str,
    visit_data: VisitUpdate,
    current_user: dict = Depends(get_current_user)
):
    try:
        visit = await db.visits.find_one({"_id": ObjectId(visit_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid visit ID format")
    
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    
    update_data = {k: v for k, v in visit_data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    await db.visits.update_one(
        {"_id": ObjectId(visit_id)},
        {"$set": update_data}
    )
    
    updated_visit = await db.visits.find_one({"_id": ObjectId(visit_id)})
    return serialize_doc(updated_visit)

@api_router.delete("/visits/{visit_id}")
async def delete_visit(
    visit_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        visit = await db.visits.find_one({"_id": ObjectId(visit_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid visit ID format")
    
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    
    await db.visits.delete_one({"_id": ObjectId(visit_id)})
    return {"message": "Visit deleted successfully"}

# ==================== STATISTICS ROUTES ====================

@api_router.get("/stats/overview")
async def get_stats_overview(
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    # Total clients
    total_clients = await db.clients.count_documents({})
    
    # Get current year
    now = datetime.now(timezone.utc)
    year_start = f"{now.year}-01-01"
    
    # Visits YTD
    visits_ytd = await db.visits.count_documents({"date": {"$gte": year_start}})
    
    # Visits last 30 days
    thirty_days_ago = (now - timedelta(days=30)).strftime("%Y-%m-%d")
    visits_last_30 = await db.visits.count_documents({"date": {"$gte": thirty_days_ago}})
    
    # Top topics (all time)
    pipeline = [
        {"$group": {"_id": "$topic", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]
    top_topics_cursor = db.visits.aggregate(pipeline)
    top_topics = await top_topics_cursor.to_list(length=5)
    top_topics = [{"topic": t["_id"], "count": t["count"]} for t in top_topics]
    
    # Recent visits
    recent_visits_cursor = db.visits.find().sort("date", -1).limit(10)
    recent_visits = await recent_visits_cursor.to_list(length=10)
    
    # Enrich with client names
    enriched_visits = []
    for visit in recent_visits:
        try:
            client = await db.clients.find_one({"_id": ObjectId(visit["client_id"])})
            visit_data = serialize_doc(visit)
            if client:
                visit_data["client_name"] = format_client_name(client)
            enriched_visits.append(visit_data)
        except:
            pass
    
    # Visits over time (last 12 months)
    visits_over_time = []
    for i in range(11, -1, -1):
        month_date = now - timedelta(days=30 * i)
        month_start = month_date.replace(day=1).strftime("%Y-%m-%d")
        if month_date.month == 12:
            next_month_start = month_date.replace(year=month_date.year + 1, month=1, day=1).strftime("%Y-%m-%d")
        else:
            next_month_start = month_date.replace(month=month_date.month + 1, day=1).strftime("%Y-%m-%d")
        
        count = await db.visits.count_documents({
            "date": {"$gte": month_start, "$lt": next_month_start}
        })
        visits_over_time.append({
            "label": month_date.strftime("%b %Y"),
            "visits": count
        })
    
    return {
        "total_clients": total_clients,
        "visits_ytd": visits_ytd,
        "visits_last_30": visits_last_30,
        "top_topics": top_topics,
        "recent_visits": enriched_visits,
        "visits_over_time": visits_over_time,
        "financial": await get_financial_stats_ytd(),
        "practices": await get_practice_stats_ytd()
    }

async def get_practice_stats_ytd():
    """Get practice statistics for current year"""
    now = datetime.now(timezone.utc)
    year_start = f"{now.year}-01-01"
    
    # Count practices YTD
    pipeline = [
        {"$match": {"date": {"$gte": year_start}}},
        {"$unwind": {"path": "$practices", "preserveNullAndEmptyArrays": False}},
        {"$group": {"_id": "$practices", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    result = await db.visits.aggregate(pipeline).to_list(10)
    
    return [{"practice": p["_id"], "count": p["count"]} for p in result]

async def get_financial_stats_ytd():
    """Get financial statistics for current year"""
    now = datetime.now(timezone.utc)
    year_start = f"{now.year}-01-01"
    thirty_days_ago = (now - timedelta(days=30)).strftime("%Y-%m-%d")
    
    # Revenue YTD
    pipeline_ytd = [
        {"$match": {"date": {"$gte": year_start}}},
        {"$group": {
            "_id": None,
            "total_revenue": {"$sum": {"$ifNull": ["$price", 15000]}},
            "total_tips": {"$sum": {"$ifNull": ["$tips", 0]}},
            "count": {"$sum": 1}
        }}
    ]
    result_ytd = await db.visits.aggregate(pipeline_ytd).to_list(1)
    ytd_data = result_ytd[0] if result_ytd else {"total_revenue": 0, "total_tips": 0, "count": 0}
    
    # Revenue last 30 days
    pipeline_30 = [
        {"$match": {"date": {"$gte": thirty_days_ago}}},
        {"$group": {
            "_id": None,
            "total_revenue": {"$sum": {"$ifNull": ["$price", 15000]}},
            "total_tips": {"$sum": {"$ifNull": ["$tips", 0]}},
            "count": {"$sum": 1}
        }}
    ]
    result_30 = await db.visits.aggregate(pipeline_30).to_list(1)
    last_30_data = result_30[0] if result_30 else {"total_revenue": 0, "total_tips": 0, "count": 0}
    
    avg_check_ytd = ytd_data["total_revenue"] / ytd_data["count"] if ytd_data["count"] > 0 else 0
    
    return {
        "revenue_ytd": ytd_data["total_revenue"],
        "tips_ytd": ytd_data["total_tips"],
        "revenue_last_30": last_30_data["total_revenue"],
        "tips_last_30": last_30_data["total_tips"],
        "avg_check": round(avg_check_ytd)
    }

@api_router.get("/stats/client/{client_id}")
async def get_client_stats(
    client_id: str,
    year: Optional[int] = None,
    current_user: dict = Depends(get_current_user)
):
    # Verify client exists
    try:
        client = await db.clients.find_one({"_id": ObjectId(client_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid client ID format")
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    query = {"client_id": client_id}
    if year:
        query["date"] = {"$gte": f"{year}-01-01", "$lte": f"{year}-12-31"}
    
    # Total visits
    total_visits = await db.visits.count_documents(query)
    
    # Topics breakdown
    pipeline = [
        {"$match": query},
        {"$group": {"_id": "$topic", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    topics_cursor = db.visits.aggregate(pipeline)
    topics = await topics_cursor.to_list(length=100)
    topics = [{"topic": t["_id"], "count": t["count"]} for t in topics]
    
    # Visits by month for the year
    visits_by_month = []
    target_year = year or datetime.now(timezone.utc).year
    for month in range(1, 13):
        month_start = f"{target_year}-{month:02d}-01"
        if month == 12:
            month_end = f"{target_year + 1}-01-01"
        else:
            month_end = f"{target_year}-{month + 1:02d}-01"
        
        count = await db.visits.count_documents({
            "client_id": client_id,
            "date": {"$gte": month_start, "$lt": month_end}
        })
        visits_by_month.append({
            "month": datetime(target_year, month, 1).strftime("%b"),
            "visits": count
        })
    
    return {
        "client": serialize_doc(client),
        "total_visits": total_visits,
        "topics": topics,
        "visits_by_month": visits_by_month,
        "year": target_year
    }

@api_router.get("/stats/topics")
async def get_topics_stats(
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if date_from or date_to:
        date_filter = {}
        if date_from:
            date_filter["$gte"] = date_from
        if date_to:
            date_filter["$lte"] = date_to
        query["date"] = date_filter
    
    pipeline = [
        {"$match": query} if query else {"$match": {}},
        {"$group": {"_id": "$topic", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    
    topics_cursor = db.visits.aggregate(pipeline)
    topics = await topics_cursor.to_list(length=100)
    
    return {
        "topics": [{"topic": t["_id"], "count": t["count"]} for t in topics],
        "total_visits": sum(t["count"] for t in topics)
    }

@api_router.get("/stats/yearly-summary")
async def get_yearly_summary(
    year: int,
    current_user: dict = Depends(get_current_user)
):
    """Get year-end summary with per-client stats"""
    date_from = f"{year}-01-01"
    date_to = f"{year}-12-31"
    
    # Get all clients with visit counts for the year
    clients = await db.clients.find().to_list(length=1000)
    client_summaries = []
    
    for client in clients:
        client_id = str(client["_id"])
        
        # Get visits with financial data for year
        pipeline = [
            {"$match": {
                "client_id": client_id,
                "date": {"$gte": date_from, "$lte": date_to}
            }},
            {"$group": {
                "_id": None,
                "visit_count": {"$sum": 1},
                "total_revenue": {"$sum": {"$ifNull": ["$price", 15000]}},
                "total_tips": {"$sum": {"$ifNull": ["$tips", 0]}}
            }}
        ]
        result = await db.visits.aggregate(pipeline).to_list(1)
        
        if result and result[0]["visit_count"] > 0:
            visit_data = result[0]
            
            # Topics for this client this year
            topics_pipeline = [
                {"$match": {
                    "client_id": client_id,
                    "date": {"$gte": date_from, "$lte": date_to}
                }},
                {"$group": {"_id": "$topic", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}}
            ]
            topics_cursor = db.visits.aggregate(topics_pipeline)
            topics = await topics_cursor.to_list(length=100)
            
            client_summaries.append({
                "client_id": client_id,
                "client_name": format_client_name(client),
                "visit_count": visit_data["visit_count"],
                "total_revenue": visit_data["total_revenue"],
                "total_tips": visit_data["total_tips"],
                "topics": [{"topic": t["_id"], "count": t["count"]} for t in topics]
            })
    
    # Sort by visit count
    client_summaries.sort(key=lambda x: x["visit_count"], reverse=True)
    
    # Overall stats
    total_visits = sum(c["visit_count"] for c in client_summaries)
    total_revenue = sum(c["total_revenue"] for c in client_summaries)
    total_tips = sum(c["total_tips"] for c in client_summaries)
    avg_check = total_revenue / total_visits if total_visits > 0 else 0
    
    # All topics for year
    pipeline = [
        {"$match": {"date": {"$gte": date_from, "$lte": date_to}}},
        {"$group": {"_id": "$topic", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    topics_cursor = db.visits.aggregate(pipeline)
    all_topics = await topics_cursor.to_list(length=100)
    
    return {
        "year": year,
        "total_clients_active": len(client_summaries),
        "total_visits": total_visits,
        "total_revenue": total_revenue,
        "total_tips": total_tips,
        "avg_check": round(avg_check),
        "client_summaries": client_summaries,
        "topic_distribution": [{"topic": t["_id"], "count": t["count"]} for t in all_topics]
    }

@api_router.get("/topics")
async def get_all_topics(current_user: dict = Depends(get_current_user)):
    """Get all unique topics for filtering"""
    pipeline = [
        {"$group": {"_id": "$topic"}},
        {"$sort": {"_id": 1}}
    ]
    topics_cursor = db.visits.aggregate(pipeline)
    topics = await topics_cursor.to_list(length=500)
    return {"topics": [t["_id"] for t in topics if t["_id"]]}

# Health check
@api_router.get("/health")
async def health_check():
    return {"status": "healthy"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    # Create indexes
    await db.clients.create_index([("last_name", 1), ("first_name", 1)])
    await db.clients.create_index([("first_name", 1)])
    await db.visits.create_index([("client_id", 1), ("date", -1)])
    await db.visits.create_index([("topic", 1)])
    await db.visits.create_index([("date", 1)])
    await db.users.create_index([("email", 1)], unique=True)
    logger.info("Database indexes created")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
