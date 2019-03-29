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
            document.getElementById('info').textContent = 'get yourself a nickname :)';
            document.getElementById('nickWrapper').style.display = 'block';
            document.getElementById('nicknameInput').focus();
        });

        this.socket.on('nickExisted', function () {
            document.getElementById('info').textContent = '!nickname is taken, choose another pls';
        });

        this.socket.on('loginSuccess', function () {
            document.title = 'chat | ' + document.getElementById('nicknameInput').value;
            document.getElementById('loginWrapper').style.display = 'none';// hide the wrapper,and show the 
            //document.getElementById('messageInput').focus();//让消息输入框获得焦点
        });

        this.socket.on('system', function (nickName, userCount, type) {
            //show the login/out info
            if(nickName){
                var msg = nickName + (type == 'login' ? ' joined' : ' left');
                var p = document.createElement('p');
                p.textContent = msg;
                p.setAttribute('class','system');
                document.getElementById('historyMsg').appendChild(p);
                //console.log(userCount);
                //that._displayNewMsg('system ', msg, 'red');
                document.getElementById('status').textContent = userCount + (userCount > 1 ? ' users' : ' user') + ' online';
            }            
        });

        this.socket.on('newMsg', function(user, msg) {
            that._displayNewMsg(user, msg);
        });

        document.getElementById('sendBtn').addEventListener('click',function(){
            var msgInput = document.getElementById('messageInput');
            var msg = msgInput.value;
            msgInput.value = '';
            //msgInput.focus();
            if (msg.trim().length>0){
                that.socket.emit('postMsg',msg);
                that._displayNewMsg('me',msg);
            };
        },false);


        document.getElementById('loginBtn').addEventListener('click', function () {
            var nickName = document.getElementById('nicknameInput').value;
            if (nickName.trim().length != 0) {
                // send login
                that.socket.emit('login', nickName);
            } else {
                document.getElementById('nicknameInput').focus();
            };
        }, false);
    },

    _displayNewMsg: function(user, msg, color) {
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span>' + msg;
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    }
};

