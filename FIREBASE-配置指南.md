# 🔥 Firebase 实时配置指南

## 📋 配置步骤概览

1. ✅ 创建 Firebase 项目
2. ✅ 启用 Realtime Database
3. ✅ 配置安全规则
4. ✅ 获取配置信息
5. ✅ 更新代码
6. ✅ 测试和部署

---

## 第一步：创建 Firebase 项目

### 1.1 访问 Firebase Console

打开浏览器，访问：**https://console.firebase.google.com/**

### 1.2 创建新项目

1. 点击 **"添加项目"** 或 **"Create a project"**
2. 输入项目名称：`lyrics-puzzle`（或你喜欢的名称）
3. Google Analytics：选择 **关闭**（不需要）
4. 点击 **"创建项目"**
5. 等待项目创建完成（约30-60秒）
6. 点击 **"继续"**

---

## 第二步：启用 Realtime Database

### 2.1 进入 Realtime Database

1. 在左侧菜单中找到 **"构建"** 或 **"Build"**
2. 点击 **"Realtime Database"**
3. 点击 **"创建数据库"** 或 **"Create Database"**

### 2.2 选择位置

选择数据库位置：
- **推荐：** `asia-southeast1` (新加坡) - 亚洲用户速度最快
- 或者：`us-central1` (美国中部) - 全球平衡

### 2.3 设置安全规则

选择 **"测试模式"** (Test mode)
- 这会允许所有人读写数据（30天后自动失效）
- 我们稍后会设置更安全的规则

点击 **"启用"**

---

## 第三步：配置安全规则

### 3.1 打开规则编辑器

在 Realtime Database 页面，点击 **"规则"** 标签

### 3.2 设置规则

将规则替换为：

```json
{
  "rules": {
    "dailyStats": {
      ".read": true,
      "$date": {
        ".write": "!data.exists() || newData.val() >= data.val()",
        ".validate": "newData.isNumber() && newData.val() >= 0"
      }
    }
  }
}
```

**规则说明：**
- ✅ 所有人可以读取数据
- ✅ 只能增加数字，不能减少（防止恶意篡改）
- ✅ 只接受数字类型
- ✅ 数字必须大于等于0

点击 **"发布"**

---

## 第四步：获取配置信息

### 4.1 进入项目设置

1. 点击左上角的 **齿轮图标** ⚙️
2. 选择 **"项目设置"** 或 **"Project settings"**

### 4.2 添加 Web 应用

1. 滚动到 **"您的应用"** 部分
2. 点击 **Web 图标** `</>`
3. 输入应用昵称：`lyrics-puzzle-web`
4. **不要勾选** "Firebase Hosting"
5. 点击 **"注册应用"**

### 4.3 复制配置代码

你会看到类似这样的代码：

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "lyrics-puzzle-xxxxx.firebaseapp.com",
  databaseURL: "https://lyrics-puzzle-xxxxx-default-rtdb.firebaseio.com",
  projectId: "lyrics-puzzle-xxxxx",
  storageBucket: "lyrics-puzzle-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxxx"
};
```

**重要：** 复制这段配置，我们马上要用到！

---

## 第五步：更新代码

### 5.1 打开 firebase-stats.js

找到文件中的配置部分：

```javascript
this.config = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 5.2 替换配置

将上面的配置替换为你从 Firebase 复制的配置。

**示例：**

```javascript
this.config = {
    apiKey: "AIzaSyAbc123...",  // 你的真实 API Key
    authDomain: "lyrics-puzzle-12345.firebaseapp.com",
    databaseURL: "https://lyrics-puzzle-12345-default-rtdb.firebaseio.com",
    projectId: "lyrics-puzzle-12345",
    storageBucket: "lyrics-puzzle-12345.appspot.com",
    messagingSenderId: "987654321098",
    appId: "1:987654321098:web:abcdefghijk"
};
```

### 5.3 更新 index.html

在 `index.html` 的 `</body>` 标签之前，添加：

```html
<script src="firebase-stats.js"></script>
```

**完整示例：**

```html
    <!-- 其他内容... -->
    
    <script src="firebase-stats.js"></script>
    <script src="script.js"></script>
</body>
</html>
```

---

## 第六步：测试

### 6.1 本地测试

1. 打开浏览器
2. 访问 `index.html`
3. 打开浏览器控制台（F12）

**预期看到：**
```
🚀 初始化 Firebase 全局统计系统...
✅ Firebase 初始化成功
📊 今日全球通过人数: 0
✅ 全局统计系统初始化完成
   模式: ☁️ Firebase云端
```

### 6.2 测试通关

1. 玩游戏并通关
2. 查看右上角数字是否增加
3. 在 Firebase Console 查看数据

**在 Firebase Console 验证：**
- 打开 Realtime Database
- 查看 `dailyStats/2025-10-16`
- 应该看到数字增加了

### 6.3 多设备测试

1. 在另一个浏览器或设备打开页面
2. 应该看到相同的通过人数
3. 在一个设备通关后，另一个设备刷新应该看到更新

---

## 第七步：部署到 GitHub Pages

### 7.1 提交代码

```bash
git add firebase-stats.js index.html
git commit -m "添加Firebase全局统计功能"
git push origin main
```

### 7.2 验证部署

1. 等待 GitHub Pages 构建（1-2分钟）
2. 访问你的 GitHub Pages 网站
3. 检查功能是否正常

---

## 🔍 故障排查

### 问题 1: 显示 "模拟数据"

**原因：** Firebase 配置未正确填写

**解决：**
1. 检查 `firebase-stats.js` 中的配置
2. 确保没有 `"YOUR_API_KEY_HERE"` 这样的占位符
3. 确保所有字段都已填写

### 问题 2: 控制台错误 "Firebase: Error (auth/...)"

**原因：** 安全规则配置错误

**解决：**
1. 检查 Firebase Console 的规则设置
2. 确保规则允许读写

### 问题 3: 数字不更新

**原因：** 网络问题或已记录

**解决：**
1. 检查网络连接
2. 清除浏览器 LocalStorage
3. 刷新页面重试

### 问题 4: CORS 错误

**原因：** 域名未授权

**解决：**
1. 在 Firebase Console > Authentication
2. 添加你的域名到授权域名列表

---

## 📊 查看统计数据

### 在 Firebase Console 查看

1. 打开 Realtime Database
2. 展开 `dailyStats`
3. 看到每日的通过人数

**数据格式：**
```
dailyStats/
  ├── 2025-10-16: 23
  ├── 2025-10-17: 45
  └── 2025-10-18: 12
```

### 导出数据

1. 在 Realtime Database 页面
2. 点击 "导出 JSON"
3. 保存数据备份

---

## 🔒 安全最佳实践

### 1. 限制写入频率

在规则中添加：

```json
{
  "rules": {
    "dailyStats": {
      ".read": true,
      "$date": {
        ".write": "!data.exists() || (newData.val() <= data.val() + 100 && newData.val() >= data.val())"
      }
    }
  }
}
```

### 2. 监控使用量

- 定期检查 Firebase Console 的使用统计
- 免费额度：每月 1GB 下载，100,000 并发连接

### 3. 设置预算提醒

- Firebase Console > 使用情况和结算
- 设置预算提醒（推荐：$5）

---

## 💰 费用说明

### 免费额度（Spark 计划）

- ✅ 1 GB 存储
- ✅ 10 GB/月 下载
- ✅ 100,000 并发连接
- ✅ 完全免费，无需信用卡

### 预计使用量

对于歌词游戏项目：
- 每次通关：约 100 字节
- 每天 1000 次通关：约 0.1 MB
- **结论：** 免费额度完全够用！

---

## ✅ 配置完成检查清单

- [ ] Firebase 项目已创建
- [ ] Realtime Database 已启用
- [ ] 安全规则已设置
- [ ] 配置已复制并更新到代码
- [ ] `firebase-stats.js` 已引入到 `index.html`
- [ ] 本地测试通过
- [ ] Firebase Console 可以看到数据
- [ ] 代码已提交到 GitHub
- [ ] GitHub Pages 部署成功

---

## 🎉 完成！

恭喜！你已经成功配置了 Firebase 全局统计功能。

现在所有用户都能看到相同的实时通过人数了！🏆

---

**需要帮助？** 查看 Firebase 文档：https://firebase.google.com/docs/database
