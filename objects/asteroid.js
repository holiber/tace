;(function (ctx) {

	//asteroid forms
	var FORMS = [
		[
			[0.6, -1],
			[1, 0.2],
			[0.2, 0.4],
			[-0.8, 0.4],
			[-0.6, -0.4]
		],
		[
			[-0.6, -1],
			[0.2, -0.8],
			[0.5, -0.3],
			[0.9, 0.4],
			[0.8, 0.6],
			[0.4, 0.6],
			[-0.5, 0.2],
			[-0.8, -0.3]
		]
	];
	
	ctx.Asteroid = GameObject.extend({
		
		init: function (scale, hp) {
			this._super();
			this.type = 'asteroid';
			this.maxHp = 100;
			this.hp = hp || this.maxHp;
			this.scale = scale || 1;
			this.canSegmentedScale = 0.5
			this.splintersCnt = 3;
			this.splintersRange = 2;
			this.splintersImpulse = 1;
			this.splintersDistance = 0.8;
			this.splintersScale = this.scale/2.5

			//take random asteroid form and create it
			var formDef = FORMS[Math.round(Math.random())];
			var form = [];
			for (var i = formDef.length; i--;) {
				form[i] = new Game.B2Vec2(formDef[i][0], formDef[i][1]);
				if (this.scale == 1) continue;
				form[i].x *= this.scale;
				form[i].y *= this.scale;
			}

			var fixDef = new Game.B2FixtureDef();
			fixDef.density = 1.0;
			fixDef.friction = 0.5;
			fixDef.restitution = 0.2;
			fixDef.shape = new Game.B2PolygonShape;
			fixDef.shape.SetAsArray(form);
			this.bodyDef = new Game.B2BodyDef();
			this.bodyDef.type = Game.B2Body.b2_dynamicBody;
			this.bodyDef.angularDamping = 0.7;
			this.bodyDef.linearDamping = 0.2;
			this.bodyDef.angle = Math.random() * 2 * Math.PI;
			this.fixturesDef = [fixDef];
		},

		//kill asteroid
		die: function () {
			if (this.isDead) return;
			this.isDead = true;
			var worldCenter = this.body.GetWorldCenter();

			//splnter add callback
			var onSplinterAdd = function (angle) {
				return function () {
					//kick splinter
					this.body.ApplyImpulse(new Game.B2Vec2( Math.sin(angle) * this.splintersImpulse, Math.cos(angle) * (-this.splintersImpulse)), this.body.GetWorldCenter());
				}
			};

			//if asteroid can be splited
			if (this.scale >= this.canSegmentedScale) {
				//create and place splinters
				for (var i = this.splintersCnt; i--;) {
					var splinter = new Asteroid(this.splintersScale);
					var angle = ((Math.PI * 2) / this.splintersCnt) * (i + 1) + Math.random() * this.splintersRange - this.splintersRange / 2;
					
					var x = worldCenter.x + Math.sin(angle) * this.splintersDistance;
					var y = worldCenter.y + Math.cos(angle) * (-this.splintersDistance);
					this.game.add(splinter, x, y, onSplinterAdd(angle));
				}
			}
		},
		
		_onContact: function (fixture, impulse, contact) {
			if (this.isDead) return;
			var object = fixture.GetBody().GetUserData();
			if (!object) return;
			if (object.damage) this.hp -= object.damage;
			if (this.hp <= 0) this.die();
		}
		
	});
})(window);