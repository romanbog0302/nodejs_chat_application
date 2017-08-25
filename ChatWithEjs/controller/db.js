/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var mysql = require("mysql");

var pool = mysql.createPool({
    connectionLimit: 100,
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '',
    database: 'chatapp',
    debug: false
});

exports.getConnection = function (callback) {
    pool.getConnection(function (err, conn) {
        if (err) {
            return callback(err);
            console.log("Connection Success Fail");
        }
        console.log("Connection Success");
        callback(err, conn);
    });
};

