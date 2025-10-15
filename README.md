# 🎵 歌词猜猜乐 (Lyrics Wordle)

一个基于歌词的猜词游戏，玩家需要在6次机会内猜出随机选择的歌词。

## 🎮 游戏规则

- 玩家有6次机会猜出正确的歌词
- 每次猜测后，系统会用颜色给出提示：
  - 🟢 **<span style="background-color: #6aaa64; color: white; padding: 2px 6px; border-radius: 4px;">绿色</span>**：字符正确且位置正确
  - 🟡 **<span style="background-color: #c9b458; color: white; padding: 2px 6px; border-radius: 4px;">黄色</span>**：字符正确但位置错误  
  - ⚫ **<span style="background-color: #787c7e; color: white; padding: 2px 6px; border-radius: 4px;">灰色</span>**：字符不在答案中

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 启动生产服务器
```bash
npm start
```

### 访问游戏
打开浏览器访问 `http://localhost:3000`

## 📁 项目结构

```
lyrics-wordle/
├── index.html          # 前端页面
├── style.css          # 样式文件
├── script.js          # 前端逻辑
├── server.js          # 后端服务器
├── lyrics.json        # 歌词库
├── package.json       # 项目配置
└── README.md          # 说明文档
```

## 🛠 技术栈

- **前端**: HTML5 + CSS3 + 原生JavaScript
- **后端**: Node.js + Express
- **部署**: 支持Vercel等平台

## 🎯 核心功能

### 前端功能
- 响应式游戏界面
- 6x N 自适应网格布局
- 实时输入验证
- 动画效果和视觉反馈
- 游戏状态管理
- **智能提示系统**：显示包含答案中所有字符的提示汉字库，方便玩家输入

### 后端功能
- RESTful API接口
- 歌词库管理
- 智能字符比较算法
- 错误处理和日志记录
- **提示汉字生成**：自动生成包含歌词所有字符的汉字提示库

## 📡 API接口

### GET /api/game-state
获取当前游戏状态和目标歌词

**响应示例:**
```json
{
  "success": true,
  "lyric": "青春如同奔流的江河",
  "length": 9
}
```

### POST /api/guess
提交猜测并获取颜色反馈

**请求示例:**
```json
{
  "guess": "青春如同奔流的江河"
}
```

**响应示例:**
```json
{
  "success": true,
  "correct": true,
  "colors": ["correct", "correct", "correct", "correct", "correct", "correct", "correct", "correct", "correct"]
}
```

## 🎨 颜色状态说明

- `correct`: 字符正确且位置正确（<span style="background-color: #6aaa64; color: white; padding: 2px 6px; border-radius: 4px;">绿色</span>）
- `present`: 字符存在但位置错误（<span style="background-color: #c9b458; color: white; padding: 2px 6px; border-radius: 4px;">黄色</span>）
- `absent`: 字符不在答案中（<span style="background-color: #787c7e; color: white; padding: 2px 6px; border-radius: 4px;">灰色</span>）

## 💡 智能提示系统

游戏提供智能提示汉字库功能：
- **包含所有答案字符**：提示汉字库中包含歌词的所有字符，确保玩家能够找到正确答案
- **混合干扰字符**：同时包含其他常用汉字作为干扰，保持游戏挑战性
- **点击输入**：玩家可以直接点击提示汉字进行输入，提升游戏体验
- **动态生成**：每次新游戏都会生成不同的提示汉字组合

## 📱 响应式设计

- 支持桌面端和移动端
- 自适应屏幕尺寸
- 触摸友好的操作界面

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
- `maxAttempts`: 最大尝试次数
- 输入验证规则
- 动画效果

## 🚀 部署到Vercel

1. 将代码推送到GitHub仓库
2. 在Vercel中导入项目
3. Vercel会自动检测Node.js项目并部署
4. 访问生成的URL即可游戏

### Vercel配置文件 (可选)
创建 `vercel.json` 文件：
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ]
}
```

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 📄 许可证

MIT License - 详见 LICENSE 文件

## 🎵 歌词来源

游戏中的歌词来自流行的中文歌曲，仅用于娱乐和学习目的。

---

享受猜歌词的乐趣吧！🎶
