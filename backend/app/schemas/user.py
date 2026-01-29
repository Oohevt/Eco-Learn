from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# ===== 用户相关 Schema =====
class UserBase(BaseModel):
    """用户基础 Schema"""
    username: str = Field(..., min_length=3, max_length=50, description="用户名")
    email: EmailStr = Field(..., description="邮箱")


class UserCreate(UserBase):
    """用户创建 Schema"""
    password: str = Field(..., min_length=6, max_length=50, description="密码")


class UserUpdate(BaseModel):
    """用户更新 Schema"""
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6, max_length=50)


class UserInDB(UserBase):
    """数据库中的用户"""
    id: int
    is_active: bool
    is_admin: bool

    class Config:
        from_attributes = True


class User(UserInDB):
    """返回给前端的用户信息（不包含敏感信息）"""
    pass


# ===== 认证相关 Schema =====
class Token(BaseModel):
    """Token 响应"""
    access_token: str
    token_type: str = "bearer"
    user: User


class TokenPayload(BaseModel):
    """Token 载荷"""
    sub: Optional[int] = None  # user_id
    exp: Optional[int] = None  # expiry time


class LoginRequest(BaseModel):
    """登录请求"""
    username: str = Field(..., description="用户名或邮箱")
    password: str = Field(..., description="密码")


class RegisterRequest(UserCreate):
    """注册请求（继承 UserCreate）"""
    pass


# ===== 进度相关 Schema =====
class ProgressBase(BaseModel):
    """进度基础 Schema"""
    chapter_id: str
    status: str = Field(default="not-started", pattern="^(not-started|in-progress|completed)$")


class ProgressCreate(ProgressBase):
    """创建进度"""
    pass


class ProgressUpdate(BaseModel):
    """更新进度"""
    status: str = Field(..., pattern="^(not-started|in-progress|completed)$")


class Progress(ProgressBase):
    """进度响应"""
    id: int
    user_id: int
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ===== 收藏相关 Schema =====
class FavoriteBase(BaseModel):
    """收藏基础 Schema"""
    chapter_id: str


class FavoriteCreate(FavoriteBase):
    """创建收藏"""
    pass


class Favorite(FavoriteBase):
    """收藏响应"""
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ===== 通用响应 Schema =====
class MessageResponse(BaseModel):
    """通用消息响应"""
    message: str
    success: bool = True
