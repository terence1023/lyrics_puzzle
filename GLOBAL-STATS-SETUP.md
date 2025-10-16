# 全局统计数据配置

## 使用 GitHub Gist 作为数据存储

### 设置步骤：

1. **创建 GitHub Personal Access Token**
   - 访问：https://github.com/settings/tokens
   - 点击 "Generate new token (classic)"
   - 勾选权限：`gist`
   - 生成并复制 token

2. **创建公开 Gist**
   - 访问：https://gist.github.com/
   - 创建一个新的 Gist
   - 文件名：`lyrics-puzzle-stats.json`
   - 内容：
   ```json
   {
     "dailyStats": {},
     "lastUpdate": ""
   }
   ```
   - 创建为 Public Gist
   - 复制 Gist ID（URL中的字符串）

3. **配置到代码中**
   在 `script.js` 中设置：
   ```javascript
   GIST_ID: 'your_gist_id_here',
   GITHUB_TOKEN: 'your_token_here'  // 可选，用于写入
   ```

### 方案二：使用第三方服务（推荐）

使用免费的后端服务：

1. **JSONBin.io** (免费，无需登录)
   - 限制：每月 10,000 次请求
   - 无需 token

2. **Firebase Realtime Database** (Google)
   - 免费额度充足
   - 实时同步

3. **Supabase** (开源)
   - PostgreSQL 数据库
   - 免费额度充足

### 当前简化方案

由于配置复杂度，我先实现一个**模拟全局统计**的版本：
- 使用固定的种子值生成"全球统计"
- 基于日期和题目生成确定性的统计数字
- 所有用户看到相同的模拟数据

这样无需后端配置，但数据是模拟的。

如果需要真实的全局统计，建议使用 Firebase 或其他后端服务。
