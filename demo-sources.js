#!/usr/bin/env node

/**
 * 歌曲来源功能演示脚本
 */

const fs = require('fs');
const path = require('path');

console.log('🎵 歌词猜猜乐 - 歌曲来源功能演示\n');

// 读取歌词数据
const lyricsPath = path.join(__dirname, 'lyrics.json');
const lyrics = JSON.parse(fs.readFileSync(lyricsPath, 'utf8'));

// 统计各来源的歌曲数量
const sourceStats = {};
const sourceExamples = {};

lyrics.forEach(song => {
    if (song.source) {
        const sourceType = song.source.type;
        sourceStats[sourceType] = (sourceStats[sourceType] || 0) + 1;
        
        if (!sourceExamples[sourceType]) {
            sourceExamples[sourceType] = [];
        }
        
        if (sourceExamples[sourceType].length < 3) {
            sourceExamples[sourceType].push({
                title: song.title,
                artist: song.artist,
                lyric: song.lyric,
                description: song.source.description
            });
        }
    }
});

// 显示统计信息
console.log('📊 歌曲来源统计：');
console.log(`   总歌曲数：${lyrics.length} 首`);
console.log(`   📅 每日推荐：${sourceStats.daily || 0} 首`);
console.log(`   ❤️ 我的收藏：${sourceStats.favorite || 0} 首`);
console.log(`   🔥 热门榜单：${sourceStats.hot || 0} 首\n`);

// 显示各来源的示例歌曲
const sourceNames = {
    daily: '📅 每日30首推荐歌单',
    favorite: '❤️ 我的收藏歌单',
    hot: '🔥 热门榜单'
};

Object.keys(sourceExamples).forEach(sourceType => {
    console.log(`${sourceNames[sourceType]}：`);
    sourceExamples[sourceType].forEach((song, index) => {
        console.log(`   ${index + 1}. "${song.title}" - ${song.artist}`);
        console.log(`      歌词：${song.lyric}`);
        console.log(`      标签：${song.description}\n`);
    });
});

console.log('🚀 启动服务器体验完整功能：');
console.log('   npm start');
console.log('   然后访问：http://localhost:3000\n');

console.log('✨ 功能特色：');
console.log('   • 猜对歌词后可查看歌曲来源');
console.log('   • 点击"歌单详情"了解更多信息');
console.log('   • 三种不同风格的歌单分类');
console.log('   • 现代化的用户界面设计');
console.log('   • 支持移动设备和桌面设备');
