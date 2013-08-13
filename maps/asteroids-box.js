(function (ctx) {
	
	ctx.Game.maps['asteroidsBox'] = Map.extend({
		init: function (game) {
			this._super(game);
			this.name = 'asteroidsBox';
		},
		
		create: function () {
			var fixDef = new Game.B2FixtureDef();
			fixDef.density = 1.0;
			fixDef.friction = 0.5;
			fixDef.restitution = 0.2;
			var bodyDef = new Game.B2BodyDef();
			bodyDef.type = Game.B2Body.b2_staticBody;
			fixDef.shape = new Game.B2PolygonShape;
			fixDef.shape.SetAsBox(this.game.camera.width, 2);
			bodyDef.position.Set(this.game.camera.width / 2 , this.game.camera.height + 1.8);
			this.game.world.CreateBody(bodyDef).CreateFixture(fixDef);
			bodyDef.position.Set(this.game.camera.width / 2, -1.8);
			this.game.world.CreateBody(bodyDef).CreateFixture(fixDef);
			bodyDef.position.Set(-1.8, 0);
			fixDef.shape.SetAsBox(2, this.game.camera.height);
			this.game.world.CreateBody(bodyDef).CreateFixture(fixDef);
			bodyDef.position.Set(this.game.camera.width + 1.8, 0);
			this.game.world.CreateBody(bodyDef).CreateFixture(fixDef);
			for (var i = 10; i--;) {
				this.game.add(new Asteroid(Math.random() + 0.5), Math.random() * this.game.camera.width, Math.random() * this.game.camera.height);
			}
		}
		
	});
	
})(window)