/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var express = require('express');
//var app = require('express')();
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
//var request = require('request');
var request = require('sync-request');
var uuid = require('node-uuid');
var fs = require("fs");
var bodyParser = require('body-parser');

app.use(bodyParser.json({limit: '150mb'}));
app.use(bodyParser.urlencoded({limit: '150mb'}));


var lApiRootUrl = "http://localhost:3000";

var clients = [];
var users = [];

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});



//   Socket Io Connection...
io.on('connection', function (socket) {
    console.log('New client is connected (id=' + socket.id + ').');
    clients.push(socket);
    // When socket disconnects, remove it from the list:
    socket.on('disconnect', function () {
        var index = clients.indexOf(socket);
        if (index != -1) {
            clients.splice(index, 1);
            console.info('Client gone (id=' + socket.id + ').');
        }
    });
    socket.on('logOut', function (aUser) {
        for (var i = 0; i < users.length; i++) {
            if (users[i].id === aUser.id) {
                users.splice(i, 1);
            }
        }
        socket.leave(aUser.id);
        io.emit('updateRooms', users);
    });
    socket.on('addUser', function (aUser) {

        for (var i = 0; i < users.length; i++) {
            if (users[i].id === aUser.id) {
                users.splice(i, 1);
            }
        }
        users.push(aUser);
        socket.leave(aUser.id);
        socket.join(aUser.id);
        io.emit('updateRooms', users);
    });

    socket.on('chat message', function (msg) {
        var isImage = false;
        var id1 = saveChatDataForReciver(msg);
        msg.id = id1.data.insertId;
        io.sockets.in(msg.toUser).emit('chat message', msg, isImage);
        //console.log(id1.data.insertId);
        var id2 = saveChatDataForSender(msg);
        msg.id = id2.data.insertId;
        io.sockets.in(msg.fromUser).emit('chat message', msg, isImage);
        //To Save Chat Data


    });

    socket.on('chat image', function (msg, img) {
        //console.log(img);
        var isImage = true;
        var data1 = saveChatImageForReciver(msg);
        msg.id= data1.data.insertId;
        io.sockets.in(msg.toUser).emit('chat message', msg, isImage, msg.fileUrl);
        
        var data2 = saveChatImageForSender(msg);
        msg.id= data2.data.insertId;
        io.sockets.in(msg.fromUser).emit('chat message', msg, isImage, msg.fileUrl);
       
    });
    socket.on('typing', function (to, from) {
        io.emit('typing', to, from);
    });
    socket.on('notTyping', function (to, from) {
        io.emit('notTyping', to, from);
    });
    io.emit('updateRooms', users);
});
http.listen(3030, function () {
    console.log('listening on *:3030');
});

function saveChatDataForReciver(msg) {

    var requestData = {
        user_Id: msg.toUser,
        fromUser: msg.fromUser,
        toUser: msg.toUser,
        text: msg.text,
        isReaded: 1

    };
    /*
     var data = request({
     url: lApiRootUrl + '/api/addChat',
     method: "POST",
     json: true,
     headers: {
     "content-type": "application/json"
     },
     body: requestData,
     
     //  body: JSON.stringify(requestData)
     }, function (error, resp, body) {
     // console.log(error);
     console.log(body);
     return body;
     });
     */

    var res = request('POST', lApiRootUrl + '/api/addChat', {
        json: requestData
    });
    var data = JSON.parse(res.getBody('utf8'));

    return data;
}

function saveChatDataForSender(msg) {

    var requestData = {
        user_Id: msg.fromUser,
        fromUser: msg.fromUser,
        toUser: msg.toUser,
        text: msg.text,
        isReaded: 1

    };
    var res = request('POST', lApiRootUrl + '/api/addChat', {
        json: requestData
    });
    var data = JSON.parse(res.getBody('utf8'));
    return data;
}

function saveChatImageForSender(msg, img) {
    var requestData = {
        user_Id: msg.fromUser,
        fromUser: msg.fromUser,
        toUser: msg.toUser,
        text: msg.text,
        isReaded: 1,
        fileName: msg.fileUrl,
        fileType: msg.type

    };
    /*
    request({
        url: lApiRootUrl + '/api/saveImages',
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json"
        },
        body: requestData
    }, function (error, resp, body) {
        // console.log(error);
        console.log(body);
        return body;
    });
    */
 
   var res = request('POST', lApiRootUrl + '/api/saveImages', {
        json: requestData
    });
    var data = JSON.parse(res.getBody('utf8'));
    return data;
}

function saveChatImageForReciver(msg, img) {
    var requestData = {
        user_Id: msg.toUser,
        fromUser: msg.fromUser,
        toUser: msg.toUser,
        text: msg.text,
        isReaded: 1,
        fileName: msg.fileUrl,
        fileType: msg.type

    };
  
   var res = request('POST', lApiRootUrl + '/api/saveImages', {
        json: requestData
    });
    var data = JSON.parse(res.getBody('utf8'));
    return data;
}


function decodeBase64Image(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    var response = {};

    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }
    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');
    return response;
}
