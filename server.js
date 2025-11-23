const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 靜態檔案
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// --- 1. 遊戲配置 ---

const MAP_DATA = [
    // 底部 (右 -> 左)
    { id: 0, name: "起點", type: "GO" },
    { id: 1, name: "基隆夜市", type: "PROP", group: "Brown", price: 6000, house: 5000, rents: [600, 3000, 9000, 18000, 25000, 35000] },
    { id: 2, name: "命運", type: "DESTINY" },
    { id: 3, name: "九份老街", type: "PROP", group: "Brown", price: 6000, house: 5000, rents: [800, 4000, 10000, 20000, 30000, 45000] },
    { id: 4, name: "所得稅", type: "TAX", amount: 2000 },
    { id: 5, name: "台鐵車站", type: "RAIL", price: 20000, baseRent: 1500 },
    { id: 6, name: "西門町", type: "PROP", group: "LightBlue", price: 10000, house: 6000, rents: [1000, 5000, 15000, 30000, 45000, 60000] },
    { id: 7, name: "機會", type: "CHANCE" },
    { id: 8, name: "華山文創", type: "PROP", group: "LightBlue", price: 10000, house: 6000, rents: [1000, 5000, 15000, 30000, 45000, 60000] },
    { id: 9, name: "台北101", type: "PROP", group: "LightBlue", price: 12000, house: 6000, rents: [1200, 6000, 18000, 35000, 50000, 75000] },
    // 左邊 (下 -> 上)
    { id: 10, name: "監獄", type: "JAIL" },
    { id: 11, name: "新竹城隍廟", type: "PROP", group: "Pink", price: 14000, house: 8000, rents: [1400, 7000, 20000, 40000, 55000, 75000] },
    { id: 12, name: "高鐵新竹站", type: "UTIL", price: 15000, factor: 4 },
    { id: 13, name: "竹科園區", type: "PROP", group: "Pink", price: 14000, house: 8000, rents: [1400, 7000, 20000, 40000, 55000, 75000] },
    { id: 14, name: "豪宅稅", type: "TAX", amount: 3000 },
    { id: 15, name: "高鐵台中站", type: "RAIL", price: 20000, baseRent: 1500 },
    { id: 16, name: "鹿港老街", type: "PROP", group: "Orange", price: 16000, house: 9000, rents: [1600, 8000, 22000, 44000, 60000, 80000] },
    { id: 17, name: "命運", type: "DESTINY" },
    { id: 18, name: "逢甲夜市", type: "PROP", group: "Orange", price: 16000, house: 9000, rents: [1600, 8000, 22000, 44000, 60000, 80000] },
    { id: 19, name: "高美濕地", type: "PROP", group: "Orange", price: 18000, house: 9000, rents: [1800, 9000, 25000, 50000, 70000, 90000] },
    // 上方 (左 -> 右)
    { id: 20, name: "免費停車", type: "FREE_PARKING" },
    { id: 21, name: "安平古堡", type: "PROP", group: "Red", price: 18000, house: 11000, rents: [1800, 9000, 25000, 55000, 70000, 90000] },
    { id: 22, name: "機會", type: "CHANCE" },
    { id: 23, name: "花園夜市", type: "PROP", group: "Red", price: 18000, house: 11000, rents: [2000, 10000, 30000, 60000, 80000, 95000] },
    { id: 24, name: "台南孔廟", type: "PROP", group: "Red", price: 20000, house: 11000, rents: [2200, 11000, 33000, 66000, 82000, 100000] },
    { id: 25, name: "高鐵左營站", type: "RAIL", price: 20000, baseRent: 1500 },
    { id: 26, name: "六合夜市", type: "PROP", group: "Yellow", price: 22000, house: 13000, rents: [2200, 13000, 36000, 70000, 90000, 110000] },
    { id: 27, name: "愛河", type: "PROP", group: "Yellow", price: 22000, house: 13000, rents: [2200, 13000, 36000, 70000, 90000, 110000] },
    { id: 28, name: "命運", type: "DESTINY" },
    { id: 29, name: "蓮池潭", type: "PROP", group: "Yellow", price: 24000, house: 13000, rents: [2400, 14000, 40000, 75000, 100000, 120000] },
    // 右邊 (上 -> 下)
    { id: 30, name: "前進監獄", type: "GOTO_JAIL" },
    { id: 31, name: "花蓮太魯閣", type: "PROP", group: "Green", price: 26000, house: 15000, rents: [2600, 15000, 42000, 82000, 110000, 130000] },
    { id: 32, name: "花蓮車站", type: "RAIL", price: 20000, baseRent: 1500 },
    { id: 33, name: "七星潭", type: "PROP", group: "Green", price: 26000, house: 15000, rents: [2600, 15000, 42000, 82000, 110000, 130000] },
    { id: 34, name: "清境農場", type: "PROP", group: "Green", price: 28000, house: 15000, rents: [2800, 16000, 45000, 85000, 115000, 140000] },
    { id: 35, name: "台電公司", type: "UTIL", price: 15000, factor: 4 },
    { id: 36, name: "日月潭", type: "PROP", group: "DarkBlue", price: 35000, house: 20000, rents: [3500, 20000, 50000, 110000, 130000, 150000] },
    { id: 37, name: "機會", type: "CHANCE" },
    { id: 38, name: "阿里山", type: "PROP", group: "DarkBlue", price: 40000, house: 20000, rents: [5000, 22000, 60000, 120000, 150000, 180000] },
    { id: 39, name: "豪華稅", type: "TAX", amount: 3000 }
];

// 機會 / 命運 基底樣本（好壞各有）
const CHANCE_BASE = [
    { text: "銀行系統出錯，多入帳 $2000", val: 2000 },
    { text: "智慧投資成功，獲利 $3000", val: 3000 },
    { text: "年終獎金豐厚，獲得 $1500", val: 1500 },
    { text: "高鐵誤點補償金 $800", val: 800 },
    { text: "醫療保險理賠金 $1200", val: 1200 },
    { text: "繳納學費 $1500", val: -1500 },
    { text: "車禍罰單，支付 $500", val: -500 },
    { text: "信用卡遲繳，支付利息 $1000", val: -1000 },
    { text: "手機掉進海裡，重買一支 $3000", val: -3000 },
    { text: "旅遊過度血拼，爆買花費 $2500", val: -2500 },
];

const DESTINY_BASE = [
    { text: "股東分紅，獲得 $3000", val: 3000 },
    { text: "土地增值，獲得 $2500", val: 2500 },
    { text: "親友包紅包，獲得 $1000", val: 1000 },
    { text: "中樂透小獎，獲得 $5000", val: 5000 },
    { text: "政府補助節能家電，獲得 $800", val: 800 },
    { text: "維修房屋費用 $2000", val: -2000 },
    { text: "醫療開銷，支付 $1800", val: -1800 },
    { text: "投資失利，損失 $2500", val: -2500 },
    { text: "稅務稽查，補繳稅金 $2200", val: -2200 },
    { text: "閃電颱風損失 $1500", val: -1500 },
];

// 擴充成 50 張
function expandCards(base, targetLen = 50) {
    const arr = [];
    while (arr.length < targetLen) arr.push(...base);
    return arr.slice(0, targetLen);
}
const CHANCE_CARDS = expandCards(CHANCE_BASE, 50);
const DESTINY_CARDS = expandCards(DESTINY_BASE, 50);

// --- 2. 多房間遊戲狀態 (room-based) ---

function createInitialState() {
    return {
        players: {},          // playerId -> { ... }
        map: MAP_DATA.map(t => ({ ...t, owner: null, level: 0 })),
        order: [],
        turnIndex: 0,
        status: 'LOBBY',      // 'LOBBY' | 'PLAYING' | 'ENDED'
        lastDice: [0, 0],
        hostId: null,
        winnerId: null,
        liquidation: null     // { playerId, creditorId, reason }
    };
}

const rooms = new Map();          // roomId -> { id, state }
const clientSessions = new Map(); // socketId -> { roomId, playerId }

function getRoom(roomId) {
    if (!rooms.has(roomId)) {
        rooms.set(roomId, { id: roomId, state: createInitialState() });
    }
    return rooms.get(roomId);
}

function getAlivePlayerIds(state) {
    return state.order.filter(pid => {
        const p = state.players[pid];
        return p && !p.bankrupt;
    });
}

function broadcastState(room) {
    io.to(room.id).emit('stateUpdate', room.state);
}

function ownsFullColorSet(state, ownerId, group) {
    const groupTiles = state.map.filter(t => t.type === 'PROP' && t.group === group);
    if (groupTiles.length === 0) return false;
    return groupTiles.every(t => t.owner === ownerId);
}

function calculateRent(state, tile, diceTotal) {
    if (!tile || !tile.owner) return 0;
    const ownerId = tile.owner;

    if (tile.type === 'PROP') {
        if (tile.level > 0) {
            return tile.rents[tile.level] || tile.rents[0];
        }
        const monopoly = ownsFullColorSet(state, ownerId, tile.group);
        const base = tile.rents[0] || 0;
        return monopoly ? base * 2 : base;
    }

    if (tile.type === 'RAIL') {
        const count = state.map.filter(t => t.type === 'RAIL' && t.owner === ownerId).length;
        const n = Math.max(1, count);
        return tile.baseRent * Math.pow(2, n - 1);
    }

    if (tile.type === 'UTIL') {
        const utilCount = state.map.filter(t => t.type === 'UTIL' && t.owner === ownerId).length;
        let factor = tile.factor || 4;
        if (utilCount >= 2) factor *= 2.5;
        return diceTotal * factor * 100;
    }

    return 0;
}

function getSellValue(tile) {
    const base = tile.price || 0;
    const houseCost = tile.house || 0;
    const total = base + (tile.level || 0) * houseCost;
    return Math.floor(total * 0.5); // 估算 5 折變賣
}

function getPlayerProps(state, playerId) {
    return state.map
        .filter(t => t.owner === playerId && ['PROP', 'RAIL', 'UTIL'].includes(t.type))
        .map(t => ({
            id: t.id,
            name: t.name,
            price: t.price || 0,
            level: t.level || 0,
            house: t.house || 0,
            sellValue: getSellValue(t)
        }));
}

// 啟動變賣流程
function startLiquidation(room, playerId, creditorId, reason) {
    const state = room.state;
    const player = state.players[playerId];
    const props = getPlayerProps(state, playerId);
    if (props.length === 0) {
        handleBankruptcy(room, playerId, creditorId, reason);
        return;
    }
    state.liquidation = { playerId, creditorId, reason };
    io.to(playerId).emit('liquidationRequired', {
        playerId,
        deficit: -player.money,
        reason,
        properties: props
    });
    io.to(room.id).emit('globalMsg', `${player.name} 資金不足，必須變賣資產或宣告破產！`);
    broadcastState(room);
}

// 調整金錢 + 若不足觸發變賣 / 破產
function adjustMoney(room, playerId, amount, opts = {}) {
    const { creditorId = null, reason = '', allowLiquidation = true } = opts;
    const state = room.state;
    const player = state.players[playerId];
    if (!player || player.bankrupt) return;

    if (amount >= 0) {
        player.money += amount;
        return;
    }

    player.money += amount; // amount < 0
    if (player.money < 0) {
        if (allowLiquidation) {
            startLiquidation(room, playerId, creditorId, reason);
        } else {
            handleBankruptcy(room, playerId, creditorId, reason);
        }
    }
}

// 破產：釋出資產 + 移除回合 + 檢查結束 + 自動換人
function handleBankruptcy(room, playerId, creditorId, reason = '') {
    const state = room.state;
    const player = state.players[playerId];
    if (!player || player.bankrupt) return;

    player.bankrupt = true;
    player.money = 0;
    player.properties = [];

    state.map.forEach(tile => {
        if (tile.owner === playerId) {
            tile.owner = null;
            tile.level = 0;
        }
    });

    io.to(room.id).emit(
        'globalMsg',
        `${player.name} 因${reason || '資金不足'}而破產，所有資產歸還銀行！`
    );

    state.order = state.order.filter(id => id !== playerId);
    if (state.turnIndex >= state.order.length) state.turnIndex = 0;

    state.liquidation = null;
    checkGameEnd(room);
    if (state.status === 'PLAYING') {
        nextTurn(room);
    } else {
        broadcastState(room);
    }
}

function checkGameEnd(room) {
    const state = room.state;
    const alive = getAlivePlayerIds(state);
    if (alive.length <= 1 && state.status === 'PLAYING') {
        state.status = 'ENDED';
        state.winnerId = alive[0] || null;
        if (state.winnerId) {
            io.to(room.id).emit(
                'globalMsg',
                `遊戲結束！贏家是 ${state.players[state.winnerId].name}！`
            );
        } else {
            io.to(room.id).emit('globalMsg', '遊戲結束！所有玩家皆破產。');
        }
        broadcastState(room);
    }
}

function nextTurn(room) {
    const state = room.state;
    const alive = getAlivePlayerIds(state);
    if (alive.length === 0) return;
    if (state.liquidation) return; // 變賣期間不切換回合

    const curId = state.order[state.turnIndex];
    let idx = alive.indexOf(curId);
    idx = idx === -1 ? 0 : (idx + 1) % alive.length;

    const nextPlayerId = alive[idx];
    state.turnIndex = state.order.indexOf(nextPlayerId);

    io.to(room.id).emit('turn', nextPlayerId);
    io.to(room.id).emit(
        'globalMsg',
        `輪到 ${state.players[nextPlayerId].name} 的回合`
    );
    broadcastState(room);
}

// Rematch 重開局（保留玩家，重置棋盤與金錢）
function resetRoomForRematch(room) {
    const state = room.state;

    // 重置地圖
    state.map = MAP_DATA.map(t => ({ ...t, owner: null, level: 0 }));

    // 重置玩家
    for (const pid of Object.keys(state.players)) {
        const p = state.players[pid];
        p.pos = 0;
        p.money = 150000;
        p.bankrupt = false;
        p.properties = [];
        p.connected = true; // 視為重新上線
    }

    // 清理其他狀態
    state.lastDice = [0, 0];
    state.winnerId = null;
    state.liquidation = null;

    // 確保 order 只包含現有玩家
    state.order = state.order.filter(id => !!state.players[id]);

    // 回到 PLAYING
    state.status = 'PLAYING';
    state.turnIndex = 0;

    const firstId = state.order[0];
    if (firstId) {
        io.to(room.id).emit('turn', firstId);
        io.to(room.id).emit(
            'globalMsg',
            `新的一局開始！由 ${state.players[firstId].name} 先手。`
        );
    }
    broadcastState(room);
}

// 移動與格子事件
function handleMove(room, playerId, steps, diceTotal) {
    const state = room.state;
    const player = state.players[playerId];
    const oldPos = player.pos;
    const oldMoney = player.money;
    const newPos = (oldPos + steps) % state.map.length;

    player.pos = newPos;

    if (newPos < oldPos) {
        adjustMoney(room, playerId, 2000, { reason: '經過起點', allowLiquidation: false });
        io.to(room.id).emit(
            'globalMsg',
            `${player.name} 經過起點，獲得 $2000`
        );
    }

    const tile = state.map[newPos];
    let event = { type: 'NONE' };

    if (['PROP', 'RAIL', 'UTIL'].includes(tile.type)) {
        if (!tile.owner) {
            if (player.money >= tile.price) {
                tile.tempLock = playerId;
                event = {
                    type: 'BUY_PROMPT',
                    tileId: tile.id,
                    tileName: tile.name,
                    price: tile.price
                };
            }
        } else if (tile.owner !== playerId) {
            const rent = calculateRent(state, tile, diceTotal);
            adjustMoney(room, playerId, -rent, {
                creditorId: tile.owner,
                reason: '支付租金',
                allowLiquidation: true
            });
            adjustMoney(room, tile.owner, rent, {
                reason: '收取租金',
                allowLiquidation: false
            });

            event = {
                type: 'PAY_RENT',
                category: 'MONEY',
                amount: rent,
                from: playerId,
                to: tile.owner,
                tileId: tile.id
            };

            io.to(room.id).emit(
                'globalMsg',
                `${player.name} 支付 $${rent} 給 ${state.players[tile.owner].name}`
            );
        }
    }
    else if (tile.type === 'TAX') {
        adjustMoney(room, playerId, -tile.amount, {
            reason: '繳稅',
            allowLiquidation: true
        });
        event = {
            type: 'TAX',
            category: 'MONEY',
            amount: tile.amount
        };
        io.to(room.id).emit(
            'globalMsg',
            `${player.name} 繳稅 $${tile.amount}`
        );
    }
    else if (tile.type === 'CHANCE' || tile.type === 'DESTINY') {
        const cards = tile.type === 'CHANCE' ? CHANCE_CARDS : DESTINY_CARDS;
        const card = cards[Math.floor(Math.random() * cards.length)];
        adjustMoney(room, playerId, card.val, {
            reason: tile.type === 'CHANCE' ? '機會卡' : '命運卡',
            allowLiquidation: true
        });

        event = {
            type: 'CARD',
            category: 'MONEY',
            deck: tile.type,
            title: tile.type === 'CHANCE' ? '機會卡' : '命運卡',
            text: card.text,
            amount: card.val,
            val: card.val
        };

        io.to(room.id).emit(
            'globalMsg',
            `${player.name} 抽中卡片: ${card.text}`
        );
    }
    else if (tile.type === 'GOTO_JAIL') {
        player.pos = 10;
        event = { type: 'JAIL' };
        io.to(room.id).emit(
            'globalMsg',
            `${player.name} 前往監獄`
        );
    }

    const moneyChange = player.money - oldMoney;
    return { event, moneyChange };
}

// --- 3. Socket.IO 事件 ---

io.on('connection', (socket) => {

    // 顯示房間列表
    socket.on('listRooms', () => {
        const list = [];
        rooms.forEach((room, id) => {
            const s = room.state;
            const playerCount = Object.keys(s.players).length;
            if (playerCount === 0) return; // 不顯示空房
            list.push({
                id,
                playerCount,
                status: s.status
            });
        });
        socket.emit('roomList', list);
    });

    // 加入 / 建立房間
    socket.on('joinRoom', ({ roomId, nickname, playerId }) => {
        const trimmedRoom = (roomId || 'ROOM1').toString().trim().toUpperCase();
        const pid = (playerId || socket.id).toString();
        const name = nickname && nickname.trim()
            ? nickname.trim()
            : `Player ${pid.slice(-4)}`;

        const room = getRoom(trimmedRoom);
        const state = room.state;

        socket.join(trimmedRoom);
        socket.join(pid); // 方便只對某玩家廣播
        clientSessions.set(socket.id, { roomId: trimmedRoom, playerId: pid });

        let player = state.players[pid];
        if (player) {
            player.connected = true;
            player.name = name;
        } else {
            if (state.status !== 'LOBBY') {
                socket.emit('joinFailed', { reason: '遊戲進行中，無法加入此房間。' });
                return;
            }
            if (state.order.length >= 4) {
                socket.emit('joinFailed', { reason: '此房間人數已滿。' });
                return;
            }

            const playerColors = ['#e74c3c', '#2980b9', '#27ae60', '#f1c40f'];
            const color = playerColors[state.order.length];

            player = {
                id: pid,
                name,
                pos: 0,
                money: 150000,
                color,
                bankrupt: false,
                connected: true,
                properties: []
            };
            state.players[pid] = player;
            state.order.push(pid);

            if (!state.hostId) state.hostId = pid;
        }

        const isHost = state.hostId === pid;
        socket.emit('joinSuccess', { isHost, roomId: trimmedRoom, playerId: pid });
        io.to(room.id).emit('globalMsg', `${player.name} 加入了房間 ${room.id}`);
        broadcastState(room);
    });

    // 房主開始遊戲
    socket.on('start', () => {
        const sess = clientSessions.get(socket.id);
        if (!sess) return;
        const room = getRoom(sess.roomId);
        const state = room.state;
        const pid = sess.playerId;

        if (state.status !== 'LOBBY') return;
        if (state.hostId !== pid) return;
        if (state.order.length < 2) {
            socket.emit('globalMsg', '至少需要 2 位玩家才能開始遊戲。');
            return;
        }

        state.status = 'PLAYING';
        state.turnIndex = 0;

        const cur = state.order[state.turnIndex];
        io.to(room.id).emit('turn', cur);
        io.to(room.id).emit(
            'globalMsg',
            `遊戲開始！由 ${state.players[cur].name} 先手。`
        );
        broadcastState(room);
    });

    // Rematch 再來一局（房主限定）
    socket.on('rematch', () => {
        const sess = clientSessions.get(socket.id);
        if (!sess) return;
        const room = getRoom(sess.roomId);
        const state = room.state;
        const pid = sess.playerId;

        if (state.status !== 'ENDED') return;
        if (state.hostId !== pid) return;

        resetRoomForRematch(room);
    });

    // 擲骰子
    socket.on('roll', () => {
        const sess = clientSessions.get(socket.id);
        if (!sess) return;
        const room = getRoom(sess.roomId);
        const state = room.state;
        const pid = sess.playerId;

        if (state.status !== 'PLAYING') return;
        if (state.liquidation) return;
        if (getAlivePlayerIds(state).length <= 1) return;
        if (state.order[state.turnIndex] !== pid) return;
        if (state.map.some(t => t.tempLock === pid)) return;

        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const steps = d1 + d2;
        state.lastDice = [d1, d2];

        const player = state.players[pid];
        const oldPos = player.pos;

        const path = [];
        for (let i = 1; i <= steps; i++) {
            path.push((oldPos + i) % state.map.length);
        }

        const { event, moneyChange } = handleMove(room, pid, steps, steps);

        io.to(room.id).emit('rollResult', {
            roomId: room.id,
            playerId: pid,
            dice: state.lastDice,
            path,
            event,
            moneyChange,
            newState: state
        });
    });

    // 買地
    socket.on('buy', (confirm) => {
        const sess = clientSessions.get(socket.id);
        if (!sess) return;
        const room = getRoom(sess.roomId);
        const state = room.state;
        const pid = sess.playerId;
        if (state.liquidation) return;

        const player = state.players[pid];
        const tile = state.map[player.pos];

        if (!tile || tile.tempLock !== pid) return;

        if (confirm) {
            if (player.money >= tile.price) {
                adjustMoney(room, pid, -tile.price, {
                    reason: '購買地產',
                    allowLiquidation: false // 不讓買地觸發變賣，錢不夠就不買
                });
                tile.owner = pid;
                if (!player.properties) player.properties = [];
                if (!player.properties.includes(tile.id)) {
                    player.properties.push(tile.id);
                }
                io.to(room.id).emit(
                    'globalMsg',
                    `${player.name} 以 $${tile.price} 購買了 ${tile.name}`
                );
            } else {
                io.to(room.id).emit(
                    'globalMsg',
                    `${player.name} 資金不足，無法購買 ${tile.name}`
                );
            }
        } else {
            io.to(room.id).emit(
                'globalMsg',
                `${player.name} 放棄購買 ${tile.name}`
            );
        }

        delete tile.tempLock;
        broadcastState(room);
        nextTurn(room);
    });

    // 建造房屋 / 飯店
    socket.on('build', (tileId) => {
        const sess = clientSessions.get(socket.id);
        if (!sess) return;
        const room = getRoom(sess.roomId);
        const state = room.state;
        const pid = sess.playerId;
        if (state.liquidation) return;

        const player = state.players[pid];
        const tile = state.map[tileId];

        if (!tile) return;
        if (tile.owner !== pid) return;
        if (tile.type !== 'PROP') return;
        if (tile.level >= 5) return;
        if (player.money < tile.house) return;

        const groupTiles = state.map.filter(
            t => t.type === 'PROP' && t.group === tile.group
        );
        if (!groupTiles.every(t => t.owner === pid)) {
            socket.emit(
                'globalMsg',
                `必須擁有 ${tile.group} 色的所有地產才能建造房屋。`
            );
            return;
        }

        adjustMoney(room, pid, -tile.house, { reason: '建造房屋', allowLiquidation: false });
        tile.level += 1;

        broadcastState(room);
        io.to(room.id).emit('effect', { type: 'BUILD', tileId });
        io.to(room.id).emit(
            'globalMsg',
            `${player.name} 在 ${tile.name} 建造了 ${tile.level < 5 ? '房屋' : '飯店'}`
        );
    });

    // 變賣資產
    socket.on('liquidateProperty', (tileId) => {
        const sess = clientSessions.get(socket.id);
        if (!sess) return;
        const room = getRoom(sess.roomId);
        const state = room.state;
        const pid = sess.playerId;

        if (!state.liquidation || state.liquidation.playerId !== pid) return;

        const tile = state.map[tileId];
        const player = state.players[pid];
        if (!tile || tile.owner !== pid) return;

        const value = getSellValue(tile);
        tile.owner = null;
        tile.level = 0;
        player.properties = (player.properties || []).filter(id => id !== tile.id);
        player.money += value;

        io.to(room.id).emit(
            'globalMsg',
            `${player.name} 變賣 ${tile.name}，獲得 $${value}`
        );

        const propsLeft = getPlayerProps(state, pid);

        if (player.money >= 0) {
            state.liquidation = null;
            io.to(pid).emit('liquidationResolved', { money: player.money });
            broadcastState(room);
            nextTurn(room);
        } else if (propsLeft.length === 0) {
            handleBankruptcy(room, pid, state.liquidation.creditorId, state.liquidation.reason);
        } else {
            io.to(pid).emit('liquidationUpdate', {
                deficit: -player.money,
                properties: propsLeft
            });
            broadcastState(room);
        }
    });

    // 玩家主動宣告破產
    socket.on('declareBankruptcy', () => {
        const sess = clientSessions.get(socket.id);
        if (!sess) return;
        const room = getRoom(sess.roomId);
        const state = room.state;
        const pid = sess.playerId;

        if (!state.liquidation || state.liquidation.playerId !== pid) return;
        handleBankruptcy(room, pid, state.liquidation.creditorId, state.liquidation.reason || '主動宣告破產');
    });

    // 動畫結束 → 結束回合（無變賣時使用）
    socket.on('endTurn', () => {
        const sess = clientSessions.get(socket.id);
        if (!sess) return;
        const room = getRoom(sess.roomId);
        const state = room.state;
        const pid = sess.playerId;

        if (state.status !== 'PLAYING') return;
        if (state.liquidation) return;
        if (state.order[state.turnIndex] !== pid) return;

        nextTurn(room);
    });

    // 玩家主動退出房間（不關閉 socket，可再加入其他房）
    socket.on('leaveRoom', () => {
        const sess = clientSessions.get(socket.id);
        if (!sess) {
            socket.emit('leftRoom');
            return;
        }
        const { roomId, playerId } = sess;
        clientSessions.delete(socket.id);

        socket.leave(roomId);
        socket.leave(playerId);

        const room = rooms.get(roomId);
        if (!room) {
            socket.emit('leftRoom');
            return;
        }
        const state = room.state;
        const player = state.players[playerId];
        if (!player) {
            socket.emit('leftRoom');
            return;
        }

        player.connected = false;

        // 房主轉移
        if (state.hostId === playerId) {
            const alive = getAlivePlayerIds(state);
            const nextHost = alive.find(id => id !== playerId);
            if (nextHost) {
                state.hostId = nextHost;
                io.to(room.id).emit(
                    'globalMsg',
                    `房主 ${player.name} 離開，房主改為 ${state.players[nextHost].name}`
                );
            } else {
                state.hostId = null;
            }
        }

        // 在 LOBBY 直接移除玩家
        if (state.status === 'LOBBY') {
            delete state.players[playerId];
            state.order = state.order.filter(id => id !== playerId);
        }

        io.to(room.id).emit('globalMsg', `${player.name} 離開了房間 ${room.id}`);
        broadcastState(room);

        // 回應前端
        socket.emit('leftRoom');
    });

    // 斷線
    socket.on('disconnect', () => {
        const sess = clientSessions.get(socket.id);
        if (!sess) return;
        const { roomId, playerId } = sess;
        clientSessions.delete(socket.id);

        const room = rooms.get(roomId);
        if (!room) return;
        const state = room.state;
        const player = state.players[playerId];
        if (!player) return;

        player.connected = false;

        if (state.hostId === playerId) {
            const alive = getAlivePlayerIds(state);
            const nextHost = alive.find(id => id !== playerId);
            if (nextHost) {
                state.hostId = nextHost;
                io.to(room.id).emit(
                    'globalMsg',
                    `房主 ${player.name} 離線，房主改為 ${state.players[nextHost].name}`
                );
            } else {
                state.hostId = null;
            }
        }

        if (state.status === 'LOBBY') {
            delete state.players[playerId];
            state.order = state.order.filter(id => id !== playerId);
        }

        broadcastState(room);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
