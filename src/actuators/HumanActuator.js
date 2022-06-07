
import {
	Vector3
} from 'three';


import { Actuator } from '../Actuator.js';

class HumanActuator extends Actuator {

	constructor( game ) {

		super( game );

		this.controller = null;

		this.timeBetweenJumps = 0.5;
		this.timeNextJump = game.time;

		this.tempBtVec3_1 = new game.Ammo.btVector3( 0, 0, 0 );
		this.tempVec3_1 = new Vector3();
		this.tempVec3_2 = new Vector3();
		this.tempVec3_3 = new Vector3();
		this.tempVec3_4 = new Vector3();

	}

	addTo( object ) {

		super.addTo( object );

		this.active = true;

		this.tempBtVec3_1.setValue( 0, 0, 0 );
		object.userData.rigidBody.setAngularFactor( this.tempBtVec3_1 );

	}

	removeFrom( object ) {

		super.removeFrom( object );

		this.active = false;

	}

	actuate( deltaTime ) {

		if ( this.object.userData.collided ) {

			this.object.userData.collided = false;

			if ( this.controller.y > 0.5 && this.timeNextJump <= this.game.time ) {

				this.tempVec3_1.set( this.controller.x, 1, 0 ).normalize();
				this.tempVec3_1.multiplyScalar( 20 * this.object.userData.mass );
				this.tempBtVec3_1.setValue( this.tempVec3_1.x, this.tempVec3_1.y, 0 );
				this.object.userData.rigidBody.applyCentralImpulse( this.tempBtVec3_1 );

				this.timeNextJump = this.game.time + this.timeBetweenJumps;

			}
		}

	}

}

export { HumanActuator };
