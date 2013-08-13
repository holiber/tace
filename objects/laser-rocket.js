;(function (ctx) {
	
	ctx.LaserRocket = GameObject.extend({
		
		init: function (parent, damage) {
			this._super();
			this.type = 'laserRocket';
			this.parent = parent;
			
			this.hp = 10;
			this.accelForce = 15;
			this.impulse = 10;
			this.rotationStep = 0.1;
			this.maxSpeed = 90;
			
			this.isFirstStep = true;
			this.hasTarget = true;
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
			this.bodyDef.AngularDamping = 4;
			this.bodyDef.isBullet = true;
		},
		
		fire: function (game, angle, position) {
			game.add(this, position.x, position.y, function () {
				this.body.SetAngle(angle);
			});
		},
		
		_onStep: function () {
			if (!this.hasTarget) return;
			var worldCenter = this.body.GetWorldCenter();
			this.target = this.parent.aimPoint;
			var angle = this.body.GetAngle();
			var velocity = this.body.GetLinearVelocity();
			var velocityLength = velocity.Length();
			
			if (this.isFirstStep) {
				this.isFirstStep = false;
				var impulseVec = Game.utils.getVec(this.impulse, angle);
				this.body.ApplyImpulse(impulseVec, worldCenter);
				return;
			}

			if (velocityLength > this.maxSpeed) this.hasTarget = false;
			if (this.hasTarget) {
				var targetAngle = Game.utils.getSegmentAngle(worldCenter, this.target);
				var angleDistance = Game.utils.getAngleDistance(angle, targetAngle);
				var step = (Math.abs(angleDistance) > this.rotationStep) ? this.rotationStep : Math.abs(angleDistance);

				angle = (angleDistance > 0) ? angle + step : angle - step;
				velocity.x = velocityLength * Math.sin(angle);
				velocity.y = (-velocityLength) * Math.cos(angle);
				this.body.SetAngle(angle);
				this.body.ApplyForce(new Game.B2Vec2(Math.sin(angle) * this.accelForce, Math.cos(angle) * (-this.accelForce)), worldCenter);
			}

			this.body.SetLinearVelocity(new Game.B2Vec2(velocity.x, velocity.y));
		},
		
		_onContact: function () {
			if (this.isDead) return;
			this.hp -= 10;
			if (this.hp <= 0) this.die();
		}
		
	});
})(window);