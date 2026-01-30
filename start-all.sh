#!/bin/bash
# Eco-Learn 一键启动脚本（本地服务 + Cloudflare Tunnel 穿透）

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Eco-Learn 一键启动..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. 检查并安装后端依赖
echo -e "${BLUE}[1/5]${NC} 检查后端依赖..."
if [ ! -d "$SCRIPT_DIR/backend/node_modules" ]; then
    echo "   安装后端依赖..."
    cd "$SCRIPT_DIR/backend"
    npm install
    cd "$SCRIPT_DIR"
else
    echo "   ✓ 后端依赖已安装"
fi

# 2. 检查并安装前端依赖
echo -e "${BLUE}[2/5]${NC} 检查前端依赖..."
if [ ! -d "$SCRIPT_DIR/frontend/node_modules" ]; then
    echo "   安装前端依赖..."
    cd "$SCRIPT_DIR/frontend"
    npm install
    cd "$SCRIPT_DIR"
else
    echo "   ✓ 前端依赖已安装"
fi

# 3. 启动后端服务
echo -e "${BLUE}[3/5]${NC} 启动后端服务 (Cloudflare Workers)..."
cd "$SCRIPT_DIR/backend"
npm run dev > "$SCRIPT_DIR/.backend.log" 2>&1 &
BACKEND_PID=$!
cd "$SCRIPT_DIR"

# 等待后端启动
echo "   等待后端服务启动..."
for i in {1..20}; do
    if curl -s http://localhost:8787/health > /dev/null 2>&1; then
        echo -e "   ${GREEN}✓${NC} 后端服务已启动 (PID: $BACKEND_PID)"
        break
    fi
    if [ $i -eq 20 ]; then
        echo -e "   ${RED}✗${NC} 后端服务启动失败"
        cat "$SCRIPT_DIR/.backend.log"
        exit 1
    fi
    sleep 1
done

# 4. 启动前端服务
echo -e "${BLUE}[4/5]${NC} 启动前端服务 (Vue 3)..."
cd "$SCRIPT_DIR/frontend"
npm run dev > "$SCRIPT_DIR/.frontend.log" 2>&1 &
FRONTEND_PID=$!
cd "$SCRIPT_DIR"

# 等待前端启动
echo "   等待前端服务启动..."
for i in {1..20}; do
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo -e "   ${GREEN}✓${NC} 前端服务已启动 (PID: $FRONTEND_PID)"
        break
    fi
    if [ $i -eq 20 ]; then
        echo -e "   ${RED}✗${NC} 前端服务启动失败"
        cat "$SCRIPT_DIR/.frontend.log"
        exit 1
    fi
    sleep 1
done

# 5. 启动 Cloudflare Tunnel
echo -e "${BLUE}[5/5]${NC} 启动 Cloudflare Tunnel 穿透服务..."

# 检查 cloudflared 是否安装
if ! command -v cloudflared &> /dev/null; then
    echo -e "   ${RED}✗${NC} 未找到 cloudflared"
    echo ""
    echo "请安装 cloudflared："
    echo "   brew install cloudflared  (macOS)"
    echo "   或访问: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/"
    echo ""
    echo "本地服务已启动，可以直接访问："
    echo "   前端: http://localhost:5173"
    echo "   后端: http://localhost:8787"
    echo ""
    echo "按 Ctrl+C 停止服务"
    trap "echo ''; echo '🛑 停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
    wait
fi

# 启动前端隧道
echo "   启动前端隧道..."
cloudflared tunnel --url http://localhost:5173 > "$SCRIPT_DIR/.tunnel-frontend.log" 2>&1 &
TUNNEL_FRONTEND_PID=$!

# 启动后端隧道
echo "   启动后端隧道..."
cloudflared tunnel --url http://localhost:8787 > "$SCRIPT_DIR/.tunnel-backend.log" 2>&1 &
TUNNEL_BACKEND_PID=$!

TUNNEL_PIDS="$TUNNEL_FRONTEND_PID $TUNNEL_BACKEND_PID"

# 等待隧道启动
echo "   等待隧道建立..."
sleep 5

# 从日志中提取 URL
FRONTEND_URL=$(grep -m1 -oE 'https://[a-z0-9\-]+(\.[a-z0-9\-]+)*\.trycloudflare\.com' "$SCRIPT_DIR/.tunnel-frontend.log" 2>/dev/null || echo "")
BACKEND_URL=$(grep -m1 -oE 'https://[a-z0-9\-]+(\.[a-z0-9\-]+)*\.trycloudflare\.com' "$SCRIPT_DIR/.tunnel-backend.log" 2>/dev/null || echo "")

if [ -z "$FRONTEND_URL" ] || [ -z "$BACKEND_URL" ]; then
    echo -e "   ${YELLOW}⚠${NC} 隧道启动超时，请检查日志"
    echo "   前端: $SCRIPT_DIR/.tunnel-frontend.log"
    echo "   后端: $SCRIPT_DIR/.tunnel-backend.log"
else
    # 更新前端环境变量
    echo "   更新前端 API 地址..."
    echo "VITE_API_URL=$BACKEND_URL/api" > "$SCRIPT_DIR/frontend/.env"
    echo -e "   ${GREEN}✓${NC} Cloudflare Tunnel 已启动"
fi

# 显示访问信息
echo ""
echo "=================================="
echo -e "${GREEN}✓ 所有服务已启动！${NC}"
echo "=================================="
echo ""
echo -e "${BLUE}本地访问：${NC}"
echo "   前端: http://localhost:5173"
echo "   后端: http://localhost:8787"
echo ""

if [ -n "$FRONTEND_URL" ] && [ -n "$BACKEND_URL" ]; then
    echo -e "${BLUE}公网访问（Cloudflare Tunnel）：${NC}"
    echo "   前端: $FRONTEND_URL"
    echo "   后端: $BACKEND_URL/api"
    echo ""
    echo -e "${YELLOW}💡 提示：${NC}前端 API 已自动配置为 Cloudflare Tunnel 后端地址"
    echo -e "          可以直接分享前端 URL 给他人访问"
fi

echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

# 清理函数
cleanup() {
    echo ""
    echo "🛑 停止服务..."
    kill $BACKEND_PID $FRONTEND_PID $TUNNEL_PIDS 2>/dev/null
    rm -f "$SCRIPT_DIR/.backend.log" "$SCRIPT_DIR/.frontend.log"
    rm -f "$SCRIPT_DIR/.tunnel-frontend.log" "$SCRIPT_DIR/.tunnel-backend.log"
    exit 0
}

trap cleanup INT TERM

wait
