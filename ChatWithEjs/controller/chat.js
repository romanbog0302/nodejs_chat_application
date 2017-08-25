/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var md5 = require('MD5');
var myDb = require('../controller/db.js');
var formidable = require('formidable');
var path = require('path');
var fs = require("fs");
var uuid = require('node-uuid');



function CHAT_OPERATIONS(router) {
    var self = this;
    self.handleRoutes(router);
}

CHAT_OPERATIONS.prototype.handleRoutes = function (router) {
    var self = this;

    router.get("/", function (req, res) {
        res.json({"Message": "Wel Come to rest Chat Word world !"})
    });

    router.get('/getChat', function (req, res) {
        myDb.getConnection(function (err, conn) {
            var query = "SELECT * FROM `tbl_conversation_replay` WHERE `user_id` = " + req.query['user_Id'] + " AND ((`toUser` = " + req.query['user_Id'] + " OR `toUser` = " + req.query['toUser'] + ")and(`fromUser` = " + req.query['user_Id'] + " OR `fromUser` = " + req.query['toUser'] + ")) ORDER BY `id` DESC limit 20";
            // console.log(query);
            conn.query(query, function (err, rows) {
                if (err) {
                    res.json({"Error": true, "Message": "Error executing in MySql query"});
                } else {
                    res.json({"Error": false, "data": rows});
                }
            });
        });
    });

    router.post('/addChat', function (req, res) {
        myDb.getConnection(function (err, conn) {
            var query = "INSERT INTO `tbl_conversation_replay` (`id`, `user_id`, `fromUser`, `toUser`, `text`, `isRead`,`isFile`,`fileType`) VALUES (NULL, '" + req.body.user_Id + "', '" + req.body.fromUser + "', '" + req.body.toUser + "', '" + req.body.text + "','" + req.body.isReaded + "',0,'');"
            // console.log(query);
            conn.query(query, function (err, rows) {
                if (err) {
                    res.json({"Error": true, "Message": "Error executing in MySql query"});
                } else {
                    res.json({"Error": false, "data": rows});
                }
            });
        });
    });

    router.post('/saveImages', function (req, res) {

        myDb.getConnection(function (err, conn) {
            var query = "INSERT INTO `tbl_conversation_replay` (`id`, `user_id`, `fromUser`, `toUser`, `text`, `isRead`,`isFile`,`fileType`) VALUES (NULL, '" + req.body.user_Id + "', '" + req.body.fromUser + "', '" + req.body.toUser + "', '" + req.body.fileName + "','" + req.body.isReaded + "',1,'" + req.body.fileType + "');"
            //  var query2 = "INSERT INTO `tbl_conversation_replay` (`id`, `user_id`, `fromUser`, `toUser`, `text`, `isRead`,`isFile`,`fileType`) VALUES (NULL, '" + req.body.toUser + "', '" + req.body.fromUser + "', '" + req.body.toUser + "', '" + req.body.fileName + "','" + req.body.isReaded + "',1,'" + req.body.fileType + "');"
            conn.query(query, function (err, rows) {
                if (err) {
                    res.json({"Error": true, "Message": "Error executing in MySql query"});
                } else {
                    res.json({"Error": false, "data": rows});
                }
            });
            /*
             conn.query(query2, function (err, rows) {
             
             });
             */

        });
    });

    router.post('/deleteMsg', function (req, res) {
        //console.log("Api Called");
        
        myDb.getConnection(function (err, conn) {
            var query = "DELETE FROM `tbl_conversation_replay` where id IN (" + req.body.msg.toString() + ")";
            conn.query(query, function (err, rows) {
                if (err) {
                    res.json({"Error": true, "Message": "Error executing in MySql query"});
                } else {
                    res.json({"Error": false, "data": rows});
                }
            });
        });
    });

    router.get('/deletAllChat', function (req, res) {
        myDb.getConnection(function (err, conn) {
            var userId = req.query['user_Id'];
            var toUser = req.query['toUser'];
            var query = "DELETE FROM `tbl_conversation_replay` where `user_id`=" + userId + " AND ((`toUser` = " + userId + " OR `toUser` = " + toUser + ")and(`fromUser` = " + userId + " OR `fromUser` = " + toUser + "))";

            conn.query(query, function (err, rows) {
                if (err) {
                    res.json({"Error": true, "Message": "Error executing in MySql query"});
                } else {
                    res.json({"Error": false, "data": rows});
                }
            });
        });
    });

    router.get('/getOlderMessage', function (req, res) {
        myDb.getConnection(function (err, conn) {
            var userId = req.query['user_Id'];
            var toUser = req.query['toUser']
            var query = "SELECT * FROM `tbl_conversation_replay` WHERE `user_id`=" + userId + " AND id < "+ req.query['fromId'] + " AND ((`toUser` = " + userId + " OR `toUser` = " + toUser + ")and(`fromUser` = " + userId + " OR `fromUser` = " + toUser + "))" + " ORDER BY `id` DESC limit 20" ;
            
            conn.query(query, function (err, rows) {
                if (err) {
                    res.json({"Error": true, "Message": "Error executing in MySql query"});
                } else {
                    res.json({"Error": false, "data": rows});
                }
            });
            
        });
    });

    router.post('/uploadChatFile', function (req, res) {

        var form = new formidable.IncomingForm();

        form.uploadDir = 'public/chatImages/';

        form.parse(req, function (err, fields, files) {
            // console.log(files);
        });

        form.on('end', function () {
            var fileName = this.openedFiles[0].name;
            var targetImage = "public/chatImages/" + fileName;
            var imgUrl = "chatImages/" + fileName;

            fs.rename(this.openedFiles[0].path, targetImage);

            res.json({"success": true, "fileUrl": imgUrl, "fileName": fileName});
        });

    });
}


module.exports = CHAT_OPERATIONS;