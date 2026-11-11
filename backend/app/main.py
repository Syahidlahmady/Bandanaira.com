from datetime import datetime, timezone
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.app.core.config import settings
from backend.app.database.session import check_db_health
from backend.app.modules.auth.router import router as auth_router
from backend.app.modules.farmers.router import router as farmers_router
from backend.app.modules.farms.router import router as farms_router
from backend.app.modules.harvests.router import router as harvests_router
from backend.app.modules.population.router import router as population_router
from backend.app.modules.qr.router import router as qr_router
from backend.app.modules.traceability.router import router as traceability_router
from backend.app.modules.blockchain.router import router as blockchain_router
from backend.app.modules.audit.router import router as audit_router
from backend.app.modules.dss.router import router as dss_router
from backend.app.modules.koperasi.router import router as koperasi_router
from backend.app.modules.iot.router import router as iot_router
from backend.app.modules.tourism.router import router as tourism_router
from backend.app.modules.gis.router import router as gis_router, peta_alias_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Integrated Village Digital Platform for Banda Neira (Population, Spice Farmers & Traceability)",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Register routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(population_router, prefix=settings.API_V1_STR)
app.include_router(farmers_router, prefix=settings.API_V1_STR)
app.include_router(farms_router, prefix=settings.API_V1_STR)
app.include_router(harvests_router, prefix=settings.API_V1_STR)
app.include_router(traceability_router, prefix=settings.API_V1_STR)
app.include_router(qr_router, prefix=settings.API_V1_STR)
app.include_router(blockchain_router, prefix=settings.API_V1_STR)
app.include_router(audit_router, prefix=settings.API_V1_STR)
app.include_router(dss_router, prefix=settings.API_V1_STR)
app.include_router(koperasi_router, prefix=settings.API_V1_STR)
app.include_router(iot_router, prefix=settings.API_V1_STR)
app.include_router(tourism_router, prefix=settings.API_V1_STR)
app.include_router(gis_router, prefix=settings.API_V1_STR)
app.include_router(peta_alias_router, prefix=settings.API_V1_STR)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Root"])
async def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR,
    }


@app.get(f"{settings.API_V1_STR}/health", tags=["Health"])
async def health_check():
    db_ok = await check_db_health()
    overall_status = "healthy" if db_ok else "degraded"
    status_code = status.HTTP_200_OK if db_ok else status.HTTP_503_SERVICE_UNAVAILABLE

    return JSONResponse(
        status_code=status_code,
        content={
            "status": overall_status,
            "version": settings.VERSION,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "services": {
                "api": "healthy",
                "database": "connected" if db_ok else "disconnected",
            },
        },
    )
