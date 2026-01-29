from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Chapter(Base):
    """章节模型"""
    __tablename__ = "chapters"

    id = Column(Integer, primary_key=True, index=True)
    chapter_id = Column(String(50), unique=True, index=True, nullable=False)  # 前端使用的 ID
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    simple_explanation = Column(Text, nullable=False)  # 通俗解释
    examples = Column(Text, nullable=True)  # JSON 数组字符串
    category = Column(String(20), nullable=False)  # micro, macro, finance
    difficulty = Column(String(20), default="beginner")  # beginner, intermediate, advanced
    order = Column(Integer, nullable=False, default=0)
    related_charts = Column(Text, nullable=True)  # JSON 数组字符串
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
