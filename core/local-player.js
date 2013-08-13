;(function (ctx) {
	
	var NEW_GAME_TIMEOUT = 3000;
	
	var KEY = {
		W: 87,
		S: 83,
		A: 65,
		D: 68,
		SPACE: 32
	}
	
	ctx.LocalPlayer = ctx.Player.extend({
		
		init: function (name) {
			this._super(name);
			this.pressedKeys = {};
			this.worldMouseX = 0;
			this.worldMouseY = 0;
			this.oldWorldMouseX = 0;
			this.oldWorldMouseY = 0;
		},

		_onStep: function () {
			if (!this.object) {
				this.cmdQueue = [];
				return;
			}

			//player respawn
			if (this.object.isDead) {
				this.emit('playerDie');
				delete this.object;
				this.cmdQueue = [];
				setTimeout(function () {
					var plane = new Plane('plane ' + this.id);
					var x = Math.random() * this.game.camera.width;
					var y = Math.random() * this.game.camera.height;
					this.game.add(plane, x, y);
					this.addObject(plane);
				}.bind(this), NEW_GAME_TIMEOUT);
				return;
			}
			if (this.oldWorldMouseX != this.worldMouseX || this.oldWorldMouseY != this.worldMouseY) {
				this.cmdQueue.unshift({target: 'object', cmd: 'aim', params: {targetX: this.worldMouseX, targetY: this.worldMouseY}});
			}
			
			for (var i = 0 ; i < this.cmdQueue.length; i++) {
				var cmd = this.cmdQueue.pop();
				if (cmd.target == 'object') {
					if (!this.object[cmd.cmd]) throw 'method "' + cmd.cmd + '" not found';
					this.object[cmd.cmd](cmd.params);
				}
			}
		},
		
		_onGame: function (game) {
			this.game = game;
			this._attachControllEvents();
		},
		
		_attachControllEvents: function () {
			var namespace = '.' + 'player' + this.idx;
			this.game.$eventLayer.on('keydown' + namespace, this._onKeyEvent.bind(this));
			this.game.$eventLayer.on('keyup' + namespace, this._onKeyEvent.bind(this));
			this.game.$eventLayer.on('mousedown' + namespace, this._onKeyEvent.bind(this));
			this.game.$eventLayer.on('contextmenu' + namespace, this._onKeyEvent.bind(this));
			this.game.$eventLayer.on('mousemove' + namespace, this._onKeyEvent.bind(this));
		},
		
		_onKeyEvent: function (e) {
			
			if (e.type == 'mousemove') {
				this.oldWorldMouseX = this.worldMouseX;
				this.oldWorldMouseY = this.worldMouseY;
				this.worldMouseX = e.offsetX * this.game.camera.scale;
				this.worldMouseY = e.offsetY * this.game.camera.scale;
			}
			
			if (e.type == 'contextmenu') {
				var targetX = e.offsetX * this.game.camera.scale;
				var targetY = e.offsetY * this.game.camera.scale;
				this.cmdQueue.unshift({target: 'object', cmd: 'fire', params: {gun: 'laserRocket', targetX: targetX, targetY: targetY}});
				return false;
			}
			
			if (e.type == 'mousedown') {
				var targetX = e.offsetX * this.game.camera.scale;
				var targetY = e.offsetY * this.game.camera.scale;
				if (e.button == 0) this.cmdQueue.unshift({target: 'object', cmd: 'fire', params: {targetX: targetX, targetY: targetY}});
				if (e.button == 1) this.cmdQueue.unshift({target: 'object', cmd: 'fire', params: {gun: 'bioRocket', targetX: targetX, targetY: targetY}});
				return;
			}
			
			switch (e.keyCode) {
				
				case KEY.SPACE:
					if (e.type == 'keyup') {
						this.pressedKeys[KEY.SPACE] = false;
					}
					
					if (e.type == 'keydown') {
						if (this.pressedKeys[KEY.SPACE]) return;
						this.pressedKeys[KEY.SPACE] = true;
						this.cmdQueue.unshift({target: 'object', cmd: 'fire'});
					}
					
				break;
				
				case KEY.W:
					if (e.type == 'keyup') {
						this.pressedKeys[KEY.W] = false;
						this.cmdQueue.unshift({target: 'object', cmd: 'stopAccelerate'});
					}
					
					if (e.type == 'keydown') {
						if (this.pressedKeys[KEY.W]) return;
						this.pressedKeys[KEY.W] = true;
						this.cmdQueue.unshift({target: 'object', cmd: 'accelerate'});
					}
				break;
				
				case KEY.S:
					if (e.type == 'keyup') {
						this.pressedKeys[KEY.S] = false;
						this.cmdQueue.unshift({target: 'object', cmd: 'stopAccelerate'});
					}
					
					if (e.type == 'keydown') {
						if (this.pressedKeys[KEY.S]) return;
						this.pressedKeys[KEY.S] = true;
						this.cmdQueue.unshift({target: 'object', cmd: 'reverse'});
					}
				break;
				
				case KEY.D:
					if (e.type == 'keyup') {
						this.pressedKeys[KEY.D] = false;
						this.cmdQueue.unshift({target: 'object', cmd: 'stopRotate'});
					}
					
					if (e.type == 'keydown') {
						if (this.pressedKeys[KEY.D]) return;
						this.pressedKeys[KEY.D] = true;
						this.cmdQueue.unshift({target: 'object', cmd: 'rotateCW'});
					}
				break;
				
				case KEY.A:
					if (e.type == 'keyup') {
						this.pressedKeys[KEY.A] = false;
						this.cmdQueue.unshift({target: 'object', cmd: 'stopRotate'});
					}
					
					if (e.type == 'keydown') {
						if (this.pressedKeys[KEY.A]) return;
						this.pressedKeys[KEY.A] = true;
						this.cmdQueue.unshift({target: 'object', cmd: 'rotateCCW'});
					}
				break;
			}
		}
		
		
	});
})(window);