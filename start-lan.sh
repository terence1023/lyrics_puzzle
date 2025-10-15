#!/bin/bash

# 歌词猜猜乐 - 局域网访问启动脚本

echo "🎵 歌词猜猜乐 - 局域网版 🎵"
echo "============================="

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到Node.js，请先安装Node.js"
    echo "📥 下载地址: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js版本: $(node --version)"

# 检查依赖是否已安装
if [ ! -d "node_modules" ]; then
    echo "📦 安装项目依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
fi

# 获取本机IP地址（优先使用实际的局域网IP）
# 先尝试10.x.x.x网段（通常是真正的局域网）
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | grep "10\." | awk '{print $2}' | head -n 1)

# 如果没有10.x.x.x，再尝试192.168.x.x
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | grep "192.168." | awk '{print $2}' | head -n 1)
fi

# 最后尝试172.x.x.x网段
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | grep "172\." | awk '{print $2}' | head -n 1)
fi

echo ""
echo "🚀 启动局域网服务器..."
echo "📍 检测到的局域网IP: $LOCAL_IP"

# 显示所有可用的IP地址
echo ""
echo "🔍 所有可用的IP地址："
ifconfig | grep "inet " | grep -v 127.0.0.1 | while read line; do
    ip=$(echo $line | awk '{print $2}')
    echo "   - $ip"
done

echo ""
echo "🌐 推荐访问地址: http://$LOCAL_IP:3000"
echo ""
echo "📱 在同一局域网的其他设备上尝试以下地址："

# 显示所有可能的访问地址
ifconfig | grep "inet " | grep -v 127.0.0.1 | while read line; do
    ip=$(echo $line | awk '{print $2}')
    echo "   http://$ip:3000"
done

echo ""
echo "� 如果无法访问，请检查："
echo "   1. 防火墙设置：系统偏好设置 > 安全性与隐私 > 防火墙"
echo "   2. 确保设备在同一WiFi网络下"
echo "   3. 尝试暂时关闭防火墙测试"
echo ""
echo "💡 防火墙快速检查命令："
echo "   sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate"
echo ""
echo "按 Ctrl+C 停止服务器"
echo "================================="

# 启动服务器
npm start
