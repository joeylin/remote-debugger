/**
 * Module dependencies.
 */

var express = require('express'), // web framework
    http = require('http'), // Web Server
    sio = require('socket.io'), // Socket.io
    fs = require('fs'), // File system
    path = require('path'); // Path

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
    app.use(express.errorHandler());
}

var pages = {};
var debuggers = {};
var user = '';

app.get('/debug.js', function(req, res) {

    if (typeof req.param("user") !== 'undefined') {
        user = req.param("user");
        console.log("[Server] USER: " + user);
    }

    res.writeHead(200, {
        'Content-Type': 'application/javascript'
    });

    var socketStraem = fs.createReadStream('./node_modules/socket.io/node_modules/socket.io-client/dist/socket.io.min.js');

    socketStraem.on('data', function(data) {
        console.log("socket.io : ");
        res.write(data);
    });

    socketStraem.on('close', function() {
        var buffer = new Buffer('var remoteDubuggerUser = "' + user + '"; ');
        console.log('add userinfo');
        res.write(buffer);
    });

    socketStraem.on('close', function() {
        var debugStraem = fs.createReadStream('./debug.js');
        debugStraem.on('data', function(data) {
            console.log("webslide : me");
            res.write(data);
        });

        debugStraem.on('close', function() {
            res.end();
        });

    });
});

// Start server
var io = sio.listen(http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
}));

io.set('authorization', function(hsData, accept) {
    console.log('name');
    return accept(null, true);
});


// Start socket.io
io.sockets.on('connection', function(socket) {

    socket.on('connect', function(data) {
        if (data.role && data.role === 'page') {
            console.log('page add');
            pages[data.user] = socket.id;
        } else {
            console.log('debugger add ' + data.user + ' ' + socket.id);
            if (!debuggers[data.user]) {
                debuggers[data.user] = [];
            }
            debuggers[data.user].push(socket.id);
        }

        console.log(data.user + ': ' + data.user + ' add!');
    });

    socket.on('disconnect', function() {
        console.log('[Server] disconnect');
    });

    socket.on('exc', function(data) {
        console.log('[Server] code ' + data.code);
        //io.sockets.socket(sockets[data]).emit('start', data);
        if (!pages[data.user]) {
            //socket.emit('alert', 'page has disconnected !');
            return false;
        }

        console.log(pages[data.user], 'exc');
        io.sockets.socket(pages[data.user]).emit('exc', data);
    });

    socket.on('result', function(data) {
        console.log('[page] result ' + data.result);
        console.log(debuggers[data.user]);
        if (!debuggers[data.user]) {
            //socket.emit('alert', 'page has disconnected !')
            return false;
        }
        var len = debuggers[data.user].length;
        for (var i = 0; i < len; i++) {
            console.log(debuggers[data.user][i], 'result');
            console.log(io.sockets.socket(debuggers[data.user][i]).id, 'result...');
            io.sockets.socket(debuggers[data.user][i]).emit('result', data);
        }
    });
});
