/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global module */

var md5 = require('MD5');
var myDb = require('../controller/db.js');
var formidable = require('formidable');
var path = require('path');
var fs = require("fs");
//var im = require('imagemagick');

function REGISTRATION(router) {
    var self = this;

    self.handleRoutes(router);
}

REGISTRATION.prototype.handleRoutes = function (router) {
    var self = this;

    router.get("/", function (req, res) {
        res.json({"Message": "Wel Come to rest world !"});
    });

    router.post('/signin', function (req, res) {
        myDb.getConnection(function (err, conn) {
            // var query = "SELECT * FROM tbluser where email='" + req.body.email + "' and pwd='" + md5(req.body.pwd) + "'";
            var query = "select tblUser.id,tblUser.email,tbluserinfo.firstName,tbluserinfo.lastName,tbluserinfo.mobileNo,tbluserinfo.profileImage from tblUser LEFT JOIN tbluserinfo ON tblUser.id = tbluserinfo.user_id where tblUser.email = '" + req.body.email + "' and tblUser.pwd='" + md5(req.body.pwd) + "'";
            console.log(query);
            conn.query(query, function (err, rows) {
                if (err) {
                    res.json({"Error": true, "Message": "Error executing in MySql query"});
                } else {
                   console.log(rows);
                    if (rows.length > 0) {
                        //console.log(rows[0]);
                        req.session.user = rows[0];
                        res.redirect('/index');
                    } else {
                        req.session.user = undefined;
                        req.flash("msg", "Incorrect Username or password.");
                        res.locals.messages = req.flash();
                        res.render('pages/signin');
                    }
                }
            });
        });

    });

    router.post('/signup', function (req, res) {
        myDb.getConnection(function (err, conn) {
            var hashPwd = md5(req.body.pwd);
            var query = "INSERT INTO `tbluser` (`id`, `email`, `pwd`, `role`) VALUES (NULL, '" + req.body.email + "', '" + hashPwd + "', 'role-user');";
            conn.query(query, function (err, rows) {
                if (err) {
                    req.flash("msg", "Something went Wrong");
                    res.locals.messages = req.flash();
                    res.render('pages/sign-up');
                } else {
                    self.addUserInformation(req.body);
                    res.redirect('/');
                }
            });
        });
    });

    router.post('/changepassword', function (req, res) {
        //console.log("==============");
        console.log(req.body.email);
        console.log(req.body);

        myDb.getConnection(function (err, conn) {
            var hashPwd = md5(req.body.curentPwd);
            //var query = "SELECT * from `tbluser` where email = '" + req.body.email + "' AND pwd = '" + hashPwd + "'";
            var query = "UPDATE `tbluser` SET pwd = '" + md5(req.body.newPwd) + "' where email = '" + req.body.email + "' AND pwd = '" + hashPwd + "'";

            conn.query(query, function (err, rows) {
                if (err) {
                    res.json({"Error": true, "Message": "Error executing in MySql query"});
                } else {
                    console.log(rows);
                    //res.redirect('/');
                    res.redirect('/profile');
                }
            });
        });

    });


    router.post('/changeProfileImage', function (req, res) {
        console.log(req.session.user);

        var form = new formidable.IncomingForm();

        form.uploadDir = 'public/uploads/';

        form.parse(req, function (err, fields, files) {
            // console.log(files);
        });

        var targetImage = "public/uploads/" + req.session.user.id + ".png";
        var imgUrl = "uploads/" + req.session.user.id + ".png";

        form.on('end', function () {
            console.log('-> upload done');
            fs.rename(this.openedFiles[0].path, targetImage);
            self.updateUserImage(req.session.user, imgUrl);
            req.session.user.profileImage = imgUrl;
            res.redirect("/profile");

        });
    });
};

REGISTRATION.prototype.addUserInformation = function (data) {

    myDb.getConnection(function (err, conn) {
        var query = "INSERT INTO `chatapp`.`tbluserinfo` (`id`, `user_Id`, `firstName`, `lastName`, `mobileNo`, `profileImage`) VALUES (NULL, (SELECT id FROM `tbluser` WHERE email = '" + data.email + "' ), '" + data.name + "', '" + data.lname + "', '" + data.mobile + "', 'img/avatar_2x.png');";
        console.log(query);
        conn.query(query, function (err, rows) {
            if (err) {
                console.log(err);
            } else {
                console.log("info added");
            }
        });
    });
};

REGISTRATION.prototype.updateUserImage = function (data, aImg) {

    myDb.getConnection(function (err, conn) {
        // var query = "INSERT INTO `chatapp`.`tbluserinfo` (`id`, `user_Id`, `firstName`, `lastName`, `mobileNo`, `profileImage`) VALUES (NULL, (SELECT id FROM `tbluser` WHERE email = '" + data.email + "' ), '" + data.name + "', '" + data.lname + "', '" + data.mobile + "', '//placehold.it/100');";
        var query = "UPDATE `tbluserinfo` SET `profileImage`='" + aImg + "' WHERE user_id=" + data.id;
        console.log(query);
        conn.query(query, function (err, rows) {
            if (err) {
                console.log(err);
            } else {
                console.log("info added");
            }
        });
    });
};

module.exports = REGISTRATION;