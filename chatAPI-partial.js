//chatAPI.js
const http = require('http');
const url = require('url');
const fs = require('fs');

const db = require('./chat_database.js');

const chatRecords = [];

http.createServer(function (req, res) {
    let path = url.parse(req.url, true).pathname;
    console.log("Request:" + path);
    if (path == "/") {
        fs.readFile('index.html', function (err, data) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(data);
            return res.end();
        })
    } else if (path == "/chat") {
        let q = url.parse(req.url, true).query;
        let user = q.user;
        let say = q.say;
        let time = new Date().toLocaleString();
        if (user) {
            let chatObj = { user: user, say: say, time: time };
            chatRecords.push(chatObj);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        console.log(JSON.stringify(chatRecords));
        res.end(JSON.stringify(chatRecords));
    } else if (path == "/clear") {
        while (chatRecords.length > 0) {
            chatRecords.pop();
        }
    } else if (path == "/save") {
        db.save(chatRecords);
        res.end();
    } else if (path == "/reload") {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        let recordsPromise = db.reload();

        recordsPromise
            .then(function (value) {
                console.log("Value: " + value);
                for (let chat of value) {
                    console.log("Chat: " + JSON.stringify(chat));
                    if (!chat.id) chatRecords.push(chat);
                }

                console.log("All Chats: " + chatRecords);
                res.end(JSON.stringify(chatRecords));
            })
    }
    else {
        res.end();
    }
}).listen(8080);