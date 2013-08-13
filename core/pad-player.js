;(function (ctx) {
	
	var NEW_GAME_TIMEOUT = 3000;
	var KEY = {
		W: 87,
		S: 83,
		A: 65,
		D: 68
	}
	
	ctx.PadPlayer = ctx.Player.extend({
		
		init: function (name) {
			this._super(name);
			this.pressedKeys = {};
		},
				
		_onGame: function (game) {
			this.game = game;
		},

		_onAction: function (action) {
			this.cmdQueue.unshift(action);
		},
		
		_onStep: function () {
			if (!this.object) {
				this.cmdQueue = [];
				return;
			}
			
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
			
			for (var i = 0 ; i < this.cmdQueue.length; i++) {
				var cmd = this.cmdQueue.pop();
				if (cmd.target == 'object') {
					if (!this.object[cmd.cmd]) throw 'method "' + cmd.cmd + '" not found';
					this.object[cmd.cmd](cmd.params);
				}
			}
		}
	
		
		
	});
})(window);