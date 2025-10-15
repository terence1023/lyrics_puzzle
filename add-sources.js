#!/usr/bin/env node

/**
 * 为歌词库中的所有歌曲添加来源信息
 */

const fs = require('fs');
const path = require('path');

// 定义三种来源类型
const sourceTypes = [
    {
        type: 'daily',
        name: '每日30首推荐歌单',
        descriptions: [
            '今日精选经典老歌',
            '每日怀旧金曲推荐',
            '今日精选华语经典',
            '每日经典回忆'
        ]
    },
    {
        type: 'favorite',
        name: '我的收藏歌单',
        descriptions: [
            '个人珍藏经典',
            '精心收藏的回忆',
            '我的经典收藏',
            '珍藏经典金曲',
            '个人精选收藏',
            '民谣经典收藏',
            '摇滚经典收藏',
            '流行经典收藏'
        ]
    },
    {
        type: 'hot',
        name: '热门榜单',
        descriptions: [
            '华语经典热门',
            '经典热门金曲',
            '传唱度最高',
            '最受欢迎经典',
            '励志金曲排行',
            '怀旧金曲热榜'
        ]
    }
];

// 随机选择来源
function getRandomSource() {
    const sourceType = sourceTypes[Math.floor(Math.random() * sourceTypes.length)];
    const description = sourceType.descriptions[Math.floor(Math.random() * sourceType.descriptions.length)];
    
    return {
        type: sourceType.type,
        name: sourceType.name,
        description: description
    };
}

// 主函数
function addSourcesToLyrics() {
    const lyricsPath = path.join(__dirname, 'lyrics.json');
    
    try {
        // 读取歌词文件
        const data = fs.readFileSync(lyricsPath, 'utf8');
        const lyrics = JSON.parse(data);
        
        console.log(`📚 开始处理 ${lyrics.length} 首歌曲...`);
        
        let updatedCount = 0;
        
        // 为每首歌曲添加来源信息（如果没有的话）
        const updatedLyrics = lyrics.map((song, index) => {
            if (!song.source) {
                const source = getRandomSource();
                updatedCount++;
                
                console.log(`✅ [${index + 1}/${lyrics.length}] "${song.title}" - ${song.artist} → ${source.name} (${source.description})`);
                
                return {
                    ...song,
                    source: source
                };
            } else {
                console.log(`⏭️  [${index + 1}/${lyrics.length}] "${song.title}" - ${song.artist} → 已有来源信息`);
                return song;
            }
        });
        
        // 写回文件
        fs.writeFileSync(lyricsPath, JSON.stringify(updatedLyrics, null, 2), 'utf8');
        
        console.log(`\n🎉 处理完成！`);
        console.log(`📊 统计信息:`);
        console.log(`   - 总歌曲数: ${lyrics.length}`);
        console.log(`   - 新增来源: ${updatedCount}`);
        console.log(`   - 已有来源: ${lyrics.length - updatedCount}`);
        
        // 按来源类型统计
        const sourceStats = {};
        updatedLyrics.forEach(song => {
            if (song.source) {
                const sourceType = song.source.type;
                sourceStats[sourceType] = (sourceStats[sourceType] || 0) + 1;
            }
        });
        
        console.log(`\n📈 来源分布:`);
        console.log(`   - 📅 每日推荐: ${sourceStats.daily || 0} 首`);
        console.log(`   - ❤️ 我的收藏: ${sourceStats.favorite || 0} 首`);
        console.log(`   - 🔥 热门榜单: ${sourceStats.hot || 0} 首`);
        
        console.log(`\n✅ 歌词库更新完成！重启服务器以应用更改。`);
        
    } catch (error) {
        console.error('❌ 处理失败:', error.message);
        process.exit(1);
    }
}

// 运行脚本
if (require.main === module) {
    addSourcesToLyrics();
}

module.exports = { addSourcesToLyrics };
