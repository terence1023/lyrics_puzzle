# 📸 GitHub Pages 界面说明

## 你在 Pages 设置页面会看到什么？

打开 **Settings → Pages** 后，可能会看到以下几种界面：

---

## 界面类型 1: 标准界面（最常见）

```
┌────────────────────────────────────────────────────────┐
│ GitHub Pages                                           │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Source                                                 │
│ ┌────────────────────────────────────────┐            │
│ │ Deploy from a branch             ▼    │            │
│ └────────────────────────────────────────┘            │
│                                                        │
│ [点击这个下拉菜单，选择 "GitHub Actions"]               │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**操作：**
1. 点击 "Deploy from a branch" 右边的 ▼
2. 从列表中选择 "GitHub Actions"

---

## 界面类型 2: 新版界面

```
┌────────────────────────────────────────────────────────┐
│ GitHub Pages                                           │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Build and deployment                                   │
│                                                        │
│ Source                                                 │
│ ┌────────────────────────────────────────┐            │
│ │ GitHub Actions                   ▼    │            │
│ └────────────────────────────────────────┘            │
│                                                        │
│ Configure your GitHub Actions workflow below          │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**说明：**
- 如果已经显示 "GitHub Actions"，说明已经配置好了 ✓
- 如果显示其他选项，点击下拉菜单选择 "GitHub Actions"

---

## 界面类型 3: 首次配置界面

```
┌────────────────────────────────────────────────────────┐
│ GitHub Pages                                           │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Get started with GitHub Pages                         │
│                                                        │
│ Choose how you want to build and deploy your site:    │
│                                                        │
│ ○ Deploy from a branch                                │
│   Use a branch as the source for your site            │
│                                                        │
│ ● GitHub Actions (recommended)                        │
│   Use a GitHub Actions workflow to build and deploy   │
│                                                        │
│           [Continue]                                   │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**操作：**
1. 选择 "GitHub Actions" 选项（点击圆圈 ●）
2. 点击 "Continue" 按钮

---

## 界面类型 4: 禁用状态

```
┌────────────────────────────────────────────────────────┐
│ GitHub Pages                                           │
├────────────────────────────────────────────────────────┤
│                                                        │
│ ⓘ GitHub Pages is currently disabled.                │
│                                                        │
│ Source                                                 │
│ ┌────────────────────────────────────────┐            │
│ │ None                             ▼    │            │
│ └────────────────────────────────────────┘            │
│                                                        │
│ Select a source to enable GitHub Pages                │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**操作：**
1. 点击 "None" 下拉菜单
2. 选择 "GitHub Actions"

---

## ❓ 如果你的界面不是以上任何一种

### 请检查：

1. **仓库是否是 Public？**
   - Settings → General → 页面底部
   - 如果是 Private，需要升级到 GitHub Pro 才能使用 Pages

2. **工作流文件是否存在？**
   ```bash
   # 检查文件是否存在
   ls -la .github/workflows/deploy.yml
   
   # 如果不存在，推送代码
   git add .github/workflows/deploy.yml
   git commit -m "Add workflow"
   git push
   ```

3. **刷新页面**
   - 有时候需要刷新页面才能看到最新选项

---

## ✅ 配置成功的标志

配置完成后，页面应该显示以下**任意一种**：

```
✓ Source: GitHub Actions

或

✓ Your site will be built and deployed using GitHub Actions

或

Build and deployment
Source: GitHub Actions
Use a workflow file from your repository to build and deploy

或

✓ Your site is live at https://username.github.io/repo/
```

**看到这些信息就说明配置正确！** 🎉

---

## 🔍 关键词查找法

如果你不确定在哪里设置，在 Pages 页面上：

**按 Ctrl+F (Windows) 或 Cmd+F (Mac) 搜索以下关键词：**

1. `Source`
2. `GitHub Actions`
3. `Deploy`
4. `Build and deployment`

找到这些关键词附近的下拉菜单，就是你需要设置的地方！

---

## 📞 仍然找不到？

### 尝试以下步骤：

**步骤 1：确认你在正确的位置**
```
网址应该是：
https://github.com/你的用户名/lyrics_wordle/settings/pages
```

**步骤 2：检查仓库权限**
- 确保仓库是 Public
- 确保你是仓库的 Owner 或 Admin

**步骤 3：使用命令行查看当前设置**
```bash
# 在终端运行（需要安装 GitHub CLI）
gh repo view --web
```

**步骤 4：直接访问 API**
```bash
# 查看仓库的 Pages 配置
curl https://api.github.com/repos/你的用户名/lyrics_wordle/pages
```

---

## 💡 最简单的方法

如果实在找不到或不确定：

### 方法 1: 直接运行脚本
```bash
./setup-github-pages.sh
```
脚本会给出详细的操作指示。

### 方法 2: 发送截图
把你的 Settings → Pages 页面截图，我可以准确告诉你应该点哪里。

### 方法 3: 使用 GitHub 帮助
访问：https://docs.github.com/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

---

**记住核心目标：找到并选择 "GitHub Actions"！** 🎯
