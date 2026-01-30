# Eco-Learn 部署指南

## 方案选择

### 快速部署（推荐新手）
- **前端**: [Vercel](https://vercel.com) - 免费，自动 HTTPS
- **后端**: [Railway](https://railway.app) - $5/月起，或 [Render](https://render.com) 免费额度

### VPS 部署（推荐生产环境）
- **服务器**: 阿里云/腾讯云/AWS EC2 (~¥30-100/月)
- **系统**: Ubuntu 20.04+ / Debian 11+

---

## VPS 部署步骤

### 1. 服务器准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装必要软件
sudo apt install -y python3 python3-venv nodejs nginx postgresql
```

### 2. 部署项目

```bash
# 克隆代码
git clone https://github.com/Oohevt/Eco-Learn.git /var/www/eco-learn
cd /var/www/eco-learn

# 运行部署脚本
chmod +x deploy.sh
./deploy.sh
```

### 3. 配置数据库

```bash
# 创建数据库
sudo -u postgres psql
CREATE DATABASE eco_learn;
CREATE USER eco_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE eco_learn TO eco_user;
\q

# 配置后端环境变量
cd /var/www/eco-learn/backend
nano .env
```

```env
DATABASE_URL=postgresql://eco_user:your_password@localhost/eco_learn
SECRET_KEY=your_random_secret_key_here
```

### 4. 初始化数据库

```bash
cd /var/www/eco-learn/backend
source venv/bin/activate
python -c "from app.database import engine; from app.models import Base; Base.metadata.create_all(bind=engine)"
```

### 5. 配置 HTTPS（可选但推荐）

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 管理命令

```bash
# 查看后端日志
sudo journalctl -u eco-learn -f

# 重启服务
sudo systemctl restart eco-learn

# 查看 Nginx 状态
sudo systemctl status nginx
```

---

## 环境变量说明

| 变量 | 说明 | 示例 |
|------|------|------|
| DATABASE_URL | PostgreSQL 连接字符串 | `postgresql://user:pass@host/db` |
| SECRET_KEY | JWT 密钥 | 随机字符串，至少 32 位 |
| CORS_ORIGINS | 允许的前端域名 | `http://localhost:5173,https://yourdomain.com` |
