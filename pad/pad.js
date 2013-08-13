!function (ctx) {

	var DEFAULT_SERVER = 'http://192.168.1.2:8080';
	//var DEFAULT_SERVER = 'http://localhost:8080';
	var STATE_OFFLINE = 'offline';
	var STATE_ONLINE = 'online';
	var STATE_CONNECTION = 'connection';
	
	var KEY = {
		W: 87,
		S: 83,
		A: 65,
		D: 68,
		SPACE: 32,
		ENTER: 13
	}
	
	ctx.Pad = Class.extend({
		
		init: function ($el) {
			this.$el = $el;
			this.serverAddr = DEFAULT_SERVER;
			this.socket = null;
			this.state = STATE_OFFLINE;
			this.pressedKeys = {};
			this.$el.on('mousedown', '.btn', this._onBtn.bind(this));
			this.$el.on('mouseup', '.btn', this._onBtn.bind(this));
			$(window).off('.pad');
			$(window).on('keydown.pad', this._onBtn.bind(this));
			$(window).on('keyup.pad', this._onBtn.bind(this));
			this.blinkingIntervalId = null;
		},
		
		connect: function () {
			//console.log('try to connect: "' + this.serverAddr + '"');
			this.socket && this.socket.disconnect();
			this.socket = io.connect(this.serverAddr);
			this.socket.on('connect', this._onConnect.bind(this));
			this.socket.on('alert', this._onAlert.bind(this));
			this.socket.on('authRequest', this._onAuthRequest.bind(this));
			this.state = STATE_CONNECTION;
			this.blinkingIntervalId && clearInterval(this.blinkingIntervalId);
			this.blinkingIntervalId = setInterval(function () {
				this.$el.find('.indicator').toggleClass('try');
			}.bind(this), 500);
		},
		
		echo: function (eventName, eventBody) {
			this.socket.emit('echo', {eventName: eventName, eventBody: eventBody});
		},
		
		_onBtn: function (e) {
			console.log(e.type);
			var action = $(e.currentTarget).attr('rel');
			if (action == 'connect' && e.type == 'mousedown') {
				this.connect();
				return false;
			}
			if (this.state != STATE_ONLINE) return;
			var padAction = null;
			if (e.type == 'mousedown') {
				switch (action) {
					case 'up':
						padAction = {target: 'object', cmd: 'accelerate'};
					break;
					case 'right':
						padAction = {target: 'object', cmd: 'rotateCW'};
					break;
					case 'left':
						padAction = {target: 'object', cmd: 'rotateCCW'};
					break;
					case 'down':
						padAction = {target: 'object', cmd: 'reverse'};
					break;
					case 'fire':
						padAction = {target: 'object', cmd: 'fire'};
					break;
				}
			}
			
			if (e.type == 'mouseup') {
				switch (action) {
					case 'up':
						padAction = {target: 'object', cmd: 'stopAccelerate'};
					break;
					case 'right':
						padAction = {target: 'object', cmd: 'stopRotate'};
					break;
					case 'left':
						padAction = {target: 'object', cmd: 'stopRotate'};
					break;
					case 'down':
						padAction = {target: 'object', cmd: 'stopAccelerate'};
					break;
//					case 'fire':
//						padAction = {target: 'object', cmd: 'fire'};
//					break;
				}
			}
			
			if (e.type == 'keydown' || e.type == 'keyup') {
				switch (e.keyCode) {

					case KEY.W:
						if (e.type == 'keyup') {
							this.pressedKeys[KEY.W] = false;
							padAction = {target: 'object', cmd: 'stopAccelerate'};
						}

						if (e.type == 'keydown') {
							if (this.pressedKeys[KEY.W]) return;
							this.pressedKeys[KEY.W] = true;
							padAction = {target: 'object', cmd: 'accelerate'};
						}
					break;

					case KEY.S:
						if (e.type == 'keyup') {
							this.pressedKeys[KEY.S] = false;
							padAction = {target: 'object', cmd: 'stopAccelerate'};
						}

						if (e.type == 'keydown') {
							if (this.pressedKeys[KEY.S]) return;
							this.pressedKeys[KEY.S] = true;
							padAction = {target: 'object', cmd: 'reverse'};
						}
					break;

					case KEY.D:
						if (e.type == 'keyup') {
							this.pressedKeys[KEY.D] = false;
							padAction = {target: 'object', cmd: 'stopRotate'};
						}

						if (e.type == 'keydown') {
							if (this.pressedKeys[KEY.D]) return;
							this.pressedKeys[KEY.D] = true;
							padAction = {target: 'object', cmd: 'rotateCW'};
						}
					break;

					case KEY.A:
						if (e.type == 'keyup') {
							this.pressedKeys[KEY.A] = false;
							padAction = {target: 'object', cmd: 'stopRotate'};
						}

						if (e.type == 'keydown') {
							if (this.pressedKeys[KEY.A]) return;
							this.pressedKeys[KEY.A] = true;
							padAction = {target: 'object', cmd: 'rotateCCW'};
						}
					break;
					
					case KEY.SPACE:
					case KEY.ENTER:
						if (e.type == 'keyup') {
							this.pressedKeys[KEY.SPACE] = false;
						}

						if (e.type == 'keydown') {
							if (this.pressedKeys[KEY.SPACE]) return;
							this.pressedKeys[KEY.SPACE] = true;
							padAction = {target: 'object', cmd: 'fire'};
						}
					break;
				}
			}
			

			if (padAction) this.socket.emit('padAction', padAction);
		},
		
		_onConnect: function () {
			//console.log('connected');
			clearInterval(this.blinkingIntervalId);
			this.$el.find('.indicator').removeClass('try').addClass('ok');
			this.state = STATE_ONLINE;
		},
		
		_onAlert: function (data) {
			alert(data.message);
		},
		
		_onAuthRequest: function () {
			this.socket.emit('auth', {type: 'pad'});
		},
		
		_onPadAction: function (data) {
			this.game.objects[1].fire();
		}
		
	});
	
}(window);