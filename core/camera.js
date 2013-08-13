(function (ctx) {
	
	var DEFAULT_SCALE = 1 / 30;
	
	ctx.Camera = Class.extend({
	
		init: function (game) {
			this.game = game;
			this.scale = DEFAULT_SCALE;
			this.screenWidth = $(window).width() - 40;
			this.screenHeight = $(window).height() - 40;
			this.width = this.screenWidth * this.scale;
			this.height = this.screenHeight * this.scale;
		}
		
	});
	
})(window)