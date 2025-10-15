#!/bin/bash

# 歌词猜猜乐 - 10轮自动化测试启动脚本

echo "🎵 歌词猜猜乐 - 10轮自动化测试"
echo "================================"

# 检查Node.js和npm
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    echo "❌ 错误：需要安装Node.js和npm"
    exit 1
fi

# 检查并安装依赖
if [ ! -d "node_modules/puppeteer" ]; then
    echo "📦 安装测试依赖 (puppeteer)..."
    npm install
fi

# 检查服务器是否运行
PORT=3001
if ! lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  服务器未运行，正在启动..."
    echo "🚀 启动服务器（端口 $PORT）..."
    PORT=$PORT npm start &
    SERVER_PID=$!
    echo "   服务器PID: $SERVER_PID"
    
    # 等待服务器启动
    echo "⏳ 等待服务器启动..."
    sleep 5
    
    # 验证服务器是否成功启动
    if ! lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
        echo "❌ 服务器启动失败"
        exit 1
    fi
    
    echo "✅ 服务器启动成功"
    SERVER_STARTED_HERE=true
else
    echo "✅ 服务器已在运行（端口 $PORT）"
    SERVER_STARTED_HERE=false
fi

echo ""
echo "🧪 开始执行10轮自动化测试..."
echo "================================"
echo ""

# 运行测试
node test-10-rounds.js

TEST_EXIT_CODE=$?

echo ""
echo "================================"

# 如果是脚本启动的服务器，询问是否关闭
if [ "$SERVER_STARTED_HERE" = true ]; then
    echo ""
    read -p "❓ 测试完成，是否关闭服务器？(y/n): " STOP_SERVER
    if [ "$STOP_SERVER" = "y" ] || [ "$STOP_SERVER" = "Y" ]; then
        echo "🛑 关闭服务器..."
        kill $SERVER_PID 2>/dev/null
        echo "✅ 服务器已关闭"
    else
        echo "ℹ️  服务器继续运行 (PID: $SERVER_PID)"
        echo "   使用以下命令关闭: kill $SERVER_PID"
    fi
fi

echo ""
echo "📊 测试详细报告已保存到: test-report.json"
echo "📸 错误截图已保存到: test-screenshots/ 目录"
echo ""

exit $TEST_EXIT_CODE
