// 游戏状态管理
let gameState = {
    targetLyric: '',           // 目标歌词
    songTitle: '',             // 歌曲名称
    songArtist: '',            // 歌手名称
    songSource: null,          // 歌曲来源信息
    audioFile: '',             // 音频文件名
    imageFile: '',             // 图片文件名
    currentRow: 0,             // 当前行数
    maxAttempts: 6,            // 最大尝试次数
    gameOver: false,           // 游戏是否结束
    won: false,                // 是否获胜
    hintChars: [],             // 提示汉字
    charStates: new Map(),     // 汉字状态追踪 (char -> 'correct' | 'present' | 'absent')
    seed: null                 // 游戏种子，确保整个会话使用同一个seed
};

// 全局统计管理系统
const GlobalStats = {
    // 获取今日日期字符串 (YYYY-MM-DD)
    getTodayKey() {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    },
    
    // 获取当前题目的唯一标识（基于歌词内容）
    getCurrentPuzzleId() {
        if (!gameState.targetLyric) return null;
        // 使用歌词 + 歌名生成唯一标识
        return `${gameState.songTitle}_${gameState.targetLyric}`.replace(/\s/g, '');
    },
    
    // 获取所有统计数据
    getAllStats() {
        try {
            const stats = localStorage.getItem('globalStats');
            console.log('📊 读取全局统计数据:', stats);
            return stats ? JSON.parse(stats) : {
                totalGames: 0,           // 总游戏次数
                totalWins: 0,            // 总通关次数
                dailyStats: {},          // 每日统计 {date: {wins: 0, attempts: 0}}
                puzzleStats: {},         // 每题统计 {puzzleId: {wins: 0, attempts: 0, firstWinDate: ''}}
                userHistory: []          // 用户历史记录 [{date, puzzleId, won, attempts, time}]
            };
        } catch (e) {
            console.error('❌ 读取统计数据失败:', e);
            return {totalGames: 0, totalWins: 0, dailyStats: {}, puzzleStats: {}, userHistory: []};
        }
    },
    
    // 保存统计数据
    saveStats(stats) {
        try {
            localStorage.setItem('globalStats', JSON.stringify(stats));
            console.log('💾 保存全局统计数据成功');
        } catch (e) {
            console.error('❌ 保存统计数据失败:', e);
        }
    },
    
    // 获取今日通过人数（基于本地浏览器）
    getTodayWins() {
        const stats = this.getAllStats();
        const today = this.getTodayKey();
        return stats.dailyStats[today]?.wins || 0;
    },
    
    // 获取今日总挑战次数
    getTodayAttempts() {
        const stats = this.getAllStats();
        const today = this.getTodayKey();
        return stats.dailyStats[today]?.attempts || 0;
    },
    
    // 获取当前题目的统计
    getCurrentPuzzleStats() {
        const puzzleId = this.getCurrentPuzzleId();
        if (!puzzleId) return null;
        
        const stats = this.getAllStats();
        return stats.puzzleStats[puzzleId] || {wins: 0, attempts: 0, firstWinDate: null};
    },
    
    // 记录游戏开始
    recordGameStart() {
        const stats = this.getAllStats();
        const today = this.getTodayKey();
        const puzzleId = this.getCurrentPuzzleId();
        
        if (!puzzleId) {
            console.warn('⚠️ 无法获取题目ID，跳过记录');
            return;
        }
        
        // 初始化今日统计
        if (!stats.dailyStats[today]) {
            stats.dailyStats[today] = {wins: 0, attempts: 0};
        }
        
        // 初始化题目统计
        if (!stats.puzzleStats[puzzleId]) {
            stats.puzzleStats[puzzleId] = {wins: 0, attempts: 0, firstWinDate: null};
        }
        
        // 增加尝试次数
        stats.totalGames++;
        stats.dailyStats[today].attempts++;
        stats.puzzleStats[puzzleId].attempts++;
        
        this.saveStats(stats);
        console.log(`🎮 记录游戏开始 - 题目: ${gameState.songTitle}, 总游戏数: ${stats.totalGames}`);
    },
    
    // 记录通关成功
    recordWin() {
        const stats = this.getAllStats();
        const today = this.getTodayKey();
        const puzzleId = this.getCurrentPuzzleId();
        
        if (!puzzleId) {
            console.warn('⚠️ 无法获取题目ID，跳过记录');
            return;
        }
        
        console.log(`🎮 记录通关 - 日期: ${today}, 题目: ${gameState.songTitle}`);
        
        // 确保数据结构存在
        if (!stats.dailyStats[today]) {
            stats.dailyStats[today] = {wins: 0, attempts: 0};
        }
        if (!stats.puzzleStats[puzzleId]) {
            stats.puzzleStats[puzzleId] = {wins: 0, attempts: 0, firstWinDate: null};
        }
        
        // 增加通关次数
        stats.totalWins++;
        stats.dailyStats[today].wins++;
        stats.puzzleStats[puzzleId].wins++;
        
        // 记录首次通关日期
        if (!stats.puzzleStats[puzzleId].firstWinDate) {
            stats.puzzleStats[puzzleId].firstWinDate = today;
        }
        
        // 添加到历史记录
        stats.userHistory.push({
            date: today,
            timestamp: new Date().toISOString(),
            puzzleId: puzzleId,
            songTitle: gameState.songTitle,
            songArtist: gameState.songArtist,
            lyric: gameState.targetLyric,
            won: true,
            attempts: gameState.currentRow + 1,
            time: new Date().toLocaleTimeString()
        });
        
        // 限制历史记录数量（保留最近100条）
        if (stats.userHistory.length > 100) {
            stats.userHistory = stats.userHistory.slice(-100);
        }
        
        this.saveStats(stats);
        console.log(`✅ 通关记录成功！`);
        console.log(`   - 总通关数: ${stats.totalWins}`);
        console.log(`   - 今日通关: ${stats.dailyStats[today].wins}`);
        console.log(`   - 本题通关: ${stats.puzzleStats[puzzleId].wins}`);
        
        this.updateDisplay();
        this.showWinAnimation();
    },
    
    // 记录游戏失败
    recordLoss() {
        const stats = this.getAllStats();
        const today = this.getTodayKey();
        const puzzleId = this.getCurrentPuzzleId();
        
        if (!puzzleId) return;
        
        // 添加到历史记录
        stats.userHistory.push({
            date: today,
            timestamp: new Date().toISOString(),
            puzzleId: puzzleId,
            songTitle: gameState.songTitle,
            songArtist: gameState.songArtist,
            lyric: gameState.targetLyric,
            won: false,
            attempts: gameState.maxAttempts,
            time: new Date().toLocaleTimeString()
        });
        
        if (stats.userHistory.length > 100) {
            stats.userHistory = stats.userHistory.slice(-100);
        }
        
        this.saveStats(stats);
        console.log('📝 失败记录已保存');
    },
    
    // 更新显示
    updateDisplay() {
        const wins = this.getTodayWins();
        const displayElement = document.getElementById('daily-wins');
        console.log('🔄 更新显示 - 今日通关数:', wins);
        if (displayElement) {
            displayElement.textContent = wins;
            console.log('✅ 显示已更新');
        } else {
            console.error('❌ 找不到 daily-wins 元素！');
        }
    },
    
    // 显示通过动画
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
    
    // 获取统计摘要
    getStatsSummary() {
        const stats = this.getAllStats();
        const today = this.getTodayKey();
        
        return {
            total: {
                games: stats.totalGames,
                wins: stats.totalWins,
                winRate: stats.totalGames > 0 ? ((stats.totalWins / stats.totalGames) * 100).toFixed(1) : 0
            },
            today: {
                wins: stats.dailyStats[today]?.wins || 0,
                attempts: stats.dailyStats[today]?.attempts || 0,
                winRate: stats.dailyStats[today]?.attempts > 0 
                    ? ((stats.dailyStats[today].wins / stats.dailyStats[today].attempts) * 100).toFixed(1) 
                    : 0
            },
            currentPuzzle: this.getCurrentPuzzleStats(),
            recentHistory: stats.userHistory.slice(-10).reverse()
        };
    },
    
    // 初始化
    init() {
        console.log('🚀 初始化全局统计系统...');
        this.updateDisplay();
        
        // 添加CSS动画
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
        
        console.log('✅ 全局统计系统初始化完成');
        
        // 输出统计摘要
        const summary = this.getStatsSummary();
        console.log('📊 统计摘要:', summary);
    }
};

// 保持向后兼容（DailyStats 别名）
const DailyStats = GlobalStats;

// DOM元素引用
const gameGrid = document.getElementById('game-grid');
const guessInput = document.getElementById('guess-input');
const submitBtn = document.getElementById('submit-btn');
const remainingAttempts = document.getElementById('remaining-attempts');
const gameModal = document.getElementById('game-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const charCounter = document.getElementById('char-counter');

// 歌词卡DOM元素
const lyricsCardModal = document.getElementById('lyrics-card-modal');
const songTitle = document.getElementById('song-title');
const songArtist = document.getElementById('song-artist');

// 简单的随机数生成器（基于seed）
function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

// 高频汉字库（与服务器端保持一致）
const highFrequencyChars = [
    '的', '一', '是', '了', '我', '不', '人', '在', '他', '有', '这', '个', '上', '们', '来', '到', '时', '大', '地', '为',
    '子', '中', '你', '说', '生', '国', '年', '着', '就', '那', '和', '要', '她', '出', '也', '得', '里', '后', '自', '以',
    '会', '家', '可', '下', '而', '过', '天', '去', '能', '对', '小', '多', '然', '于', '心', '学', '么', '之', '都', '好',
    '看', '起', '发', '当', '没', '成', '只', '如', '事', '把', '还', '用', '第', '样', '道', '想', '作', '种', '开', '美',
    '总', '从', '无', '情', '己', '面', '最', '女', '但', '现', '前', '些', '所', '同', '日', '手', '又', '行', '意', '动',
    '方', '期', '它', '头', '经', '长', '儿', '回', '位', '分', '爱', '老', '因', '很', '给', '名', '法', '间', '知', '世',
    '什', '月', '言', '通', '性', '本', '直', '高', '命', '取', '条', '件', '走', '场', '物', '合', '真', '品', '次', '式',
    '活', '集', '加', '主', '赶', '进', '数', '路', '级', '少', '图', '山', '统', '接', '较', '将', '组', '见', '计', '别',
    '角', '根', '论', '运', '农', '指', '几', '九', '区', '强', '放', '决', '西', '被', '干', '做', '必', '战', '先', '则',
    '任', '据', '处', '队', '南', '色', '光', '门', '即', '保', '治', '北', '造', '百', '规', '热', '领', '七', '海', '口',
    '东', '导', '器', '压', '志', '金', '增', '争', '济', '阶', '油', '思', '术', '极', '交', '受', '联', '认', '六', '共',
    '权', '收', '证', '改', '清', '再', '采', '转', '更', '单', '风', '切', '打', '白', '教', '速', '花', '带', '安', '身',
    '车', '例', '务', '具', '万', '每', '目', '至', '达', '积', '示', '议', '声', '报', '斗', '完', '类', '八', '离', '华',
    '确', '才', '科', '张', '信', '马', '节', '话', '米', '整', '空', '元', '况', '今', '温', '传', '土', '许', '步', '群',
    '广', '石', '记', '需', '段', '研', '界', '拉', '林', '律', '叫', '且', '究', '观', '越', '织', '装', '影', '算', '低',
    '持', '音', '众', '书', '布', '复', '容', '须', '际', '商', '非', '验', '连', '断', '深', '难', '近', '矿', '千', '周',
    '委', '素', '技', '备', '半', '办', '青', '省', '列', '习', '响', '约', '支', '般', '史', '感', '劳', '便', '团', '往',
    '酸', '历', '市', '克', '何', '除', '消', '构', '府', '称', '太', '准', '精', '值', '号', '率', '族', '维', '划', '选',
    '标', '写', '存', '候', '毛', '亲', '快', '效', '院', '查', '江', '型', '眼', '王', '按', '格', '养', '易', '置', '派',
    '层', '片', '始', '却', '专', '状', '育', '厂', '京', '识', '适', '属', '圆', '包', '火', '住', '调', '满', '县', '局',
    '照', '参', '红', '细', '引', '听', '该', '铁', '价', '严', '首', '底', '液', '官', '德', '随', '病', '苏', '失', '尔',
    '死', '讲', '配', '黄', '推', '显', '谈', '罪', '神', '艺', '呢', '席', '含', '企', '望', '密', '批', '营', '项', '防',
    '举', '球', '英', '氧', '势', '告', '李', '台', '落', '木', '帮', '轮', '破', '亚', '师', '围', '注', '远', '字', '材',
    '排', '供', '河', '态', '封', '另', '施', '减', '树', '溶', '怎', '止', '案', '士', '均', '武', '固', '叶', '鱼', '波',
    '视', '仅', '费', '紧', '左', '章', '早', '朝', '害', '续', '轻', '服', '试', '食', '充', '向', '际', '权', '治', '万'
];

// 生成提示字符（与服务器端逻辑一致）
function generateHintChars(lyric, seed) {
    const lyricChars = [...new Set([...lyric])]; // 去重的歌词字符
    const hintChars = [];
    const usedChars = new Set();
    
    // 添加歌词中的所有去重字符（确保用户能找到所有需要的字）
    lyricChars.forEach(char => {
        // 只添加中文字符、英文字母和数字，过滤掉标点符号
        if (/[\u4e00-\u9fa5a-zA-Z0-9]/.test(char)) {
            hintChars.push(char);
            usedChars.add(char);
        }
    });
    
    // 从高频汉字库中随机选择剩余的字符，确保不重复
    const availableChars = highFrequencyChars.filter(char => !usedChars.has(char));
    
    const remainingCount = Math.max(30 - hintChars.length, 0);
    
    // 使用seed进行确定性随机排序
    const shuffledAvailableChars = [...availableChars].sort((a, b) => {
        return seededRandom(seed + a.charCodeAt(0)) - seededRandom(seed + b.charCodeAt(0));
    });
    
    for (let i = 0; i < remainingCount && i < shuffledAvailableChars.length; i++) {
        hintChars.push(shuffledAvailableChars[i]);
        usedChars.add(shuffledAvailableChars[i]);
    }
    
    // 如果高频字库不够，从所有中文字符中补充
    let randomSeed = seed;
    while (hintChars.length < 30) {
        randomSeed++;
        const randomChar = String.fromCharCode(0x4e00 + Math.floor(seededRandom(randomSeed) * (0x9fff - 0x4e00)));
        if (!usedChars.has(randomChar)) {
            hintChars.push(randomChar);
            usedChars.add(randomChar);
        }
    }
    
    // 去重并随机打乱顺序
    const uniqueHintChars = [...new Set(hintChars)];
    return uniqueHintChars.sort((a, b) => {
        return seededRandom(seed + a.charCodeAt(0) + b.charCodeAt(0)) - 0.5;
    });
}

// 游戏初始化
async function initGame() {
    try {
        // 从URL获取seed参数，如果没有则生成一个新的seed
        const urlParams = new URLSearchParams(window.location.search);
        let seed = urlParams.get('seed');
        
        // 如果URL中没有seed，生成一个新的并添加到URL中
        if (!seed) {
            seed = Date.now().toString();
            // 更新URL但不刷新页面
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('seed', seed);
            window.history.replaceState({}, '', newUrl);
        }
        
        // 保存seed到游戏状态
        gameState.seed = seed;
        
        // 直接从 lyrics.json 文件读取数据（适用于GitHub Pages）
        const response = await fetch('lyrics.json');
        const lyrics = await response.json();
        
        if (lyrics && lyrics.length > 0) {
            // 使用seed选择一首歌
            const numericSeed = parseInt(seed) || Date.now();
            const randomValue = seededRandom(numericSeed);
            const selectedIndex = Math.floor(randomValue * lyrics.length);
            const selectedSong = lyrics[selectedIndex];
            
            gameState.targetLyric = selectedSong.lyric;
            gameState.songTitle = selectedSong.title || '经典歌词';
            gameState.songArtist = selectedSong.artist || '传世金曲';
            gameState.songSource = selectedSong.source || null;
            gameState.audioFile = selectedSong.audioFile || '';
            gameState.imageFile = selectedSong.imageFile || '';
            
            // 生成提示字符（30个，包含歌词中所有字符）
            const hintCharsArray = generateHintChars(selectedSong.lyric, numericSeed);
            gameState.hintChars = hintCharsArray.map(char => ({
                char: char,
                index: -1 // 前端版本不需要追踪索引
            }));
            
            gameState.charStates.clear(); // 清除字符状态
            setupGameGrid();
            setupHintChars();
            setupInputEvents();
            updateCharCounter();
            
            console.log(`游戏初始化成功，使用seed: ${seed}`);
            
            // 记录游戏开始（在游戏完全初始化后）
            setTimeout(() => {
                GlobalStats.recordGameStart();
            }, 100);
        } else {
            showError('获取游戏数据失败，请刷新页面重试');
        }
    } catch (error) {
        console.error('初始化游戏失败:', error);
        showError('无法加载游戏数据，请检查 lyrics.json 文件是否存在');
    }
}

// 设置游戏网格
function setupGameGrid() {
    gameGrid.innerHTML = '';
    // 使用正确的字符计数（处理Unicode）
    const lyricLength = [...gameState.targetLyric].length;
    
    // 创建6行网格（6次机会）
    for (let row = 0; row < gameState.maxAttempts; row++) {
        const rowElement = document.createElement('div');
        rowElement.className = 'guess-row';
        rowElement.id = `row-${row}`;
        
        // 为每个字符创建一个格子
        for (let col = 0; col < lyricLength; col++) {
            const letterBox = document.createElement('div');
            letterBox.className = 'letter-box';
            letterBox.id = `box-${row}-${col}`;
            rowElement.appendChild(letterBox);
        }
        
        gameGrid.appendChild(rowElement);
    }
}

// 设置提示汉字
function setupHintChars() {
    const hintContainer = document.getElementById('hint-chars');
    if (!hintContainer) return;
    
    hintContainer.innerHTML = '';
    gameState.hintChars.forEach((hintObj, index) => {
        const charElement = document.createElement('span');
        charElement.className = 'hint-char';
        charElement.textContent = hintObj.char; // 修复：访问对象的 char 属性
        charElement.id = `hint-${hintObj.char}-${index}`; // 添加索引避免ID冲突
        charElement.setAttribute('data-char', hintObj.char); // 存储字符用于查找
        charElement.addEventListener('click', () => {
            insertCharToInput(hintObj.char); // 修复：传递字符而不是对象
        });
        
        // 应用已知的字符状态
        const charState = gameState.charStates.get(hintObj.char);
        if (charState) {
            charElement.classList.add(`hint-${charState}`);
        }
        
        hintContainer.appendChild(charElement);
    });
}

// 插入字符到输入框
function insertCharToInput(char) {
    if (gameState.gameOver) return;
    
    const currentValue = guessInput.value;
    const maxLength = [...gameState.targetLyric].length;
    const currentLength = [...currentValue].length;
    
    if (currentLength < maxLength) {
        guessInput.value = currentValue + char;
        guessInput.focus();
        updateCharCounter();
    }
}

// 更新字符计数器
function updateCharCounter() {
    if (!gameState.targetLyric || !charCounter) return;
    
    // 使用 Array.from 或扩展运算符来正确计算字符数（处理Unicode）
    const currentLength = [...guessInput.value].length;
    const targetLength = [...gameState.targetLyric].length;
    const remaining = Math.max(0, targetLength - currentLength);
    
    if (remaining === 0) {
        charCounter.textContent = '已完成';
        charCounter.style.background = '#6aaa64';
    } else {
        charCounter.textContent = `还需${remaining}字`;
        charCounter.style.background = '#667eea';
    }
}

// 设置输入框事件监听器  
function setupInputEvents() {
    // 回车键提交
    guessInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            submitGuess();
        }
    });
    
    // 处理输入法相关问题和字符过滤
    let isComposing = false;
    
    // 监听输入法开始和结束
    guessInput.addEventListener('compositionstart', function() {
        isComposing = true;
    });
    
    guessInput.addEventListener('compositionend', function(e) {
        isComposing = false;
        // 输入法结束后再处理字符过滤和计数更新
        filterAndUpdateInput(e);
    });
    
    // 输入事件监听
    guessInput.addEventListener('input', function(e) {
        // 如果正在使用输入法，不进行处理
        if (isComposing) {
            return;
        }
        filterAndUpdateInput(e);
    });
    
    // 字符过滤和更新函数
    function filterAndUpdateInput(e) {
        const value = e.target.value;
        const cleanedValue = value.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');
        
        // 限制输入长度（使用正确的字符计数）
        const maxLength = [...gameState.targetLyric].length;
        const valueChars = [...cleanedValue];
        const finalValue = valueChars.slice(0, maxLength).join('');
        
        if (value !== finalValue) {
            e.target.value = finalValue;
        }
        
        updateCharCounter();
    }
}

// 显示成功效果
function showSuccessEffect() {
    // 为当前行的所有格子添加成功动画
    const currentRowBoxes = document.querySelectorAll(`#row-${gameState.currentRow} .letter-box`);
    currentRowBoxes.forEach((box, index) => {
        setTimeout(() => {
            box.classList.add('success-bounce');
        }, index * 100);
    });
    
    // 记录今日通过人数
    DailyStats.recordWin();
    
    // 显示歌词卡
    setTimeout(() => {
        showLyricsCard();
    }, 1000);
}

// 提交猜测
async function submitGuess() {
    const guess = guessInput.value.trim();
    
    // 验证输入
    if (!validateInput(guess)) {
        return;
    }
    
    try {
        // 禁用提交按钮
        submitBtn.disabled = true;
        
        // 前端计算颜色（不再调用后端API）
        const colors = calculateColors(guess, gameState.targetLyric);
        const correct = guess === gameState.targetLyric;
        
        // 更新网格显示
        updateGrid(guess, colors);
        
        // 检查游戏状态
        if (correct) {
            // 答对后直接显示全绿色，不弹出窗口
            gameState.gameOver = true;
            gameState.won = true;
            // 可以添加一些成功的视觉效果
            showSuccessEffect();
        } else {
            gameState.currentRow++;
            
            if (gameState.currentRow >= gameState.maxAttempts) {
                endGame(false, `游戏结束！\n正确答案是："${gameState.targetLyric}"`);
            }
        }
        
        // 清空输入框并更新计数器
        guessInput.value = '';
        updateCharCounter();
    } catch (error) {
        console.error('提交猜测失败:', error);
        showError('处理猜测时出错，请重试');
    } finally {
        // 重新启用提交按钮
        submitBtn.disabled = false;
    }
}

// 前端计算颜色逻辑
function calculateColors(guess, target) {
    const colors = [];
    // 使用扩展运算符正确处理Unicode字符
    const targetChars = [...target];
    const guessChars = [...guess];
    const used = new Array(targetChars.length).fill(false);
    
    // 第一遍：标记完全正确的字符
    for (let i = 0; i < guessChars.length; i++) {
        if (guessChars[i] === targetChars[i]) {
            colors[i] = 'correct';
            used[i] = true;
        }
    }
    
    // 第二遍：标记存在但位置错误的字符
    for (let i = 0; i < guessChars.length; i++) {
        if (colors[i] === 'correct') continue;
        
        let found = false;
        for (let j = 0; j < targetChars.length; j++) {
            if (!used[j] && guessChars[i] === targetChars[j]) {
                colors[i] = 'present';
                used[j] = true;
                found = true;
                break;
            }
        }
        
        if (!found) {
            colors[i] = 'absent';
        }
    }
    
    return colors;
}

// 验证输入
function validateInput(guess) {
    if (!guess) {
        showError('请输入你的猜测');
        return false;
    }
    
    // 使用正确的字符计数方法（处理Unicode字符）
    const guessLength = [...guess].length;
    const targetLength = [...gameState.targetLyric].length;
    
    if (guessLength !== targetLength) {
        showError(`请输入${targetLength}个字符`);
        return false;
    }
    
    if (gameState.gameOver) {
        showError('游戏已结束，请开始新游戏');
        return false;
    }
    
    return true;
}

// 更新网格显示
function updateGrid(guess, colors) {
    const row = gameState.currentRow;
    const guessChars = [...guess]; // 将字符串转换为字符数组（正确处理Unicode）
    
    for (let i = 0; i < guessChars.length; i++) {
        const box = document.getElementById(`box-${row}-${i}`);
        const char = guessChars[i];
        box.textContent = char;
        
        // 更新字符状态（优先级：correct > present > absent）
        const currentState = gameState.charStates.get(char);
        const newState = colors[i];
        
        // 状态优先级：correct(绿) > present(黄) > absent(灰)
        if (!currentState || 
            newState === 'correct' || 
            (newState === 'present' && currentState === 'absent')) {
            gameState.charStates.set(char, newState);
        }
        
        // 添加动画效果
        setTimeout(() => {
            box.classList.add('animate');
            box.classList.add(colors[i]);
            
            // 更新提示汉字的颜色
            updateHintCharColor(char, gameState.charStates.get(char));
        }, i * 100); // 逐个显示效果
    }
}

// 更新提示汉字颜色
function updateHintCharColor(char, state) {
    // 更新所有包含该字符的提示汉字
    const hintElements = document.querySelectorAll(`[data-char="${char}"]`);
    hintElements.forEach(hintElement => {
        // 移除旧的状态类
        hintElement.classList.remove('hint-correct', 'hint-present', 'hint-absent');
        // 添加新的状态类
        hintElement.classList.add(`hint-${state}`);
    });
}

// 更新剩余尝试次数 (已移除显示，保留函数以防其他地方调用)
function updateRemainingAttempts() {
    // 功能已移除，不再显示剩余机会
    return;
}

// 结束游戏
function endGame(won, message) {
    gameState.gameOver = true;
    gameState.won = won;
    
    // 记录失败
    if (!won) {
        GlobalStats.recordLoss();
    }
    
    modalTitle.textContent = won ? '🎉 恭喜！' : '😅 游戏结束';
    modalMessage.textContent = message;
    gameModal.classList.remove('hidden');
}

// 开始新游戏（刷新页面）
async function newGame() {
    // 使用时间戳作为seed，确保每次刷新获得不同的题目
    const timestamp = Date.now();
    location.href = `${location.pathname}?seed=${timestamp}`;
}

// 显示错误信息
function showError(message) {
    // 简单的错误提示，可以后续优化为更好的UI
    alert(message);
}

// 防止输入框失去焦点（提升用户体验）
guessInput.addEventListener('blur', function() {
    setTimeout(() => {
        if (!gameState.gameOver) {
            guessInput.focus();
        }
    }, 100);
});

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', function() {
    // 初始化全局统计系统
    GlobalStats.init();
    
    // 初始化游戏
    initGame();
    guessInput.focus();
});

// 歌词卡相关功能
function showLyricsCard() {
    // 设置歌词图片和文本
    setupLyricsImage();
    
    // 设置歌曲来源信息
    updateSongSourceEnhanced();
    
    // 设置音频播放
    setupAudioPlayer();
    
    // 显示歌词卡
    lyricsCardModal.classList.remove('hidden');
    lyricsCardModal.classList.remove('closing');
}

// 设置歌词图片展示
function setupLyricsImage() {
    const lyricsImage = document.getElementById('lyrics-image');
    const imageContainer = lyricsImage.parentNode;
    
    // 清理之前的错误提示
    const existingErrorDiv = imageContainer.querySelector('.lyrics-image-error');
    if (existingErrorDiv) {
        existingErrorDiv.remove();
    }
    
    // 重置图片显示状态
    lyricsImage.style.display = 'block';
    
    // 使用游戏状态中的图片文件名，如果没有则使用默认方式
    const imageName = gameState.imageFile || getSongImageName(gameState.songTitle);
    const imageUrl = `素材/${encodeURIComponent(imageName)}`;
    
    console.log('尝试加载图片:', imageUrl);
    console.log('游戏状态中的图片文件名:', gameState.imageFile);
    lyricsImage.src = imageUrl;
    
    // 图片加载成功时的处理
    lyricsImage.onload = function() {
        console.log('图片加载成功:', imageName);
        lyricsImage.style.display = 'block';
    };
    
    // 图片加载错误时的处理
    lyricsImage.onerror = function() {
        console.log('图片加载失败:', imageName, '尝试备用方案');
        
        // 尝试不同的文件扩展名
        if (imageName.endsWith('.jpeg')) {
            const jpgName = imageName.replace('.jpeg', '.jpg');
            const jpgUrl = `素材/${encodeURIComponent(jpgName)}`;
            console.log('尝试JPG格式:', jpgUrl);
            lyricsImage.src = jpgUrl;
            
            // 设置JPG格式的错误处理
            lyricsImage.onerror = function() {
                console.log('JPG格式也失败，尝试PNG格式');
                const pngName = imageName.replace('.jpeg', '.png');
                const pngUrl = `素材/${encodeURIComponent(pngName)}`;
                console.log('尝试PNG格式:', pngUrl);
                lyricsImage.src = pngUrl;
                
                // 设置PNG格式的错误处理
                lyricsImage.onerror = function() {
                    console.log('所有格式都失败，显示备用方案');
                    showFallbackImage();
                };
            };
        } else if (imageName.endsWith('.jpg')) {
            const pngName = imageName.replace('.jpg', '.png');
            const pngUrl = `素材/${encodeURIComponent(pngName)}`;
            console.log('尝试PNG格式:', pngUrl);
            lyricsImage.src = pngUrl;
            
            lyricsImage.onerror = function() {
                console.log('PNG格式也失败，显示备用方案');
                showFallbackImage();
            };
        } else {
            showFallbackImage();
        }
    };
    
    // 显示备用图片的函数
    function showFallbackImage() {
        lyricsImage.style.display = 'none';
        const errorDiv = document.createElement('div');
        errorDiv.className = 'lyrics-image-error';
        errorDiv.innerHTML = `
            <div style="
                display: flex; 
                align-items: center; 
                justify-content: center; 
                min-height: 300px; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                text-align: center;
                border-radius: 8px;
                font-size: 18px;
            ">
                <div>
                    <div style="font-size: 48px; margin-bottom: 10px;">🎵</div>
                    <div>${gameState.targetLyric}</div>
                    <div style="margin-top: 10px; font-size: 14px; opacity: 0.8;">
                        ${gameState.songTitle} - ${gameState.songArtist}
                    </div>
                </div>
            </div>
        `;
        imageContainer.appendChild(errorDiv);
    }
}

// 根据歌曲标题获取图片名称 (备用方法)
function getSongImageName(songTitle) {
    // 如果没有指定图片文件，尝试根据歌曲标题推断
    const commonImageExtensions = ['.jpeg', '.jpg', '.png'];
    
    // 尝试不同的文件扩展名
    for (const ext of commonImageExtensions) {
        const filename = `${songTitle}${ext}`;
        // 这里只是返回可能的文件名，实际验证在图片加载时进行
        return filename;
    }
    
    // 默认返回 jpeg 格式
    return `${songTitle}.jpeg`;
}

// 设置音频播放器
function setupAudioPlayer() {
    const audioSource = document.getElementById('audio-source');
    const songAudio = document.getElementById('song-audio');
    const musicControlBtn = document.getElementById('music-control-btn');
    const musicIcon = document.getElementById('music-icon');
    const musicControlText = document.getElementById('music-control-text');
    
    // 使用游戏状态中的音频文件名，如果没有则使用默认方式
    const audioName = gameState.audioFile || getSongAudioName(gameState.songTitle);
    audioSource.src = `素材/${audioName}`;
    
    // 重新加载音频
    songAudio.load();
    
    // 初始化按钮状态
    musicIcon.textContent = '⏳';
    musicControlText.textContent = '加载中';
    musicControlBtn.classList.add('muted');
    
    // 监听音频加载事件
    songAudio.addEventListener('loadstart', () => {
        musicIcon.textContent = '⏳';
        musicControlText.textContent = '加载中';
        musicControlBtn.classList.add('muted');
    });
    
    songAudio.addEventListener('canplay', () => {
        musicIcon.textContent = '🎵';
        musicControlText.textContent = '播放';
        musicControlBtn.classList.remove('muted');
        console.log('音频可以播放:', audioName);
    });
    
    songAudio.addEventListener('error', (e) => {
        console.log('音频加载失败:', audioName, e);
        musicIcon.textContent = '❌';
        musicControlText.textContent = '无音频';
        musicControlBtn.classList.add('muted');
    });
    
    // 监听播放状态事件
    songAudio.addEventListener('ended', () => {
        musicIcon.textContent = '🎵';
        musicControlText.textContent = '播放';
        musicControlBtn.classList.remove('muted');
    });
    
    songAudio.addEventListener('pause', () => {
        musicIcon.textContent = '🎵';
        musicControlText.textContent = '播放';
        musicControlBtn.classList.remove('muted');
    });
    
    songAudio.addEventListener('play', () => {
        musicIcon.textContent = '⏸️';
        musicControlText.textContent = '暂停';
        musicControlBtn.classList.remove('muted');
    });
    
    // 猜对瞬间自动播放
    setTimeout(() => {
        songAudio.play().then(() => {
            musicIcon.textContent = '🎵̸';
            musicControlBtn.classList.remove('muted');
        }).catch(error => {
            console.log('自动播放失败，需要用户手动播放:', error);
            musicIcon.textContent = '🎵';
            musicControlBtn.classList.remove('muted');
        });
    }, 1000);
}

// 根据歌曲标题获取音频文件名称 (备用方法)
function getSongAudioName(songTitle) {
    // 如果没有指定音频文件，直接根据歌曲标题生成文件名
    return `${songTitle}.mp3`;
}

// 音频播放切换功能
function toggleAudio() {
    const songAudio = document.getElementById('song-audio');
    const musicControlBtn = document.getElementById('music-control-btn');
    const musicIcon = document.getElementById('music-icon');
    const musicControlText = document.getElementById('music-control-text');
    
    if (songAudio.paused) {
        songAudio.play().then(() => {
            musicIcon.textContent = '⏸️';
            musicControlText.textContent = '暂停';
            musicControlBtn.classList.remove('muted');
        }).catch(error => {
            console.log('播放失败:', error);
            musicIcon.textContent = '🎵';
            musicControlText.textContent = '播放';
            musicControlBtn.classList.add('muted');
        });
    } else {
        songAudio.pause();
        musicIcon.textContent = '🎵';
        musicControlText.textContent = '播放';
        musicControlBtn.classList.remove('muted');
    }
}

// 测试函数 - 直接显示歌词卡
function testLyricsCard() {
    // 设置测试数据 - 使用素材目录中的第一个歌曲
    gameState.targetLyric = "甜蜜蜜你笑得甜蜜蜜";
    gameState.songTitle = "甜蜜蜜";
    gameState.songArtist = "邓丽君";
    gameState.audioFile = "甜蜜蜜.mp3";
    gameState.imageFile = "甜蜜蜜你笑得甜蜜蜜.jpeg";
    gameState.songSource = {
        type: 'favorite',
        name: '我的收藏歌单',
        description: '个人珍藏经典'
    };
    
    // 显示歌词卡
    showLyricsCard();
}

function closeLyricsCard() {
    // 关闭音乐播放
    const songAudio = document.getElementById('song-audio');
    if (songAudio && !songAudio.paused) {
        songAudio.pause();
        songAudio.currentTime = 0;
    }
    
    // 添加关闭动画类
    lyricsCardModal.classList.add('closing');
    
    // 在动画完成后隐藏弹窗
    setTimeout(() => {
        lyricsCardModal.classList.add('hidden');
        lyricsCardModal.classList.remove('closing');
    }, 300);
}

function getSongInfo(lyric) {
    // 这里可以扩展为真实的歌曲信息数据库
    // 目前返回通用信息
    const songDatabase = {
        '你问我爱你有多深': { title: '爱你有多深', artist: '邓丽君' },
        '甜蜜蜜你笑得甜蜜蜜': { title: '甜蜜蜜', artist: '邓丽君' },
        '小城故事多充满喜和乐': { title: '小城故事', artist: '邓丽君' },
        '路边的野花不要采': { title: '路边的野花不要采', artist: '邓丽君' },
        '但愿人长久千里共婵娟': { title: '但愿人长久', artist: '邓丽君' },
        '今天我寒夜里看雪飘过': { title: '寒夜', artist: '梅艳芳' },
        '喜欢你那双眼动人': { title: '喜欢你', artist: 'Beyond' },
        '让我们荡起双桨': { title: '让我们荡起双桨', artist: '少儿合唱' },
        '我和我的祖国一刻也不能分割': { title: '我和我的祖国', artist: '李谷一' },
        '千年等一回等一回啊': { title: '千年等一回', artist: '高胜美' },
        '敢问路在何方路在脚下': { title: '敢问路在何方', artist: '蒋大为' },
        '难忘今宵无论天涯海角': { title: '难忘今宵', artist: '李谷一' },
        '五星红旗迎风飘扬': { title: '歌唱祖国', artist: '王莘' },
        '东方红太阳升': { title: '东方红', artist: '经典民歌' },
        '好一朵美丽的茉莉花': { title: '茉莉花', artist: '经典民歌' },
        '长亭外古道边芳草碧连天': { title: '送别', artist: '李叔同' },
        '浪奔浪流万里滔滔江水永不休': { title: '万里长城永不倒', artist: '罗文' },
        '万水千山总是情': { title: '万水千山总是情', artist: '汪明荃' },
        '明月几时有把酒问青天': { title: '但愿人长久', artist: '王菲' },
        '村里有个姑娘叫小芳': { title: '小芳', artist: '李春波' },
        '明天你是否会想起': { title: '同桌的你', artist: '老狼' },
        '睡在我上铺的兄弟': { title: '睡在我上铺的兄弟', artist: '老狼' },
        '朋友一生一起走': { title: '朋友', artist: '周华健' },
        '把握生命里的每一分钟': { title: '真心英雄', artist: '成龙、周华健、黄耀明、李宗盛' }
    };
    
    return songDatabase[lyric] || { 
        title: '经典歌词', 
        artist: '传世金曲' 
    };
}

// 分享功能已删除，节省空间

// 更新歌曲来源按钮显示
function updateSongSourceEnhanced() {
    const sourceBtnIcon = document.getElementById('source-btn-icon');
    const sourceBtnText = document.getElementById('source-btn-text');
    
    if (gameState.songSource) {
        const source = gameState.songSource;
        let icon = '📀';
        
        switch (source.type) {
            case 'daily':
                icon = '📅';
                break;
            case 'favorite':
                icon = '❤️';
                break;
            case 'hot':
                icon = '🔥';
                break;
        }
        
        sourceBtnIcon.textContent = icon;
        sourceBtnText.textContent = '来源';
    } else {
        sourceBtnIcon.textContent = '📀';
        sourceBtnText.textContent = '来源';
    }
}

function showLyricsSource() {
    const sourceModal = document.getElementById('source-modal');
    const sourceDetail = document.getElementById('source-detail');
    
    // 生成来源详情内容
    const sourcesData = [
        {
            type: 'daily',
            icon: '📅',
            name: '每日30首推荐歌单',
            description: '每日精选30首经典好歌，让您重温美好时光',
            stats: { songs: '30首', update: '每日更新' },
            active: gameState.songSource?.type === 'daily'
        },
        {
            type: 'favorite',
            icon: '❤️',
            name: '我的收藏歌单',
            description: '精心收藏的经典华语歌曲，承载着珍贵回忆',
            stats: { songs: '99+首', update: '持续收藏' },
            active: gameState.songSource?.type === 'favorite'
        },
        {
            type: 'hot',
            icon: '🔥',
            name: '热门榜单',
            description: '最受欢迎的华语经典，传唱度最高的金曲',
            stats: { songs: '50首', update: '实时更新' },
            active: gameState.songSource?.type === 'hot'
        }
    ];
    
    // 生成HTML内容
    sourceDetail.innerHTML = sourcesData.map(source => `
        <div class="source-card ${source.active ? 'active' : ''}" data-source="${source.type}">
            <div class="source-header">
                <span class="source-type-icon">${source.icon}</span>
                <h3 class="source-name">${source.name}</h3>
            </div>
            <p class="source-description">${source.description}</p>
            <div class="source-stats">
                <span>收录：${source.stats.songs}</span>
                <span>更新：${source.stats.update}</span>
            </div>
        </div>
    `).join('');
    
    // 添加点击事件
    sourceDetail.querySelectorAll('.source-card').forEach(card => {
        card.addEventListener('click', () => {
            const sourceType = card.dataset.source;
            handleSourceCardClick(sourceType);
        });
    });
    
    // 显示模态框
    sourceModal.classList.remove('hidden');
}

function handleSourceCardClick(sourceType) {
    const messages = {
        daily: '📅 每日推荐歌单包含30首精选经典歌曲，每天为您推荐不同的怀旧金曲，让您在游戏中重温美好时光。',
        favorite: '❤️ 我的收藏歌单收录了最受喜爱的华语经典，这些歌曲承载着无数人的青春回忆和情感故事。',
        hot: '🔥 热门榜单汇集了传唱度最高的华语金曲，这些歌曲跨越时代，至今仍被广泛传唱。'
    };
    
    showNotification(messages[sourceType] || '这是一个精选歌单，收录了优质的华语经典歌曲。');
}

function closeSourceModal() {
    const sourceModal = document.getElementById('source-modal');
    sourceModal.classList.add('hidden');
}

function showNotification(message) {
    // 创建简单的通知提示
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 3000;
        font-size: 14px;
        transition: all 0.3s ease;
        transform: translateX(100%);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // 3秒后自动消失
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 键盘事件处理
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const sourceModal = document.getElementById('source-modal');
        if (!sourceModal.classList.contains('hidden')) {
            closeSourceModal();
        } else if (!lyricsCardModal.classList.contains('hidden')) {
            closeLyricsCard();
        }
    }
});
