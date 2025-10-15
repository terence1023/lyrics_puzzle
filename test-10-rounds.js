/**
 * 歌词猜猜乐 - 10轮自动化测试脚本
 * 
 * 测试内容：
 * 1. 直接输入正确答案
 * 2. 点击新游戏按钮
 * 3. 重复10轮
 * 4. 每轮检查：歌词内容、显示内容、音频内容是否一致
 * 5. 检查是否存在其他问题
 */

const puppeteer = require('puppeteer');
const path = require('path');

// 测试配置
const TEST_CONFIG = {
    rounds: 10,                          // 测试轮数
    baseUrl: 'http://localhost:3001',    // 测试服务器地址
    timeout: 10000,                      // 操作超时时间（毫秒）
    delayBetweenRounds: 2000,           // 轮次之间的延迟（毫秒）
    screenshotOnError: true              // 错误时截图
};

// 测试结果记录
const testResults = {
    totalRounds: 0,
    successRounds: 0,
    failedRounds: 0,
    errors: [],
    roundDetails: []
};

/**
 * 等待指定时间
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 截图保存
 */
async function takeScreenshot(page, filename) {
    const screenshotDir = path.join(__dirname, 'test-screenshots');
    const fs = require('fs');
    if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir);
    }
    const filepath = path.join(screenshotDir, filename);
    await page.screenshot({ path: filepath, fullPage: true });
    console.log(`📸 截图已保存: ${filepath}`);
}

/**
 * 获取当前游戏状态
 */
async function getGameState(page) {
    return await page.evaluate(() => {
        return {
            targetLyric: window.gameState?.targetLyric || '',
            songTitle: window.gameState?.songTitle || '',
            songArtist: window.gameState?.songArtist || '',
            audioFile: window.gameState?.audioFile || '',
            imageFile: window.gameState?.imageFile || '',
            currentRow: window.gameState?.currentRow || 0,
            gameOver: window.gameState?.gameOver || false,
            won: window.gameState?.won || false
        };
    });
}

/**
 * 获取页面显示的内容
 */
async function getDisplayContent(page) {
    return await page.evaluate(() => {
        // 获取所有显示的字符
        const displayedChars = [];
        const boxes = document.querySelectorAll('.letter-box');
        boxes.forEach(box => {
            if (box.textContent) {
                displayedChars.push(box.textContent);
            }
        });

        // 获取提示字符
        const hintChars = [];
        const hints = document.querySelectorAll('.hint-char');
        hints.forEach(hint => {
            hintChars.push(hint.textContent);
        });

        // 获取音频源
        const audioElement = document.querySelector('audio');
        const audioSrc = audioElement ? audioElement.src : '';

        // 获取图片源
        const imageElement = document.querySelector('#lyrics-image');
        const imageSrc = imageElement ? imageElement.src : '';

        return {
            displayedChars: displayedChars.join(''),
            hintChars: hintChars,
            audioSrc: audioSrc,
            imageSrc: imageSrc
        };
    });
}

/**
 * 输入答案并提交
 */
async function submitAnswer(page, answer) {
    // 清空输入框
    await page.evaluate(() => {
        const input = document.getElementById('guess-input');
        if (input) input.value = '';
    });

    // 输入答案
    await page.type('#guess-input', answer, { delay: 50 });
    
    // 等待一下让输入完全生效
    await sleep(500);

    // 点击提交按钮
    await page.click('#submit-btn');
    
    // 等待提交处理完成
    await sleep(1500);
}

/**
 * 点击新游戏按钮
 */
async function clickNewGame(page) {
    // 查找并点击新游戏按钮
    const newGameButton = await page.$('button:has-text("开始新游戏"), button:has-text("新游戏")');
    
    if (!newGameButton) {
        // 如果在弹窗中找不到，尝试其他方式
        await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const newGameBtn = buttons.find(btn => 
                btn.textContent.includes('新游戏') || 
                btn.textContent.includes('开始新游戏')
            );
            if (newGameBtn) {
                newGameBtn.click();
            } else {
                // 直接调用 newGame 函数
                if (typeof window.newGame === 'function') {
                    window.newGame();
                }
            }
        });
    } else {
        await newGameButton.click();
    }
    
    // 等待新游戏加载
    await sleep(2000);
}

/**
 * 验证一轮游戏的一致性
 */
function validateRound(roundNum, gameState, displayContent) {
    const issues = [];
    
    // 1. 检查目标歌词是否存在
    if (!gameState.targetLyric) {
        issues.push('目标歌词为空');
    }
    
    // 2. 检查歌曲信息是否完整
    if (!gameState.songTitle) {
        issues.push('歌曲标题缺失');
    }
    if (!gameState.songArtist) {
        issues.push('歌手信息缺失');
    }
    
    // 3. 检查音频文件
    if (!gameState.audioFile) {
        issues.push('音频文件名缺失');
    } else {
        const audioFileName = gameState.audioFile;
        const displayedAudioSrc = displayContent.audioSrc;
        if (!displayedAudioSrc.includes(audioFileName)) {
            issues.push(`音频文件不匹配: 期望包含 "${audioFileName}", 实际 "${displayedAudioSrc}"`);
        }
    }
    
    // 4. 检查图片文件
    if (!gameState.imageFile) {
        issues.push('图片文件名缺失');
    } else {
        const imageFileName = gameState.imageFile;
        const displayedImageSrc = displayContent.imageSrc;
        if (displayedImageSrc && !displayedImageSrc.includes(imageFileName)) {
            issues.push(`图片文件不匹配: 期望包含 "${imageFileName}", 实际 "${displayedImageSrc}"`);
        }
    }
    
    // 5. 检查提示字符是否包含目标歌词的所有字符
    if (gameState.targetLyric && displayContent.hintChars.length > 0) {
        const targetChars = [...new Set(gameState.targetLyric.split(''))];
        const missingChars = targetChars.filter(char => !displayContent.hintChars.includes(char));
        if (missingChars.length > 0) {
            issues.push(`提示字符缺少: ${missingChars.join(', ')}`);
        }
    }
    
    // 6. 检查游戏是否成功结束
    if (!gameState.gameOver) {
        issues.push('游戏未正确结束');
    }
    if (!gameState.won) {
        issues.push('游戏未标记为胜利状态');
    }
    
    return issues;
}

/**
 * 执行单轮测试
 */
async function runSingleRound(page, roundNum) {
    console.log(`\n🎮 第 ${roundNum} 轮测试开始...`);
    
    const roundResult = {
        round: roundNum,
        success: false,
        gameState: null,
        displayContent: null,
        issues: [],
        error: null
    };
    
    try {
        // 获取当前游戏状态
        const gameState = await getGameState(page);
        roundResult.gameState = gameState;
        
        console.log(`📝 目标歌词: "${gameState.targetLyric}"`);
        console.log(`🎵 歌曲: ${gameState.songTitle} - ${gameState.songArtist}`);
        console.log(`🔊 音频: ${gameState.audioFile}`);
        console.log(`🖼️  图片: ${gameState.imageFile}`);
        
        // 获取显示内容（提交前）
        const displayContentBefore = await getDisplayContent(page);
        
        // 输入正确答案并提交
        console.log(`⌨️  输入答案: "${gameState.targetLyric}"`);
        await submitAnswer(page, gameState.targetLyric);
        
        // 等待一下确保状态更新
        await sleep(1000);
        
        // 获取提交后的游戏状态
        const gameStateAfter = await getGameState(page);
        
        // 获取显示内容（提交后）
        const displayContentAfter = await getDisplayContent(page);
        roundResult.displayContent = displayContentAfter;
        
        // 验证一致性
        const issues = validateRound(roundNum, gameStateAfter, displayContentAfter);
        roundResult.issues = issues;
        
        if (issues.length === 0) {
            console.log(`✅ 第 ${roundNum} 轮测试通过`);
            roundResult.success = true;
            testResults.successRounds++;
        } else {
            console.log(`❌ 第 ${roundNum} 轮测试失败:`);
            issues.forEach(issue => console.log(`   - ${issue}`));
            testResults.failedRounds++;
            
            // 错误时截图
            if (TEST_CONFIG.screenshotOnError) {
                await takeScreenshot(page, `round-${roundNum}-error.png`);
            }
        }
        
        // 如果不是最后一轮，点击新游戏
        if (roundNum < TEST_CONFIG.rounds) {
            console.log(`🔄 准备开始新游戏...`);
            await clickNewGame(page);
            await sleep(TEST_CONFIG.delayBetweenRounds);
        }
        
    } catch (error) {
        console.log(`❌ 第 ${roundNum} 轮测试出错: ${error.message}`);
        roundResult.error = error.message;
        roundResult.success = false;
        testResults.failedRounds++;
        
        // 错误时截图
        if (TEST_CONFIG.screenshotOnError) {
            await takeScreenshot(page, `round-${roundNum}-exception.png`);
        }
    }
    
    testResults.roundDetails.push(roundResult);
    testResults.totalRounds++;
}

/**
 * 主测试函数
 */
async function runTests() {
    console.log('🚀 开始10轮自动化测试...\n');
    console.log(`配置信息:`);
    console.log(`  - 测试轮数: ${TEST_CONFIG.rounds}`);
    console.log(`  - 服务器地址: ${TEST_CONFIG.baseUrl}`);
    console.log(`  - 轮次延迟: ${TEST_CONFIG.delayBetweenRounds}ms`);
    console.log('================================\n');
    
    let browser;
    let page;
    
    try {
        // 启动浏览器
        browser = await puppeteer.launch({
            headless: false,  // 设置为 false 可以看到浏览器操作
            defaultViewport: { width: 1280, height: 800 },
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        page = await browser.newPage();
        
        // 设置超时时间
        page.setDefaultTimeout(TEST_CONFIG.timeout);
        
        // 监听控制台输出
        page.on('console', msg => {
            const type = msg.type();
            if (type === 'error') {
                console.log(`🔴 浏览器错误: ${msg.text()}`);
            }
        });
        
        // 监听页面错误
        page.on('pageerror', error => {
            console.log(`🔴 页面错误: ${error.message}`);
            testResults.errors.push(`页面错误: ${error.message}`);
        });
        
        // 访问游戏页面
        console.log(`🌐 访问游戏页面: ${TEST_CONFIG.baseUrl}`);
        await page.goto(TEST_CONFIG.baseUrl, { waitUntil: 'networkidle2' });
        
        // 等待游戏初始化
        await page.waitForSelector('#game-grid', { timeout: 5000 });
        await sleep(2000);
        
        // 执行10轮测试
        for (let i = 1; i <= TEST_CONFIG.rounds; i++) {
            await runSingleRound(page, i);
        }
        
    } catch (error) {
        console.error(`\n❌ 测试过程中发生严重错误: ${error.message}`);
        testResults.errors.push(`严重错误: ${error.message}`);
    } finally {
        // 生成测试报告
        generateReport();
        
        // 关闭浏览器（延迟一下，方便查看最后状态）
        if (browser) {
            console.log('\n⏳ 5秒后关闭浏览器...');
            await sleep(5000);
            await browser.close();
        }
    }
}

/**
 * 生成测试报告
 */
function generateReport() {
    console.log('\n');
    console.log('================================');
    console.log('📊 测试报告');
    console.log('================================');
    console.log(`总轮数: ${testResults.totalRounds}`);
    console.log(`成功: ${testResults.successRounds} ✅`);
    console.log(`失败: ${testResults.failedRounds} ❌`);
    console.log(`成功率: ${testResults.totalRounds > 0 ? ((testResults.successRounds / testResults.totalRounds) * 100).toFixed(2) : 0}%`);
    console.log('--------------------------------');
    
    if (testResults.errors.length > 0) {
        console.log('\n⚠️  全局错误:');
        testResults.errors.forEach(error => {
            console.log(`  - ${error}`);
        });
    }
    
    console.log('\n📋 详细结果:');
    testResults.roundDetails.forEach(round => {
        console.log(`\n轮次 ${round.round}: ${round.success ? '✅' : '❌'}`);
        if (round.gameState) {
            console.log(`  歌词: "${round.gameState.targetLyric}"`);
            console.log(`  歌曲: ${round.gameState.songTitle} - ${round.gameState.songArtist}`);
        }
        if (round.issues.length > 0) {
            console.log(`  问题:`);
            round.issues.forEach(issue => {
                console.log(`    - ${issue}`);
            });
        }
        if (round.error) {
            console.log(`  错误: ${round.error}`);
        }
    });
    
    console.log('\n================================');
    console.log('测试完成！');
    console.log('================================\n');
    
    // 保存JSON报告
    const fs = require('fs');
    const reportPath = path.join(__dirname, 'test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
    console.log(`📄 详细报告已保存: ${reportPath}\n`);
}

// 运行测试
runTests().catch(error => {
    console.error('测试脚本执行失败:', error);
    process.exit(1);
});
