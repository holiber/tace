;(function (ctx) {
	
	ctx.Bullet = GameObject.extend({
		
		init: function (parent, damage) {
			this._super();
			this.type = 'bullet';
			this.parent = parent;
			this.hp = 20;
			this.damage = damage || 0;
			this.impulse = 4;
			this.fixDef = new Game.B2FixtureDef();
			this.bodyDef = new Game.B2BodyDef();
			this.fixDef.density = 4.0;
			this.fixDef.friction = 0.1;
			this.fixDef.restitution = 0.9;
			this.fixDef.shape = new Game.B2CircleShape(0.1);
			this.fixturesDef = [this.fixDef];
			this.bodyDef.type = Game.B2Body.b2_dynamicBody;
			this.bodyDef.isBullet = true;
		},
		
		fire: function (game, angle, position) {
			game.add(this, position.x, position.y);
			this.body.ApplyImpulse(new Game.B2Vec2(Math.sin(angle) * this.impulse, Math.cos(angle) * (-this.impulse)), this.body.GetWorldCenter());
		},
		
		_onContact: function () {
			if (this.isDead) return;
			this.hp -= 10;
			if (this.hp <= 0) this.die();
		}
		
	});
})(window);