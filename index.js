const clova = require('@line/clova-cek-sdk-nodejs');
const line = require('@line/bot-sdk');
const express = require('express');

// ファイル読み込み
require('dotenv').config();
const info = require('./liff/info');
const tourDetail = require('./liff/tourDetail');
const hotelDetail = require('./liff/hotelDetail');
const airlineDetail = require('./liff/airlineDetail');
const lineBot = require('./messagingAPI/lineBot');
const linePayConfirm = require('./linepay/linePayConfirm');
const linePayReserve = require('./linepay/linePayReserve');
const clovaSkillHandler = require('./clova/clovaSkill');

// LINE BOTの設定
const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET
};


const app = new express();
const port = 3000;

// Clova
const clovaMiddleware = clova.Middleware({ applicationId: process.env.EXTENSION_ID });
app.post('/clova', clovaMiddleware, clovaSkillHandler);

// LINE PAY
app.get('/linepay/reserve', linePayReserve);
app.use("/linepay/confirm", linePayConfirm);

// 申込情報入力
app.get('/info', info);
// ツアー詳細
app.get('/tour', tourDetail);
// ホテル詳細
app.get('/hotel', hotelDetail);
// 航空会社詳細
app.get('/airline', airlineDetail);

// LINE BOT
app.post('/linebot', line.middleware(config), lineBot);

app.listen(port, () => console.log(`Server running on ${port}`));
