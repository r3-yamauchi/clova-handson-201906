'use strict';

const line = require('@line/bot-sdk');

const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET
};

const client = new line.Client(config);

module.exports = async( req, res ) => {
  Promise
    .all(req.body.events.map(await handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.log('err!!!');
      console.error(err);
      res.status(200).end();
    });
};

// event handler
async function handleEvent(event, session) {
  console.log(event);
  let echo = [];
  if (event.type === 'message') {
    if(event.message.text === '申込'){
      // 申し込み内容確認のflex
      echo = {
        "type": "flex",
        "altText": "申込内容を送信しました。",
        "contents": {
          "type": "carousel",
          "contents": [
            {
              "type": "bubble",
              "header": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                  {
                    "type": "text",
                    "text": "ハワイ３泊５日間の旅"
                  }
                ]
              },
              "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                  {
                    "type": "text",
                    "text": "¥90,000"
                  }
                ]
              },
              "footer": {
                "type": "box",
                "layout": "vertical",
                "spacing": "sm",
                "contents": [
                  {
                    "type": "button",
                    "style": "primary",
                    "action": {
                      "type": "uri",
                      "label": "お支払い",
                      "uri": process.env.LINEPAY_LIFF_URI + "?userid=" + event.source.userId
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    }
  } else {
    echo = { type: 'text', text: '申し訳ありませんが、お返事できません。' }; 
  }

  // use reply API
  return client.replyMessage(event.replyToken, echo);
}
