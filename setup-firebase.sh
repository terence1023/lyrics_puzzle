#!/bin/bash

# Firebase 配置助手脚本

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔥 Firebase 全局统计 - 配置助手"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "这个脚本将帮助你完成 Firebase 配置。"
echo ""

# 检查是否已配置
if grep -q "YOUR_API_KEY_HERE" firebase-stats.js; then
    echo "📝 检测到 Firebase 尚未配置"
    echo ""
    echo "请按照以下步骤操作："
    echo ""
    echo "步骤 1: 打开浏览器，访问 Firebase Console"
    echo "   👉 https://console.firebase.google.com/"
    echo ""
    echo "步骤 2: 创建新项目"
    echo "   • 点击 '添加项目'"
    echo "   • 项目名称：lyrics-puzzle"
    echo "   • 关闭 Google Analytics"
    echo ""
    echo "步骤 3: 启用 Realtime Database"
    echo "   • 左侧菜单 > Realtime Database"
    echo "   • 点击 '创建数据库'"
    echo "   • 位置：asia-southeast1 (推荐)"
    echo "   • 规则：测试模式"
    echo ""
    echo "步骤 4: 获取配置"
    echo "   • 项目设置 ⚙️  > 常规"
    echo "   • 您的应用 > Web 应用 </>"
    echo "   • 复制 firebaseConfig 对象"
    echo ""
    echo "步骤 5: 更新配置"
    read -p "是否现在输入配置？(y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "请输入 Firebase 配置信息："
        echo ""
        
        read -p "API Key: " api_key
        read -p "Project ID: " project_id
        read -p "App ID: " app_id
        read -p "Sender ID: " sender_id
        
        echo ""
        echo "正在更新配置..."
        
        # 备份原文件
        cp firebase-stats.js firebase-stats.js.backup
        
        # 替换配置
        sed -i.tmp "s/YOUR_API_KEY_HERE/$api_key/g" firebase-stats.js
        sed -i.tmp "s/YOUR_PROJECT_ID/$project_id/g" firebase-stats.js
        sed -i.tmp "s/YOUR_APP_ID/$app_id/g" firebase-stats.js
        sed -i.tmp "s/YOUR_SENDER_ID/$sender_id/g" firebase-stats.js
        
        rm firebase-stats.js.tmp
        
        echo "✅ 配置已更新！"
        echo ""
        echo "备份文件保存为：firebase-stats.js.backup"
    else
        echo ""
        echo "请手动编辑 firebase-stats.js 文件"
        echo "打开文件："
        echo "   code firebase-stats.js"
        echo ""
        echo "或查看详细指南："
        echo "   cat FIREBASE-配置指南.md"
    fi
else
    echo "✅ Firebase 配置已存在"
    echo ""
    echo "检查配置文件："
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    grep -A 8 "this.config = {" firebase-stats.js
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "下一步："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  测试配置"
echo "   open index.html"
echo "   （查看浏览器控制台）"
echo ""
echo "2️⃣  部署到 GitHub Pages"
echo "   ./deploy-github.sh '添加Firebase全局统计'"
echo ""
echo "3️⃣  查看详细文档"
echo "   cat FIREBASE-配置指南.md"
echo ""
