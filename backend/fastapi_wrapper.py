
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

#Enale during deployment

try:
    from backend.openai_handler import get_vertical_submarkets
    from backend.horizontal_handler import get_horizontal_submarkets  
    from backend.global_metrics_agent import get_global_overview
    from backend.metrics_agent import get_detailed_metrics
    from backend.company_agent import get_top_companies
    from backend.mergers_agent import get_mergers_table
    from backend.web_search_agent import search_web_insights
    from backend.compare_pdf_agent import compare_uploaded_pdfs
    from backend.split_and_upload_chunks import split_and_upload_pdf_chunks
    from backend.query_uploaded_chunks import query_chunks
    from backend.applications_agent import get_market_applications
    from backend.technology_segments_agent import get_technology_segments
    from backend.product_categories_agent import get_product_categories
    from backend.regional_segments_agent import get_regional_analysis
    from backend.end_user_segments_agent import get_end_user_analysis 
    print("✅ Modules imported")
except ImportError as e:
    print(f"❌ Import error: {e}")
'''
try:
    from openai_handler import get_vertical_submarkets
    #from horizontal_handler import get_horizontal_submarkets
    from regional_segments_agent import get_regional_analysis
    from technology_segments_agent import get_technology_segments
    from product_categories_agent import get_product_categories
    from end_user_segments_agent import get_end_user_analysis   
    from global_metrics_agent import get_global_overview
    from metrics_agent import get_detailed_metrics
    from applications_agent import get_market_applications
    from company_agent import get_top_companies
    from mergers_agent import get_mergers_table
    from web_search_agent import search_web_insights
    from compare_pdf_agent import compare_uploaded_pdfs
    from split_and_upload_chunks import split_and_upload_pdf_chunks
    from query_uploaded_chunks import query_chunks
    from product_categories_agent import get_product_categories
    print("✅ Modules imported")
except ImportError as e:
    print(f"❌ Import error: {e}")
'''
app = FastAPI(title="Market Research Intelligence API", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    #allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "https://market-research-website.vercel.app"],
    allow_origins=["*"],
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

@app.post("/api/market/applications")
async def market_applications(request: MarketRequest, db: Session = Depends(get_db)):
    cached = db.query(MarketAnalysis)\
               .filter_by(market=request.market, analysis_type="applications")\
               .order_by(MarketAnalysis.created_at.desc())\
               .first()
    if cached:
        return {"success": True, "data": cached.data, "cached": True}

    result = get_market_applications(request.market)
    db.add(MarketAnalysis(market=request.market, analysis_type="applications", data=result))
    db.commit()
    return {"success": True, "data": result, "cached": False}
'''
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
'''
@app.post("/api/market/technology-segments")
async def technology_segments(request: MarketRequest, db: Session = Depends(get_db)):
    cached = db.query(MarketAnalysis)\
               .filter_by(market=request.market, analysis_type="technology_segments")\
               .order_by(MarketAnalysis.created_at.desc())\
               .first()
    if cached:
        return {"success": True, "data": cached.data, "cached": True}

    result = get_technology_segments(request.market)
    db.add(MarketAnalysis(market=request.market, analysis_type="technology_segments", data=result))
    db.commit()

@app.post("/api/market/regional-analysis")
async def regional_analysis(request: MarketRequest, db: Session = Depends(get_db)):
    cached = db.query(MarketAnalysis)\
               .filter_by(market=request.market, analysis_type="regional")\
               .order_by(MarketAnalysis.created_at.desc())\
               .first()
    if cached:
        return {"success": True, "data": cached.data, "cached": True}

    result = get_regional_analysis(request.market)
    db.add(MarketAnalysis(market=request.market, analysis_type="regional", data=result))
    db.commit()
    return {"success": True, "data": result, "cached": False}

@app.post("/api/market/end-user-analysis")
async def end_user_analysis(request: MarketRequest, db: Session = Depends(get_db)):
    cached = db.query(MarketAnalysis)\
               .filter_by(market=request.market, analysis_type="end_user")\
               .order_by(MarketAnalysis.created_at.desc())\
               .first()
    if cached:
        return {"success": True, "data": cached.data, "cached": True}

    result = get_end_user_analysis(request.market)
    db.add(MarketAnalysis(market=request.market, analysis_type="end_user", data=result))
    db.commit()
    return {"success": True, "data": result, "cached": False}

@app.post("/api/market/product-categories")
async def product_categories(request: MarketRequest, db: Session = Depends(get_db)):
    cached = db.query(MarketAnalysis)\
               .filter_by(market=request.market, analysis_type="product_categories")\
               .order_by(MarketAnalysis.created_at.desc())\
               .first()
    if cached:
        return {"success": True, "data": cached.data, "cached": True}

    result = get_product_categories(request.market)
    
    db.add(MarketAnalysis(market=request.market, analysis_type="product_categories", data=result))
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
