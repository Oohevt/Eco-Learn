#!/bin/bash
# Eco-Learn 一键启动脚本（本地服务 + ngrok 穿透）

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

# 5. 启动 ngrok
echo -e "${BLUE}[5/5]${NC} 启动 ngrok 穿透服务..."

# 检查 ngrok 是否存在
if [ ! -f "$SCRIPT_DIR/ngrok" ]; then
    # 检查系统是否安装了 ngrok
    if ! command -v ngrok &> /dev/null; then
        echo -e "   ${RED}✗${NC} 未找到 ngrok"
        echo ""
        echo "请安装 ngrok："
        echo "   brew install ngrok  (macOS)"
        echo "   或访问: https://ngrok.com/download"
        echo ""
        echo "本地服务已启动，可以直接访问："
        echo "   前端: http://localhost:5173"
        echo "   后端: http://localhost:8787"
        echo ""
        echo "按 Ctrl+C 停止服务"
        trap "echo ''; echo '🛑 停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
        wait
    fi
    NGROK_CMD="ngrok"
else
    NGROK_CMD="$SCRIPT_DIR/ngrok"
fi

# 启动 ngrok（多隧道模式）
$NGROK_CMD start --all --config="$SCRIPT_DIR/ngrok.yml" > "$SCRIPT_DIR/.ngrok.log" 2>&1 &
NGROK_PID=$!

# 等待 ngrok 启动
echo "   等待 ngrok 启动..."
sleep 3

# 获取 ngrok URL
for i in {1..15}; do
    FRONTEND_URL=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for tunnel in data.get('tunnels', []):
        if tunnel.get('proto') == 'http' and tunnel.get('addr', '').endswith(':5173'):
            print(tunnel['public_url'])
            exit(0)
except: pass
" 2>/dev/null || echo "")

    BACKEND_URL=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for tunnel in data.get('tunnels', []):
        if tunnel.get('proto') == 'http' and tunnel.get('addr', '').endswith(':8787'):
            print('https://' + tunnel['public_url'].split('://')[1] + '/api')
            exit(0)
except: pass
" 2>/dev/null || echo "")

    if [ -n "$FRONTEND_URL" ] && [ -n "$BACKEND_URL" ]; then
        break
    fi
    if [ $i -eq 15 ]; then
        echo -e "   ${YELLOW}⚠${NC} ngrok 启动超时，请检查日志: $SCRIPT_DIR/.ngrok.log"
        break
    fi
    sleep 1
done

# 更新前端环境变量
if [ -n "$BACKEND_URL" ]; then
    echo "   更新前端 API 地址..."
    echo "VITE_API_URL=$BACKEND_URL" > "$SCRIPT_DIR/frontend/.env"
    echo -e "   ${GREEN}✓${NC} ngrok 已启动"
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
    echo -e "${BLUE}公网访问（ngrok）：${NC}"
    echo "   前端: $FRONTEND_URL"
    echo "   后端: $BACKEND_URL"
    echo ""
    echo -e "${YELLOW}💡 提示：${NC}前端 API 已自动配置为 ngrok 后端地址"
    echo -e "          可以直接分享前端 URL 给他人访问"
fi

echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

# 清理函数
cleanup() {
    echo ""
    echo "🛑 停止服务..."
    kill $BACKEND_PID $FRONTEND_PID $NGROK_PID 2>/dev/null
    rm -f "$SCRIPT_DIR/.backend.log" "$SCRIPT_DIR/.frontend.log" "$SCRIPT_DIR/.ngrok.log"
    exit 0
}

trap cleanup INT TERM

wait
