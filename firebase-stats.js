// Firebase 全局统计系统
// 使用 Firebase Realtime Database 存储真实的全局统计数据

class FirebaseStats {
    constructor() {
        this.db = null;
        this.initialized = false;
        
        // Firebase 配置（请在设置完成后替换）
        this.config = {
            apiKey: "AIzaSyBaxJ_oKOy1L7sz0Js3RLRiqZmFyXclyDY",
            authDomain: "lyrics-puzzle.firebaseapp.com",
            databaseURL: "https://lyrics-puzzle-default-rtdb.asia-southeast1.firebasedatabase.app",
            projectId: "lyrics-puzzle",
            storageBucket: "lyrics-puzzle.firebasestorage.app",
            messagingSenderId: "1017592814849",
            appId: "1:1017592814849:web:3010e48eac80b281e40f00"
        };
    }
    
    // 获取今日日期
    getTodayKey() {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    }
    
    // 初始化 Firebase
    async initFirebase() {
        try {
            // 检查配置是否已更新
            if (this.config.apiKey === "YOUR_API_KEY_HERE") {
                console.warn('⚠️ Firebase 未配置，使用模拟数据');
                return false;
            }
            
            // 动态导入 Firebase SDK
            const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
            const { getDatabase, ref, get, runTransaction } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
            
            // 初始化应用
            const app = initializeApp(this.config);
            this.db = getDatabase(app);
            this.dbRef = ref;
            this.dbGet = get;
            this.dbTransaction = runTransaction;
            
            this.initialized = true;
            console.log('✅ Firebase 初始化成功');
            return true;
        } catch (error) {
            console.error('❌ Firebase 初始化失败:', error);
            return false;
        }
    }
    
    // 获取今日通过人数
    async getTodayWins() {
        if (!this.initialized) {
            return this.getSimulatedWins();
        }
        
        try {
            const today = this.getTodayKey();
            const winsRef = this.dbRef(this.db, `dailyStats/${today}`);
            const snapshot = await this.dbGet(winsRef);
            const wins = snapshot.val() || 0;
            console.log(`📊 今日全球通过人数: ${wins}`);
            return wins;
        } catch (error) {
            console.error('获取数据失败:', error);
            return this.getSimulatedWins();
        }
    }
    
    // 模拟数据（Firebase 未配置时使用）
    getSimulatedWins() {
        const today = this.getTodayKey();
        let seed = 0;
        for (let i = 0; i < today.length; i++) {
            seed = seed * 31 + today.charCodeAt(i);
        }
        const baseWins = 20 + (Math.abs(seed) % 40);
        const hourIncrement = Math.floor(new Date().getHours() / 2) * (1 + (Math.abs(seed) % 3));
        return baseWins + hourIncrement;
    }
    
    // 记录通关
    async recordWin() {
        const today = this.getTodayKey();
        const localKey = `firebase_win_${today}`;
        
        // 检查本地是否已记录
        if (localStorage.getItem(localKey)) {
            console.log('ℹ️ 今日已记录，跳过');
            return;
        }
        
        if (!this.initialized) {
            console.log('⚠️ Firebase 未初始化，仅本地记录');
            localStorage.setItem(localKey, 'true');
            await this.updateDisplay();
            return;
        }
        
        try {
            const winsRef = this.dbRef(this.db, `dailyStats/${today}`);
            
            // 使用事务确保原子性
            await this.dbTransaction(winsRef, (currentValue) => {
                return (currentValue || 0) + 1;
            });
            
            localStorage.setItem(localKey, 'true');
            console.log('✅ 全球统计已更新');
            
            await this.updateDisplay();
            this.showWinAnimation();
        } catch (error) {
            console.error('❌ 记录失败:', error);
            localStorage.setItem(localKey, 'true');
        }
    }
    
    // 更新显示
    async updateDisplay() {
        const wins = await this.getTodayWins();
        const elem = document.getElementById('daily-wins');
        if (elem) {
            elem.textContent = wins;
        }
    }
    
    // 显示动画
    showWinAnimation() {
        const panel = document.querySelector('.daily-stats-panel');
        const number = document.getElementById('daily-wins');
        if (panel && number) {
            panel.style.animation = 'none';
            number.style.animation = 'none';
            
            setTimeout(() => {
                panel.style.animation = 'celebration 0.6s ease-out';
                number.style.animation = 'numberPop 0.5s ease-out';
            }, 10);
        }
    }
    
    // 初始化
    async init() {
        console.log('🚀 初始化 Firebase 全局统计系统...');
        
        // 添加动画样式
        if (!document.getElementById('daily-stats-animations')) {
            const style = document.createElement('style');
            style.id = 'daily-stats-animations';
            style.textContent = `
                @keyframes celebration {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1) rotate(5deg); }
                    100% { transform: scale(1) rotate(0deg); }
                }
                
                @keyframes numberPop {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.3); }
                    100% { transform: scale(1); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // 初始化 Firebase
        await this.initFirebase();
        
        // 更新显示
        await this.updateDisplay();
        
        // 每5分钟刷新一次数据
        setInterval(() => {
            this.updateDisplay();
        }, 5 * 60 * 1000);
        
        console.log('✅ 全局统计系统初始化完成');
        console.log(`   模式: ${this.initialized ? '☁️ Firebase云端' : '🎭 模拟数据'}`);
    }
}

// 创建全局实例
const firebaseStats = new FirebaseStats();

// 兼容原有接口
const GlobalStats = {
    getTodayWins: () => firebaseStats.getTodayWins(),
    recordWin: () => firebaseStats.recordWin(),
    updateDisplay: () => firebaseStats.updateDisplay(),
    init: () => firebaseStats.init()
};

const DailyStats = GlobalStats;
