;(function (ctx) {
	
	ctx.Plane = GameObject.extend({
		
		init: function (name) {
			this._super();
			this.type = 'plane';
			if (name) this.name = name;
			
			this.maxHp = 100;
			this.hp = this.maxHp;
			this.maxSpeed = 15;
			this.accelForce = 15;
			this.torqueForce = 5;
			this.rotationAngularDamping = 4;
			this.angularDamping = 0.2;
			
			this.gunDamage = 40;
			this.rocketDamage = 100;
			this.gunRecoil = 1;
			this.gunRange = 0.1;
			this.gunDistance = 0.4;
			this.gunMaxTurning = 0.5;
			
			this.derbisCnt = 6;
			this.derbisRange = 2;
			this.derbisImpulse = 1;
			this.derbisDistance = 0.8;
			this.derbisScale = 0.2;
			this.derbisScaleRange = 0.1;
			
			this.isAccelerate = false;
			this.isReverse = false;
			this.isRotateCW = false;
			this.isRotateCCW = false;
			this.aimPoint = null;
			
			var fixDef = new Game.B2FixtureDef();
			fixDef.density = 1.0;
			fixDef.friction = 0.5;
			fixDef.restitution = 0.2;
			fixDef.shape = new Game.B2PolygonShape;
			fixDef.shape.SetAsArray([
				new Game.B2Vec2(1, 0),
				new Game.B2Vec2(1.5, 1.5),
				new Game.B2Vec2(1, 2),
				new Game.B2Vec2(0.5, 1.5)
			]);
			this.bodyDef = new Game.B2BodyDef();
			this.bodyDef.type = Game.B2Body.b2_dynamicBody;
			this.bodyDef.angularDamping = this.angularDamping;
			this.bodyDef.linearDamping = 0.2;
			this.fixturesDef = [fixDef];
		},
		
		fire: function (params) {
			params = $.extend({gun: 'machinegun', targetX: undefined, targetY: undefined}, params);
			var targetPosition = (params.targetX !== undefined && params.targetY !== undefined) ? new Game.B2Vec2(params.targetX, params.targetY) : null;
			var gunPosition = this.body.GetWorldPoint(new Game.B2Vec2(1, 0));
			var angle = this.body.GetAngle();
			gunPosition.x += Math.sin(angle) * this.gunDistance;
			gunPosition.y += Math.cos(angle) * (-this.gunDistance);
			var gunAngle = angle;
			
			if (targetPosition) {
				var targetAngle = Game.utils.getSegmentAngle(gunPosition, targetPosition);
				var gunTurning = Game.utils.getAngleDistance(angle, targetAngle);
				if (Math.abs(gunTurning) <= this.gunMaxTurning) {
					gunAngle = targetAngle;
				} else {
					gunAngle = (gunTurning < 0) ? (angle % (Math.PI * 2)) - this.gunMaxTurning : (angle % (Math.PI * 2)) + this.gunMaxTurning;
				}
			}

			
			
			if (params.gun == 'machinegun') {
				gunAngle = gunAngle += Math.random() * this.gunRange - this.gunRange / 2;
				var bullet = new Bullet(this, this.gunDamage);
				bullet.fire(this.game, gunAngle, gunPosition);
				this.body.ApplyImpulse(new Game.B2Vec2(Math.sin(angle) * (-this.gunRecoil), Math.cos(angle) * this.gunRecoil), this.body.GetWorldCenter());
			}
			
			if (params.gun == 'bioRocket') {
				var rocket = new BioRocket(this, this.rocketDamage);
				rocket.fire(this.game, gunAngle, gunPosition);
				rocket.body.SetLinearVelocity(this.body.GetLinearVelocity());
			}
			
			if (params.gun == 'laserRocket') {
				var rocket = new LaserRocket(this, this.rocketDamage);
				rocket.fire(this.game, gunAngle, gunPosition);
				rocket.body.SetLinearVelocity(this.body.GetLinearVelocity());
			}
			
		},
		
		die: function () {
			if (this.isDead) return;
			this.isDead = true;
			var worldCenter = this.body.GetWorldCenter();
			var onSplinterAdd = function (angle) {
				return function () {
					this.body.ApplyImpulse(new Game.B2Vec2( Math.sin(angle) * this.derbisImpulse, Math.cos(angle) * (-this.derbisImpulse)), this.body.GetWorldCenter());
				}
			};
			
			for (var i = this.derbisCnt; i--;) {
				var splinter = new Asteroid(this.derbisScale, 1);
				var angle = ((Math.PI * 2) / this.derbisCnt) * (i + 1) + Math.random() * this.derbisRange - this.derbisRange / 2;

				var x = worldCenter.x + Math.sin(angle) * this.derbisDistance;
				var y = worldCenter.y + Math.cos(angle) * (-this.derbisDistance);
				this.game.add(splinter, x, y, onSplinterAdd(angle));
			}
		},
		
		accelerate: function () {
			this.isAccelerate = true;
		},
		
		reverse: function () {
			this.isReverse = true;
		},
		
		stopAccelerate: function () {
			this.isAccelerate = false;
			this.isReverse = false;
		},
		
		rotateCW: function () {
			this.stopRotate();
			this.isRotateCW = true;
		},
		
		rotateCCW: function () {
			this.stopRotate();
			this.isRotateCCW = true;
		},
		
		stopRotate: function () {
			this.isRotateCW = false;
			this.isRotateCCW = false;
		},
		
		aim: function (params) {
			this.aimPoint = new Game.B2Vec2(params.targetX, params.targetY);
		},
		
		_onStep: function () {
			var angle = this.body.GetAngle();
			if (this.isRotateCW || this.isRotateCCW) this.body.SetAngularDamping(this.rotationAngularDamping);
			if (this.isRotateCW) this.body.ApplyTorque(this.torqueForce);
			if (this.isRotateCCW) this.body.ApplyTorque(-this.torqueForce);
			var speed = this.body.GetLinearVelocity().Length();
			
			if (this.isAccelerate) {
				if (speed < this.maxSpeed) {
					var speedX = Math.sin(angle) * this.accelForce;
					var speedY =  Math.cos(angle) * (-this.accelForce);
					this.body.ApplyForce(new Game.B2Vec2(speedX,speedY) , this.body.GetWorldCenter());
				}
			}
			if (this.isReverse) {
				if (speed < this.maxSpeed) {
					var speedX = Math.sin(angle + Math.PI) * this.accelForce;
					var speedY =  Math.cos(angle + Math.PI) * (-this.accelForce);
					this.body.ApplyForce(new Game.B2Vec2(speedX,speedY) , this.body.GetWorldCenter());
				}
			}
		},
		
		_onContact: function (fixture) {
			var object = fixture.GetBody().GetUserData();
			if (this.body.GetAngularDamping() != this.angularDamping) this.body.SetAngularDamping(this.angularDamping);
			if (!object) return;
			if (object.damage) {
				this.hp -= object.damage;
				if (this.hp <= 0) this.die(); 
			}
		}
		
	});
})(window);