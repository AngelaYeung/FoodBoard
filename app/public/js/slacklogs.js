const http = require('https');

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


function log(msg, error) {
    var timeStamp = new Date(Date.now());
    
    var postData = JSON.stringify({
        text: `\`\`\`${timeStamp}, ${msg}: ${JSON.stringify(error, undefined, 3)}\`\`\``,
    });


    var postReq = http.request(options, (res) => {
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
        });
    });

    postReq.write(postData);
    postReq.end();
};


module.exports = {
    log: log,

}