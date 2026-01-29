from app.api.auth import router as auth_router
from app.api.chapters import router as chapters_router
from app.api.progress import router as progress_router

__all__ = ["auth_router", "chapters_router", "progress_router"]
