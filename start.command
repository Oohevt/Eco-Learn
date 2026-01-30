#!/bin/bash

# 启动前端和后端服务

echo "🚀 启动 Eco-Learn 项目..."

# 启动后端
echo "📦 启动后端服务 (FastAPI)..."
cd backend && python run.py &
BACKEND_PID=$!
cd ..

# 等待后端启动
sleep 2

# 启动前端
echo "🎨 启动前端服务 (Vue 3)..."
cd frontend && npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ 服务启动成功！"
echo "   后端: http://localhost:8000"
echo "   前端: http://localhost:5173"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
trap "echo ''; echo '🛑 停止服务...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM

wait
