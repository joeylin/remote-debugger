var user = '';
var socket;

function login() {
    user = $('#userId').val();
    if (user !== '') {
        console.log("[Controller] login: " + user);
        $('#userstate').attr('class', 'label label-success').html('logined');
        socket.emit('connect', {
            role: 'debugger',
            user: user
        });
    }
}

function showResult(data) {
    // add to page
    var tpl = '<span class="console-result"></span>';
    $(tpl).text(data).prependTo('.console-show');
}

function send(data) {
    if (user.length === 0) {
        return false;
    } else {
        socket.emit('exc', {
            user: user,
            code: data
        });
    }
}

//Initialize function
var init = function () {
    var portStr;
    var port = (location.port || location.host.split(':')[1] );
    if ( !port || port.length === 0 ) {
        portStr = '';
    } else {
        portStr = ':' + port;
    }
    var url = 'http://' + ( location.host || 'localhost' ).split( ':' )[0] + portStr;

    socket = io.connect(url);

    

    socket.on('connect', function (data) {
        $('#state').attr('class', 'label label-success').html('connected');
    });

    socket.on('disconnect', function (data) {
        socket.socket.reconnect();
        $('#state').attr('class', 'label label-important').html('disconnect');
    });

    socket.on('server', function (data) {
        console.log("[Controller] " + data);
        //socket.emit('client', 'Controller connection success');
        $('.label-success').html('connedted');
    });

    socket.on('result', function(data) {
        console.log('[result] ' + data.result);
        showResult(data.result);
    });
};
$(document).ready(init);

$('.login').on('click', login);
$('.code-send').on('click', function() {
    var data = $('.code-input').val();
    send(data);
    return false;
});



