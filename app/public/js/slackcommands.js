const mysqlconnection = require('./mysqlconnection.js');
const slacklog = require('./slacklogs');
var connection = mysqlconnection.handleDisconnect();
const token = 'pbvEgpojkg1eEkIdv03G9SRA';



/**
 * Queries the top 3 most recent items on the foodboard page, and sends it to slack. 
 */
function getItems(req, res) {

    let slackReqObj = req.body;

    let query = "SELECT * FROM FoodItem WHERE Users_claimerUserID IS NULL";
    connection.query(query, (error, rows, fields) => {
        if (error) {
            slacklog.log('Error: Slack Command - getItems()', error);
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
            const response = {
                response_type: 'in_channel',
                channel: slackReqObj.channel_id,
                text: `\`\`\`${JSON.stringify(rows, undefined, 3)}\`\`\``,
            }
              console.log('Slack Commands:', response);
              return res.json(response);
        }
    });

};


function getSessions(req, res) {

    let slackReqObj = req.body;

    let query = 'SELECT * from Sessions';
    connection.query(query, (error, rows, fields) => {
        if (error) {
            slacklog.log('Error: Slack Command - getSessions()', sessions);
            console.log('Error', new Date(Date.now()), error);
        } else if (rows.length === 0) {
            const response = {
                response_type: 'in_channel',
                channel: slackReqObj.channel_id,
                text: 'Currently there are no active sessions :white_frowning_face:',
            }
            console.log('Slack Commands:', response);
            return res.json(response);
        } else {
            const response = {
                response_type: 'in_channel',
                channel: slackReqObj.channel_id,
                text: `\`\`\`${JSON.stringify(rows, undefined, 3)}\`\`\``,
            }
              console.log('Slack Commands:', response);
              return res.json(response);
        }
    });

}

function getUsers(req, res) {

    let slackReqObj = req.body;

    let query = 'SELECT * from users';
    connection.query(query, (error, rows, fields) => {
        if (error) {
            slacklog.log('Error: Slack Command - getUsers()', error);
            console.log('Error', new Date(Date.now()), error);
        } else if (rows.length === 0) {
            const response = {
                response_type: 'in_channel',
                channel: slackReqObj.channel_id,
                text: 'Currently there are no users registered :white_frowning_face:',
            }
            console.log('Slack Commands:', response);
            return res.json(response);
        } else {
            const response = {
                response_type: 'in_channel',
                channel: slackReqObj.channel_id,
                text: `\`\`\`${JSON.stringify(rows, undefined, 3)}\`\`\``,
            }
              console.log('Slack Commands:', response);
              return res.json(response);
        }
    });
}


module.exports = {
    getItems: getItems,
    getSessions: getSessions,
    getUsers: getUsers,
    token: token
};
