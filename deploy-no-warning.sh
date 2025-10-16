#!/bin/bash

# 歌词猜猜乐 - 无警告页面部署脚本
# 使用多种方案确保无警告页面访问

echo "🎵 歌词猜猜乐 - 无警告页面部署"
echo "================================"

# 检查Node.js和npm
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    echo "❌ 错误：需要安装Node.js和npm"
    exit 1
fi

# 安装项目依赖
echo "📦 安装项目依赖..."
npm install > /dev/null 2>&1

# 检查可用端口
PORT=${PORT:-3001}
while lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; do
    PORT=$((PORT+1))
done

echo "✅ 使用端口: $PORT"

# 提供多种无警告页面的部署选项
echo ""
echo "🚀 选择部署方式（无警告页面）："
echo ""
echo "1) LocalTunnel (推荐) - 完全无警告页面"
echo "2) Serveo - 无需安装，通过SSH"
echo "3) Cloudflare Tunnel - 需要Cloudflare账户"
echo "4) 仅本地/局域网访问"
echo "5) 尝试ngrok优化参数（可能仍有警告）"
echo ""
read -p "请选择 (1-5): " choice

case $choice in
    1)
        # LocalTunnel方案
        if ! command -v lt &> /dev/null; then
            echo "📦 安装LocalTunnel..."
            npm install -g localtunnel
        fi
        
        echo "🚀 启动服务器..."
        PORT=$PORT npm start &
        SERVER_PID=$!
        sleep 3
        
        echo "🌐 启动LocalTunnel..."
        lt --port $PORT &
        LT_PID=$!
        
        echo ""
        echo "🎉 部署成功！"
        echo "================================"
        echo "📍 本地访问: http://localhost:$PORT"
        echo "🌐 公网访问: 查看上方LocalTunnel提供的URL"
        echo "✅ 完全无警告页面，可直接访问"
        echo "================================"
        
        trap 'echo ""; echo "🛑 停止服务..."; kill $SERVER_PID $LT_PID 2>/dev/null; exit 0' INT
        while true; do sleep 1; done
        ;;
        
    2)
        # Serveo方案
        echo "🚀 启动服务器..."
        PORT=$PORT npm start &
        SERVER_PID=$!
        sleep 3
        
        echo ""
        echo "🎉 服务器已启动！"
        echo "================================"
        echo "📍 本地访问: http://localhost:$PORT"
        echo ""
        echo "🌐 要获得公网访问，请在新终端窗口运行："
        echo "ssh -R 80:localhost:$PORT serveo.net"
        echo ""
        echo "💡 重要提示："
        echo "   - Serveo会分配一个随机URL（如 https://xxxxx.serveo.net）"
        echo "   - 每次访问时URL中会自动添加seed参数"
        echo "   - 相同seed确保多次访问看到相同题目"
        echo "   - 分享URL时包含seed参数，朋友将看到相同题目"
        echo ""
        echo "✅ Serveo完全无警告页面"
        echo "================================"
        
        trap 'echo ""; echo "🛑 停止服务..."; kill $SERVER_PID 2>/dev/null; exit 0' INT
        while true; do sleep 1; done
        ;;
        
    3)
        # Cloudflare Tunnel方案
        if ! command -v cloudflared &> /dev/null; then
            echo "📦 安装Cloudflare Tunnel..."
            echo "请运行: brew install cloudflared"
            echo "然后重新运行此脚本"
            exit 1
        fi
        
        echo "🚀 启动服务器..."
        PORT=$PORT npm start &
        SERVER_PID=$!
        sleep 3
        
        echo "🌐 启动Cloudflare Tunnel..."
        cloudflared tunnel --url http://localhost:$PORT &
        CF_PID=$!
        
        echo ""
        echo "🎉 部署成功！"
        echo "================================"
        echo "📍 本地访问: http://localhost:$PORT"
        echo "🌐 公网访问: 查看上方Cloudflare提供的URL"
        echo "✅ Cloudflare Tunnel无警告页面"
        echo "================================"
        
        trap 'echo ""; echo "🛑 停止服务..."; kill $SERVER_PID $CF_PID 2>/dev/null; exit 0' INT
        while true; do sleep 1; done
        ;;
        
    4)
        # 本地/局域网访问
        echo "🚀 启动本地服务器..."
        LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || echo "获取IP失败")
        
        echo ""
        echo "🎉 服务器启动成功！"
        echo "================================"
        echo "📍 本地访问: http://localhost:$PORT"
        if [ "$LOCAL_IP" != "获取IP失败" ]; then
            echo "🔗 局域网访问: http://$LOCAL_IP:$PORT"
        fi
        echo "✅ 无需外网穿透，无任何警告页面"
        echo "================================"
        
        PORT=$PORT npm start
        ;;
        
    5)
        # ngrok优化方案
        if ! command -v ngrok &> /dev/null; then
            echo "❌ 错误：未找到ngrok"
            exit 1
        fi
        
        echo "🚀 启动服务器..."
        PORT=$PORT npm start &
        SERVER_PID=$!
        sleep 3
        
        echo "🌐 启动ngrok（尝试禁用警告页面）..."
        # 尝试多种参数组合
        ngrok http $PORT --inspect=false --log=stdout > ngrok.log 2>&1 &
        NGROK_PID=$!
        sleep 5
        
        NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*"' | grep -o 'https://[^"]*' | head -1)
        
        if [ -n "$NGROK_URL" ]; then
            echo ""
            echo "🎉 部署成功！"
            echo "================================"
            echo "📍 本地访问: http://localhost:$PORT"
            echo "🌐 公网访问: $NGROK_URL"
            echo "⚠️  注意：可能仍会显示警告页面（ngrok免费版限制）"
            echo "💡 建议使用选项1的LocalTunnel获得最佳体验"
            echo "================================"
            
            trap 'echo ""; echo "🛑 停止服务..."; kill $SERVER_PID $NGROK_PID 2>/dev/null; rm -f ngrok.log; exit 0' INT
            while true; do sleep 1; done
        else
            echo "❌ ngrok启动失败，请检查ngrok.log"
            kill $SERVER_PID 2>/dev/null
            exit 1
        fi
        ;;
        
    *)
        echo "❌ 无效选项"
        exit 1
        ;;
esac
