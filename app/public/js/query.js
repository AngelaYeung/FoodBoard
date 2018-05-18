const mysqlconnection = require('./mysqlconnection.js');

var connection = mysqlconnection.handleDisconnect();

/**
 * 
 * @param {string} clientSessionID session ID from the server
 */
function getSessionID(clientSessionID) {
    var query = 'SELECT sessionID FROM Sessions WHERE sessionID = ?';
    var sessionID = connection.query(query, [clientSessionID], (error, rows, fields) => {
        if (error) {
            console.log('Error', error)
        } else {
            if (rows.length) {
                console.log('QUERY TRUE');
                return true;
            } else {
                console.log('QUERY FALSE');
                return false;
            }
        }
    });

    return sessionID;
}




module.exports = {
    getSessionID: getSessionID,
};
