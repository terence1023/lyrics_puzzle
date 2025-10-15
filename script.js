// 游戏状态管理
let gameState = {
    targetLyric: '',           // 目标歌词
    songTitle: '',             // 歌曲名称
    songArtist: '',            // 歌手名称
    songSource: null,          // 歌曲来源信息
    currentRow: 0,             // 当前行数
    maxAttempts: 6,            // 最大尝试次数
    gameOver: false,           // 游戏是否结束
    won: false,                // 是否获胜
    hintChars: [],             // 提示汉字
    charStates: new Map()      // 汉字状态追踪 (char -> 'correct' | 'present' | 'absent')
};

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

// 游戏初始化
async function initGame() {
    try {
        // 从后端获取游戏状态
        const response = await fetch('/api/game-state');
        const data = await response.json();
        
        if (data.success) {
            gameState.targetLyric = data.lyric;
            gameState.songTitle = data.title || '经典歌词';
            gameState.songArtist = data.artist || '传世金曲';
            gameState.songSource = data.source || null;
            gameState.hintChars = data.hintChars;
            gameState.charStates.clear(); // 清除字符状态
            setupGameGrid();
            setupHintChars();
            setupInputEvents();
            updateCharCounter();
        } else {
            showError('获取游戏数据失败，请刷新页面重试');
        }
    } catch (error) {
        console.error('初始化游戏失败:', error);
        showError('网络连接失败，请检查网络后重试');
    }
}

// 设置游戏网格
function setupGameGrid() {
    gameGrid.innerHTML = '';
    const lyricLength = gameState.targetLyric.length;
    
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
    gameState.hintChars.forEach((char, index) => {
        const charElement = document.createElement('span');
        charElement.className = 'hint-char';
        charElement.textContent = char;
        charElement.id = `hint-${char}-${index}`; // 添加索引避免ID冲突
        charElement.setAttribute('data-char', char); // 存储字符用于查找
        charElement.addEventListener('click', () => {
            insertCharToInput(char);
        });
        
        // 应用已知的字符状态
        const charState = gameState.charStates.get(char);
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
    const maxLength = gameState.targetLyric.length;
    
    if (currentValue.length < maxLength) {
        guessInput.value = currentValue + char;
        guessInput.focus();
        updateCharCounter();
    }
}

// 更新字符计数器
function updateCharCounter() {
    if (!gameState.targetLyric || !charCounter) return;
    
    const currentLength = guessInput.value.length;
    const targetLength = gameState.targetLyric.length;
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
        
        // 限制输入长度
        const maxLength = gameState.targetLyric.length;
        const finalValue = cleanedValue.slice(0, maxLength);
        
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
        
        // 发送猜测到后端
        const response = await fetch('/api/guess', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ guess })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // 更新网格显示
            updateGrid(guess, data.colors);
            
            // 检查游戏状态
            if (data.correct) {
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
        } else {
            showError(data.message || '提交失败，请重试');
        }
    } catch (error) {
        console.error('提交猜测失败:', error);
        showError('网络错误，请重试');
    } finally {
        // 重新启用提交按钮
        submitBtn.disabled = false;
    }
}

// 验证输入
function validateInput(guess) {
    if (!guess) {
        showError('请输入你的猜测');
        return false;
    }
    
    if (guess.length !== gameState.targetLyric.length) {
        showError(`请输入${gameState.targetLyric.length}个字符`);
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
    
    for (let i = 0; i < guess.length; i++) {
        const box = document.getElementById(`box-${row}-${i}`);
        const char = guess[i];
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
    
    modalTitle.textContent = won ? '🎉 恭喜！' : '😅 游戏结束';
    modalMessage.textContent = message;
    gameModal.classList.remove('hidden');
}

// 开始新游戏
async function newGame() {
    try {
        // 关闭当前播放的音乐
        const songAudio = document.getElementById('song-audio');
        if (songAudio && !songAudio.paused) {
            songAudio.pause();
            songAudio.currentTime = 0;
        }
        
        // 重置游戏状态
        gameState.currentRow = 0;
        gameState.gameOver = false;
        gameState.won = false;
        gameState.charStates.clear(); // 清除字符状态
        
        // 隐藏弹窗
        gameModal.classList.add('hidden');
        
        // 优雅地关闭歌词卡
        if (!lyricsCardModal.classList.contains('hidden')) {
            lyricsCardModal.classList.add('closing');
            setTimeout(() => {
                lyricsCardModal.classList.add('hidden');
                lyricsCardModal.classList.remove('closing');
            }, 300);
        }
        
        // 从服务器获取新的游戏数据
        const response = await fetch('/api/new-game', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            gameState.targetLyric = data.lyric;
            gameState.songTitle = data.title || '经典歌词';
            gameState.songArtist = data.artist || '传世金曲';
            gameState.songSource = data.source || null;
            gameState.hintChars = data.hintChars;
            setupGameGrid();
            setupHintChars();
            
            // 重置游戏状态显示
            const statusElement = document.getElementById('game-status');
            statusElement.innerHTML = ``;
        } else {
            throw new Error(data.message || '获取新游戏数据失败');
        }
        
        // 清空输入框并更新计数器
        guessInput.value = '';
        updateCharCounter();
        guessInput.focus();
    } catch (error) {
        console.error('开始新游戏失败:', error);
        showError('开始新游戏失败，请刷新页面重试');
    }
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
    
    // 设置图片路径 - 根据歌曲标题获取对应图片
    const imageName = getSongImageName(gameState.songTitle);
    lyricsImage.src = `file/${imageName}`;
    
    // 图片加载错误时的处理
    lyricsImage.onerror = function() {
        // 如果图片不存在，显示错误消息
        console.log('图片加载失败:', imageName);
        lyricsImage.alt = '图片加载失败';
        lyricsImage.style.display = 'block';
        lyricsImage.style.minHeight = '300px';
        lyricsImage.style.background = '#f0f0f0';
    };
}

// 根据歌曲标题获取图片名称
function getSongImageName(songTitle) {
    // 文件映射表 - 可以根据需要添加更多歌曲
    const imageMap = {
        '一路向北': '一路向北.png',
        // 未来可以添加更多歌曲的图片映射
        // '歌曲名': '图片文件名.png',
    };
    
    // 首先尝试精确匹配
    if (imageMap[songTitle]) {
        return imageMap[songTitle];
    }
    
    // 如果没有精确匹配，尝试模糊匹配
    for (const [title, filename] of Object.entries(imageMap)) {
        if (songTitle.includes(title) || title.includes(songTitle)) {
            return filename;
        }
    }
    
    // 默认使用一路向北的图片
    return '一路向北.png';
}

// 设置音频播放器
function setupAudioPlayer() {
    const audioSource = document.getElementById('audio-source');
    const songAudio = document.getElementById('song-audio');
    const musicControlBtn = document.getElementById('music-control-btn');
    const musicIcon = document.getElementById('music-icon');
    const musicControlText = document.getElementById('music-control-text');
    
    // 设置音频路径
    const audioName = getSongAudioName(gameState.songTitle);
    audioSource.src = `file/${audioName}`;
    
    // 重新加载音频
    songAudio.load();
    
    // 初始化按钮状态
    musicIcon.textContent = '🎵';
    musicControlText.textContent = '播放';
    musicControlBtn.classList.remove('muted');
    
    // 监听音频事件
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

// 根据歌曲标题获取音频文件名称
function getSongAudioName(songTitle) {
    // 音频文件映射表
    const audioMap = {
        '一路向北': '一路向北.mp3',
        // 未来可以添加更多歌曲的音频映射
        // '歌曲名': '音频文件名.mp3',
    };
    
    // 首先尝试精确匹配
    if (audioMap[songTitle]) {
        return audioMap[songTitle];
    }
    
    // 如果没有精确匹配，尝试模糊匹配
    for (const [title, filename] of Object.entries(audioMap)) {
        if (songTitle.includes(title) || title.includes(songTitle)) {
            return filename;
        }
    }
    
    // 默认使用一路向北的音频
    return '一路向北.mp3';
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
    // 设置测试数据
    gameState.targetLyric = "我一路向北离开有你的季节";
    gameState.songTitle = "一路向北";
    gameState.songArtist = "周杰伦";
    gameState.songSource = {
        type: 'daily',
        name: '每日30首推荐歌单',
        description: '今日精选经典老歌'
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
