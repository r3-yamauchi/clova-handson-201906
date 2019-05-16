'use strict';
const clova = require('@line/clova-cek-sdk-nodejs');
const line = require('@line/bot-sdk');
const jsonData = require('../data.json');

// LINE BOTの設定
const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET
};

const client = new line.Client(config);

module.exports = clova.Client
  .configureSkill()

  //起動時
  .onLaunchRequest(async responseHelper => {
    console.log('onLaunchRequest');
    
    const speech = [
        clova.SpeechBuilder.createSpeechText('こんにちは！トラベルプランへようこそ。あなたに合った旅行プランをお探しします。行き先は国内ですか？海外ですか？')
      ]
    
    responseHelper.setSpeechList(speech);
    responseHelper.setReprompt(getRepromptMsg(clova.SpeechBuilder.createSpeechText('行き先は国内ですか？海外ですか？')));
  
  })

  //ユーザーからの発話が来たら反応する箇所
  .onIntentRequest(async responseHelper => {
    const intent = responseHelper.getIntentName();
    console.log('Intent:' + intent);
    switch (intent) {
      // ヘルプ
      case 'Clova.GuideIntent':
        const helpSpeech = [
          clova.SpeechBuilder.createSpeechText('スキルの説明をします。あなたに合った、トラベルプランをご提供いたします。お気に召しましたら、お申し込みできます。'),
          clova.SpeechBuilder.createSpeechText('行き先は国内ですか？海外ですか？')];
        responseHelper.setSpeechList(helpSpeech);
        responseHelper.setReprompt(getRepromptMsg(clova.SpeechBuilder.createSpeechText('行き先は国内ですか？海外ですか？')));
        break;
      
      case 'TravelPlaceIntent':
        const slots = responseHelper.getSlots();
        console.log(slots);
        
        const placeSpeech = [];
        console.log(slots.Place);
        
        // ユーザID取得
        const { userId } = responseHelper.getUser();
        
        // オススメのプランをBOTへ送信
        await sendLineBot(userId, jsonData[0])
          .then(() => {
            if (slots.Place === '海外') {
              placeSpeech.push(clova.SpeechBuilder.createSpeechText('海外のおすすめプランをボットに送信しました。ご確認くださいませ。'));
            } else {
              placeSpeech.push(clova.SpeechBuilder.createSpeechText('国内のおすすめプランをボットに送信しました。ご確認くださいませ。'));
            }
          })
          .catch((err) => {
            console.log(err);
            placeSpeech.push(clova.SpeechBuilder.createSpeechText('botを連携させてください。'));
          });
        
        responseHelper.setSpeechList(placeSpeech);
        responseHelper.endSession();
        break;
        
      default:
        responseHelper.setSimpleSpeech(clova.SpeechBuilder.createSpeechText('はいか、いいえで答えてください。'));
        responseHelper.setReprompt(getRepromptMsg(clova.SpeechBuilder.createSpeechText('はいか、いいえで答えてください。')));
        break;
    }
  })

  //終了時
  .onSessionEndedRequest(async responseHelper => {
    console.log('onSessionEndedRequest');
  })
  .handle();
  


// オススメのプランをBOTへ送信
async function sendLineBot(userId, jsonData) {
    // jsonデータからプランを取得
    // LIFFで申込情報入力
    const informationLiff = process.env.INFO_LIFF_URI;
    // ツアー名
    const tour = jsonData['tour'];
    // ツアーイメージ
    const tourImageUrl = jsonData['tourImageUrl'];
    // 場所
    const place = jsonData['place'];
    // 値段
    const price = jsonData['price'];
    // LIFFでツアー詳細
    const tourLiff = process.env.TOUR_LIFF_URI + '?tour=' + encodeURIComponent(tour);
    // ホテル名
    const hotel = jsonData['hotel'];
    // ホテルイメージ
    const hotelImageUrl = jsonData['hotelImageUrl'];
    // LIFFでホテル詳細
    const hotelLiff = process.env.HOTEL_LIFF_URI + '?hotel=' + encodeURIComponent(hotel);
    // 航空会社
    const airline = jsonData['airline'];
    // 航空会社イメージ
    const airlineImageUrl = jsonData['airlineImageUrl'];
    // LIFFで航空会社詳細
    const airlineLiff = process.env.AIRLINE_LIFF_URI + '?airline=' + encodeURIComponent(airline);
    
    await client.pushMessage(userId, [
    {
      "type": "flex",
      "altText": "プランを送信しました。",
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
                  "text": place
                }
              ]
            },
            "hero": {
              "type": "image",
              "url": tourImageUrl,
              'size': 'full',
              'aspectRatio': '20:13',
              'aspectMode': 'cover'
            },
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": price
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
                    "label": "申込情報入力",
                    "uri": informationLiff
                  }
                }
              ]
            },
            "styles": {
              "header": {
                "backgroundColor": "#00ffff"
              },
              "hero": {
                "separator": true,
                "separatorColor": "#000000"
              },
              "footer": {
                "separator": true,
                "separatorColor": "#000000"
              }
            }
          },
          {
            "type": "bubble",
            "header": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": tour
                }
              ]
            },
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": "日程"
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
                  "action": {
                    "type": "uri",
                    "label": "詳細へ",
                    "uri": tourLiff
                  }
                }
              ]
            },
            "styles": {
              "header": {
                "backgroundColor": "#00ffff"
              },
              "hero": {
                "separator": true,
                "separatorColor": "#000000"
              },
              "footer": {
                "separator": true,
                "separatorColor": "#000000"
              }
            }
          },
          {
            "type": "bubble",
            "header": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": "ホテル"
                }
              ]
            },
            "hero": {
              "type": "image",
              "url": hotelImageUrl,
              'size': 'full',
              'aspectRatio': '20:13',
              'aspectMode': 'cover'
            },
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": hotel
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
                  "action": {
                    "type": "uri",
                    "label": "詳細へ",
                    "uri": hotelLiff
                  }
                }
              ]
            },
            "styles": {
              "header": {
                "backgroundColor": "#00ffff"
              },
              "hero": {
                "separator": true,
                "separatorColor": "#000000"
              },
              "footer": {
                "separator": true,
                "separatorColor": "#000000"
              }
            }
          },
          {
            "type": "bubble",
            "header": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": "航空会社"
                }
              ]
            },
            "hero": {
              "type": "image",
              "url": airlineImageUrl,
              'size': 'full',
              'aspectRatio': '20:13',
              'aspectMode': 'cover'
            },
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": airline
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
                  "action": {
                    "type": "uri",
                    "label": "詳細へ",
                    "uri": airlineLiff
                  }
                }
              ]
            },
            "styles": {
              "header": {
                "backgroundColor": "#00ffff"
              },
              "hero": {
                "separator": true,
                "separatorColor": "#000000"
              },
              "footer": {
                "separator": true,
                "separatorColor": "#000000"
              }
            }
          }
        ]
      }
    }
    ]);
}

// リプロント
function getRepromptMsg(speechInfo){
  const speechObject = {
    type: 'SimpleSpeech',
    values: speechInfo,
  };
  return speechObject;
}

