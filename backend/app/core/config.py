from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "EconoLearn API"

    # Security
    SECRET_KEY: str = "econolearn-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database
    DATABASE_URL: str = "sqlite:///./econolearn.db"

    # CORS（生产环境需要添加 Vercel 域名）
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:5177",
        "https://eco-learn.vercel.app",  # 替换为你的 Vercel 域名
    ]

    class Config:
        env_file = ".env"


settings = Settings()
