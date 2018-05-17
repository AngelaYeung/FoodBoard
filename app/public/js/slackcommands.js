const http = require('http');

const mysqlconnection = require('./mysqlconnection.js');
var connection = mysqlconnection.handleDisconnect();
const token = 'pbvEgpojkg1eEkIdv03G9SRA';

const options = {
    host: 'hooks.slack.com',
    port: '443',
    path: '/services/TAPJCHR5G/BARUPCJJZ/SixLycbd5dQtcvAdMHdLfnJH',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json'
    }
};


function log(msg) {
    var timeStamp = new Date(Date.now());
    
    var postData = JSON.stringify({
        text: `\`\`\`${timeStamp}, Message: ${JSON.stringify(msg, undefined, 3)}\`\`\``,
    });


    var post_req = http.request(options, (res) => {
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
        });

        console.log(new Date(Date.now()), 'Slack response: ', res);
    });

    post_req.write(postData);
    post_req.end();
};


/**
 * Queries the top 3 most recent items on the foodboard page, and sends it to slack. 
 */
function newItems(req, res) {

    let slackReqObj = req.body;

    let query = "SELECT * FROM FoodItem WHERE Users_claimerUserID IS NULL";
    connection.query(query, (error, rows, fields) => {
        if (error) {
            console.log('Error', new Date(Date.now()), error);
        } else if (rows.length === 0) {
            const response = {
                response_type: 'in_channel',
                channel: slackReqObj.channel_id,
                text: 'Sorry but the boards empty :white_frowning_face:',
            }
            console.log('Slack Commands:', response);
            return res.json(response);
        } else {
            let msg;
            for (let i = 0; i < rows.length; i++) {
                msg += `${i}.\t${rows.foodName}\n`;
            }
            const response = {
                response_type: 'in_channel',
                channel: slackReqObj.channel_id,
                text: 'Most Recent Posts:',
                attachments: {
                    text: msg,
                }
              };
              console.log('Slack Commands:', response);
              return res.json(response);
        }
    });

};





module.exports = {
    newItems: newItems,
    token: token,
    log: log, 
};