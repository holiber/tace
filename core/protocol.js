!function (ctx) {

	//var DEFAULT_SERVER = 'http://10.10.1.64:8080';
	
	var DEFAULT_SERVER = 'http://localhost:8080';
	
	ctx.Protocol = Class.extend({
		
		init: function (game) {
			this.game = game;
			this.serverAddr = DEFAULT_SERVER;
			this.socket = null;
		},
		
		connect: function () {
			console.log('try to connect: "' + this.serverAddr + '"');
			this.socket = io.connect(this.serverAddr);
			this.socket.on('connect', this._onConnect.bind(this));
			this.socket.on('alert', this._onAlert.bind(this));
			this.socket.on('authRequest', this._onAuthRquest.bind(this));
			this.socket.on('padConnected', this._onPadConnected.bind(this));
			this.socket.on('padDisconnected', this._onPadDisonnected.bind(this));
			this.socket.on('padAction', this._onPadAction.bind(this));
		},
		
		echo: function (eventName, eventBody) {
			this.socket.emit('echo', {eventName: eventName, eventBody: eventBody});
		},
		
		_onConnect: function () {
			console.log('connected');
		},
		
		_onAlert: function (data) {
			alert(data.message);
		},
		
		_onAuthRquest: function () {
			this.socket.emit('auth', {type: 'game'});
		},
		
		_onPadConnected: function (data) {
			var padId = data.id;
			var player = new PadPlayer('Pad player ' + padId);
			var plane = new Plane('plane ' + padId);
			var x = Math.random() * this.game.camera.width;
			var y = Math.random() * this.game.camera.height;
			this.game.add(plane, x, y);
			this.game.addPlayer(player, padId);
			player.addObject(plane);
			console.log('pad connected');
		},
		
		_onPadDisonnected: function (data) {
			this.game.removePlayer(data.padId);
			console.log('pad disconnected');
		},
		
		_onPadAction: function (data) {
			var player = this.game.players[data.padId];
			player._onAction(data.action);
		}
		
		
		
	});
	
}(window);

