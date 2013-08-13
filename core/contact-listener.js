;(function (ctx) {
	ctx.GameContactListener = function () {};
	ctx.GameContactListener.prototype = ctx.Game.B2ContactListener.prototype;
	ctx.GameContactListener.prototype.PostSolve = function(contact, impulse) {
		var objectA = contact.GetFixtureA().GetBody().GetUserData();
		var objectB = contact.GetFixtureB().GetBody().GetUserData();
		if (objectA && objectA._onContact) objectA._onContact(contact.GetFixtureB(), impulse, contact);
		if (objectB && objectB._onContact) objectB._onContact(contact.GetFixtureA(), impulse, contact);
//		if(contact.GetFixtureB().GetBody().GetUserData()) {
//			var BangedBody = contact.GetFixtureB().GetBody();
//			if(contact.GetFixtureB().GetBody().GetUserData().GetType() == PIG) {
//					var imp = 0;
//					for(a in impulse.normalImpulses) {
//					imp = imp + impulse.normalImpulses[a];
//				}
//
//				if(imp > 3) {
//					destroyedBodies.push(BangedBody);
//					BangedBody.visible = false;
//					BangedBody = null;
//				}
//			}
//		}
	}
})(window)