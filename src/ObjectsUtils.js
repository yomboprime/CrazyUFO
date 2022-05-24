import {
	Vector3,
} from 'three';

class ObjectsUtils {

	constructor( game ) {

		this.game = game;

	}

	createObject( svgPath, callback, position, mass = 0, scale = 1, angle = 0 ) {

		const scope = this;

		this.game.loadSVG( svgPath, {}, ( object ) => {

			object.position.copy( position );
			object.rotation.z = angle;
			object.userData.mass = mass;
			scope.game.createDebrisFromBreakableObject( object, scale, true );

			if ( callback ) callback( object );

		} );

	}

}

export { ObjectsUtils };
