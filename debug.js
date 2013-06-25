// begin socket control
var socket;

//Initialize function
var init = function () {
    // FIXME:: Localtest url
    //socket = io.connect('127.0.0.1:3000');
    socket = io.connect('http://192.168.1.168:3000');

    socket.emit('connect', {
        role: 'page',
        user: remoteDubuggerUser
    });

    socket.on('exc', function(data) {
    	console.log('executing code !');
    	remoteExc(data.code);
    });
};

init();

function remoteExc(data) {
	var result;

	// fixme: execute code
	// eval(data.code);

	console.log('get code ' + data);

	try {
		result = eval('(' + data + ')');
	} catch(e) {
		result = 'error';
	}

	console.log(result);

	socket.emit('result', {
		role: 'client',
        user: remoteDubuggerUser,
        result: result
	});

}

