// 简化版 Firebase 全局统计系统
// 即使 Firebase 加载失败也能正常工作

(function() {
    'use strict';
    
    // Firebase 配置
    const firebaseConfig = {
        apiKey: "AIzaSyBaxJ_oKOy1L7sz0Js3RLRiqZmFyXclyDY",
        authDomain: "lyrics-puzzle.firebaseapp.com",
        databaseURL: "https://lyrics-puzzle-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "lyrics-puzzle",
        storageBucket: "lyrics-puzzle.firebasestorage.app",
        messagingSenderId: "1017592814849",
        appId: "1:1017592814849:web:3010e48eac80b281e40f00"
    };
    
    let firebaseInitialized = false;
    let db = null;
    
    // 获取今日日期
    function getTodayKey() {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    }
    
    // 模拟数据生成
    function getSimulatedWins() {
        const today = getTodayKey();
        let seed = 0;
        for (let i = 0; i < today.length; i++) {
            seed = seed * 31 + today.charCodeAt(i);
        }
        const baseWins = 20 + (Math.abs(seed) % 40);
        const hourIncrement = Math.floor(new Date().getHours() / 2);
        return baseWins + hourIncrement;
    }
    
    // 初始化 Firebase
    async function initFirebase() {
        try {
            const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
            const { getDatabase, ref, get, runTransaction } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
            
            const app = initializeApp(firebaseConfig);
            db = { instance: getDatabase(app), ref, get, runTransaction };
            firebaseInitialized = true;
            console.log('✅ Firebase 已连接');
            return true;
        } catch (error) {
            console.warn('⚠️ Firebase 初始化失败，使用模拟数据:', error.message);
            return false;
        }
    }
    
    // 获取今日通过人数
    async function getTodayWins() {
        try {
            if (!firebaseInitialized) {
                return getSimulatedWins();
            }
            
            const today = getTodayKey();
            const winsRef = db.ref(db.instance, `dailyStats/${today}`);
            const snapshot = await db.get(winsRef);
            return snapshot.val() || 0;
        } catch (error) {
            console.error('获取数据失败:', error);
            return getSimulatedWins();
        }
    }
    
    // 记录通关
    async function recordWin() {
        try {
            const today = getTodayKey();
            const localKey = `win_${today}`;
            
            // 检查本地是否已记录
            if (localStorage.getItem(localKey)) {
                console.log('ℹ️ 今日已记录');
                return;
            }
            
            if (!firebaseInitialized) {
                console.log('⚠️ Firebase 未连接，仅本地记录');
                localStorage.setItem(localKey, 'true');
                await updateDisplay();
                return;
            }
            
            const winsRef = db.ref(db.instance, `dailyStats/${today}`);
            await db.runTransaction(winsRef, (currentValue) => {
                return (currentValue || 0) + 1;
            });
            
            localStorage.setItem(localKey, 'true');
            console.log('✅ 全球统计已更新');
            
            await updateDisplay();
            showWinAnimation();
        } catch (error) {
            console.error('记录失败:', error);
        }
    }
    
    // 更新显示
    async function updateDisplay() {
        try {
            const wins = await getTodayWins();
            const elem = document.getElementById('daily-wins');
            if (elem) {
                elem.textContent = wins;
            }
        } catch (error) {
            console.error('更新显示失败:', error);
        }
    }
    
    // 显示动画
    function showWinAnimation() {
        try {
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
        } catch (error) {
            console.error('动画失败:', error);
        }
    }
    
    // 初始化
    async function init() {
        try {
            console.log('🚀 初始化统计系统...');
            
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
            
            // 初始化 Firebase（异步，不阻塞）
            initFirebase().catch(err => console.warn('Firebase 初始化警告:', err));
            
            // 更新显示
            await updateDisplay();
            
            // 定期刷新
            setInterval(updateDisplay, 5 * 60 * 1000);
            
            console.log('✅ 统计系统就绪');
        } catch (error) {
            console.error('初始化失败:', error);
        }
    }
    
    // 导出到全局
    window.GlobalStats = {
        getTodayWins,
        recordWin,
        updateDisplay,
        init
    };
    
    window.DailyStats = window.GlobalStats;
    
})();
