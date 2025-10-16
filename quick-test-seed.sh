#!/bin/bash

# 快速验证seed一致性的测试脚本

echo "🧪 Seed一致性快速验证"
echo "====================="
echo ""

# 读取服务器地址
read -p "请输入服务器地址 (默认: http://localhost:3000): " SERVER_URL
SERVER_URL=${SERVER_URL:-http://localhost:3000}

# 使用固定seed
SEED=1234567890

echo ""
echo "📡 测试配置："
echo "   服务器: $SERVER_URL"
echo "   测试Seed: $SEED"
echo ""

# 测试1: 获取游戏状态
echo "1️⃣  测试获取游戏状态..."
RESPONSE1=$(curl -s "$SERVER_URL/api/game-state?seed=$SEED")
LYRIC1=$(echo $RESPONSE1 | grep -o '"lyric":"[^"]*"' | sed 's/"lyric":"\([^"]*\)"/\1/')

if [ -z "$LYRIC1" ]; then
    echo "   ❌ 失败：无法获取歌词"
    exit 1
else
    echo "   ✅ 成功：$LYRIC1"
fi

# 等待1秒
sleep 1

# 测试2: 再次获取（相同seed）
echo ""
echo "2️⃣  再次获取游戏状态（相同seed）..."
RESPONSE2=$(curl -s "$SERVER_URL/api/game-state?seed=$SEED")
LYRIC2=$(echo $RESPONSE2 | grep -o '"lyric":"[^"]*"' | sed 's/"lyric":"\([^"]*\)"/\1/')

if [ -z "$LYRIC2" ]; then
    echo "   ❌ 失败：无法获取歌词"
    exit 1
else
    echo "   ✅ 成功：$LYRIC2"
fi

# 验证一致性
echo ""
echo "3️⃣  验证一致性..."
if [ "$LYRIC1" = "$LYRIC2" ]; then
    echo "   ✅ 通过：两次请求返回相同歌词"
else
    echo "   ❌ 失败：两次请求返回不同歌词"
    echo "   第一次: $LYRIC1"
    echo "   第二次: $LYRIC2"
    exit 1
fi

# 测试3: 不同seed
echo ""
SEED2=$((SEED + 1))
echo "4️⃣  测试不同seed ($SEED2)..."
RESPONSE3=$(curl -s "$SERVER_URL/api/game-state?seed=$SEED2")
LYRIC3=$(echo $RESPONSE3 | grep -o '"lyric":"[^"]*"' | sed 's/"lyric":"\([^"]*\)"/\1/')

if [ -z "$LYRIC3" ]; then
    echo "   ❌ 失败：无法获取歌词"
    exit 1
else
    echo "   ✅ 成功：$LYRIC3"
fi

if [ "$LYRIC1" != "$LYRIC3" ]; then
    echo "   ✅ 通过：不同seed返回不同歌词"
else
    echo "   ⚠️  警告：不同seed返回相同歌词（歌词库可能较小）"
fi

echo ""
echo "🎉 所有测试完成！"
echo ""
echo "💡 建议："
echo "   - 在浏览器中访问: $SERVER_URL?seed=$SEED"
echo "   - 刷新页面验证题目不变"
echo "   - 提交答案验证逻辑正确"
echo ""
