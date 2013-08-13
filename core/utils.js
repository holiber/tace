(function (ctx) {
	Game.utils = {
		
		getVec: function (length, angle) {
			return new Game.B2Vec2(Math.sin(angle) * length, Math.cos(angle) * (-length));
		},
		
		/**
		 * getVecAlngle({Game.B2Vec2} vec)
		 * getVecAlngle(x, y)
		 */
		getVecAngle: function (opt1, opt2) {
			var x = 0;
			var y = 0;
			if (arguments.length == 2) {
				x = opt1;
				y = opt2;
			} else {
				x = opt1.x;
				y = opt1.y;
			}
			if (x == 0) {
				return (y > 0) ? (3 * Math.PI) / 2 : Math.PI / 2;
			}
			var result = Math.atan(y/x);
			//box2d angle fix
			result += Math.PI/2;
			if (x < 0) result = result - Math.PI;
			return result;
		},
		
		/**
		 * getSegmentAngle({Game.B2Vec2} vec1, {Game.B2Vec2} vec2)
		 * getSegmentAngle(x1, y1, x2, y2)
		 */
		getSegmentAngle: function (opt1, opt2, opt3, opt4) {
			var x1 = 0;
			var y1 = 0;
			var x2 = 0;
			var y2 = 0;
			if (arguments.length == 2) {
				x1 = opt1.x;
				y1 = opt1.y;
				x2 = opt2.x;
				y2 = opt2.y;
			} else {
				x1 = opt1;
				y1 = opt2;
				x2 = opt3;
				y2 = opt4;
			}
			return Game.utils.getVecAngle(x2 - x1, y2 - y1);
		},
		
		getAngleDistance: function (angle1, angle2) {
			angle1 = angle1 % (Math.PI * 2);
			angle2 = angle2 % (Math.PI * 2); 
			if (angle1 < 0 ) angle1 = (Math.PI * 2) + angle1;
			if (angle2 < 0 ) angle2 = (Math.PI * 2) + angle2;
			
			var angle2 = angle2 - angle1;
			var result = angle2;
			if (Math.abs(angle2) > Math.PI) {
				result = -((Math.PI * 2) - Math.abs(angle2));
				if (angle2 < 0) result = -result;
			}
			return result;
			
			var result1 = angle1 - angle2;
			var result2 = ((Math.PI * 2) - Math.abs(result1));
			return ( Math.abs(result1) < Math.abs(result2)) ? result1 : result2;
		}
	}
})(window);