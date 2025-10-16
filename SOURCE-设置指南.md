# ⚙️ GitHub Pages Source 设置指南

## 问题：如何选择 Source？

在 GitHub Pages 设置中，你会看到一个 **Source** 下拉菜单。以下是详细说明：

---

## 📍 位置

```
你的仓库 → Settings → Pages → Build and deployment → Source
```

---

## 🎯 正确选择

### 点击 "Source" 下拉菜单后，会看到：

```
┌────────────────────────────────┐
│ ● GitHub Actions             │  ← ✅ 选这个！
├────────────────────────────────┤
│ ○ Deploy from a branch       │  ← ❌ 不要选
└────────────────────────────────┘
```

### ✅ 选择：**GitHub Actions**

选择后会显示：
```
Source: GitHub Actions

Use a workflow file from your repository 
to build and deploy.
```

这样 GitHub 会使用你项目中的 `.github/workflows/deploy.yml` 文件来自动部署。

---

## ❓ 关于 "There are no verified domains"

### 你可能会在页面上方看到：

```
┌──────────────────────────────────────────────┐
│ ⓘ There are no verified domains.           │
│   Verify domains to restrict who can       │
│   publish GitHub Pages on them.             │
└──────────────────────────────────────────────┘
```

### 这个提示：

- ✅ **可以完全忽略**
- ✅ **不影响部署**
- ✅ **只是一个信息提示**

### 什么时候需要关注？

**只在以下情况才需要：**
- 你是企业/组织账户
- 你想使用自定义域名（如 `lyrics.example.com`）
- 你想限制谁可以发布 Pages

**对于个人项目使用默认的 `username.github.io/repo/` 地址：**
- ❌ 不需要验证域名
- ❌ 不需要任何额外设置
- ✅ 直接忽略这个提示即可

---

## 🔍 如何确认配置正确

### 配置完成后，检查以下几点：

#### 1. Pages 设置页面显示：

```
Build and deployment
┌────────────────────────────────────┐
│ Source: GitHub Actions            │
│ Use a workflow file from your     │
│ repository to build and deploy.   │
└────────────────────────────────────┘
```

#### 2. 切换到 Actions 标签页：

- 应该能看到 "pages build and deployment" 工作流
- 状态应该是 🟢 绿色（成功）或 🟡 黄色（进行中）

#### 3. 部署成功后，Pages 设置顶部显示：

```
┌────────────────────────────────────────────┐
│ ✓ Your site is live at                   │
│   https://username.github.io/repo/        │
└────────────────────────────────────────────┘
```

---

## 📋 完整操作步骤

### 第 1 步：进入 Settings
- 打开你的 GitHub 仓库
- 点击顶部的 **Settings** 标签

### 第 2 步：找到 Pages
- 左侧菜单向下滚动
- 点击 **Pages**

### 第 3 步：选择 Source
- 找到 "Build and deployment" 部分
- 点击 **Source** 下拉菜单
- 选择 **GitHub Actions**

### 第 4 步：等待部署
- 配置自动保存
- 切换到 **Actions** 标签
- 等待部署完成（1-3 分钟）

### 第 5 步：访问网站
- 部署成功后，访问显示的链接
- 或直接访问 `https://你的用户名.github.io/仓库名/`

---

## 🎯 总结

1. **Source 选择**: GitHub Actions ✅
2. **忽略**: "There are no verified domains" 提示 ✅
3. **等待**: 1-3 分钟部署完成 ✅
4. **访问**: `https://username.github.io/repo/` ✅

就这么简单！🎉

---

## 💡 还有问题？

查看更详细的文档：
- `GITHUB-PAGES-配置详解.md` - 超详细图文教程
- `DEPLOY-GITHUB-PAGES.md` - 完整部署指南
- `QUICK-DEPLOY.md` - 3步快速部署

或者直接查看 [GitHub Pages 官方文档](https://docs.github.com/pages)
