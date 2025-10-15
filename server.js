const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// 歌词库
let lyricsDatabase = [];

// 高频汉字库（常用汉字）
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

// 当前游戏状态
let currentGameState = {
    dailyLyric: '',
    lastUpdate: null,
    usedHintChars: new Set() // 跟踪已使用的提示汉字
};

// 加载歌词库
function loadLyricsDatabase() {
    try {
        const lyricsPath = path.join(__dirname, 'lyrics.json');
        if (fs.existsSync(lyricsPath)) {
            const data = fs.readFileSync(lyricsPath, 'utf8');
            lyricsDatabase = JSON.parse(data);
            console.log(`已加载 ${lyricsDatabase.length} 条歌词`);
        } else {
            console.log('歌词库不存在，使用默认歌词');
            // 使用默认歌词作为后备
            lyricsDatabase = getDefaultLyrics();
        }
    } catch (error) {
        console.error('加载歌词库失败:', error);
        lyricsDatabase = getDefaultLyrics();
    }
}

// 获取默认歌词库
function getDefaultLyrics() {
    return [
        { lyric: "青春如同奔流的江河", title: "青春", artist: "经典歌曲" },
        { lyric: "一路向北不能回头", title: "一路向北", artist: "周杰伦" },
        { lyric: "最美不过初相见", title: "初相见", artist: "经典歌曲" },
        { lyric: "岁月是朵两生花", title: "两生花", artist: "经典歌曲" },
        { lyric: "时间都去哪儿了", title: "时间都去哪儿了", artist: "王铮亮" },
        { lyric: "那些年我们一起追的女孩", title: "那些年", artist: "胡夏" },
        { lyric: "你是我心中最美的云彩", title: "最美的云彩", artist: "经典歌曲" },
        { lyric: "海阔天空在勇敢以后", title: "海阔天空", artist: "Beyond" },
        { lyric: "梦想还是要有的", title: "梦想", artist: "经典歌曲" },
        { lyric: "平凡之路孤独着前行", title: "平凡之路", artist: "朴树" },
        { lyric: "小幸运遇见了你", title: "小幸运", artist: "田馥甄" },
        { lyric: "后来我们都长大了", title: "后来", artist: "刘若英" },
        { lyric: "匆匆那年我们来不及认真", title: "匆匆那年", artist: "王菲" },
        { lyric: "红豆生南国春来发几枝", title: "红豆", artist: "王菲" },
        { lyric: "月亮代表我的心永远不变", title: "月亮代表我的心", artist: "邓丽君" },
        { lyric: "往事只能回味不能重来", title: "往事只能回味", artist: "经典歌曲" },
        { lyric: "明天你好含着泪微笑", title: "明天你好", artist: "牛奶咖啡" },
        { lyric: "同桌的你现在好吗", title: "同桌的你", artist: "老狼" },
        { lyric: "外面的世界很精彩", title: "外面的世界", artist: "齐秦" },
        { lyric: "爱如潮水将我包围", title: "爱如潮水", artist: "张信哲" }
    ];
}

// 获取今日歌词（这里简化为随机选择）
function getTodayLyric() {
    const today = new Date().toDateString();
    
    // 如果是新的一天或者还没有设置今日歌词，则重新选择
    if (!currentGameState.lastUpdate || currentGameState.lastUpdate !== today) {
        if (lyricsDatabase.length > 0) {
            const randomIndex = Math.floor(Math.random() * lyricsDatabase.length);
            currentGameState.dailyLyric = lyricsDatabase[randomIndex];
            currentGameState.lastUpdate = today;
        }
    }
    
    return currentGameState.dailyLyric;
}

// 获取今日歌词的文本部分
function getTodayLyricText() {
    const lyricObj = getTodayLyric();
    return typeof lyricObj === 'string' ? lyricObj : lyricObj?.lyric || '';
}

// 获取今日歌词的完整信息
function getTodayLyricInfo() {
    const lyricObj = getTodayLyric();
    if (typeof lyricObj === 'string') {
        return {
            lyric: lyricObj,
            title: '经典歌词',
            artist: '传世金曲'
        };
    }
    return lyricObj || {
        lyric: '',
        title: '经典歌词',
        artist: '传世金曲'
    };
}

// 比较猜测和答案，返回颜色数组
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

// 生成提示汉字（30个汉字，包含歌词中的所有去重字符）
function generateHintChars(lyric) {
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
    
    console.log(`歌词"${lyric}"包含的去重字符:`, lyricChars);
    console.log(`添加到提示库的字符:`, hintChars);
    
    // 从高频汉字库中随机选择剩余的字符，确保不重复且不与已使用的字符重复
    const availableChars = highFrequencyChars.filter(char => 
        !usedChars.has(char) && !currentGameState.usedHintChars.has(char)
    );
    
    const remainingCount = Math.max(30 - hintChars.length, 0);
    const shuffledAvailableChars = availableChars.sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < remainingCount && i < shuffledAvailableChars.length; i++) {
        hintChars.push(shuffledAvailableChars[i]);
        usedChars.add(shuffledAvailableChars[i]);
    }
    
    // 如果高频字库不够，从所有中文字符中补充
    while (hintChars.length < 30) {
        const randomChar = String.fromCharCode(0x4e00 + Math.floor(Math.random() * (0x9fff - 0x4e00)));
        if (!usedChars.has(randomChar)) {
            hintChars.push(randomChar);
            usedChars.add(randomChar);
        }
    }
    
    // 记录本次使用的提示字符，防止下次重复
    hintChars.forEach(char => currentGameState.usedHintChars.add(char));
    
    // 如果使用的字符太多，清理一部分（保持在合理范围内）
    if (currentGameState.usedHintChars.size > 200) {
        const usedArray = Array.from(currentGameState.usedHintChars);
        currentGameState.usedHintChars = new Set(usedArray.slice(-100));
    }
    
    // 去重并随机打乱顺序
    const uniqueHintChars = [...new Set(hintChars)];
    return uniqueHintChars.sort(() => Math.random() - 0.5);
}

// API路由：获取游戏状态
app.get('/api/game-state', (req, res) => {
    try {
        const todayLyricInfo = getTodayLyricInfo();
        const todayLyricText = todayLyricInfo.lyric;
        
        if (!todayLyricText) {
            return res.status(500).json({
                success: false,
                message: '无法获取今日歌词'
            });
        }
        
        const hintChars = generateHintChars(todayLyricText);
        
        res.json({
            success: true,
            lyric: todayLyricText,
            title: todayLyricInfo.title,
            artist: todayLyricInfo.artist,
            source: todayLyricInfo.source,
            length: todayLyricText.length,
            hintChars: hintChars
        });
    } catch (error) {
        console.error('获取游戏状态失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

// API路由：处理猜测
app.post('/api/guess', (req, res) => {
    try {
        const { guess } = req.body;
        
        // 验证输入
        if (!guess || typeof guess !== 'string') {
            return res.status(400).json({
                success: false,
                message: '请提供有效的猜测'
            });
        }
        
        const target = getTodayLyricText();
        
        if (!target) {
            return res.status(500).json({
                success: false,
                message: '无法获取答案'
            });
        }
        
        // 验证长度
        if (guess.length !== target.length) {
            return res.status(400).json({
                success: false,
                message: `请输入${target.length}个字符`
            });
        }
        
        // 比较猜测和答案
        const colors = compareGuess(guess, target);
        const isCorrect = guess === target;
        
        res.json({
            success: true,
            correct: isCorrect,
            colors: colors,
            guess: guess
        });
        
    } catch (error) {
        console.error('处理猜测失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

// 主页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 健康检查路由
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        lyricsCount: lyricsDatabase.length
    });
});

// API路由：重新开始游戏（清理使用过的提示字符）
app.post('/api/new-game', (req, res) => {
    try {
        // 清理使用过的提示字符，让新游戏可以使用不同的提示字符
        currentGameState.usedHintChars.clear();
        
        // 重新选择歌词
        if (lyricsDatabase.length > 0) {
            const randomIndex = Math.floor(Math.random() * lyricsDatabase.length);
            currentGameState.dailyLyric = lyricsDatabase[randomIndex];
        }
        
        const todayLyricInfo = getTodayLyricInfo();
        const todayLyricText = todayLyricInfo.lyric;
        const hintChars = generateHintChars(todayLyricText);
        
        res.json({
            success: true,
            lyric: todayLyricText,
            title: todayLyricInfo.title,
            artist: todayLyricInfo.artist,
            source: todayLyricInfo.source,
            length: todayLyricText.length,
            hintChars: hintChars
        });
    } catch (error) {
        console.error('重新开始游戏失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

// 404处理
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: '页面不存在'
    });
});

// 错误处理中间件
app.use((error, req, res, next) => {
    console.error('服务器错误:', error);
    res.status(500).json({
        success: false,
        message: '服务器内部错误'
    });
});

// 启动服务器
function startServer() {
    // 加载歌词库
    loadLyricsDatabase();
    
    // 获取本机IP地址
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();
    let localIP = 'localhost';
    
    // 查找局域网IP
    for (const interfaceName in networkInterfaces) {
        const networkInterface = networkInterfaces[interfaceName];
        for (const network of networkInterface) {
            if (network.family === 'IPv4' && !network.internal && network.address.startsWith('192.168.')) {
                localIP = network.address;
                break;
            }
        }
        if (localIP !== 'localhost') break;
    }
    
    // 启动服务器，监听所有网卡接口
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🎵 歌词猜猜乐服务器运行在端口 ${PORT}`);
        console.log(`🌐 本地访问: http://localhost:${PORT}`);
        console.log(`🌐 局域网访问: http://${localIP}:${PORT}`);
        console.log(`📱 手机/平板访问: http://${localIP}:${PORT}`);
        
        // 设置今日歌词
        const todayLyricInfo = getTodayLyricInfo();
        console.log(`📝 今日歌词: "${todayLyricInfo.lyric}" - ${todayLyricInfo.title} (${todayLyricInfo.artist})`);
    });
}

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('收到 SIGTERM 信号，正在关闭服务器...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('收到 SIGINT 信号，正在关闭服务器...');
    process.exit(0);
});

// 启动应用
startServer();
