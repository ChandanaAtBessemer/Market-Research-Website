'''
# fastapi_wrapper.py - Enhanced wrapper to match Streamlit app functionality
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import tempfile
import os
import json
import hashlib
from datetime import datetime

# Import your EXISTING modules - no changes needed!
try:
    from openai_handler import get_vertical_submarkets
    from horizontal_handler import get_horizontal_submarkets  
    from global_metrics_agent import get_global_overview
    from metrics_agent import get_detailed_metrics
    from company_agent import get_top_companies
    from mergers_agent import get_mergers_table
    from web_search_agent import search_web_insights
    from compare_pdf_agent import compare_uploaded_pdfs
    from split_and_upload_chunks import split_and_upload_pdf_chunks
    from query_uploaded_chunks import query_chunks
    print("✅ All Python modules imported successfully!")
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure all your Python files are in the same folder as fastapi_wrapper.py")

app = FastAPI(title="Market Research Intelligence API", version="2.0.0")

# Enable CORS for React - VERY IMPORTANT!
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory storage (in production, you'd use a real database)
# This simulates the database functionality from your Streamlit app
memory_storage = {
    "market_cache": {},
    "pdf_history": {},
    "pdf_qa": {},
    "ma_searches": [],
    "analytics": [],
    "popular_markets": [
        {"market_name": "Electric Vehicles", "query_count": 45, "last_queried": "2024-01-15"},
        {"market_name": "AI Healthcare", "query_count": 32, "last_queried": "2024-01-14"},
        {"market_name": "Clean Energy", "query_count": 28, "last_queried": "2024-01-13"},
    ]
}

# Request models
class MarketRequest(BaseModel):
    market: str

class SubmarketRequest(BaseModel):
    submarket: str

class QueryRequest(BaseModel):
    query: str
    search_depth: Optional[str] = "standard"
    focus_area: Optional[str] = "general"

class DocumentQueryRequest(BaseModel):
    query: str
    file_chunks: List[dict]

class MARequest(BaseModel):
    market: str
    timeframe: str

class HistoryRequest(BaseModel):
    history_type: Optional[str] = "All"
    search_term: Optional[str] = ""
    limit: Optional[int] = 20

# Utility functions
def generate_cache_key(market: str, analysis_type: str) -> str:
    """Generate cache key for market analysis"""
    return hashlib.md5(f"{market}:{analysis_type}".encode()).hexdigest()

def log_analytics_event(event_type: str, data: dict):
    """Log analytics event"""
    memory_storage["analytics"].append({
        "event_type": event_type,
        "data": data,
        "timestamp": datetime.now().isoformat()
    })

# === BASIC ENDPOINTS ===
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "Enhanced backend is running!"}

@app.get("/api/dashboard/stats")
async def get_dashboard_stats():
    """Get dashboard statistics"""
    return {
        "success": True,
        "data": {
            "active_markets": len(memory_storage["market_cache"]),
            "companies_analyzed": 45800,
            "documents_processed": len(memory_storage["pdf_history"]), 
            "ma_deals_tracked": len(memory_storage["ma_searches"]),
            "db_size_mb": 12.5,
            "popular_markets": memory_storage["popular_markets"]
        }
    }

# === MARKET ANALYSIS ENDPOINTS ===
@app.post("/api/market/global-overview")
async def global_overview(request: MarketRequest):
    try:
        cache_key = generate_cache_key(request.market, "global")
        
        # Check cache first
        if cache_key in memory_storage["market_cache"]:
            cached_data = memory_storage["market_cache"][cache_key]
            cached_data["cached"] = True
            log_analytics_event("market_analysis_cached", {"market": request.market, "type": "global"})
            return {"success": True, "data": cached_data["data"], "cached": True}
        
        # Fresh analysis
        result = get_global_overview(request.market)
        
        # Cache the result
        memory_storage["market_cache"][cache_key] = {
            "data": result,
            "market": request.market,
            "type": "global",
            "timestamp": datetime.now().isoformat()
        }
        
        log_analytics_event("market_analysis", {"market": request.market, "type": "global"})
        return {"success": True, "data": result, "cached": False}
    except Exception as e:
        print(f"Error in global_overview: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/market/vertical-segments") 
async def vertical_segments(request: MarketRequest):
    try:
        cache_key = generate_cache_key(request.market, "vertical")
        
        # Check cache first
        if cache_key in memory_storage["market_cache"]:
            cached_data = memory_storage["market_cache"][cache_key]
            log_analytics_event("market_analysis_cached", {"market": request.market, "type": "vertical"})
            return {"success": True, "data": cached_data["data"], "cached": True}
        
        result = get_vertical_submarkets(request.market)
        
        # Cache the result
        memory_storage["market_cache"][cache_key] = {
            "data": result,
            "market": request.market,
            "type": "vertical",
            "timestamp": datetime.now().isoformat()
        }
        
        log_analytics_event("market_analysis", {"market": request.market, "type": "vertical"})
        return {"success": True, "data": result, "cached": False}
    except Exception as e:
        print(f"Error in vertical_segments: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/market/horizontal-markets")
async def horizontal_markets(request: MarketRequest):
    try:
        cache_key = generate_cache_key(request.market, "horizontal")
        
        if cache_key in memory_storage["market_cache"]:
            cached_data = memory_storage["market_cache"][cache_key]
            log_analytics_event("market_analysis_cached", {"market": request.market, "type": "horizontal"})
            return {"success": True, "data": cached_data["data"], "cached": True}
        
        result = get_horizontal_submarkets(request.market)
        
        memory_storage["market_cache"][cache_key] = {
            "data": result,
            "market": request.market,
            "type": "horizontal",
            "timestamp": datetime.now().isoformat()
        }
        
        log_analytics_event("market_analysis", {"market": request.market, "type": "horizontal"})
        return {"success": True, "data": result, "cached": False}
    except Exception as e:
        print(f"Error in horizontal_markets: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/market/detailed-metrics")
async def detailed_metrics(request: MarketRequest):
    try:
        result = get_detailed_metrics(request.market)
        log_analytics_event("detailed_metrics", {"market": request.market})
        return {"success": True, "data": result}
    except Exception as e:
        print(f"Error in detailed_metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# === COMPANY INTELLIGENCE ENDPOINTS ===
@app.post("/api/company/top-companies")
async def top_companies(request: SubmarketRequest):
    try:
        result = get_top_companies(request.submarket)
        log_analytics_event("company_analysis", {"submarket": request.submarket})
        return {"success": True, "data": result}
    except Exception as e:
        print(f"Error in top_companies: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# === WEB RESEARCH ENDPOINTS ===
@app.post("/api/research/web-insights")
async def web_research(request: QueryRequest):
    try:
        result = search_web_insights(request.query)
        log_analytics_event("web_research", {
            "query": request.query,
            "search_depth": request.search_depth,
            "focus_area": request.focus_area
        })
        return {"success": True, "data": result}
    except Exception as e:
        print(f"Error in web_research: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# === DOCUMENT ANALYSIS ENDPOINTS ===
@app.post("/api/documents/upload-and-split")
async def upload_document(file: UploadFile = File(...)):
    try:
        # Generate file hash for deduplication
        content = await file.read()
        file_hash = hashlib.md5(content).hexdigest()
        
        # Check if already processed
        if file_hash in memory_storage["pdf_history"]:
            existing = memory_storage["pdf_history"][file_hash]
            return {
                "success": True, 
                "data": {
                    "chunks": existing["chunks"],
                    "pdf_id": existing["pdf_id"],
                    "message": f"PDF '{existing['filename']}' already processed! Using existing {len(existing['chunks'])} chunks."
                }
            }
        
        # Save file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(content)
            tmp_path = tmp.name
        
        # Create file stream object for your existing function
        class FileStream:
            def read(self):
                with open(tmp_path, 'rb') as f:
                    return f.read()
        
        # Call your EXISTING function directly!
        file_chunks = split_and_upload_pdf_chunks(FileStream())
        
        # Store in memory
        pdf_id = f"pdf_{len(memory_storage['pdf_history'])}"
        memory_storage["pdf_history"][file_hash] = {
            "pdf_id": pdf_id,
            "filename": file.filename,
            "chunks": file_chunks,
            "processed_at": datetime.now().isoformat(),
            "file_size": len(content)
        }
        memory_storage["pdf_qa"][pdf_id] = []
        
        # Cleanup
        os.unlink(tmp_path)
        
        log_analytics_event("pdf_upload", {
            "filename": file.filename,
            "chunks_count": len(file_chunks),
            "file_size": len(content)
        })
        
        return {
            "success": True, 
            "data": {
                "chunks": file_chunks,
                "pdf_id": pdf_id,
                "message": f"Processed {len(file_chunks)} chunks from new PDF"
            }
        }
    except Exception as e:
        print(f"Error uploading document: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/documents/query")
async def query_document(request: DocumentQueryRequest):
    try:
        result = query_chunks(request.query, request.file_chunks)
        
        # Store Q&A in memory (simplified)
        qa_entry = {
            "question": request.query,
            "answer": result,
            "timestamp": datetime.now().isoformat()
        }
        
        log_analytics_event("pdf_query", {
            "question_length": len(request.query),
            "answer_length": len(result) if result else 0
        })
        
        return {"success": True, "data": result}
    except Exception as e:
        print(f"Error querying document: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/documents/compare")
async def compare_documents(files: List[UploadFile] = File(...), prompt: str = Form(...)):
    try:
        # Convert files for your existing function
        file_objects = []
        for file in files:
            content = await file.read()
            # Create object that matches what your function expects
            class FileObj:
                def __init__(self, name, content):
                    self.name = name
                    self._content = content
                def read(self):
                    return self._content
            file_objects.append(FileObj(file.filename, content))
        
        result = compare_uploaded_pdfs(file_objects, prompt)
        
        log_analytics_event("document_comparison", {
            "files_count": len(files),
            "filenames": [f.filename for f in files],
            "prompt": prompt
        })
        
        return {
            "success": True, 
            "data": {
                "comparison_results": result,
                "files_compared": [f.filename for f in files]
            }
        }
    except Exception as e:
        print(f"Error comparing documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# === M&A INTELLIGENCE ENDPOINTS ===
@app.post("/api/ma/analyze-deals")
async def ma_deals(request: MARequest):
    try:
        result = get_mergers_table(request.market, request.timeframe)
        
        # Store search in memory
        ma_search = {
            "market": request.market,
            "timeframe": request.timeframe,
            "result": result,
            "timestamp": datetime.now().isoformat(),
            "deals_count": result.count('|') // 7 if result else 0
        }
        memory_storage["ma_searches"].append(ma_search)
        
        # Keep only last 50 searches
        if len(memory_storage["ma_searches"]) > 50:
            memory_storage["ma_searches"] = memory_storage["ma_searches"][-50:]
        
        log_analytics_event("ma_analysis", {
            "market": request.market,
            "timeframe": request.timeframe
        })
        
        return {"success": True, "data": result}
    except Exception as e:
        print(f"Error in ma_deals: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ma/recent-searches")
async def get_recent_ma_searches(limit: int = 10):
    """Get recent M&A searches"""
    recent = memory_storage["ma_searches"][-limit:]
    return {"success": True, "data": recent}

# === HISTORY ENDPOINTS ===
@app.post("/api/history/market-analysis")
async def get_market_history(request: HistoryRequest):
    """Get market analysis history"""
    try:
        history = []
        for cache_key, data in memory_storage["market_cache"].items():
            if not request.search_term or request.search_term.lower() in data["market"].lower():
                history.append({
                    "market_name": data["market"],
                    "query_type": data["type"],
                    "created_at": data["timestamp"],
                    "access_count": 1  # Simplified
                })
        
        # Sort by timestamp, most recent first
        history.sort(key=lambda x: x["created_at"], reverse=True)
        return {"success": True, "data": history[:request.limit]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/history/pdf-sessions")
async def get_pdf_history(request: HistoryRequest):
    """Get PDF session history"""
    try:
        history = []
        for file_hash, data in memory_storage["pdf_history"].items():
            if not request.search_term or request.search_term.lower() in data["filename"].lower():
                qa_count = len(memory_storage["pdf_qa"].get(data["pdf_id"], []))
                history.append({
                    "id": data["pdf_id"],
                    "file_name": data["filename"],
                    "total_pages": len(data["chunks"]) * 50,  # Estimate
                    "chunks_count": len(data["chunks"]),
                    "processed_at": data["processed_at"],
                    "qa_count": qa_count,
                    "last_question": data["processed_at"]  # Simplified
                })
        
        return {"success": True, "data": history[:request.limit]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history/popular-markets")
async def get_popular_markets(days: int = 7, limit: int = 10):
    """Get popular markets"""
    return {"success": True, "data": memory_storage["popular_markets"][:limit]}

# === ADMIN ENDPOINTS ===
@app.get("/api/admin/database-stats")
async def get_database_stats():
    """Get comprehensive database statistics"""
    return {
        "success": True,
        "data": {
            "market_cache_count": len(memory_storage["market_cache"]),
            "pdf_history_count": len(memory_storage["pdf_history"]),
            "pdf_qa_count": sum(len(qa_list) for qa_list in memory_storage["pdf_qa"].values()),
            "ma_searches_count": len(memory_storage["ma_searches"]),
            "usage_analytics_count": len(memory_storage["analytics"]),
            "db_size_mb": 12.5,  # Mock value
            "popular_markets": memory_storage["popular_markets"]
        }
    }

@app.get("/api/admin/analytics")
async def get_analytics(days: int = 7):
    """Get usage analytics"""
    recent_analytics = [
        event for event in memory_storage["analytics"]
        if (datetime.now() - datetime.fromisoformat(event["timestamp"])).days <= days
    ]
    
    # Group by event type
    event_counts = {}
    for event in recent_analytics:
        event_type = event["event_type"]
        event_counts[event_type] = event_counts.get(event_type, 0) + 1
    
    return {
        "success": True,
        "data": {
            "total_events": len(recent_analytics),
            "event_breakdown": event_counts,
            "popular_markets": memory_storage["popular_markets"]
        }
    }

@app.post("/api/admin/cleanup")
async def cleanup_data(data_type: str = "expired"):
    """Cleanup various data types"""
    try:
        if data_type == "expired":
            # Mock cleanup
            cleaned_count = 5
        elif data_type == "all_cache":
            memory_storage["market_cache"].clear()
            cleaned_count = len(memory_storage["market_cache"])
        else:
            cleaned_count = 0
        
        return {
            "success": True,
            "data": {"cleaned_count": cleaned_count, "message": f"Cleaned {cleaned_count} items"}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# === RESTORE ENDPOINTS ===
@app.post("/api/restore/market-analysis/{market_name}")
async def restore_market_analysis(market_name: str):
    """Restore complete market analysis for a market"""
    try:
        restored_data = {}
        
        for cache_key, data in memory_storage["market_cache"].items():
            if data["market"] == market_name:
                restored_data[data["type"]] = data["data"]
        
        if not restored_data:
            raise HTTPException(status_code=404, detail="Market analysis not found")
        
        return {"success": True, "data": restored_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/restore/pdf-session/{pdf_id}")
async def restore_pdf_session(pdf_id: str):
    """Restore complete PDF session"""
    try:
        # Find PDF data
        pdf_data = None
        for file_hash, data in memory_storage["pdf_history"].items():
            if data["pdf_id"] == pdf_id:
                pdf_data = data
                break
        
        if not pdf_data:
            raise HTTPException(status_code=404, detail="PDF session not found")
        
        qa_history = memory_storage["pdf_qa"].get(pdf_id, [])
        
        return {
            "success": True,
            "data": {
                "pdf_info": pdf_data,
                "qa_history": qa_history,
                "chunks": pdf_data["chunks"]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# === ERROR HANDLERS ===
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return {
        "success": False,
        "error": exc.detail,
        "status_code": exc.status_code,
        "timestamp": datetime.now().isoformat()
    }

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    print(f"Unhandled exception: {str(exc)}")
    return {
        "success": False,
        "error": "Internal server error",
        "message": str(exc),
        "timestamp": datetime.now().isoformat()
    }

# === STARTUP MESSAGE ===
@app.on_event("startup")
async def startup_event():
    print("🚀 Enhanced Market Research Intelligence API is starting up!")
    print(f"📊 API Documentation: http://127.0.0.1:8000/docs")
    print(f"🔧 Alternative Docs: http://127.0.0.1:8000/redoc")
    print(f"💾 Using in-memory storage (for production, use a real database)")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

'''
# fastapi_wrapper.py - DB-enabled version
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends,APIRouter, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import tempfile, os, hashlib, json
from datetime import datetime, timedelta
# ===== DB Setup =====
from sqlalchemy import func
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

DATABASE_URL = "sqlite:///./market_research.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ===== DB Models =====
class MarketAnalysis(Base):
    __tablename__ = "market_analysis"
    id = Column(Integer, primary_key=True, index=True)
    market = Column(String, index=True)
    analysis_type = Column(String)  # global, vertical, horizontal
    data = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class PDFHistory(Base):
    __tablename__ = "pdf_history"
    id = Column(Integer, primary_key=True, index=True)
    pdf_id = Column(String, unique=True, index=True)
    filename = Column(String)
    chunks = Column(JSON)
    processed_at = Column(DateTime, default=datetime.utcnow)

class MAHistory(Base):
    __tablename__ = "ma_history"
    id = Column(Integer, primary_key=True, index=True)
    market = Column(String, index=True)
    timeframe = Column(String)
    result = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

class Analytics(Base):
    __tablename__ = "analytics"
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String)
    data = Column(JSON)
    timestamp = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

# ===== Imports =====
try:
    from openai_handler import get_vertical_submarkets
    from horizontal_handler import get_horizontal_submarkets  
    from global_metrics_agent import get_global_overview
    from metrics_agent import get_detailed_metrics
    from company_agent import get_top_companies
    from mergers_agent import get_mergers_table
    from web_search_agent import search_web_insights
    from compare_pdf_agent import compare_uploaded_pdfs
    from split_and_upload_chunks import split_and_upload_pdf_chunks
    from query_uploaded_chunks import query_chunks
    print("✅ Modules imported")
except ImportError as e:
    print(f"❌ Import error: {e}")

app = FastAPI(title="Market Research Intelligence API", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== Models =====
class MarketRequest(BaseModel):
    market: str

class SubmarketRequest(BaseModel):
    submarket: str

class QueryRequest(BaseModel):
    query: str
    search_depth: Optional[str] = "standard"
    focus_area: Optional[str] = "general"

class DocumentQueryRequest(BaseModel):
    query: str
    file_chunks: List[dict]

class MARequest(BaseModel):
    market: str
    timeframe: str

class HistoryRequest(BaseModel):
    history_type: Optional[str] = "All"
    search_term: Optional[str] = ""
    limit: Optional[int] = 20

def log_analytics(db: Session, event_type: str, data: dict):
    db.add(Analytics(event_type=event_type, data=data))
    db.commit()

# ===== Health Check =====
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "DB-backed API is running!"}

# ===== Market Analysis Endpoints =====
@app.post("/api/market/global-overview")
async def global_overview(request: MarketRequest, db: Session = Depends(get_db)):
    cached = db.query(MarketAnalysis)\
               .filter_by(market=request.market, analysis_type="global")\
               .order_by(MarketAnalysis.created_at.desc())\
               .first()
    if cached:
        log_analytics(db, "market_analysis_cached", {"market": request.market})
        return {"success": True, "data": cached.data, "cached": True}

    result = get_global_overview(request.market)
    db.add(MarketAnalysis(market=request.market, analysis_type="global", data=result))
    db.commit()
    log_analytics(db, "market_analysis", {"market": request.market})
    return {"success": True, "data": result, "cached": False}

@app.post("/api/market/vertical-segments")
async def vertical_segments(request: MarketRequest, db: Session = Depends(get_db)):
    cached = db.query(MarketAnalysis)\
               .filter_by(market=request.market, analysis_type="vertical")\
               .order_by(MarketAnalysis.created_at.desc())\
               .first()
    if cached:
        return {"success": True, "data": cached.data, "cached": True}

    result = get_vertical_submarkets(request.market)
    db.add(MarketAnalysis(market=request.market, analysis_type="vertical", data=result))
    db.commit()
    return {"success": True, "data": result, "cached": False}

@app.post("/api/market/horizontal-markets")
async def horizontal_markets(request: MarketRequest, db: Session = Depends(get_db)):
    cached = db.query(MarketAnalysis)\
               .filter_by(market=request.market, analysis_type="horizontal")\
               .order_by(MarketAnalysis.created_at.desc())\
               .first()
    if cached:
        return {"success": True, "data": cached.data, "cached": True}

    result = get_horizontal_submarkets(request.market)
    db.add(MarketAnalysis(market=request.market, analysis_type="horizontal", data=result))
    db.commit()
    return {"success": True, "data": result, "cached": False}

@app.post("/api/market/detailed-metrics")
async def detailed_metrics(request: MarketRequest):
    return {"success": True, "data": get_detailed_metrics(request.market)}

# ===== Company Endpoint =====
@app.post("/api/company/top-companies")
async def top_companies(request: SubmarketRequest):
    return {"success": True, "data": get_top_companies(request.submarket)}

# ===== Web Insights =====
@app.post("/api/research/web-insights")
async def web_research(request: QueryRequest, db: Session = Depends(get_db)):
    result = search_web_insights(request.query)
    log_analytics(db, "web_research", {"query": request.query})
    return {"success": True, "data": result}

# ===== Document Upload =====
@app.post("/api/documents/upload-and-split")
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = await file.read()
    file_hash = hashlib.md5(content).hexdigest()

    existing = db.query(PDFHistory).filter_by(pdf_id=file_hash).first()
    if existing:
        return {"success": True, "data": {"chunks": existing.chunks, "pdf_id": existing.pdf_id}}

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    class FileStream:
        def read(self): return open(tmp_path, 'rb').read()

    chunks = split_and_upload_pdf_chunks(FileStream())
    pdf_id = file_hash
    db.add(PDFHistory(pdf_id=pdf_id, filename=file.filename, chunks=chunks))
    db.commit()
    os.unlink(tmp_path)
    return {"success": True, "data": {"chunks": chunks, "pdf_id": pdf_id}}

@app.post("/api/documents/query")
async def query_document(request: DocumentQueryRequest):
    result = query_chunks(request.query, request.file_chunks)
    return {"success": True, "data": result}

@app.post("/api/documents/compare")
async def compare_documents(files: List[UploadFile] = File(...), prompt: str = Form(...)):
    file_objects = []
    for file in files:
        content = await file.read()
        class FileObj:
            def __init__(self, name, content): self.name, self._content = name, content
            def read(self): return self._content
        file_objects.append(FileObj(file.filename, content))

    result = compare_uploaded_pdfs(file_objects, prompt)
    return {"success": True, "data": result}

# ===== M&A Endpoints =====
@app.post("/api/ma/analyze-deals")
async def ma_deals(request: MARequest, db: Session = Depends(get_db)):
    result = get_mergers_table(request.market, request.timeframe)
    db.add(MAHistory(market=request.market, timeframe=request.timeframe, result=result))
    db.commit()
    return {"success": True, "data": result}

@app.get("/api/ma/recent-searches")
async def get_recent_ma_searches(limit: int = 10, db: Session = Depends(get_db)):
    rows = db.query(MAHistory).order_by(MAHistory.timestamp.desc()).limit(limit).all()
    return {"success": True, "data": [r.__dict__ for r in rows]}

# ===== Startup =====
@app.on_event("startup")
async def startup_event():
    print("🚀 DB-backed API started!")
    print("📊 DB path:", DATABASE_URL)
    print("✅ Tables:", Base.metadata.tables.keys())
@app.get("/api/admin/database-stats")
async def get_database_stats(db: Session = Depends(get_db)):
    return {
        "success": True,
        "data": {
            "market_cache_count": db.query(MarketAnalysis).count(),
            "pdf_history_count": db.query(PDFHistory).count(),
            "ma_searches_count": db.query(MAHistory).count(),
            "usage_analytics_count": db.query(Analytics).count(),
            "db_size_mb": os.path.getsize("./market_research.db") / (1024 * 1024),
            "tables": list(Base.metadata.tables.keys())
        }
    }

@app.get("/api/admin/analytics")
async def get_analytics(days: int = 7, db: Session = Depends(get_db)):
    cutoff = datetime.utcnow() - timedelta(days=days)
    rows = db.query(Analytics).filter(Analytics.timestamp >= cutoff).all()
    event_counts = {}
    for r in rows:
        event_counts[r.event_type] = event_counts.get(r.event_type, 0) + 1
    return {
        "success": True,
        "data": {
            "total_events": len(rows),
            "event_breakdown": event_counts
        }
    }

@app.post("/api/history/market-analysis")
async def get_market_history(request: HistoryRequest, db: Session = Depends(get_db)):
    query = db.query(MarketAnalysis)
    if request.search_term:
        query = query.filter(MarketAnalysis.market.ilike(f"%{request.search_term}%"))
    rows = query.order_by(MarketAnalysis.created_at.desc()).limit(request.limit).all()

    history = [
        {   
            "id": r.id,
            "market_name": r.market,
            "query_type": r.analysis_type,
            "created_at": r.created_at.isoformat(),
        } for r in rows
    ]
    return {"success": True, "data": history}

@app.post("/api/history/pdf-sessions")
async def get_pdf_history(request: HistoryRequest, db: Session = Depends(get_db)):
    query = db.query(PDFHistory)
    if request.search_term:
        query = query.filter(PDFHistory.filename.ilike(f"%{request.search_term}%"))
    rows = query.order_by(PDFHistory.processed_at.desc()).limit(request.limit).all()

    history = [
        {   
            "id": r.pdf_id,
            "pdf_id": r.pdf_id,
            "file_name": r.filename,
            "chunks_count": len(r.chunks),
            "processed_at": r.processed_at.isoformat(),
        } for r in rows
    ]
    return {"success": True, "data": history}

@app.get("/api/history/popular-markets")
async def get_popular_markets(days: int = 7, limit: int = 10, db: Session = Depends(get_db)):
    """Get most analyzed markets in the last X days"""
    cutoff = datetime.utcnow() - timedelta(days=days)
    q = (
        db.query(MarketAnalysis.market, func.count(MarketAnalysis.id).label("query_count"))
        .filter(MarketAnalysis.created_at >= cutoff)
        .group_by(MarketAnalysis.market)
        .order_by(func.count(MarketAnalysis.id).desc())
        .limit(limit)
    )

    results = [
        {"market_name": row[0], "query_count": row[1], "last_queried": datetime.utcnow().isoformat()}
        for row in q.all()
    ]
    return {"success": True, "data": results}

# ===== Restore Endpoints =====

@app.post("/api/restore/market-analysis/{market_name}")
async def restore_market_analysis(market_name: str, db: Session = Depends(get_db)):
    """Restore complete market analysis for a market from DB"""
    rows = db.query(MarketAnalysis).filter_by(market=market_name).all()
    if not rows:
        raise HTTPException(status_code=404, detail="Market analysis not found")

    restored_data = {}
    for row in rows:
        restored_data[row.analysis_type] = row.data

    return {"success": True, "data": restored_data}


@app.post("/api/restore/pdf-session/{pdf_id}")
async def restore_pdf_session(pdf_id: str, db: Session = Depends(get_db)):
    """Restore complete PDF session"""
    pdf = db.query(PDFHistory).filter_by(pdf_id=pdf_id).first()
    if not pdf:
        raise HTTPException(status_code=404, detail="PDF session not found")

    return {
        "success": True,
        "data": {
            "pdf_info": {
                "id": pdf.pdf_id,
                "file_name": pdf.filename,
                "chunks_count": len(pdf.chunks),
                "processed_at": pdf.processed_at.isoformat()
            },
            "qa_history": [],  # implement if you save Q&A
            "chunks": pdf.chunks
        }
    }

@app.delete("/api/history/delete-market/{market_id}")
async def delete_market_history(market_id: int, db: Session = Depends(get_db)):
    row = db.query(MarketAnalysis).filter(MarketAnalysis.id == market_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Market history not found")
    db.delete(row)
    db.commit()
    return {"success": True, "message": f"Deleted market history id={market_id}"}

@app.delete("/api/history/delete-pdf/{pdf_id}")
async def delete_pdf_history(pdf_id: str, db: Session = Depends(get_db)):
    row = db.query(PDFHistory).filter(PDFHistory.pdf_id == pdf_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="PDF history not found")
    db.delete(row)
    db.commit()
    return {"success": True, "message": f"Deleted PDF history pdf_id={pdf_id}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
