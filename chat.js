$(document).ready(function () {

    window.onload = function () {
        var chat = new Chat();
        chat.init();
    };

    //define chat
    var Chat = function () {
        this.socket = null;
    };

    Chat.prototype = {
        init: function () {
            var that = this;
            //establish socket
            this.socket = io.connect();
            //listen 
            this.socket.on('connect', function () {
                //show nickname input
                document.getElementById('info').textContent = "What's your name?";
                document.getElementById('nickWrapper').style.display = 'block';
                document.getElementById('nicknameInput').focus();
            });

            this.socket.on('nickExisted', function () {
                document.getElementById('info').textContent = '!nickname is taken, choose another pls';
            });

            this.socket.on('loginSuccess', function () {
                name = document.getElementById('nicknameInput').value;
                document.title = 'chat | ' + name;
                $("#info").hide(10);
                document.getElementById('info').textContent = `Hello,${name}`;
                $("#info").fadeIn(600);
                $("#nickWrapper").fadeOut(100);
                setTimeout(function () {
                    document.getElementById('loginWrapper').style.display = 'none';// hide the wrapper,and show the 
                    document.getElementById('messageInput').focus();//refocus on MsgInput
                }, 1300);
            });

            this.socket.on('system', function (nickName, userCount, type) {
                //show the login/out info
                if (nickName) {
                    var msg = nickName + (type == 'login' ? ' joined' : ' left');
                    var p = document.createElement('p');
                    p.textContent = msg;
                    p.setAttribute('class', 'system');
                    document.getElementById('historyMsg').appendChild(p);
                    document.getElementById('status').textContent = userCount + (userCount > 1 ? ' users' : ' user') + ' online';
                };
            });

            this.socket.on('newMsg', function (user, msg, color) {
                that._displayNewMsg(user, msg, color);
            });

            this.socket.on('newImg', function (user, img, color) {
                that._displayImage(user, img, color);
            });

            document.getElementById('sendBtn').addEventListener('click', function () {
                var messageInput = document.getElementById('messageInput'),
                    msg = messageInput.value,
                    color = document.getElementById('colorStyle').value;
                messageInput.value = '';
                messageInput.focus();
                if (msg.trim().length != 0) {
                    that.socket.emit('postMsg', msg, color);
                    that._displayNewMsg('me', msg, color);
                    return;
                };
            }, false);

            // Enter key send
            document.getElementById('messageInput').addEventListener('keyup', function (e) {
                var messageInput = document.getElementById('messageInput'),
                    msg = messageInput.value;
                color = document.getElementById('colorStyle').value;
                if (e.keyCode == 13 && msg.trim().length != 0) {
                    messageInput.value = '';
                    that.socket.emit('postMsg', msg, color);
                    that._displayNewMsg('me', msg, color);
                };
            }, false);

            document.getElementById('sendImage').addEventListener('change', function () {
                if (this.files.length != 0) {
                    var file = this.files[0],
                        reader = new FileReader(),
                        color = document.getElementById('colorStyle').value;
                    if (!reader) {
                        that._displayNewMsg('system', '!your browser doesn\'t support fileReader', 'red');
                        this.value = '';
                        return;
                    };
                    reader.onload = function (e) {
                        this.value = '';
                        that.socket.emit('img', e.target.result, color);
                        that._displayImage('me', e.target.result, color);
                    };
                    reader.readAsDataURL(file);
                };
            }, false);

            document.getElementById('loginBtn').addEventListener('click', function () {
                var nickName = document.getElementById('nicknameInput').value;
                if (nickName.trim().length != 0) {
                    // send login
                    that.socket.emit('login', nickName);
                } else {
                    document.getElementById('nicknameInput').focus();
                };
            }, false);

            document.getElementById('nicknameInput').addEventListener('keyup', function (e) {
                if (e.keyCode == 13) {
                    var nickName = document.getElementById('nicknameInput').value;
                    if (nickName.trim().length != 0) {
                        that.socket.emit('login', nickName);
                    };
                };
            }, false);
        },

        _displayNewMsg: function (user, msg, color) {
            var container = document.getElementById('historyMsg'),
                msgToDisplay = document.createElement('p'),
                date = new Date().toTimeString().substr(0, 8);
            msgToDisplay.style.color = color || '#100';
            msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span>' + msg;
            container.appendChild(msgToDisplay);
            container.scrollTop = container.scrollHeight;
        },

        _displayImage: function (user, imgData, color) {
            var container = document.getElementById('historyMsg'),
                msgToDisplay = document.createElement('p'),
                date = new Date().toTimeString().substr(0, 8);
            msgToDisplay.style.color = color || '#000';
            msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
            container.appendChild(msgToDisplay);
            container.scrollTop = container.scrollHeight;
        }
    };

    $('#info').animate({
        padding: '20px'
    }, 400);
});	