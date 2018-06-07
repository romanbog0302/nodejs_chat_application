/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


nodeChat = typeof nodeChat !== "undefined" ? nodeChat : {};
nodeChat.Chat = {
    socketServer: 'http://192.168.0.158:3030/',
    userData: "",
    socket: io('http://192.168.0.158:3030/'),
    _init: function () {
        //this.socket = ;
        this.initialize();
        this.socketChat();
    },
    initialize: function () {
        var lMe = this;
        //console.log(lMe);
        $('.head-circle').text(lMe.userData.email.charAt(0));
        $(document).on("blur", ".chat-text", function () {
            var to = $(this).closest(".chatWindow").find('.chat').attr("id");
            var from = $("#user").val();
            lMe.socket.emit('notTyping', to.split("-")[1], from);
        });
        $(document).on("change keyup paste mouseup", ".chat-text", function () {
            var to = $(this).closest(".chatWindow").find('.chat').attr("id");
            var from = $("#user").val();
            lMe.socket.emit('typing', to.split("-")[1], from);
        });

        $(document).on('click', "#emotionList span", function () {
            var chatText = $(this).closest(".chatWindow").find(".chat-text").val();
            chatText = chatText + " " + $(this).text();
            $(this).closest(".chatWindow").find(".chat-text").val(chatText);
        });

        $(document).on('mouseover', '.emotionDropUp', function () {
            var footerObj = $(this).closest(".panel-footer");
            $(footerObj).find("#emotionList").width($(footerObj).width());
        });

        $(document).on('click', '.chat-list-img', function (e) {
            var lHtml = '<div class="image-popup-back ">' +
                    '<div class="row">' +
                    '<div class="col-md-12" style="padding-left: 200px;padding-right: 200px;padding-top: 50px;">' +
                    '<img class="animated zoomIn img-responsive" src=' + $(this).attr('src') + '>' +
                    '</div>' +
                    '</div>' +
                    '</div>'
            $('body').append(lHtml);
            e.stopPropagation();

        });

        $(document).on('click', '.fileIcon', function (e) {
            e.stopPropagation();
        })
        $(document).on('click', '.files-msg p', function () {
            e.stopPropagation();
        });

        $(document).on('click', '.image-popup-back div', function (e) {
            if (e.target != this) {
                return;
            }
            $('.image-popup-back').remove();

        });
        /*
         $("#logOut").click(function () {
         lMe.socket.emit('logOut', lMe.userData);
         });
         */
        // Message sent on press enter.
        $(document).on('keypress', '.chat-text', function (e) {
            if (e.which === 13) {
                $(this).blur();
                var lCObj = $(this).closest('.chatWindow');
                $(lCObj).find('.btn-chat').focus().click();
            }
        });
        $(document).on('click', '.glyphicon-remove', function () {
            $(this).closest('.chatWindow').addClass('chatWindow-close').removeClass('chatWindow-open');
        });
        $(document).on('mouseover', '.unread-msg', function () {
            $(this).removeClass('unread-msg');
            var toUser = $(this).closest('.chatWindow').find('.toUser').text();
            var badgeObj = $('#onlineUser-' + toUser).find('.badge');
            var cnt = parseInt($(badgeObj).text());
            $(badgeObj).text(cnt - 1).show();
            if ((cnt - 1) <= 0) {
                $('#onlineUser-' + toUser).removeClass('active');
                $(badgeObj).hide();
            }
        });
        //send messege on click button event
        $(document).on('click', '.btn-chat', function () {
            var lCObj = $(this).closest('.chatWindow');
            var msg = {};
            msg.email = lMe.userData.email;
            msg.text = escape($(lCObj).find('.chat-text').val().trim());
            msg.fromUser = $('#user').val().trim();
            msg.toUser = $(lCObj).find('.toUser').text().trim();
            msg.time = new Date().toISOString();
            msg.userImage = 'uploads/' + msg.fromUser + '.png';
            msg.room = msg.fromUser + '-' + msg.toUser;
            if (msg.text.trim().length <= 0) {
                return;
            }

            lMe.socket.emit('chat message', msg);
            $(lCObj).find('.chat-text').focus().val('');
            return;
        });

        $(document).on('click', '.sendImage', function () {
            $('#chatImage').trigger('click');
        });

        $('#uploadForm').on('submit', (function (e) {
            e.preventDefault();
            var formData = new FormData(this);

            console.log(formData);
            $("#loader").show();
            $.ajax({
                type: 'POST',
                url: $(this).attr('action'),
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                success: function (data) {
                    $("#loader").hide();
                    //alert("success  : >  " + JSON.stringify(data));
                    lMe.sendImageAndFileToInChat(data);
                },
                error: function (data) {
                    console.log("error");
                    console.log(data);
                }
            });
        }));

        $('#chatImage').on('change', function (e) {

            if ((this.files[0].size) / (1024 * 1024) < 1024) {
                $('#uploadForm').submit();
            } else {
                alert("File is too large you can't send file having size more then 150 MB ");
            }
        });



        $(document).on("click", "li.clearfix", function () {
            var elm = $(this)
            if (elm.hasClass("selected-msg")) {
                elm.removeClass("selected-msg");
            } else {
                elm.addClass("selected-msg");
            }
            if ($(".selected-msg").length > 0) {
                $(".acton-btn").show();
            } else {
                $(".acton-btn").hide();
            }

        });

        $(document).on("click", ".delete-msg", function () {
            /*
             $(".selected-msg").remove();
             $(".acton-btn").hide();
             */
            lMe.deleteMsg();
        });
    },
    logout: function () {
        var lMe = this;
        lMe.socket.emit('logOut', lMe.userData);
    },
    /**
     *   To sockets chat functions... which is used to manage chat data
     **/
    socketChat: function () {
        var lMe = this;
        lMe.socket.emit('addUser', lMe.userData);
        lMe.socket.on('notTyping', function (to, from) {
            var lfrom = $("#user").val();
            if (lfrom === to) {
                $("#messages-" + from + " #typing").remove();
                lMe.toScrollContent();
            }
        });

        //To show user typing...
        lMe.socket.on('typing', function (to, from) {
            var lfrom = $("#user").val();
            if (lfrom === to) {
                $("#messages-" + from + " #typing").remove();
                $("#messages-" + from).append("<div id='typing'><small class='text-muted'>typing...</small></div>");
                lMe.toScrollContent();
            }
        });

        //Update User Who comes online.
        lMe.socket.on('updateRooms', function (users) {
            console.log(users);
            $("#onlineUser").empty();
            for (var r = 0; r < users.length; r++) {
                if ($('#user').val() !== users[r].id.toString()) {
                    $("#onlineUser").append('<a id="onlineUser-' + users[r].id + '" href="javascript:void(0)" class="list-group-item" onclick=nodeChat.Chat.selectUserToChat("' + users[r].id + '","' + escape(users[r].email) + '")> <img class="img-circle" alt="User Avatar" src="' + users[r].profileImage + '"></span> ' + users[r].email + '<span class="badge">0</span> </a>');
                }
            }

            $('.badge').each(function () {
                var lCnt = parseInt($(this).text());
                if (lCnt === 0) {
                    $(this).hide();
                }
            });
        });

        lMe.socket.on('chat image', function (msg, img64bit) {
            //  alert("recive");
            var lHtmlMsg = '<img src="' + img64bit + '">';
            $('#messages-' + msg.toUser).append($('<li class="clearfix " id="' + msg.id + '">').html(lHtmlMsg));
            $('#messages-' + msg.fromUser).append($('<li class="clearfix" id="' + msg.id + '">').html(lHtmlMsg));
        });

        /**
         * To send and recive messages form socket...
         */
        lMe.socket.on('chat message', function (msg, isImage, img64bit) {
            var lInUser = $('#user').val();

            if (lInUser === msg.toUser) {
                if ($('#messages-' + msg.fromUser).length <= 0) {
                    if ($('.chatWindow-open').length > 0) {
                        lMe.addChatWindows(msg.fromUser, msg.email);
                        $('#messages-' + msg.fromUser).closest('.chatWindow').addClass('chatWindow-close').removeClass('chatWindow-open');
                    } else {
                        lMe.addChatWindows(msg.fromUser, msg.email);
                    }
                }

                if (focused === false) {
                    lMe.send_desktop_notification(unescape(msg.text));
                }

                lMe.play_single_sound();
            }
            //To Increment the count of text
            var parentBadgeObj = $('#onlineUser-' + msg.fromUser);
            $(parentBadgeObj).addClass('active');
            var badgeObj = $(parentBadgeObj).find('.badge');
            var cnt = parseInt($(badgeObj).text());
            $(badgeObj).text(cnt + 1).show();

            var time = moment(msg.time).format('lll'), unreadClass = " unread-msg";
            var liClass = "left", lRoundImage = msg.userImage, circleImage = " pull-left";
            var msgHeader = '<small class="pull-right text-muted">' +
                    '<span class="glyphicon glyphicon-time"></span>' + time + '</small>';

            if ($('#user').val() === msg.fromUser) {
                liClass = "right";
                unreadClass = '';
                circleImage = " pull-right";
                msgHeader = '<small class = "pull-left text-muted"> <span class = "glyphicon glyphicon-time"> </span>' + time + '</small >';
            }

            var lHtmlMsg = '<span class = "chat-img ' + circleImage + '">' +
                    '<img src="' + lRoundImage + '" alt="User Avatar" class="img-circle"  />' +
                    '</span>' +
                    '<div class = "chat-body clearfix">' +
                    '<div class = "header">' + msgHeader + '</div>';
            if (isImage) {
                if (!img64bit.match(/\.(jpg|jpeg|png|gif)$/)) {
                    $('.chat-loader').hide();
                    var l = '<div class="' + circleImage + '">' +
                            '<a class="files-msg"  href="' + img64bit + '" target="_blank">' +
                            '<div><div class="fileIcon  ' + img64bit.split('.').pop() + circleImage + '"></div></div>' +
                            '<p class="' + circleImage + '">' + img64bit.split("/")[1] + '</p>' +
                            '</a>' +
                            '<div>';
                    //lHtmlMsg = lHtmlMsg + '<p><a class="fileIcon  ' + circleImage + '  ' + img64bit.split('.').pop() + '" href="' + img64bit + '" target="_blank"></a></p>';
                    lHtmlMsg = lHtmlMsg + l;
                } else {
                    lHtmlMsg = lHtmlMsg + '<p><img  class="chat-list-img ' + circleImage + '" src="' + img64bit + '"></p>';
                }

            } else {
                lHtmlMsg = lHtmlMsg + '<p class="' + circleImage + '">' + unescape(msg.text) + '</p>';
            }

            lHtmlMsg = lHtmlMsg + '</div>';
            $('#messages-' + msg.toUser).append($('<li class="clearfix ' + liClass + unreadClass + '" id="' + msg.id + '">').html(lHtmlMsg));

            $('#messages-' + msg.fromUser).append($('<li class="clearfix ' + liClass + unreadClass + '" id="' + msg.id + '" >').html(lHtmlMsg));

            setTimeout(function () {
                lMe.toScrollContent();
                lMe.loadEmotions();
            }, 200);



            $(".img-circle").error(function () {
                $(this).attr('src', 'img/avatar_2x.png');
            });
        });
    },
    /**
     * 
     * To scroll Content down...
     */
    toScrollContent: function () {
        //To scroll content down.
        $('.chatWindow .panel-body').each(function () {
            var wtf = $(this);
            var height = wtf[0].scrollHeight;
            wtf.scrollTop(height);
        });
    },
    selectUserToChat: function (aToUser, aToUserEmail) {
        var lMe = this;
        $('.chatWindow').addClass('chatWindow-close').removeClass('chatWindow-open');
        if ($('#messages-' + aToUser).length > 0) {
            $('#messages-' + aToUser).closest('.chatWindow').addClass('chatWindow-open').removeClass('chatWindow-close');
            return;
        } else {
            lMe.addChatWindows(aToUser, aToUserEmail);
        }
    },
    addChatWindows: function (aToUser, aToUserEmail) {
        var lMe = this;
        if ($('#messages-' + aToUser).length > 0) {
            return;
        }

        lHtmlWindows = '<div class="col-md-12 chatWindow chatWindow-open">' +
                '<div class = "panel panel-default">' +
                '<div class = "panel-heading">' +
                '<span class = "glyphicon glyphicon-comment"> </span> <span class="toEmail">' + unescape(aToUserEmail) + '</span> <span id="toUser" class="toUser" style="opacity: 0.02">' + aToUser + '</span>' +
                '<span class="glyphicon glyphicon-remove pull-right chat-action"></span>' +
                //-----
                '<div class="btn-group pull-right">' +
                '<button type="button" class="btn btn-default btn-xs dropdown-toggle" data-toggle="dropdown">' +
                '<span class="glyphicon glyphicon-chevron-down"></span>' +
                '</button>' +
                '<ul class="dropdown-menu slidedown">' +
                '<li><a onclick="nodeChat.Chat.refreshchat();" href="javascript:void(0);"><span class="glyphicon glyphicon-refresh">' +
                '</span>Refresh</a></li>' +
                /*
                 '<li><a href="javascript:void(0);"><span class="glyphicon glyphicon-ok-sign">' +
                 '</span>Available</a></li>' +
                 '<li><a href="javascript:void(0);"><span class="glyphicon glyphicon-remove">' +
                 '</span>Busy</a></li>' +
                 '<li><a href="javascript:void(0);"><span class="glyphicon glyphicon-time"></span>Away</a></li>' +
                 */
                '<li><a href="javascript:void(0);" onclick="nodeChat.Chat.deleteAllChat();"><span class="glyphicon glyphicon-trash"></span>Delete All Message</a></li>' +
                '<li class="divider"></li>' +
                '<li><a href="/logout"><span class="glyphicon glyphicon-off" onclick="nodeChat.Chat.logout();"></span>Sign Out</a></li>' +
                '</ul>' +
                '</div>' +
                //------


                '</div>' +
                '<div id="msgPanel" class = "panel-body">' +
                '<ul id = "messages-' + aToUser + '" class = "chat">' +
                '</ul>' +
                '</div>' +
                '<div class = "panel-footer"> ' +
                '<a href="javascript:void(0);" class="emotionDropUp dropup">' +
                '<span class="css-emoticon " dropdown-toggle" type="button" data-toggle="dropdown">:-)</span>' +
                //  '<form action = "">' +

                lMe.emotionList() +
                '</a>' +
                '<a href="javascript:void(0);" class="sendImage"><img src="img/attach.png"></a>' +
                '<div class="pull-right acton-btn"><a href="javascript:void(0);" class="delete-msg"><span class="glyphicon glyphicon-trash"></span></a></div>' +
                '<img src="img/ajax-loader.gif" class="pull-right chat-loader" style="display:none">' +
                '<div class = "input-group">' +
                '<textarea style="resize: none;border: none;background: transparent;box-shadow: none;" autocomplete = "off" type = "text" class = "chat-text form-control input-lg b-0" placeholder = "Type message..." ></textarea>' +
                '<span class = "input-group-btn">' +
                '<button type="button" class = "btn btn-warning btn-circle btn-lg btn-chat"><i class="fa fa-paper-plane-o"></i> </button>' +
                '</span>' +
                '</div>' +
                // '</form>' +
                '</div>' +
                '</div>' +
                '</div>';
        $("#chat-windows-container").append(lHtmlWindows);

        $.ajax({
            url: 'api/getChat?user_Id=' + lMe.userData.id + '&toUser=' + aToUser,
            type: 'get',
            dataType: 'json',
            success: function (data) {
                if (!data.Error) {
                    lMe.fillStoredChatData(data);

                }
            }
        });
        lMe.saveActiveWindows('onlineUser-' + aToUser);

        // Bind scroll event of msgPanel..
        $("#msgPanel").bind("scroll", function () {
            var curruntOffset = $("#msgPanel").scrollTop();
            if (curruntOffset == 0) {
                lMe.getOlderMessage();
            }
        });
    },
    fillStoredChatData: function (data) {
        var lMe = this;
        lMe.createMessageList(data);

        //To scroll content down.
        setTimeout(function () {
            lMe.loadEmotions();
            lMe.toScrollContent();
        }, 200);

        $(".img-circle").error(function () {
            $(this).attr('src', 'img/avatar_2x.png');
        });
    },
    createMessageList: function (data) {

        var lMe = this;
        for (var i = 0; i < data.data.length; i++) {
            var msg = data.data[i];
            msg.email = $("#messages-" + msg.fromUser).closest('.chatWindow').find('.toEmail').text();
            var time = moment(msg.created_time).format('lll');
            var liClass = "left", lRoundImage = 'uploads/' + msg.fromUser + '.png', circleImage = " pull-left";
            var msgHeader = ' <small class="pull-right text-muted">' +
                    '<span class="glyphicon glyphicon-time"></span>' + time + '</small>';

            if ($('#user').val().trim() === msg.fromUser.toString()) {
                liClass = "right";
                msg.email = lMe.userData.email;
                lRoundImage = 'uploads/' + msg.fromUser + '.png';
                circleImage = " pull-right";
                msgHeader = '<small class = "pull-left text-muted"> <span class = "glyphicon glyphicon-time"> </span>' + time + '</small >';
            }

            var lHtmlMsg = '<span class = "chat-img ' + circleImage + '">' +
                    '<img src="' + lRoundImage + '" alt="User Avatar" class="img-circle" />' +
                    '</span>' +
                    '<div class = "chat-body clearfix">' +
                    '<div class = "header">' + msgHeader + '</div>';
            if (msg.isFile) {
                var msgText = unescape(msg.text);
                if (!msgText.match(/\.(jpg|jpeg|png|gif)$/)) {
                    var l = '<div class="' + circleImage + '">' +
                            '<a class="files-msg"  href="' + msgText + '" target="_blank">' +
                            '<div><div class="fileIcon  ' + msgText.split('.').pop() + circleImage + '"></div></div>' +
                            '<p class="' + circleImage + '">' + msgText.split("/")[1] + '</p>' +
                            '</a>' +
                            '<div>';
                    lHtmlMsg = lHtmlMsg + l;

                } else {
                    lHtmlMsg = lHtmlMsg + '<div class="text-right ' + circleImage + '"><div class="' + circleImage + '"><img  class="chat-list-img " src="' + unescape(msg.text) + '"></div><p>' + unescape(msg.text).split("/")[1] + ' </p></div>';
                }
            } else {
                lHtmlMsg = lHtmlMsg + '<p class="' + circleImage + '" >' + unescape(msg.text) + '</p>';
            }

            lHtmlMsg = lHtmlMsg + '</div>';

            $('#messages-' + msg.toUser).prepend($('<li class="clearfix ' + liClass + '" id="' + msg.id + '">').html(lHtmlMsg));

            $('#messages-' + msg.fromUser).prepend($('<li class="clearfix ' + liClass + '" id="' + msg.id + '">').html(lHtmlMsg));

        }

    },
    send_desktop_notification(message) {
        if (!Notification) {
            alert('Desktop notifications not available in your browser. Try Chromium.');
            return;
        }

        if (Notification.permission !== "granted")
            Notification.requestPermission();
        else {
            var notification = new Notification('You have New Message', {
                icon: 'img/nodejs.png',
                body: message,
            });

            notification.onclick = function () {
                window.open("/index");
            };

        }
    },
    play_single_sound: function () {
        document.getElementById('audiotag1').play();
    },
    saveActiveWindows: function (aId) {
        localStorage.setItem("activeWindow", aId);
    },
    loadEmotions: function () {
        $('.chat-body p').emoticonize({
            'animate': false
        });
    },
    emotionList: function () {
        return  '<p id="emotionList" class="text dropdown-menu">' +
                '<span class="css-emoticon ">:-)</span>' +
                '<span class="css-emoticon  spaced-emoticon">:)</span>' +
                '<span class="css-emoticon ">:o)</span>' +
                '<span class="css-emoticon ">:c)</span>' +
                '<span class="css-emoticon ">:^)</span>' +
                '<span class="css-emoticon ">:-D</span>' +
                '<span class="css-emoticon ">:-(</span>' +
                '<span class="css-emoticon ">:-9</span>' +
                '<span class="css-emoticon ">;-)</span>' +
                '<span class="css-emoticon ">:-P</span>' +
                '<span class="css-emoticon ">:-p</span>' +
                '<span class="css-emoticon ">:-Þ</span>' +
                '<span class="css-emoticon ">:-b</span>' +
                '<span class="css-emoticon ">:-O</span>' +
                '<span class="css-emoticon ">:-/</span>' +
                '<span class="css-emoticon ">:-X</span>' +
                '<span class="css-emoticon ">:-#</span>' +
                '<span class="css-emoticon ">:\'(</span>' +
                '<span class="css-emoticon ">B-)</span>' +
                '<span class="css-emoticon ">8-)</span>' +
                '<span class="css-emoticon ">:-\</span>' +
                '<span class="css-emoticon ">;*(</span>' +
                '<span class="css-emoticon ">:-*</span>' +
                '<span class="css-emoticon  spaced-emoticon">:]</span>' +
                '<span class="css-emoticon  spaced-emoticon">:&gt;</span>' +
                '<span class="css-emoticon  spaced-emoticon">=]</span>' +
                '<span class="css-emoticon  spaced-emoticon">=)</span>' +
                '<span class="css-emoticon  spaced-emoticon">8)</span>' +
                '<span class="css-emoticon  spaced-emoticon">:}</span>' +
                '<span class="css-emoticon  spaced-emoticon">:D</span>' +
                '<span class="css-emoticon  small-emoticon spaced-emoticon">8D</span>' +
                '<span class="css-emoticon  small-emoticon spaced-emoticon">XD</span>' +
                '<span class="css-emoticon  small-emoticon spaced-emoticon">xD</span>' +
                '<span class="css-emoticon  small-emoticon spaced-emoticon">=D</span>' +
                '<span class="css-emoticon  spaced-emoticon">:(</span>' +
                '<span class="css-emoticon  spaced-emoticon">:&lt;</span>' +
                '<span class="css-emoticon  spaced-emoticon">:[</span>' +
                '<span class="css-emoticon  spaced-emoticon">:{</span>' +
                '<span class="css-emoticon  spaced-emoticon">=(</span>' +
                '<span class="css-emoticon  spaced-emoticon">;)</span>' +
                '<span class="css-emoticon  spaced-emoticon">;]</span>' +
                '<span class="css-emoticon  spaced-emoticon">;D</span>' +
                '<span class="css-emoticon  spaced-emoticon">:P</span>' +
                '<span class="css-emoticon  spaced-emoticon">:p</span>' +
                '<span class="css-emoticon  spaced-emoticon">=P</span>' +
                '<span class="css-emoticon  spaced-emoticon">=p</span>' +
                '<span class="css-emoticon  spaced-emoticon">:b</span>' +
                '<span class="css-emoticon  spaced-emoticon">:Þ</span>' +
                '<span class="css-emoticon  spaced-emoticon">:O</span>' +
                '<span class="css-emoticon  small-emoticon spaced-emoticon">8O</span>' +
                '<span class="css-emoticon  spaced-emoticon">:/</span>' +
                '<span class="css-emoticon  spaced-emoticon">=/</span>' +
                '<span class="css-emoticon  spaced-emoticon">:S</span>' +
                '<span class="css-emoticon  spaced-emoticon">:#</span>' +
                '<span class="css-emoticon  spaced-emoticon">:X</span>' +
                '<span class="css-emoticon  spaced-emoticon">B)</span>' +
                '<span class="css-emoticon  small-emoticon spaced-emoticon">O:)</span>' +
                '</p>';
    },
    deleteAllChat: function () {
        var lMe = this;
        var toUser = $("#toUser").text();
        $.ajax({
            url: 'api/deletAllChat?user_Id=' + lMe.userData.id + '&toUser=' + toUser,
            type: 'get',
            success: function (data) {
                alert("Your chat has been deleted.")
                location.reload();
            }
        });
    },
    refreshchat: function () {
        console.log("zxczxc");
        window.location.href = window.location.href;
    },
    submitFileToServer: function () {

        $('#uploadForm').submit();

    },
    sendImageAndFileToInChat: function (data) {
        var lMe = this;
        var lCObj = $('.chatWindow-open');
        var msg = {};

        msg.email = lMe.userData.email;
        msg.text = escape($(lCObj).find('.chat-text').val().trim());
        msg.fromUser = $('#user').val().trim();
        msg.toUser = $(lCObj).find('.toUser').text().trim();
        msg.time = new Date().toISOString();
        msg.userImage = 'uploads/' + msg.fromUser + '.png';
        msg.room = msg.fromUser + '-' + msg.toUser;
        msg.fileName = data.fileName;
        msg.type = data.fileName.split('.').pop();
        msg.fileUrl = data.fileUrl;

        //$(lCObj).find('.chat-loader').show();

        // lMe.submitFileToServer();
        console.log(msg);
        lMe.socket.emit('chat image', msg, null);
    },
    deleteMsg: function () {
        var msgArray = [];
        $(".selected-msg").each(function () {
            msgArray.push($(this).attr('id'));
        });

        console.log(msgArray);
        $.ajax({
            type: 'POST',
            url: 'api/deleteMsg',
            data: {'msg': msgArray},
            success: function (data) {
                $(".selected-msg").remove();
                $(".acton-btn").hide();
            },
            error: function (data) {
                console.log("error");
                console.log(data);
            }
        });

    },
    getOlderMessage: function () {
        var lMe = this;
        var id = $("#msgPanel ul.chat li").first().attr("id");
        var toUser = $("#toUser").text();

        $.ajax({
            url: 'api/getOlderMessage?user_Id=' + lMe.userData.id + '&toUser=' + toUser + '&fromId=' + id + '&limit=20',
            type: 'get',
            success: function (data) {
                var t = $("#msgPanel");  // Window's current scroll position
                var height = t[0].scrollHeight;
                lMe.createMessageList(data);
                var height2 = t[0].scrollHeight;
                //console.log(height + "  ===  " + height2);
                $("#msgPanel").scrollTop(height2 - height);
            }
        });
    }
};
$(document).ready(function () {
    nodeChat.Chat._init();

});

document.addEventListener('DOMContentLoaded', function () {
    if (Notification.permission !== "granted")
        Notification.requestPermission();
});
