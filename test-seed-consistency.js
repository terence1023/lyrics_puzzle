#!/usr/bin/env node

/**
 * Seed一致性测试脚本
 * 用于验证使用相同seed时，多次请求返回相同的歌词
 */

const fetch = require('node-fetch');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
const TEST_SEED = 1234567890;

async function testSeedConsistency() {
    console.log('🧪 开始Seed一致性测试\n');
    console.log(`服务器地址: ${SERVER_URL}`);
    console.log(`测试Seed: ${TEST_SEED}\n`);
    
    try {
        // 第一次请求
        console.log('📡 发送第一次请求...');
        const response1 = await fetch(`${SERVER_URL}/api/game-state?seed=${TEST_SEED}`);
        const data1 = await response1.json();
        
        if (!data1.success) {
            console.error('❌ 第一次请求失败:', data1.message);
            return;
        }
        
        console.log(`✅ 第一次请求成功`);
        console.log(`   歌词: ${data1.lyric}`);
        console.log(`   标题: ${data1.title}`);
        console.log(`   歌手: ${data1.artist}\n`);
        
        // 等待1秒
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 第二次请求（相同seed）
        console.log('📡 发送第二次请求（相同seed）...');
        const response2 = await fetch(`${SERVER_URL}/api/game-state?seed=${TEST_SEED}`);
        const data2 = await response2.json();
        
        if (!data2.success) {
            console.error('❌ 第二次请求失败:', data2.message);
            return;
        }
        
        console.log(`✅ 第二次请求成功`);
        console.log(`   歌词: ${data2.lyric}`);
        console.log(`   标题: ${data2.title}`);
        console.log(`   歌手: ${data2.artist}\n`);
        
        // 验证一致性
        console.log('🔍 验证一致性...');
        if (data1.lyric === data2.lyric && 
            data1.title === data2.title && 
            data1.artist === data2.artist) {
            console.log('✅ 测试通过！使用相同seed返回了相同的歌词。\n');
        } else {
            console.log('❌ 测试失败！使用相同seed返回了不同的歌词。');
            console.log('   差异详情:');
            if (data1.lyric !== data2.lyric) {
                console.log(`   - 歌词不同: "${data1.lyric}" vs "${data2.lyric}"`);
            }
            if (data1.title !== data2.title) {
                console.log(`   - 标题不同: "${data1.title}" vs "${data2.title}"`);
            }
            if (data1.artist !== data2.artist) {
                console.log(`   - 歌手不同: "${data1.artist}" vs "${data2.artist}"`);
            }
            console.log('');
            return;
        }
        
        // 测试猜测API
        console.log('📡 测试猜测API...');
        const guessResponse = await fetch(`${SERVER_URL}/api/guess`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                guess: data1.lyric,  // 使用正确答案
                seed: TEST_SEED
            })
        });
        
        const guessData = await guessResponse.json();
        
        if (!guessData.success) {
            console.error('❌ 猜测API请求失败:', guessData.message);
            return;
        }
        
        console.log(`✅ 猜测API响应成功`);
        console.log(`   是否正确: ${guessData.correct}`);
        console.log(`   颜色数组长度: ${guessData.colors.length}\n`);
        
        if (guessData.correct) {
            console.log('✅ 完整测试通过！Seed在整个游戏流程中保持一致。\n');
        } else {
            console.log('❌ 测试失败！猜测API使用了不同的歌词。\n');
        }
        
        // 测试不同的seed
        console.log('📡 测试不同的seed...');
        const differentSeed = TEST_SEED + 1;
        const response3 = await fetch(`${SERVER_URL}/api/game-state?seed=${differentSeed}`);
        const data3 = await response3.json();
        
        if (!data3.success) {
            console.error('❌ 不同seed请求失败:', data3.message);
            return;
        }
        
        console.log(`✅ 不同seed请求成功`);
        console.log(`   新Seed: ${differentSeed}`);
        console.log(`   歌词: ${data3.lyric}`);
        console.log(`   标题: ${data3.title}`);
        console.log(`   歌手: ${data3.artist}\n`);
        
        if (data1.lyric !== data3.lyric) {
            console.log('✅ 验证通过！不同seed返回了不同的歌词。\n');
        } else {
            console.log('⚠️  警告：不同seed返回了相同的歌词（歌词库可能太小）。\n');
        }
        
        console.log('🎉 所有测试完成！');
        
    } catch (error) {
        console.error('❌ 测试过程中发生错误:', error.message);
        console.error(error.stack);
    }
}

// 运行测试
testSeedConsistency();
