#!/bin/bash

# GitHub Pages 部署向导
# 交互式引导部署过程

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     🎵 歌词猜猜乐 - GitHub Pages 部署向导 🚀              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查 git 是否已安装
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ 错误: 未安装 Git${NC}"
    echo "请先安装 Git: https://git-scm.com/"
    exit 1
fi

echo -e "${BLUE}📋 部署前检查...${NC}"
echo ""

# 检查是否已经是 git 仓库
if [ ! -d .git ]; then
    echo -e "${YELLOW}⚠️  当前目录不是 Git 仓库${NC}"
    read -p "是否初始化 Git 仓库? (y/n): " init_git
    if [ "$init_git" = "y" ] || [ "$init_git" = "Y" ]; then
        git init
        echo -e "${GREEN}✅ Git 仓库已初始化${NC}"
    else
        echo -e "${RED}❌ 取消部署${NC}"
        exit 1
    fi
fi

# 检查远程仓库
if ! git remote | grep -q origin; then
    echo ""
    echo -e "${YELLOW}📝 需要设置 GitHub 远程仓库${NC}"
    echo ""
    echo "请先在 GitHub 创建仓库:"
    echo "  1. 访问 https://github.com/new"
    echo "  2. 仓库名称: lyrics_wordle (或其他名称)"
    echo "  3. 选择 Public (公开)"
    echo "  4. 点击 Create repository"
    echo ""
    read -p "请输入你的 GitHub 用户名: " username
    read -p "请输入仓库名称 [lyrics_wordle]: " repo_name
    repo_name=${repo_name:-lyrics_wordle}
    
    REPO_URL="https://github.com/$username/$repo_name.git"
    
    echo ""
    echo -e "${BLUE}🔗 将添加远程仓库: $REPO_URL${NC}"
    git remote add origin "$REPO_URL"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 远程仓库已添加${NC}"
    else
        echo -e "${RED}❌ 添加远程仓库失败${NC}"
        exit 1
    fi
else
    REPO_URL=$(git config --get remote.origin.url)
    echo -e "${GREEN}✅ 已配置远程仓库: $REPO_URL${NC}"
    
    # 提取用户名和仓库名
    if [[ $REPO_URL =~ github.com[:/]([^/]+)/([^/.]+) ]]; then
        username="${BASH_REMATCH[1]}"
        repo_name="${BASH_REMATCH[2]}"
    fi
fi

echo ""
echo -e "${BLUE}📦 准备提交文件...${NC}"

# 检查是否有更改
if [[ -n $(git status -s) ]]; then
    git add .
    
    echo ""
    read -p "请输入提交信息 [Initial commit]: " commit_msg
    commit_msg=${commit_msg:-Initial commit}
    
    git commit -m "$commit_msg"
    echo -e "${GREEN}✅ 文件已提交${NC}"
else
    echo -e "${YELLOW}ℹ️  没有需要提交的更改${NC}"
fi

echo ""
echo -e "${BLUE}⬆️  推送到 GitHub...${NC}"

# 检查当前分支
current_branch=$(git branch --show-current)
if [ -z "$current_branch" ]; then
    git branch -M main
    current_branch="main"
fi

# 推送
git push -u origin $current_branch

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 推送失败${NC}"
    echo ""
    echo "可能的原因:"
    echo "  1. GitHub 仓库不存在"
    echo "  2. 没有推送权限"
    echo "  3. 需要先在 GitHub 创建仓库"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ 代码已推送到 GitHub!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 下一步: 在 GitHub 启用 Pages${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "请按照以下步骤操作:"
echo ""
echo "  1. 访问你的仓库:"
echo -e "     ${BLUE}https://github.com/$username/$repo_name${NC}"
echo ""
echo "  2. 点击 Settings (设置)"
echo ""
echo "  3. 左侧菜单找到 Pages"
echo ""
echo "  4. 在 Source 部分选择: GitHub Actions"
echo ""
echo "  5. 等待 1-2 分钟，部署完成"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🌐 你的网站地址:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "  ${GREEN}https://$username.github.io/$repo_name/${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}💡 提示:${NC}"
echo "  • 查看部署状态: https://github.com/$username/$repo_name/actions"
echo "  • 后续更新: ./deploy-github.sh '更新说明'"
echo ""
echo -e "${GREEN}祝你使用愉快! 🎵${NC}"
echo ""
