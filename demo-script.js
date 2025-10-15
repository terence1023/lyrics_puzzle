// 演示模式的游戏逻辑
let gameState = {
    targetLyric: '青春如同奔流的江河',
    currentRow: 0,
    maxAttempts: 6,
    gameOver: false,
    won: false
};

// 演示用的歌词库
const demoLyrics = [
    '青春如同奔流的江河',
    '一路向北不能回头',
    '最美不过初相见',
    '岁月是朵两生花',
    '时间都去哪儿了'
];

// DOM元素引用
const gameGrid = document.getElementById('game-grid');
const guessInput = document.getElementById('guess-input');
const submitBtn = document.getElementById('submit-btn');
const remainingAttempts = document.getElementById('remaining-attempts');
const gameModal = document.getElementById('game-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const answerDisplay = document.getElementById('answer-display');

// 游戏初始化
function initGame() {
    // 随机选择一个歌词作为答案
    const randomIndex = Math.floor(Math.random() * demoLyrics.length);
    gameState.targetLyric = demoLyrics[randomIndex];
    
    // 更新答案显示
    answerDisplay.textContent = gameState.targetLyric;
    
    setupGameGrid();
    updateRemainingAttempts();
    
    console.log('演示模式 - 今日答案:', gameState.targetLyric);
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

// 比较猜测和答案，返回颜色数组（本地实现）
function compareGuess(guess, target) {
    const result = new Array(target.length).fill('absent');
    const targetChars = [...target];
    const guessChars = [...guess];
    
    // 第一轮：标记完全匹配的字符（绿色）
    for (let i = 0; i < target.length; i++) {
        if (guessChars[i] === targetChars[i]) {
            result[i] = 'correct';
            targetChars[i] = null;  // 标记为已使用
            guessChars[i] = null;   // 标记为已处理
        }
    }
    
    // 第二轮：标记存在但位置错误的字符（黄色）
    for (let i = 0; i < guessChars.length; i++) {
        if (guessChars[i] !== null) {  // 未在第一轮处理的字符
            const targetIndex = targetChars.findIndex(char => char === guessChars[i]);
            if (targetIndex !== -1) {
                result[i] = 'present';
                targetChars[targetIndex] = null;  // 标记为已使用
            }
        }
    }
    
    return result;
}

// 提交猜测
function submitGuess() {
    const guess = guessInput.value.trim();
    
    // 验证输入
    if (!validateInput(guess)) {
        return;
    }
    
    // 模拟API响应
    const colors = compareGuess(guess, gameState.targetLyric);
    const isCorrect = guess === gameState.targetLyric;
    
    // 更新网格显示
    updateGrid(guess, colors);
    
    // 检查游戏状态
    if (isCorrect) {
        setTimeout(() => {
            endGame(true, `🎉 恭喜你！你猜对了！\n答案是："${gameState.targetLyric}"`);
        }, 1000);
    } else {
        gameState.currentRow++;
        updateRemainingAttempts();
        
        if (gameState.currentRow >= gameState.maxAttempts) {
            setTimeout(() => {
                endGame(false, `😅 游戏结束！\n正确答案是："${gameState.targetLyric}"`);
            }, 1000);
        }
    }
    
    // 清空输入框
    guessInput.value = '';
}

// 验证输入
function validateInput(guess) {
    if (!guess) {
        alert('请输入你的猜测');
        return false;
    }
    
    if (guess.length !== gameState.targetLyric.length) {
        alert(`请输入${gameState.targetLyric.length}个字符`);
        return false;
    }
    
    if (gameState.gameOver) {
        alert('游戏已结束，请开始新游戏');
        return false;
    }
    
    return true;
}

// 更新网格显示
function updateGrid(guess, colors) {
    const row = gameState.currentRow;
    
    for (let i = 0; i < guess.length; i++) {
        const box = document.getElementById(`box-${row}-${i}`);
        box.textContent = guess[i];
        
        // 添加动画效果
        setTimeout(() => {
            box.classList.add('animate');
            box.classList.add(colors[i]);
        }, i * 100); // 逐个显示效果
    }
}

// 更新剩余尝试次数
function updateRemainingAttempts() {
    const remaining = gameState.maxAttempts - gameState.currentRow;
    remainingAttempts.textContent = remaining;
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
function newGame() {
    // 重置游戏状态
    gameState.currentRow = 0;
    gameState.gameOver = false;
    gameState.won = false;
    
    // 隐藏弹窗
    gameModal.classList.add('hidden');
    
    // 重新初始化游戏
    initGame();
    
    // 清空输入框并聚焦
    guessInput.value = '';
    guessInput.focus();
}

// 键盘事件监听
guessInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        submitGuess();
    }
});

// 只允许输入中文字符、英文字母和数字
guessInput.addEventListener('input', function(e) {
    const value = e.target.value;
    const cleanedValue = value.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');
    
    if (value !== cleanedValue) {
        e.target.value = cleanedValue;
    }
});

// 添加一些演示提示
function showDemoTips() {
    const tips = [
        '💡 提示：答案已显示在上方，试试输入看看效果！',
        '🎯 这是演示模式，尝试输入不同的文字看看颜色反馈',
        '🚀 安装Node.js后运行完整版本获得最佳体验'
    ];
    
    let tipIndex = 0;
    const showTip = () => {
        if (!gameState.gameOver && tipIndex < tips.length) {
            setTimeout(() => {
                alert(tips[tipIndex]);
                tipIndex++;
                if (tipIndex < tips.length) {
                    setTimeout(showTip, 5000);
                }
            }, 3000);
        }
    };
    
    showTip();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initGame();
    guessInput.focus();
    showDemoTips();
});
