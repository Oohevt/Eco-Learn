"""
数据库初始化脚本

运行方式: python init_db.py
"""
from sqlalchemy.orm import Session

from app.core.database import SessionLocal, engine
from app.core.security import get_password_hash
from app.models import User


def init_db(db: Session) -> None:
    """初始化数据库数据"""

    # 创建管理员用户
    admin = db.query(User).filter(User.username == "admin").first()

    if not admin:
        admin = User(
            username="admin",
            email="admin@econolearn.com",
            hashed_password=get_password_hash("admin123"),
            is_admin=True,
            is_active=True
        )
        db.add(admin)
        print("✓ 创建管理员用户: admin / admin123")

    # 创建测试用户
    test_user = db.query(User).filter(User.username == "test").first()

    if not test_user:
        test_user = User(
            username="test",
            email="test@example.com",
            hashed_password=get_password_hash("test123"),
            is_admin=False,
            is_active=True
        )
        db.add(test_user)
        print("✓ 创建测试用户: test / test123")

    db.commit()
    print("\n数据库初始化完成！")


def main():
    """主函数"""
    print("=" * 50)
    print("EconoLearn 数据库初始化")
    print("=" * 50)

    # 创建所有表
    from app.core.database import Base
    Base.metadata.create_all(bind=engine)
    print("✓ 数据库表创建完成")

    # 初始化数据
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
