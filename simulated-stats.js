// 模拟全局统计系统
// 所有用户看到相同的数字，但数据是基于算法生成的（不是真实统计）
// 优点：无需后端，立即可用
// 缺点：数据不是真实的

const SimulatedGlobalStats = {
    // 获取今日日期
    getTodayKey() {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    },
    
    // 基于日期生成种子
    dateToSeed(dateStr) {
        let seed = 0;
        for (let i = 0; i < dateStr.length; i++) {
            seed = seed * 31 + dateStr.charCodeAt(i);
        }
        return Math.abs(seed);
    },
    
    // 生成今日"全球通过人数"（模拟）
    getTodayWins() {
        const today = this.getTodayKey();
        const seed = this.dateToSeed(today);
        
        // 基础人数：20-60人之间
        const baseWins = 20 + (seed % 40);
        
        // 根据当前小时数增加（模拟随时间递增）
        const currentHour = new Date().getHours();
        const hourIncrement = Math.floor(currentHour / 2) * (1 + (seed % 3));
        
        // 最终人数
        return baseWins + hourIncrement;
    },
    
    // 模拟记录通关（本地记录，不影响全局数字）
    recordWin() {
        const today = this.getTodayKey();
        const localKey = `local_win_${today}`;
        
        if (!localStorage.getItem(localKey)) {
            localStorage.setItem(localKey, 'true');
            console.log('✅ 本地通关已记录（全局数字为模拟数据）');
        }
        
        this.updateDisplay();
        this.showWinAnimation();
    },
    
    // 更新显示
    updateDisplay() {
        const wins = this.getTodayWins();
        const elem = document.getElementById('daily-wins');
        if (elem) {
            elem.textContent = wins;
        }
    },
    
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
    },
    
    // 初始化
    async init() {
        console.log('🎭 使用模拟全局统计（所有用户看到相同数字）');
        console.log(`   注意：显示的是算法生成的数字，不是真实统计`);
        this.updateDisplay();
        
        // 每10分钟更新一次（模拟递增）
        setInterval(() => {
            this.updateDisplay();
        }, 10 * 60 * 1000);
        
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
    }
};

// 使用模拟统计替换原有的GlobalStats
const GlobalStats = SimulatedGlobalStats;
const DailyStats = SimulatedGlobalStats;
