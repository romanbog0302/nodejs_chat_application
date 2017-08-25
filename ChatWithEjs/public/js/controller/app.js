/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/*
 Author: Hansraj Sharma
 Description: This is the main JavaScript from the application
 */
nodeChat = typeof nodeChat !== "undefined" ? nodeChat : {};

nodeChat.App = {
    _init: function () {
        //alert("Hello i am node chat");
    }
};

$(document).ready(function () {
    nodeChat.App._init();
});
