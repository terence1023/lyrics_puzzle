// 全局统计系统 - 使用 GitHub Gist 作为免费云端存储
// 这个版本可以让所有用户看到相同的全局统计数据

const CloudStats = {
    // 配置
    GIST_ID: 'PUT_YOUR_GIST_ID_HERE', // 替换为你的 Gist ID
    GITHUB_TOKEN: '', // 可选：私有Gist需要token
    USE_CLOUD: false, // 设置为 true 启用云端统计
    
    // 获取今日日期
    getTodayKey() {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    },
    
    // 从 Gist 获取数据
    async fetchFromGist() {
        try {
            const url = `https://api.github.com/gists/${this.GIST_ID}`;
            const headers = {};
            
            if (this.GITHUB_TOKEN) {
                headers['Authorization'] = `token ${this.GITHUB_TOKEN}`;
            }
            
            const response = await fetch(url, { headers });
            const gist = await response.json();
            
            // 获取第一个文件的内容
            const filename = Object.keys(gist.files)[0];
            const content = gist.files[filename].content;
            
            return JSON.parse(content);
        } catch (error) {
            console.error('获取Gist数据失败:', error);
            return { dailyStats: {} };
        }
    },
    
    // 更新 Gist 数据
    async updateGist(data) {
        try {
            const url = `https://api.github.com/gists/${this.GIST_ID}`;
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (this.GITHUB_TOKEN) {
                headers['Authorization'] = `token ${this.GITHUB_TOKEN}`;
            }
            
            const response = await fetch(url, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({
                    files: {
                        'lyrics-puzzle-stats.json': {
                            content: JSON.stringify(data, null, 2)
                        }
                    }
                })
            });
            
            return response.ok;
        } catch (error) {
            console.error('更新Gist数据失败:', error);
            return false;
        }
    },
    
    // 获取今日通过人数
    async getTodayWins() {
        if (!this.USE_CLOUD) {
            // 降级到本地统计
            const localData = localStorage.getItem('localDailyStats');
            const stats = localData ? JSON.parse(localData) : {};
            return stats[this.getTodayKey()] || 0;
        }
        
        const data = await this.fetchFromGist();
        return data.dailyStats[this.getTodayKey()] || 0;
    },
    
    // 记录通关
    async recordWin() {
        const today = this.getTodayKey();
        const localKey = `recorded_${today}`;
        
        // 检查是否已记录
        if (localStorage.getItem(localKey)) {
            console.log('今日已记录，跳过');
            return;
        }
        
        if (!this.USE_CLOUD) {
            // 本地统计
            const localData = localStorage.getItem('localDailyStats');
            const stats = localData ? JSON.parse(localData) : {};
            stats[today] = (stats[today] || 0) + 1;
            localStorage.setItem('localDailyStats', JSON.stringify(stats));
            localStorage.setItem(localKey, 'true');
        } else {
            // 云端统计
            const data = await this.fetchFromGist();
            if (!data.dailyStats[today]) {
                data.dailyStats[today] = 0;
            }
            data.dailyStats[today]++;
            data.lastUpdate = new Date().toISOString();
            
            const success = await this.updateGist(data);
            if (success) {
                localStorage.setItem(localKey, 'true');
            }
        }
        
        // 更新显示
        await this.updateDisplay();
    },
    
    // 更新显示
    async updateDisplay() {
        const wins = await this.getTodayWins();
        const elem = document.getElementById('daily-wins');
        if (elem) {
            elem.textContent = wins;
        }
    },
    
    // 初始化
    async init() {
        console.log(`统计模式: ${this.USE_CLOUD ? '☁️ 云端' : '💾 本地'}`);
        await this.updateDisplay();
    }
};
