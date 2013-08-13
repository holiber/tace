;(function (ctx) {
	
	ctx.BioRocket = GameObject.extend({
		
		init: function (parent, damage) {
			this._super();
			this.type = 'bioRocket';
			this.parent = parent;
			
			this.hp = 500;
			this.accelForce = 12;
			this.rotationStep = 1.8;
			this.rotationAngularDamping = 4;
			
			this.target = null;
			this.damage = damage || 0;
			this.fixDef = new Game.B2FixtureDef();
			this.bodyDef = new Game.B2BodyDef();
			this.fixDef.density = 3.0;
			this.fixDef.friction = 0.3;
			this.fixDef.restitution = 0.5;
			this.fixDef.shape = new Game.B2CircleShape(0.2);
			this.fixturesDef = [this.fixDef];
			this.bodyDef.type = Game.B2Body.b2_dynamicBody;
			this.bodyDef.isBullet = true;
		},
		
		fire: function (game, angle, position) {
			game.add(this, position.x, position.y, function () {
				this.body.SetAngle(angle);
			});
		},
		
		_onStep: function () {
			var worldCenter = this.body.GetWorldCenter()
			var angle = this.body.GetAngle();
			var targetAngle = Game.utils.getSegmentAngle(worldCenter, this.parent.aimPoint);
			var angleDistance = Game.utils.getAngleDistance(angle, targetAngle);
			//console.log(this.parent.aimPoint, angle, targetAngle, angleDistance);
			
			angle = (angleDistance > 0) ? angle + this.rotationStep : angle - this.rotationStep;
			this.body.SetAngle(angle);
			this.body.ApplyForce(new Game.B2Vec2(Math.sin(angle) * this.accelForce, Math.cos(angle) * (-this.accelForce)), worldCenter);
		},
		
		_onContact: function (fixture) {
			if (this.isDead) return;
			var object = fixture.GetBody().GetUserData();
			if (object && object.damage && object.type != 'bioRocket') {
				this.die();
				return;
			}
			this.hp -= 10;
			if (this.hp <= 0) this.die();
		}
		
	});
})(window);