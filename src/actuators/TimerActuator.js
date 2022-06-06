
import { Actuator } from '../Actuator.js';

class TimerActuator extends Actuator {

	constructor( game ) {

		super( game );

		this.expiration = 0;
		this.isExpirated = false;

	}

	addTo( object ) {

		this.object = object;
		this.active = true;

	}

	removeFrom( object ) {

		this.object = null;

	}

	actuate( deltaTime ) {

		this.isExpirated = this.expiration < this.game.time;
		if ( this.isExpirated ) this.game.removeDebris( this.object );

	}

	isDestroyed() {

		return this.isExpirated;

	}

}

export { TimerActuator };
