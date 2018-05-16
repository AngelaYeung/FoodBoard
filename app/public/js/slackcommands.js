const mysqlconnection = require('./mysqlconnection.js');

var connection = mysqlconnection.handleDisconnect();



/**
 * Queries the top 3 most recent items on the foodboard page, and sends it to slack. 
 */
function newItems(req, res) {

    let query = "SELECT * FROM FoodItem WHERE claimStatus = 0 ORDER BY itemID DESC LIMIT 3";
    connection.query(query, (error, rows, fields) => {
        if (error) {
            console.log('Error', new Date(Date.now()), error);
        } else if (rows.length === 0) {
            const response = {
                response_type: 'in_channel',
                channel: slackReqObj.channel_id,
                text: 'Sorry but the boards empty :white_frowning_face:',
            }
        } else {
            let text;
            for (let i = 0; i < rows.length; i++) {
                text += `${i}.\t${rows.foodName}\n`;
            }
            const response = {
                response_type: 'in_channel',
                channel: slackReqObj.channel_id,
                text: 'Sorry but the boards empty :white_frowning_face:',
              };
        }
        
        return res.json(response);
    });

};


module.exports = {
    newItems: newItems,
};