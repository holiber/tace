;(function (ctx) {
	
	ctx.GameObject = Class.extend({
		
		init: function () {
			this.type = 'gameObect';
			this.name = 'unnamed';
			this.game = null;
			this.fixturesDef = null;
			this.bodyDef = null;
			this.body = null;
			this.player = null;
			this.hp = 100;
			this.isDead = false;
		},
		
		emit: function (eventName, data) {
			this.game && this.game._receive(eventName, data, this);
		},
		
		die: function () {
			this.isDead = true;
		}
	});
	
})(window);