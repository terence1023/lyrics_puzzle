# 🎵 歌词猜猜乐 - GitHub Pages 部署快速指南

## 🚀 三步部署到 GitHub Pages

### 步骤 1: 创建 GitHub 仓库

1. 访问 https://github.com/new
2. 仓库名称输入: `lyrics_wordle`
3. 选择 **Public** (公开)
4. 点击 **Create repository**

### 步骤 2: 上传代码

在项目文件夹打开终端，依次执行：

```bash
# 初始化 git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 连接到你的 GitHub 仓库（替换 YOUR_USERNAME）
git remote add origin https://github.com/YOUR_USERNAME/lyrics_wordle.git

# 推送代码
git branch -M main
git push -u origin main
```

### 步骤 3: 启用 GitHub Pages

1. 进入你的 GitHub 仓库
2. 点击 **Settings** (设置)
3. 左侧菜单找到 **Pages**
4. Source 选择: **GitHub Actions**
5. 等待 1-2 分钟部署完成

### ✅ 完成！访问你的网站

```
https://YOUR_USERNAME.github.io/lyrics_wordle/
```

---

## 🔄 后续更新（使用快捷脚本）

修改代码后，运行：

```bash
./deploy-github.sh "更新说明"
```

或手动执行：

```bash
git add .
git commit -m "你的更新说明"
git push
```

---

## 📖 详细文档

查看完整部署指南: [DEPLOY-GITHUB-PAGES.md](DEPLOY-GITHUB-PAGES.md)

---

## 🎮 本地测试

部署前可以本地测试：

```bash
# 方式1: 使用 Node.js 服务器
npm install
npm start
# 访问 http://localhost:3000

# 方式2: 使用 Python 简单服务器
python3 -m http.server 8000
# 访问 http://localhost:8000
```

---

## 💡 提示

- ✅ 仓库必须是 **Public** 才能免费使用 GitHub Pages
- ✅ 推送代码后会自动部署，无需手动操作
- ✅ 在 **Actions** 标签页可以查看部署状态
- ✅ 首次部署可能需要 3-5 分钟

---

**祝你部署顺利！🎉**
