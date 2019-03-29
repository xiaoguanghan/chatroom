var express = require('express'),
    app = express(),
    server = require("http").createServer(app),
    io = require('socket.io').listen(server);
users = [];
app.use('/', express.static(__dirname + '/'));
server.listen(process.env.PORT || 80);
console.log('server up');

io.on('connection', (socket) => {
    socket.on('login', (nickname) => {
        //detecting  login issue
        if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        } else {
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            io.sockets.emit('system', nickname, users.length, 'login'); //broadcast new user
        };
    });

    //user quit
    socket.on('disconnect', function () {
        //delet user
        users.splice(users.indexOf(socket.nickname), 1);
        //brocast
        socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
    });

    //broadcase Msg
    socket.on('postMsg', function (msg, color) {       
        socket.broadcast.emit('newMsg', socket.nickname, msg, color);
    });

    socket.on('img', function(imgData, color) {
        socket.broadcast.emit('newImg', socket.nickname, imgData, color);
    });
});