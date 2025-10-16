#!/bin/bash

# GitHub Pages 快速部署脚本
# 使用方法: ./deploy-github.sh "提交信息"

echo "🚀 开始部署到 GitHub Pages..."

# 检查是否提供了提交信息
if [ -z "$1" ]; then
    COMMIT_MESSAGE="Update: $(date '+%Y-%m-%d %H:%M:%S')"
else
    COMMIT_MESSAGE="$1"
fi

echo "📝 提交信息: $COMMIT_MESSAGE"

# 检查是否有未提交的更改
if [[ -n $(git status -s) ]]; then
    echo "📦 添加更改的文件..."
    git add .
    
    echo "💾 提交更改..."
    git commit -m "$COMMIT_MESSAGE"
else
    echo "ℹ️  没有需要提交的更改"
fi

# 推送到 GitHub
echo "⬆️  推送到 GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 部署成功！"
    echo ""
    echo "🌐 你的网站将在几分钟内更新"
    echo ""
    echo "📍 访问地址："
    
    # 尝试从 git remote 获取仓库信息
    REMOTE_URL=$(git config --get remote.origin.url)
    
    if [[ $REMOTE_URL =~ github.com[:/]([^/]+)/([^/.]+) ]]; then
        USERNAME="${BASH_REMATCH[1]}"
        REPO="${BASH_REMATCH[2]}"
        echo "   https://${USERNAME}.github.io/${REPO}/"
        echo ""
        echo "📊 查看部署状态："
        echo "   https://github.com/${USERNAME}/${REPO}/actions"
    else
        echo "   https://YOUR_USERNAME.github.io/YOUR_REPO/"
    fi
    echo ""
else
    echo "❌ 部署失败！请检查错误信息。"
    exit 1
fi
