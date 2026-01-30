#!/bin/bash
# Eco-Learn 项目部署脚本

set -e

echo "🚀 开始部署 Eco-Learn..."

# ===== 配置区域 =====
SERVER_USER="root"
SERVER_HOST="your-server-ip"
PROJECT_DIR="/var/www/eco-learn"
# ===================

echo "📦 构建前端..."
cd frontend
npm install
npm run build
cd ..

echo "📦 同步文件到服务器..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude 'venv' \
  --exclude '__pycache__' \
  --exclude '*.pyc' \
  --exclude '.git' \
  ./ $SERVER_USER@$SERVER_HOST:$PROJECT_DIR/

echo "🔧 配置服务器环境..."
ssh $SERVER_USER@$SERVER_HOST << 'ENDSSH'
cd /var/www/eco-learn

# 安装后端依赖
cd backend
if [ ! -d "venv" ]; then
  python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt

# 安装并配置 Nginx
sudo apt install -y nginx
sudo cp /var/www/eco-learn/nginx.conf /etc/nginx/sites-available/eco-learn
sudo ln -sf /etc/nginx/sites-available/eco-learn /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 配置 Systemd 服务
sudo cp /var/www/eco-learn/eco-learn.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable eco-learn
sudo systemctl restart eco-learn

ENDSSH

echo "✅ 部署完成！"
echo "   访问: http://$SERVER_HOST"
