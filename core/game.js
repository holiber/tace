;(function (ctx) {
	
	ctx.Game = Class.extend({
		_static: {
			maps: {},
			B2AABB: Box2D.Collision.b2AABB,
			B2World: Box2D.Dynamics.b2World,
			B2Vec2: Box2D.Common.Math.b2Vec2,
			B2DebugDraw: Box2D.Dynamics.b2DebugDraw,
			B2Body: Box2D.Dynamics.b2Body,
			B2BodyDef: Box2D.Dynamics.b2BodyDef,
			B2FixtureDef: Box2D.Dynamics.b2FixtureDef,
			B2PolygonShape: Box2D.Collision.Shapes.b2PolygonShape,
			B2CircleShape: Box2D.Collision.Shapes.b2CircleShape,
			B2MouseJointDef: Box2D.Dynamics.Joints.b2MouseJointDef,
			B2ContactListener: Box2D.Dynamics.b2ContactListener
		},
		
		init: function ($el) {
			this.lastIdx = 1;
			this.$el = $el;
			this.$eventLayer = $(ctx);
			this.players = {};
			if (!$el || !$el.length) throw 'container not found';
			this.camera = new Camera();
			this.$canvas = $('<canvas width="' + this.camera.screenWidth +'" height="' + this.camera.screenHeight + '" style="background-color:#333333;" ></canvas>');
			this.world = new Game.B2World(new Game.B2Vec2(0, 0), true);
			this.world.SetContactListener(new ctx.GameContactListener());
			this.addQueue = [];
			this.objects = {};
			this.plane = null;
			this.debugDraw = new Game.B2DebugDraw();
			this.debugDraw.SetSprite(this.$canvas[0].getContext('2d'));
			this.debugDraw.SetDrawScale(30.0);
			this.debugDraw.SetFillAlpha(0.5);
			this.debugDraw.SetLineThickness(1.0);
			this.debugDraw.SetFlags(Game.B2DebugDraw.e_shapeBit | Game.B2DebugDraw.e_jointBit);
			this.world.SetDebugDraw(this.debugDraw);
			$el.html(this.$canvas);
			
			this.protocol = new Protocol(this);
			this.protocol.connect();

			this.buildWorld();
			
			setInterval(this.step.bind(this), 1000 / 60);
		},
		
		step: function () {
			for (var idx in this.players) {
				this.players[idx]._onStep();
			}
			for (var idx in this.objects) {
				var object = this.objects[idx];
				if (object.isDead) {
					this.world.DestroyBody(object.body);
					delete this.objects[object.idx];
					continue;
				}
				object._onStep && this.objects[idx]._onStep();
			}

			for (var i = 0; i < this.addQueue.length; i++) {
				var addRequest = this.addQueue.pop();
				this.add(addRequest.object, addRequest.x, addRequest.y, addRequest.callback);
			}
			
			this.world.Step(1/60, 10, 10);
			this.world.DrawDebugData();
			this.world.ClearForces();
		},
		
		buildWorld: function () {
			this.createPlane();
			var map = new Game.maps['asteroidsBox'](this);
			map.create();
		},
		
		createPlane: function () {
			var player = new LocalPlayer('me');
			var plane = new Plane('myPlane');
			this.add(plane, 10, 10);
			this.addPlayer(player);
			player.addObject(plane);
		},
		
		add: function (gameObject, x, y, callback) {
			if (!(gameObject instanceof GameObject)) {
				throw 'invalid object added';
			}
			
			if (this.world.IsLocked()) {
				this.addQueue.push({object: gameObject, x: x, y: y, callback: callback});
				return;
			}
			
			if (gameObject.bodyDef) {
				gameObject.bodyDef.position.Set(x, y);
				gameObject.body = this.world.CreateBody(gameObject.bodyDef);
				gameObject.body.SetUserData(gameObject);
			}
			
			if (gameObject.fixturesDef) for (var i = 0; i < gameObject.fixturesDef.length; i++) {
				gameObject.body.CreateFixture(gameObject.fixturesDef[i]);
			}
			
			gameObject.game = this;
			gameObject.idx = idx;
			var idx = this.lastIdx++;
			this.objects[idx] = gameObject;
			callback && callback.call(gameObject);
		},
		
		addPlayer: function (player, id) {
			id = id || this.idx++
			player.id = id;
			this.players[id] = player;
			player._onGame(this);
		},
		
		removePlayer: function (id) {
			this.players[id].object && this.players[id].object.die();
			delete this.players[id];
		},
		
		_receive: function (eventName, data, sender) {
			switch (eventName) {
				case 'playerDie': this._onPlayerDie(sender);
			}
		},
		
		_onPlayerDie: function (sender) {
			for (var id in this.players) {
				var player = this.players[id];
				if (!player.object || player.object.isDead) continue;
				player.object.hp = player.object.maxHp;
			}
		}
	});
	
	return Game;
})(window);