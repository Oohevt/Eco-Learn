#!/bin/bash

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 启动 Eco-Learn 项目..."
echo "   工作目录: $SCRIPT_DIR"

# 启动后端（wrangler dev）
echo "📦 启动后端服务 (Cloudflare Workers)..."
cd "$SCRIPT_DIR/backend"
npm run dev &
BACKEND_PID=$!
cd "$SCRIPT_DIR"

# 等待后端启动
sleep 3

# 启动前端
echo "🎨 启动前端服务 (Vue 3)..."
cd "$SCRIPT_DIR/frontend" && npm run dev &
FRONTEND_PID=$!
cd "$SCRIPT_DIR"

echo ""
echo "✅ 服务启动成功！"
echo "   后端: http://localhost:8787"
echo "   前端: http://localhost:5173"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
trap "echo ''; echo '🛑 停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

wait
