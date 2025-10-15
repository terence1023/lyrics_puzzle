// 游戏状态管理
let gameState = {
    targetLyric: '',           // 目标歌词
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

// 游戏初始化
async function initGame() {
    try {
        // 从后端获取游戏状态
        const response = await fetch('/api/game-state');
        const data = await response.json();
        
        if (data.success) {
            gameState.targetLyric = data.lyric;
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
    
    // 显示成功消息
    setTimeout(() => {
        const statusElement = document.getElementById('game-status');
        statusElement.innerHTML = `
            <p style="color: #6aaa64; font-weight: bold; font-size: 1.4em;">
                🎉 恭喜你猜对了！答案是："${gameState.targetLyric}"
            </p>
            <button onclick="newGame()" style="margin-top: 15px; padding: 10px 20px; background: #6aaa64; color: white; border: none; border-radius: 8px; cursor: pointer;">开始新游戏</button>
        `;
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
        // 重置游戏状态
        gameState.currentRow = 0;
        gameState.gameOver = false;
        gameState.won = false;
        gameState.charStates.clear(); // 清除字符状态
        
        // 隐藏弹窗
        gameModal.classList.add('hidden');
        
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
