/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var myDb = require('../controller/db.js');


exports.getUserInfo = function (aId) {
    console.log("hello " + aId);
    myDb.getConnection(function (err, conn) {
        var query = "SELECT * FROM `chatapp`.`tbluserinfo` where user_Id=" + aId;
        console.log(query);
        conn.query(query, function (err, rows) {
            if (err) {
                console.log(err)
            } else {
                console.log("info getted");
                console.log(rows);
                return "got data";
            }
        })
    });
}