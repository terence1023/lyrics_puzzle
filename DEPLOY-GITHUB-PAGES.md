# 🚀 部署到 GitHub Pages 指南

## 📋 部署步骤

### 1. 准备工作

确保你已经有一个 GitHub 账号，并且本地项目已经初始化为 git 仓库。

### 2. 创建 GitHub 仓库

1. 登录 GitHub (https://github.com)
2. 点击右上角的 "+" -> "New repository"
3. 填写仓库信息：
   - Repository name: `lyrics_wordle` (或你喜欢的名字)
   - Description: `🎵 歌词猜猜乐 - 一个基于歌词的猜词游戏`
   - 选择 **Public** (必须是公开仓库才能免费使用 GitHub Pages)
   - 不要勾选 "Initialize this repository with a README"
4. 点击 "Create repository"

### 3. 连接本地仓库到 GitHub

在项目根目录打开终端，执行以下命令：

```bash
# 如果还没有初始化 git，先执行：
git init

# 添加所有文件
git add .

# 提交更改
git commit -m "Initial commit: Lyrics Puzzle Game"

# 添加远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/lyrics_wordle.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

### 4. 配置 GitHub Pages

1. 进入你的 GitHub 仓库页面
2. 点击顶部的 **"Settings"** (设置) 标签
3. 在左侧菜单向下滚动，找到 **"Pages"** 并点击
4. 在 "Build and deployment" (构建和部署) 部分：
   - **Source** 下拉菜单选择：**GitHub Actions**
   - ⚠️ **重要**：不要选择 "Deploy from a branch"
   - 选择后会显示 "Use a workflow file from your repository"
5. 页面会自动保存，无需额外操作

**关于 "There are no verified domains" 提示：**
- 这是正常的提示，可以忽略
- 这个功能用于企业级域名验证
- 不影响 GitHub Pages 的基本使用
- 只有当你想添加自定义域名时才需要关注

**正确的配置应该显示：**
```
Build and deployment
Source: GitHub Actions
Use a workflow file from your repository to build and deploy
```

### 5. 触发部署

部署会在以下情况自动触发：
- 每次推送代码到 `main` 分支
- 手动触发（在 Actions 标签页）

首次部署：
1. 进入仓库的 "Actions" 标签页
2. 你会看到 "Deploy to GitHub Pages" 工作流
3. 点击 "Run workflow" -> "Run workflow" 手动触发
4. 等待部署完成（通常需要 1-2 分钟）

### 6. 访问你的网站

部署成功后，你的网站将可以通过以下地址访问：

```
https://YOUR_USERNAME.github.io/lyrics_wordle/
```

例如，如果你的 GitHub 用户名是 `terence1023`，地址就是：
```
https://terence1023.github.io/lyrics_wordle/
```

## 🔧 后续更新

每次修改代码后，只需要：

```bash
git add .
git commit -m "描述你的更改"
git push
```

GitHub Actions 会自动重新部署你的网站。

## ✅ 验证部署

1. 在 Actions 标签页查看工作流状态（应该显示绿色对勾 ✓）
2. 打开你的 GitHub Pages 地址
3. 测试游戏功能是否正常

## 🐛 常见问题

### 问题1: 404 错误
- **解决方案**: 确保在 Settings -> Pages 中选择了 "GitHub Actions" 作为 Source
- 等待几分钟让部署生效

### 问题2: 部署失败
- **解决方案**: 
  - 检查 Actions 标签页中的错误日志
  - 确保 `.github/workflows/deploy.yml` 文件存在且格式正确
  - 确保仓库是 Public

### 问题3: 资源文件加载失败
- **解决方案**: 
  - 确保所有文件路径使用相对路径
  - 检查 `index.html` 中的资源引用

### 问题4: lyrics.json 加载失败
- **解决方案**: 
  - 确保 `lyrics.json` 文件在项目根目录
  - 检查文件编码是 UTF-8

## 📱 自定义域名（可选）

如果你有自己的域名，可以：

1. 在 Settings -> Pages -> Custom domain 输入你的域名
2. 在你的域名提供商处添加 DNS 记录：
   ```
   CNAME: YOUR_USERNAME.github.io
   ```

## 🎉 完成！

现在你的歌词猜谜游戏已经部署到 GitHub Pages，全世界的人都可以访问了！

分享你的游戏链接给朋友们吧：
```
https://YOUR_USERNAME.github.io/lyrics_wordle/
```

## 📊 监控访问量（可选）

你可以添加 Google Analytics 或其他统计工具来跟踪访问量：

1. 注册 Google Analytics
2. 在 `index.html` 的 `<head>` 标签中添加跟踪代码

---

**提示**: 记得在 `package.json` 中更新 repository 和 homepage 字段为你的实际 GitHub 仓库地址！
