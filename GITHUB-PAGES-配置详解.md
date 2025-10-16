# GitHub Pages 配置详解

## 📍 如何正确配置 GitHub Pages

### 第一步：进入 Settings

1. 打开你的 GitHub 仓库页面
2. 点击顶部的 **"Settings"** 标签（齿轮图标）

```
仓库首页 → Settings (设置)
```

---

### 第二步：找到 Pages 设置

1. 在左侧菜单栏向下滚动
2. 找到 **"Pages"** 选项（通常在 "Code and automation" 分组下）
3. 点击 **"Pages"**

```
左侧菜单：
├── General
├── Access
├── Collaborators
├── ...
├── Code and automation
│   ├── Pages  ← 点这里
│   ├── Webhooks
│   └── ...
```

---

### 第三步：配置 Source（最重要！）

进入 Pages 页面后，可能会看到以下几种情况：

#### 情况 1: 如果看到 "Build and deployment" 部分

**找到 "Source" 下拉菜单：**

```
Build and deployment
┌─────────────────────────────┐
│ Source: [下拉菜单]           │
└─────────────────────────────┘
```

点击下拉菜单，选择 **GitHub Actions**

---

#### 情况 2: 如果直接看到 "Source" 选项

页面可能直接显示：

```
┌──────────────────────────────────────┐
│ Source                               │
│ ┌──────────────────────────────────┐ │
│ │ [下拉菜单]                        │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

点击下拉菜单，选择 **GitHub Actions**

---

#### 情况 3: 如果页面显示 "Get started with GitHub Pages"

说明这是首次配置，页面会显示：

```
┌──────────────────────────────────────┐
│ Get started with GitHub Pages       │
│                                      │
│ Choose how to deploy your site:      │
│ ○ Deploy from a branch              │
│ ○ GitHub Actions (beta)             │
└──────────────────────────────────────┘
```

选择 **GitHub Actions**

---

#### ✅ 无论哪种情况，都选择 "GitHub Actions"

**选择后页面会显示：**

```
✓ Source: GitHub Actions
  Use a workflow file from your repository to build and deploy
```

或者：

```
Configure a GitHub Actions workflow
Your site will be built and deployed using GitHub Actions.
```

---

### 关于 "There are no verified domains" 提示

#### 这是什么？

在 Pages 设置页面上方，你可能会看到：

```
┌──────────────────────────────────────────────────────────┐
│ ⓘ There are no verified domains.                        │
│   Verify domains to restrict who can publish GitHub     │
│   Pages on them.                                         │
│   [Learn more about verified domains]                    │
└──────────────────────────────────────────────────────────┘
```

#### 可以忽略吗？

**✅ 是的，完全可以忽略！**

这个提示是：
- **用于企业/组织账户**的高级功能
- **用于自定义域名**的验证
- **不影响**基本的 `username.github.io/repo` 部署
- **只在使用自定义域名时**才需要关注

#### 你只需要关注：

在 "Build and deployment" 部分：
```
✓ Source: GitHub Actions  ← 确保这里选对了就行
```

---

### 第四步：确认配置

配置完成后，Pages 页面应该显示：

```
┌───────────────────────────────────────────────────────────┐
│ Build and deployment                                      │
│                                                           │
│ Source: GitHub Actions                                    │
│ Use a workflow file from your repository to build        │
│ and deploy.                                               │
│                                                           │
│ [Learn more about workflows]                              │
└───────────────────────────────────────────────────────────┘
```

**✅ 看到这个就说明配置正确了！**

---

### 第五步：等待部署

1. 配置保存后，GitHub 会自动开始部署
2. 切换到仓库的 **"Actions"** 标签
3. 你会看到一个 **"pages build and deployment"** 工作流正在运行

```
Actions 标签页：
┌──────────────────────────────────────────────────┐
│ ● pages build and deployment                     │
│   main · workflow                                │
│   ⏱ Running... (1m 23s)                         │
└──────────────────────────────────────────────────┘
```

4. 等待状态变为 **✓ 绿色对勾**（通常 1-3 分钟）

---

### 第六步：访问你的网站

部署成功后，在 Pages 设置页面顶部会显示：

```
┌───────────────────────────────────────────────────────────┐
│ ✓ Your site is live at                                   │
│   https://username.github.io/lyrics_wordle/               │
│   [Visit site]                                            │
└───────────────────────────────────────────────────────────┘
```

点击链接或直接访问：
```
https://你的用户名.github.io/lyrics_wordle/
```

---

## 🐛 常见问题排查

### 问题 1: 找不到 "GitHub Actions" 选项

**可能原因：**
- 仓库是 Private（私有）
- 没有 `.github/workflows/deploy.yml` 文件

**解决方案：**
1. 确保仓库是 **Public**（公开）
2. 确保项目中有 `.github/workflows/deploy.yml` 文件
3. 刷新页面重试

---

### 问题 2: 部署后显示 404

**可能原因：**
- 部署还在进行中
- Source 选择错误

**解决方案：**
1. 检查 Actions 标签页，确认部署已完成
2. 确认 Source 选择的是 "GitHub Actions"
3. 等待 5-10 分钟再试
4. 清除浏览器缓存

---

### 问题 3: Actions 显示失败

**解决方案：**
1. 点击失败的工作流查看详细日志
2. 检查 `.github/workflows/deploy.yml` 文件是否正确
3. 确保仓库是 Public

---

## 📸 配置对比

### ❌ 错误配置

```
Source: Deploy from a branch
Branch: main  /root
```
这种配置**不会使用** GitHub Actions 工作流。

### ✅ 正确配置

```
Source: GitHub Actions
Use a workflow file from your repository to build and deploy
```
这种配置**会使用**你的 `.github/workflows/deploy.yml` 文件。

---

## 🎯 快速检查清单

在部署前，确认以下几点：

- [ ] 仓库是 **Public**（公开）
- [ ] 代码已推送到 GitHub
- [ ] 存在 `.github/workflows/deploy.yml` 文件
- [ ] Settings → Pages → Source 选择了 **GitHub Actions**
- [ ] Actions 标签页显示部署成功（绿色 ✓）

**全部打勾？恭喜你，网站已经部署成功！** 🎉

---

## 💡 额外提示

### 关于自定义域名

如果将来你想使用自定义域名（如 `lyrics.example.com`）：

1. 在 Pages 设置中找到 "Custom domain"
2. 输入你的域名
3. 点击 "Save"
4. 按照提示验证域名所有权
5. 在你的域名提供商处添加 DNS 记录

这时候才需要关注 "verified domains" 的设置。

### 关于 HTTPS

GitHub Pages 自动为你提供 HTTPS：
- 默认域名：`https://username.github.io/repo/`
- 自定义域名：配置后也会自动启用 HTTPS

---

**还有问题？** 

查看 [GitHub Pages 官方文档](https://docs.github.com/pages) 或在仓库 Issues 中提问。
