// 测试新游戏功能
const http = require('http');

// 测试函数
async function testNewGame() {
    try {
        console.log('🧪 测试新游戏功能...\n');
        
        // 获取当前游戏状态
        console.log('1. 获取初始游戏状态...');
        const initialState = await makeRequest('/api/game-state');
        console.log('初始歌词:', initialState.lyric);
        console.log('初始歌曲:', initialState.title, '-', initialState.artist);
        
        console.log('\n2. 请求新游戏（第1次）...');
        const newGame1 = await makeRequest('/api/new-game', 'POST');
        console.log('新游戏1歌词:', newGame1.lyric);
        console.log('新游戏1歌曲:', newGame1.title, '-', newGame1.artist);
        
        console.log('\n3. 请求新游戏（第2次）...');
        const newGame2 = await makeRequest('/api/new-game', 'POST');
        console.log('新游戏2歌词:', newGame2.lyric);
        console.log('新游戏2歌曲:', newGame2.title, '-', newGame2.artist);
        
        console.log('\n4. 请求新游戏（第3次）...');
        const newGame3 = await makeRequest('/api/new-game', 'POST');
        console.log('新游戏3歌词:', newGame3.lyric);
        console.log('新游戏3歌曲:', newGame3.title, '-', newGame3.artist);
        
        // 检查结果
        console.log('\n📊 测试结果：');
        const lyrics = [initialState.lyric, newGame1.lyric, newGame2.lyric, newGame3.lyric];
        const uniqueLyrics = [...new Set(lyrics)];
        
        console.log('总共请求:', lyrics.length, '次');
        console.log('不同歌词:', uniqueLyrics.length, '个');
        
        if (uniqueLyrics.length > 1) {
            console.log('✅ 测试通过！新游戏功能正常工作，歌词会变化');
        } else {
            console.log('❌ 测试失败！所有请求返回相同歌词');
        }
        
        console.log('\n所有不同的歌词:');
        uniqueLyrics.forEach((lyric, index) => {
            console.log(`${index + 1}. "${lyric}"`);
        });
        
    } catch (error) {
        console.error('测试失败:', error);
    }
}

// HTTP请求函数
function makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    if (response.success) {
                        resolve(response);
                    } else {
                        reject(new Error(response.message || '请求失败'));
                    }
                } catch (error) {
                    reject(new Error('解析响应失败: ' + error.message));
                }
            });
        });
        
        req.on('error', (error) => {
            reject(new Error('网络请求失败: ' + error.message));
        });
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

// 运行测试
testNewGame();
