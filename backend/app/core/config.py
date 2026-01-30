from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "EconoLearn API"

    # Environment
    ENVIRONMENT: str = "development"  # development | production

    # Security
    SECRET_KEY: str = "econolearn-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database
    DATABASE_URL: str = "sqlite:///./econolearn.db"

    # CORS（生产环境允许所有域名，因为前后端在同一服务）
    BACKEND_CORS_ORIGINS: list[str] = ["*"]

    class Config:
        env_file = ".env"


settings = Settings()
