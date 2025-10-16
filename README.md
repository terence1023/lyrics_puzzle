# 🎵 歌词猜猜乐 (Lyrics Wordle)

一个基于歌词的猜词游戏，玩家需要在6次机会内猜出随机选择的歌词。

## 🎮 游戏规则

- 玩家有6次机会猜出正确的歌词
- 每次猜测后，系统会用颜色给出提示：
  - 🟢 **绿色**：字符正确且位置正确
  - 🟡 **黄色**：字符正确但位置错误  
  - ⚫ **灰色**：字符不在答案中

## 🚀 快速开始

### 方法一：本地运行

```bash
# 1. 克隆项目
git clone https://github.com/terence1023/lyrics_puzzle.git
cd lyrics_puzzle

# 2. 安装依赖
npm install

# 3. 启动服务器
npm start

# 4. 访问游戏
# 浏览器打开 http://localhost:3000
```

### 方法二：部署到 GitHub Pages（推荐）

**永久在线，免费访问，无需服务器！**

```bash
# 运行部署脚本
./deploy-github.sh
```

部署后，你的游戏将可通过以下地址访问：
```
https://YOUR_USERNAME.github.io/lyrics_wordle/
```

**GitHub Pages 部署步骤：**

1. 确保你的代码已推送到 GitHub 仓库
2. 运行 `./deploy-github.sh` 脚本
3. 脚本会自动：
   - 创建 `gh-pages` 分支
   - 复制必要文件（index.html, script.js, style.css, lyrics.json）
   - 推送到 GitHub
4. 在 GitHub 仓库设置中启用 GitHub Pages
   - 进入 Settings → Pages
   - Source 选择 `gh-pages` 分支
   - 保存后等待几分钟即可访问

## 📁 项目结构

```
lyrics_wordle/
├── index.html          # 前端页面
├── style.css           # 样式文件
├── script.js           # 游戏逻辑（纯前端）
├── lyrics.json         # 歌词库
├── server.js           # 本地开发服务器（可选）
├── package.json        # 项目配置
├── start.sh            # 本地启动脚本
├── deploy.sh           # 本地部署脚本
├── deploy-github.sh    # GitHub Pages 部署脚本
├── 素材/               # 游戏素材文件夹
└── README.md           # 说明文档
```

## 🛠 技术栈

- **前端**: HTML5 + CSS3 + 原生JavaScript
- **后端**: Node.js + Express（仅用于本地开发）
- **部署**: GitHub Pages（纯前端静态部署）

## 🎯 核心功能

- ✅ 响应式游戏界面
- ✅ 6x N 自适应网格布局
- ✅ 实时输入验证
- ✅ 动画效果和视觉反馈
- ✅ 智能提示系统（包含答案字符的汉字提示库）
- ✅ Unicode 字符完美支持（表情符号等）
- ✅ 纯前端实现，无需后端服务器
- ✅ 本地存储游戏进度

## 🔧 自定义配置

### 修改歌词库

编辑 `lyrics.json` 文件添加更多歌词：

```json
[
  "你的歌词1",
  "你的歌词2",
  "你的歌词3"
]
```

### 修改游戏设置

在 `script.js` 中可以调整：
- `maxAttempts`: 最大尝试次数（默认6次）
- 输入验证规则
- 动画效果和颜色

## � 响应式设计

- ✅ 支持桌面端和移动端
- ✅ 自适应屏幕尺寸
- ✅ 触摸友好的操作界面

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

MIT License

## 🎵 注意事项

游戏中的歌词来自流行的中文歌曲，仅用于娱乐和学习目的。

---

享受猜歌词的乐趣吧！🎶
