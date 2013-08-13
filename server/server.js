var sockets = require('socket.io');//.listen(8080);
var Class = require('./class-extend.js');

var DEFAULT_PORT = 8080;
var MAX_CONNECTIONS = 3;

var TYPE_GAME = 'game';
var TYPE_PAD = 'pad';
var TYPE_PLAYER = 'player';
var TYPE_TERMINAL = 'terminal';

var Game = Class.extend({
	
	init: function () {
		this.port = DEFAULT_PORT;
		this.io = null;
		this.connectionsCnt = 0;
		this.clients = {};
		this.gameClient = null;
		console.log('game inited');
	},
	
	listen: function () {
		console.log('wait connections');
		this.io = sockets.listen(this.port);
		this.io.on('connection', this._onConnection.bind(this));
	},
	
	addClient: function (socket) {
		this.connectionsCnt++;
		var client = new Client(this, socket)
		this.clients[socket.id] = client;
		client.auth();
	},
	
	removeClient: function (clientId) {
		delete this.clients[clientId];
		this.connectionsCnt--;
		console.log('client disconnected');
	},
	
	_onConnection: function (socket) {
		console.log('new connection');
		if (this.connectionsCnt == MAX_CONNECTIONS) {
			socket.emit('alert', {message: 'server is full'});
			return;
		}
		this.addClient(socket);
		//this.io.server.close();
	},
	
	_onGameConnected: function (client) {
		this.gameClient = client;
		console.log('game connected');
	},
	
	_onPadConnected: function (client) {
		client.socket.broadcast.emit('padConnected', {id: client.id});
	}
});


var Client = Class.extend({
	
	init: function (game, socket) {
		this.game = game;
		this.socket = socket;
		this.id = socket.id;
		this.isAuth = false;
		this.type = null;
		socket.on('auth', this._onAuth.bind(this));
		socket.on('echo', this._onEcho.bind(this));
		socket.on('disconnect', this._onDisconnect.bind(this));
		socket.on('padAction', this._onPadAction.bind(this));
	},
	
	auth: function () {
		this.socket.emit('authRequest', {id: this.socket.id});
	},
	
	die: function () {
		this.socket.broadcast.emit('padDisconnected', {padId: this.id});
		this.game.removeClient(this.id);
	},
	
	_onAuth: function (data) {
		this.type = data.type;
		switch (data.type) {
			case TYPE_GAME:
				this.isAuth = true;
				this.game._onGameConnected(this);
			break;
			
			case TYPE_PAD:
				console.log('pad connected');
				this.isAuth = true;
				this.game._onPadConnected(this);
			break;
			
			default:
				this.emit('alert', {message: 'wrong client type'});
			break;
			
		}
	},
	
	_onPadAction: function (action) {
		this.game.gameClient.socket.emit('padAction', {padId: this.id, action: action});
	},
	
	_onEcho: function (data) {
		this.socket.emit(data.eventName, data.eventBody);
	},
	
	_onDisconnect: function () {
		this.die();
	}
	
});

var game = new Game();
game.listen();