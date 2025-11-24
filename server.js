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

// --- 機會 / 命運卡：各 50 張樣本（多數是金錢，部分為監獄 / 出獄卡） ---

// 機會卡：偏日常事件、短期幸運 / 意外支出
const CHANCE_CARDS = [
    { text: "銀行系統出錯，多入帳 $2000", val: 2000 },
    { text: "超商點數到期前剛好用完，省下 $300", val: 300 },
    { text: "朋友請客吃大餐，省下 $800", val: 800 },
    { text: "公司聚餐抽中禮券，獲得 $1500", val: 1500 },
    { text: "發票中獎，獲得 $2000", val: 2000 },
    { text: "旅遊訂房早鳥優惠，節省 $1200", val: 1200 },
    { text: "搭高鐵誤點，獲得補償金 $800", val: 800 },
    { text: "報名研討會抽到獎品，獲得 $1000", val: 1000 },
    { text: "線上購物不小心買到特價，省下 $600", val: 600 },
    { text: "信用卡回饋入帳，獲得 $900", val: 900 },

    { text: "在夜市玩遊戲獲得大獎，價值 $1300", val: 1300 },
    { text: "路上撿到皮夾並歸還，對方致謝送你 $500", val: 500 },
    { text: "老闆臨時發放小紅包，獲得 $1000", val: 1000 },
    { text: "加班費入帳，獲得 $1800", val: 1800 },
    { text: "參加馬拉松完賽獎金，獲得 $700", val: 700 },
    { text: "出租的房子順利收租，獲得 $2500", val: 2500 },
    { text: "股票小漲，獲利 $1500", val: 1500 },
    { text: "副業接案成功，收入 $2200", val: 2200 },
    { text: "網路賣場清倉成功，多賺 $1600", val: 1600 },
    { text: "好友還你多年前借款，獲得 $2000", val: 2000 },

    { text: "手機掉進水裡，只好買新機，支出 $3000", val: -3000 },
    { text: "不小心闖紅燈，被開罰單 $1800", val: -1800 },
    { text: "外出旅遊時超支，額外花費 $1500", val: -1500 },
    { text: "颱風天窗戶破掉，修理花費 $1200", val: -1200 },
    { text: "腳踏車被偷，只好再買一台，支出 $2000", val: -2000 },
    { text: "深夜叫外送太多，額外花費 $800", val: -800 },
    { text: "健檢發現需要額外檢查，醫療支出 $2200", val: -2200 },
    { text: "忘記繳電費產生滯納金，支出 $400", val: -400 },
    { text: "交通卡不小心遺失，重儲值支出 $1000", val: -1000 },
    { text: "手機遊戲課金太多，支出 $1500", val: -1500 },

    { text: "雨天走路滑倒，醫療支出 $600", val: -600 },
    { text: "外出旅遊行李超重，支付額外費用 $700", val: -700 },
    { text: "不小心打破咖啡廳杯子，賠償 $300", val: -300 },
    { text: "寵物突然生病，看醫生花費 $2500", val: -2500 },
    { text: "抽獎活動不中獎，白白花了 $500 報名費", val: -500 },
    { text: "參加朋友婚禮包紅包，支出 $2400", val: -2400 },
    { text: "機車壞掉維修，支出 $1600", val: -1600 },
    { text: "房間冷氣大清洗，支出 $1200", val: -1200 },
    { text: "電腦突然壞掉，急修支出 $2800", val: -2800 },
    { text: "健身房年費到期，續約支出 $3000", val: -3000 },

    { text: "公司發放提案獎金，獲得 $2500", val: 2500 },
    { text: "參加黑客松拿到獎金，獲得 $4000", val: 4000 },
    { text: "幫家人處理問題，收到謝禮 $1500", val: 1500 },
    { text: "投資朋友小生意，小賺 $1800", val: 1800 },
    { text: "幫忙代購順利收款，淨賺 $900", val: 900 },
    { text: "成功殺價，購物省下 $700", val: 700 },
    { text: "鄰居送你自家農產品，等值 $600", val: 600 },
    { text: "熟客介紹帶來訂單，額外收入 $2000", val: 2000 },
    { text: "參加抽獎中到機票，估計價值 $3500", val: 3500 },
    { text: "環保回收兌換，獲得 $400", val: 400 },

    // 新增：出獄卡 / 被關幾回合
    { text: "司法誤判，獲得一張「出獄免費卡」", val: 0, getOutOfJail: true },
    { text: "公益形象佳，警方給你一張「出獄免費卡」", val: 0, getOutOfJail: true },
    { text: "醉酒鬧事，被關進監獄 2 回合", val: 0, jail: true, jailTurns: 2 },
    { text: "夜店糾紛，被警察帶回調查 1 回合", val: 0, jail: true, jailTurns: 1 },
    { text: "誤入管制區，被拘留 3 回合", val: 0, jail: true, jailTurns: 3 },
    { text: "熱心協助辦案，獲得一張「出獄免費卡」", val: 0, getOutOfJail: true },
    { text: "被誤認為嫌疑人，被關進監獄 2 回合", val: 0, jail: true, jailTurns: 2 },
    { text: "節慶夜晚街頭喧嘩，被關 1 回合", val: 0, jail: true, jailTurns: 1 },
    { text: "替警局做公益宣傳，獲得「出獄免費卡」", val: 0, getOutOfJail: true },
    { text: "超速被逮捕，關進監獄 2 回合", val: 0, jail: true, jailTurns: 2 }
];

// 命運卡：偏中長期影響、投資 / 財務 / 人生事件
const DESTINY_CARDS = [
    { text: "股東分紅，獲得 $3000", val: 3000 },
    { text: "房地產增值，資產變現獲得 $5000", val: 5000 },
    { text: "長期定存到期，領回利息 $2500", val: 2500 },
    { text: "退休基金表現優異，獲得額外收益 $4000", val: 4000 },
    { text: "外幣投資賺匯差，獲得 $3200", val: 3200 },
    { text: "股票分紅配股，折現價值 $2800", val: 2800 },
    { text: "買進 ETF 長期持有，小賺 $2200", val: 2200 },
    { text: "參與公司增資，以折扣價格認購，立即獲益 $2600", val: 2600 },
    { text: "當初買的黃金大漲，賣出獲利 $4500", val: 4500 },
    { text: "與人合資開店，首年分紅 $3800", val: 3800 },

    { text: "投資失利，損失 $3500", val: -3500 },
    { text: "全球景氣衰退，股票市值大跌，損失 $4000", val: -4000 },
    { text: "不動產稅制調整，額外支出 $2800", val: -2800 },
    { text: "把握到錯誤消息進場，短線損失 $3200", val: -3200 },
    { text: "合夥投資的店面倒閉，損失 $5000", val: -5000 },
    { text: "被不良投資平台詐騙，損失 $4500", val: -4500 },
    { text: "保險商品提前解約，遭到扣款 $2000", val: -2000 },
    { text: "虛擬貨幣暴跌，帳面損失 $3800", val: -3800 },
    { text: "投資型保單績效不佳，損失 $2300", val: -2300 },
    { text: "借錢給朋友收不回來，損失 $3000", val: -3000 },

    { text: "升遷加薪，年收入增加 $4000", val: 4000 },
    { text: "跳槽成功，新公司給你簽約金 $3500", val: 3500 },
    { text: "考取證照，公司給予獎勵金 $2500", val: 2500 },
    { text: "長期表現優異，獲得特別獎金 $3000", val: 3000 },
    { text: "創業成果穩定，年度分紅 $4500", val: 4500 },
    { text: "在校成績優異，獲得獎學金 $2800", val: 2800 },
    { text: "研究計畫通過審核，獲得補助 $3200", val: 3200 },
    { text: "技術專利授權出去，版權收入 $3800", val: 3800 },
    { text: "受邀演講，獲得鐘點費 $2100", val: 2100 },
    { text: "接下顧問工作，獲得顧問費 $5000", val: 5000 },

    { text: "重大車禍醫療支出 $4500", val: -4500 },
    { text: "家人重大手術，你支付部分醫療費 $5000", val: -5000 },
    { text: "房屋漏水整修，支出 $3800", val: -3800 },
    { text: "父母退休生活支援，固定支出 $2600", val: -2600 },
    { text: "小孩學費調漲，額外支出 $2300", val: -2300 },
    { text: "家電一次全部汰換，支出 $4200", val: -4200 },
    { text: "車輛保養與保險一次到期，合計 $3600", val: -3600 },
    { text: "長期旅居國外簽證與保險費用，支出 $3400", val: -3400 },
    { text: "投資出租套房整修，支出 $3100", val: -3100 },
    { text: "被裁員後生活費壓力，額外支出 $2700", val: -2700 },

    { text: "善心捐款給慈善機構，支出 $2000，但心情加分", val: -2000 },
    { text: "資助弱勢學生就學，支出 $1500", val: -1500 },
    { text: "參與志工活動交通與餐費，支出 $800", val: -800 },
    { text: "為環保改裝家用設備，支出 $2200", val: -2200 },
    { text: "支援親友創業，暫時借出 $2500", val: -2500 },
    { text: "為長輩添購輔具，支出 $1800", val: -1800 },
    { text: "家庭聚會請客，支出 $1600", val: -1600 },
    { text: "為自己安排進修課程，學費 $2100", val: -2100 },
    { text: "為健康辦健身會籍，支出 $1900", val: -1900 },
    { text: "帶家人出國旅遊一趟，支出 $4800", val: -4800 },

    // 新增：出獄卡 / 被關幾回合（偏人生大事件）
    { text: "你在公益活動表現優異，獲得一張「出獄免費卡」", val: 0, getOutOfJail: true },
    { text: "協助警方調查重大案件，獲得「出獄免費卡」", val: 0, getOutOfJail: true },
    { text: "公司捲入醜聞，你被列為關鍵證人，被關 3 回合", val: 0, jail: true, jailTurns: 3 },
    { text: "捲入投資詐欺案調查，被關 2 回合", val: 0, jail: true, jailTurns: 2 },
    { text: "政治集會中被誤抓，被關 1 回合", val: 0, jail: true, jailTurns: 1 },
    { text: "長期服務弱勢團體，獲得「出獄免費卡」", val: 0, getOutOfJail: true },
    { text: "環保抗議行動遭逮捕，被關 2 回合", val: 0, jail: true, jailTurns: 2 },
    { text: "在國際案件中協助調查，獲得「出獄免費卡」", val: 0, getOutOfJail: true },
    { text: "被誤認為通緝犯，被關 2 回合", val: 0, jail: true, jailTurns: 2 },
    { text: "在法院證明清白，法官贈與一張「出獄免費卡」", val: 0, getOutOfJail: true }
];

// 監獄與彩金池常數
const JAIL_TILE_INDEX = 10;
const MAX_JAIL_TURNS = 3;
const JAIL_FINE = 3000; // 付錢出獄金額

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
        liquidation: null,    // { playerId, creditorId, reason }
        freeParkingPot: 0,    // 免費停車彩金池
        extraTurnFor: null,   // 因 double 而獲得額外回合的玩家
        doubleChain: null     // { playerId, count } 連續 double 次數
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

// 送進監獄
function sendToJail(room, playerId, jailTurnsToServe = MAX_JAIL_TURNS, source = 'TILE') {
    const state = room.state;
    const player = state.players[playerId];
    if (!player) return;

    player.pos = JAIL_TILE_INDEX;
    player.inJail = true;
    player.jailTurns = 0;
    player.requiredJailTurns = jailTurnsToServe;

    // 清除 double 狀態與額外回合
    if (state.doubleChain && state.doubleChain.playerId === playerId) {
        state.doubleChain = null;
    }
    if (state.extraTurnFor === playerId) {
        state.extraTurnFor = null;
    }

    io.to(room.id).emit('globalMsg', `${player.name} 被送往監獄 (${source})！`);
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
    state.extraTurnFor = null;
    state.doubleChain = null;

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

// 結束回合或給同一玩家額外回合（double）
function finishTurnOrExtra(room, playerId) {
    const state = room.state;
    const player = state.players[playerId];
    if (!player) return;

    if (state.extraTurnFor === playerId && !state.liquidation && !player.bankrupt) {
        state.extraTurnFor = null;
        state.doubleChain = null;
        io.to(room.id).emit('globalMsg', `${player.name} 因為擲出雙骰，獲得一次額外行動！`);
        io.to(room.id).emit('turn', playerId);
        broadcastState(room);
    } else {
        state.extraTurnFor = null;
        state.doubleChain = null;
        nextTurn(room);
    }
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
        p.connected = true;
        p.inJail = false;
        p.jailTurns = 0;
        p.requiredJailTurns = MAX_JAIL_TURNS;
        p.jailCards = 0;
    }

    // 清理其他狀態
    state.lastDice = [0, 0];
    state.winnerId = null;
    state.liquidation = null;
    state.freeParkingPot = 0;
    state.extraTurnFor = null;
    state.doubleChain = null;

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

    // 經過起點
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
        // 稅金進彩金池
        state.freeParkingPot += tile.amount;
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
            `${player.name} 繳稅 $${tile.amount}（已加入免費停車彩金池）`
        );
    }
    else if (tile.type === 'CHANCE' || tile.type === 'DESTINY') {
        const cards = tile.type === 'CHANCE' ? CHANCE_CARDS : DESTINY_CARDS;
        const card = cards[Math.floor(Math.random() * cards.length)];
        const val = card.val || 0;

        if (card.getOutOfJail) {
            player.jailCards = (player.jailCards || 0) + 1;
            event = {
                type: 'CARD',
                category: 'SPECIAL',
                deck: tile.type,
                title: '獲得出獄卡',
                text: card.text,
                amount: 0,
                val: 0
            };
            io.to(room.id).emit(
                'globalMsg',
                `${player.name} 抽中卡片：${card.text}（獲得一張出獄卡）`
            );
        } else if (card.jail) {
            const jailTurns = card.jailTurns || MAX_JAIL_TURNS;
            sendToJail(room, playerId, jailTurns, 'CARD');
            event = {
                type: 'CARD',
                category: 'JAIL',
                deck: tile.type,
                title: '被關進監獄',
                text: card.text,
                amount: 0,
                val: 0
            };
            io.to(room.id).emit(
                'globalMsg',
                `${player.name} 抽中卡片：${card.text}（被關進監獄 ${jailTurns} 回合）`
            );
        } else {
            if (val < 0) {
                state.freeParkingPot += -val; // 負值代表支出給銀行，進彩金池
            }
            adjustMoney(room, playerId, val, {
                reason: tile.type === 'CHANCE' ? '機會卡' : '命運卡',
                allowLiquidation: true
            });

            event = {
                type: 'CARD',
                category: 'MONEY',
                deck: tile.type,
                title: tile.type === 'CHANCE' ? '機會卡' : '命運卡',
                text: card.text,
                amount: val,
                val: val
            };

            io.to(room.id).emit(
                'globalMsg',
                `${player.name} 抽中卡片: ${card.text}`
            );
        }
    }
    else if (tile.type === 'GOTO_JAIL') {
        sendToJail(room, playerId, MAX_JAIL_TURNS, 'TILE');
        event = { type: 'JAIL' };
    }
    else if (tile.type === 'FREE_PARKING') {
        const pot = state.freeParkingPot || 0;
        if (pot > 0) {
            adjustMoney(room, playerId, pot, {
                reason: '免費停車彩金',
                allowLiquidation: false
            });
            event = { type: 'FREE_PARKING', category: 'MONEY', amount: pot };
            io.to(room.id).emit(
                'globalMsg',
                `${player.name} 在免費停車領取彩金 $${pot}！`
            );
            state.freeParkingPot = 0;
        } else {
            event = { type: 'FREE_PARKING_EMPTY', category: 'INFO', amount: 0 };
            io.to(room.id).emit(
                'globalMsg',
                `${player.name} 抵達免費停車（目前沒有彩金）`
            );
        }
    }

    const moneyChange = player.money - oldMoney;
    return { event, moneyChange };
}

// 一般擲骰邏輯（不在監獄時、或剛出獄）
function normalRoll(room, playerId, options = {}) {
    const state = room.state;
    const player = state.players[playerId];
    if (!player) return;

    let d1, d2;
    if (options.presetDice) {
        [d1, d2] = options.presetDice;
    } else {
        d1 = Math.floor(Math.random() * 6) + 1;
        d2 = Math.floor(Math.random() * 6) + 1;
    }
    const steps = d1 + d2;
    state.lastDice = [d1, d2];
    const isDouble = d1 === d2;

    // 追蹤連續 double
    if (isDouble) {
        if (state.doubleChain && state.doubleChain.playerId === playerId) {
            state.doubleChain.count += 1;
        } else {
            state.doubleChain = { playerId, count: 1 };
        }
    } else {
        state.doubleChain = null;
    }

    // 三次連續 double：直接送進監獄，不移動
    if (state.doubleChain && state.doubleChain.count >= 3) {
        sendToJail(room, playerId, MAX_JAIL_TURNS, 'DOUBLE');
        state.doubleChain = null;
        state.extraTurnFor = null;

        io.to(room.id).emit('rollResult', {
            roomId: room.id,
            playerId,
            dice: state.lastDice,
            path: [],
            event: {
                type: 'JAIL',
                category: 'MOVE',
                text: '連續三次擲出雙骰，被送進監獄！'
            },
            moneyChange: 0,
            newState: state
        });
        return;
    }

    // 正常移動
    const oldPos = player.pos;
    const path = [];
    for (let i = 1; i <= steps; i++) {
        path.push((oldPos + i) % state.map.length);
    }

    const { event, moneyChange } = handleMove(room, playerId, steps, steps);

    // 若是 double 且沒有進入變賣 / 監獄，給予額外回合
    if (isDouble && !player.inJail && !state.liquidation) {
        state.extraTurnFor = playerId;
    } else {
        state.extraTurnFor = null;
    }

    io.to(room.id).emit('rollResult', {
        roomId: room.id,
        playerId,
        dice: state.lastDice,
        path,
        event,
        moneyChange,
        newState: state
    });
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
                properties: [],
                inJail: false,
                jailTurns: 0,
                requiredJailTurns: MAX_JAIL_TURNS,
                jailCards: 0
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

        const player = state.players[pid];
        if (!player) return;

        // 在監獄中的特殊處理
        if (player.inJail) {
            // 有出獄卡：直接使用
            if (player.jailCards > 0) {
                player.jailCards -= 1;
                player.inJail = false;
                player.jailTurns = 0;
                io.to(room.id).emit('globalMsg', `${player.name} 使用出獄卡，離開監獄！`);
                normalRoll(room, pid);
                return;
            }

            // 沒有出獄卡：擲骰看看有沒有 double
            const d1 = Math.floor(Math.random() * 6) + 1;
            const d2 = Math.floor(Math.random() * 6) + 1;
            const steps = d1 + d2;
            state.lastDice = [d1, d2];

            if (d1 === d2) {
                // double：直接出獄並依照點數移動
                player.inJail = false;
                player.jailTurns = 0;
                io.to(room.id).emit('globalMsg', `${player.name} 擲出雙骰，成功出獄！`);
                normalRoll(room, pid, { presetDice: [d1, d2] });
                return;
            }

            // 沒有 double：累積監獄回合數
            player.jailTurns += 1;

            if (player.jailTurns >= (player.requiredJailTurns || MAX_JAIL_TURNS)) {
                // 滿回合，自動支付罰金出獄，再走剛剛的步數
                state.freeParkingPot += JAIL_FINE;
                adjustMoney(room, pid, -JAIL_FINE, {
                    reason: '監獄罰金',
                    allowLiquidation: true
                });

                if (state.liquidation || player.bankrupt) {
                    // 進入變賣或破產，不再移動
                    io.to(room.id).emit('rollResult', {
                        roomId: room.id,
                        playerId: pid,
                        dice: state.lastDice,
                        path: [],
                        event: {
                            type: 'JAIL_WAIT',
                            category: 'INFO',
                            text: `你支付了 $${JAIL_FINE} 監獄罰金。`
                        },
                        moneyChange: -JAIL_FINE,
                        newState: state
                    });
                    return;
                }

                player.inJail = false;
                player.jailTurns = 0;
                io.to(room.id).emit('globalMsg', `${player.name} 已在監獄待滿 ${player.requiredJailTurns || MAX_JAIL_TURNS} 回合，支付 $${JAIL_FINE} 出獄！`);

                normalRoll(room, pid, { presetDice: [d1, d2] });
                return;
            } else {
                // 還沒滿回合，只是白待
                io.to(room.id).emit('globalMsg', `${player.name} 在監獄中，第 ${player.jailTurns}/${player.requiredJailTurns || MAX_JAIL_TURNS} 回合。`);

                io.to(room.id).emit('rollResult', {
                    roomId: room.id,
                    playerId: pid,
                    dice: state.lastDice,
                    path: [],
                    event: {
                        type: 'JAIL_WAIT',
                        category: 'INFO',
                        text: `你仍在監獄中，第 ${player.jailTurns}/${player.requiredJailTurns || MAX_JAIL_TURNS} 回合。`
                    },
                    moneyChange: 0,
                    newState: state
                });
                return;
            }
        }

        // 不在監獄：一般擲骰
        normalRoll(room, pid);
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
        finishTurnOrExtra(room, pid);
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

        finishTurnOrExtra(room, pid);
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
