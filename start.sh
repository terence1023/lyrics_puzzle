#!/bin/bash

# 歌词猜猜乐启动脚本

echo "🎵 歌词猜猜乐 - Lyrics Wordle 🎵"
echo "=================================="

# 检查Node.js是否安装
if command -v node &> /dev/null; then
    echo "✅ 检测到Node.js版本: $(node --version)"
    
    # 检查依赖是否已安装
    if [ ! -d "node_modules" ]; then
        echo "📦 安装项目依赖..."
        npm install
    fi
    
    echo "🚀 启动服务器..."
    npm start
else
    echo "❌ 未检测到Node.js"
    echo ""
    echo "请先安装Node.js："
    echo "1. 访问 https://nodejs.org/ 下载安装"
    echo "2. 或使用包管理器安装："
    echo "   - Ubuntu/Debian: sudo apt install nodejs npm"
    echo "   - CentOS/RHEL: sudo yum install nodejs npm"
    echo "   - macOS: brew install node"
    echo ""
    echo "安装完成后重新运行此脚本"
    
    # 尝试使用Python作为简单的静态文件服务器
    if command -v python3 &> /dev/null; then
        echo ""
        echo "🐍 检测到Python3，启动简单HTTP服务器查看静态页面..."
        echo "注意：这只是预览，完整功能需要Node.js后端"
        echo "访问: http://localhost:8000"
        python3 -m http.server 8000
    elif command -v python &> /dev/null; then
        echo ""
        echo "🐍 检测到Python，启动简单HTTP服务器查看静态页面..."
        echo "注意：这只是预览，完整功能需要Node.js后端"
        echo "访问: http://localhost:8000"
        python -m SimpleHTTPServer 8000
    else
        echo "也未检测到Python，无法启动预览服务器"
    fi
fi
