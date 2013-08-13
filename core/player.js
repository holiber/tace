;(function (ctx) {
	ctx.Player = Class.extend({
		
		init: function (name) {
			this.idx = null;
			this.name = name;
			this.game = null;
			this.object = null;
			this.cmdQueue = [];
		},
		
		addObject: function (gameObject) {
			if (!(gameObject instanceof GameObject)) throw 'invalid object';
			gameObject.player = this;
			this.object = gameObject;
		},
		
		emit: function (eventName, eventData) {
			this.game && this.game._receive(eventName, eventData, this);
		},
		
		_onStep: function () {
			
		},
		
		_onGame: function (game) {
			this.game = game;
		}
		
		
	});
})(window);