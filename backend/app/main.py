from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.core.config import settings
from app.core.database import engine
from app.models import User, Chapter  # noqa: F401 - 导入以创建表
from app.api import auth_router, chapters_router, progress_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时创建数据库表
    from app.core.database import Base
    Base.metadata.create_all(bind=engine)
    yield
    # 关闭时的清理工作（如果需要）


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="EconoLearn 经济学基础知识科普平台 API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册 API 路由
app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["认证"])
app.include_router(chapters_router, prefix=f"{settings.API_V1_STR}/chapters", tags=["章节管理"])
app.include_router(progress_router, prefix=f"{settings.API_V1_STR}/user", tags=["用户数据"])

# 静态文件挂载（必须在 API 路由之后）
static_dir = Path(__file__).parent.parent / "frontend" / "dist"
if static_dir.exists():
    app.mount("/assets", StaticFiles(directory=str(static_dir / "assets")), name="assets")


@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy"}


@app.get("/api")
async def root():
    """根路径"""
    return {
        "message": "EconoLearn API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    """SPA 路由支持，所有非 API 请求返回 index.html"""
    static_dir = Path(__file__).parent.parent / "frontend" / "dist"
    if not static_dir.exists():
        return {"error": "Frontend not built"}
    
    index_file = static_dir / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    return {"error": "index.html not found"}
