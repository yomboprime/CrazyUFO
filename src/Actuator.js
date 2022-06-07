
class Actuator {

	constructor( game ) {

		this.game = game;
		this.active = false;
		this.object = null;

	}

	addTo( object ) {

		if ( ! object.userData.actuators ) {

			object.userData.actuators = [];

		}

		object.userData.actuators.push( this );

		this.object = object;
	}

	removeFrom( object ) {

		const i = object.userData.actuators.indexOf( this );
		if ( i >= 0 ) object.userData.actuators.splice( i, 1 );

		this.object = null;

	}

	actuate( deltaTime ) {

		// Nothing to do

	}

	isDestroyed() {

		return false;

	}

}

export { Actuator };
