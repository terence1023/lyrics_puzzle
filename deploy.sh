#!/bin/bash

# 歌词猜猜乐部署脚本

echo "🎵 歌词猜猜乐部署脚本"
echo "========================"

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未找到Node.js，请先安装Node.js"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ 错误：未找到npm，请先安装npm"
    exit 1
fi

# 安装依赖
echo "📦 安装项目依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 错误：依赖安装失败"
    exit 1
fi

# 检查ngrok是否安装
echo "🔍 检查ngrok..."
if ! command -v ngrok &> /dev/null; then
    echo "❌ 错误：未找到ngrok，请先安装ngrok"
    echo "📖 安装方法：https://ngrok.com/download"
    echo "   或者使用 brew install ngrok (macOS)"
    exit 1
fi

# 验证ngrok认证
echo "🔐 验证ngrok认证..."
if ! ngrok config check &> /dev/null; then
    echo "❌ 错误：ngrok未认证，请先设置认证令牌"
    echo "📖 请访问 https://dashboard.ngrok.com/get-started/your-authtoken"
    echo "   获取认证令牌，然后运行: ngrok config add-authtoken <your-token>"
    exit 1
fi

echo "✅ ngrok认证验证成功"

# 检查可用端口
PORT=${PORT:-3001}
while lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; do
    echo "⚠️  端口 $PORT 已被占用，尝试端口 $((PORT+1))"
    PORT=$((PORT+1))
done

echo "✅ 使用端口: $PORT"

# 启动服务器（后台运行）
echo "🚀 启动歌词猜猜乐服务器..."
echo "📍 本地访问地址: http://localhost:$PORT"
echo "🔗 局域网访问地址: http://$(ipconfig getifaddr en0):$PORT"

# 后台启动服务器
PORT=$PORT npm start &
SERVER_PID=$!

# 等待服务器启动
echo "⏳ 等待服务器启动..."
sleep 3

# 检查服务器是否成功启动
if ! ps -p $SERVER_PID > /dev/null; then
    echo "❌ 错误：服务器启动失败"
    exit 1
fi

# 启动ngrok隧道（尝试禁用警告页面）
echo "🌐 启动ngrok隧道..."
echo "⚠️  注意：ngrok免费版可能仍会显示警告页面"
echo "💡 建议使用LocalTunnel替代: ./deploy-localtunnel.sh"
# 尝试多种参数组合来禁用警告页面
ngrok http $PORT --inspect=false --log=stdout > ngrok.log 2>&1 &
NGROK_PID=$!

# 等待ngrok启动
sleep 5

# 提取ngrok URL
echo "🔗 获取ngrok公网地址..."
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*"' | grep -o 'https://[^"]*' | head -1)

if [ -n "$NGROK_URL" ]; then
    echo ""
    echo "🎉 部署成功！"
    echo "========================"
    echo "📍 本地访问地址: http://localhost:$PORT"
    echo "🔗 局域网访问地址: http://$(ipconfig getifaddr en0):$PORT"
    echo "🌐 公网访问地址: $NGROK_URL"
    echo "========================"
    echo ""
    echo "按 Ctrl+C 停止服务器和ngrok隧道"
    
    # 等待用户中断
    trap 'echo ""; echo "🛑 正在停止服务..."; kill $SERVER_PID $NGROK_PID 2>/dev/null; rm -f ngrok.log; echo "✅ 服务已停止"; exit 0' INT
    
    while true; do
        sleep 1
    done
else
    echo "❌ 错误：无法获取ngrok公网地址"
    echo "📝 请检查 ngrok.log 文件查看详细错误信息"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi
