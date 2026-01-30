#!/bin/bash
# 自动更新 ngrok 后端域名到前端环境变量

echo "🔄 自动检测并更新 ngrok 后端域名..."

# 获取 ngrok API（需要 ngrok 在运行）
# 通过 ngrok 的 API 获取隧道信息
NGROK_API_URL="http://127.0.0.1:4040/api/tunnels"

# 尝试从 ngrok API 获取后端隧道信息
BACKEND_URL=$(curl -s "$NGROK_API_URL" 2>/dev/null | \
  python3 -c "
import sys, json
data = json.load(sys.stdin)
for tunnel in data.get('tunnels', []):
    if tunnel.get('proto') == 'http' and tunnel.get('addr', '').endswith(':8787'):
        print('https://' + tunnel['public_url'] + '/api')
        exit(0)
print('')
")

if [ -z "$BACKEND_URL" ]; then
    echo "❌ 无法获取 ngrok 后端地址"
    echo "   请确保 ngrok 正在运行，且 backend 隧道已启动"
    exit 1
fi

echo "📡 检测到后端地址: $BACKEND_URL"

# 更新 frontend/.env
ENV_FILE="/Users/Zhuanz/Desktop/Economy/frontend/.env"
echo "VITE_API_URL=$BACKEND_URL" > "$ENV_FILE"

echo "✅ 已更新 frontend/.env"
echo "   新的后端地址: $BACKEND_URL"
echo ""
echo "💡 前端服务会自动检测环境变量变化并重新加载"
echo "   如果没有自动生效，请手动重启前端服务："
echo "   cd frontend && npm run dev"
