/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var express = require('express');
var mysql = require('mysql');
var md5 = require('MD5');
var bodyParser = require('body-parser');
var app = express();
var userController = require('./controller/user.js');
var userChat = require('./controller/chat.js');
var flash = require('connect-flash');
var userQuery = require('./controller/userQuery.js');

var session = require('client-sessions');
app.use(session({
    cookieName: 'session',
    secret: 'random_string_goes_here',
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
}));

app.use(flash()); 


/*
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
*/
app.use(bodyParser.json({limit: '1024mb'}));
app.use(bodyParser.urlencoded({limit: '1024mb'}));

var userRouter = express.Router();
app.use('/user', userRouter);
new userController(userRouter);

var apiRouter = express.Router();
app.use('/api', apiRouter);
new userChat(apiRouter);


app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');


// index page 
app.get('/', function (req, res) {
    req.session.user = undefined;
    res.render('pages/signin');
});

app.get('/logout', function (req, res) {
    req.session.user = undefined;
    console.log(req.session.user)
    res.redirect('/');
});

app.get('/sign-up', function (req, res) {
    req.session.user = undefined;
    res.render('pages/sign-up');
});

app.get('/profile', function (req, res) {
     if (!req.session.user) {
        res.redirect('/');
    }
    res.render('pages/profile', {user: req.session.user});
});

app.get('/index', function (req, res) {
    console.log(req.session.user);
    if (req.session.user) {
        console.log(req.session.user);
        res.render('pages/index', {user: req.session.user});
    } else {
        res.redirect('/');
    }

});


app.listen(3000);
console.log("Request listing on 3000");