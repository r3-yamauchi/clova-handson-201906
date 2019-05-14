'use strict';

const cache = require("memory-cache");
const line_pay = require("line-pay");
const pay = new line_pay({
    channelId: process.env.LINEPAY_CHANNEL_ID,
    channelSecret: process.env.LINEPAY_CHANNEL_SECRET,
    //hostname: process.env.LINE_PAY_HOSTNAME,
    isSandbox: true
})


module.exports = ( req, res ) => {
    if (!req.query.transactionId){
        throw new Error("Transaction Id not found.");
    }

    // Retrieve the reservation from database.
    let reservation = cache.get(req.query.transactionId);
    if (!reservation){
        throw new Error("Reservation not found.");
    }

    console.log(`Retrieved following reservation.`);
    console.log(reservation);

    let confirmation = {
        transactionId: req.query.transactionId,
        amount: reservation.amount,
        currency: reservation.currency
    }

    console.log(`Going to confirm payment with following options.`);
    console.log(confirmation);

    pay.confirm(confirmation).then(async(response) => {
      console.log('k line');
      console.log(reservation.userid);
      var html = `<html>
          <head>
            <script src="https://d.line-scdn.net/liff/1.0/sdk.js"></script>
            <script>
              window.onload = function(e) {
                var ms = 'お支払いが完了しました。';
                liff
                  .sendMessages([
                    {
                      type: 'text',
                      text: ms
                    }
                  ])
                  .then(function() {
                  alert('ok');
                    liff.closeWindow();
                  })
                  .catch(function(error) {
                    window.alert('エラーが発生しました。時間を置いて再度お試しください。');
                  });
              };
            </script>
          </head>
          <body>
          </body>
        </html>`;
        res.sendStatus(200);
    });
};