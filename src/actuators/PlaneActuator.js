
import {
	Vector3
} from 'three';


import { Actuator } from '../Actuator.js';

class PlaneActuator extends Actuator {

	constructor( game ) {

		super( game );

		this.object = null;
		this.controller = null;

		this.maxVelocity = 200;

		this.altitudeLabel = null;

		this.flipPressed = false;

		this.tempBtVec3_1 = new game.Ammo.btVector3( 0, 0, 0 );
		this.tempVec3_1 = new Vector3();
		this.tempVec3_2 = new Vector3();
		this.tempVec3_3 = new Vector3();
		this.tempVec3_4 = new Vector3();

	}

	addTo( object ) {

		this.object = object;
		this.active = true;

		this.altitudeLabel = document.createElement( 'span' );
		this.altitudeLabel.style.position = 'absolute';
		this.altitudeLabel.style.top = '20px';
		this.altitudeLabel.style.left = '60px';
		this.altitudeLabel.style.color = 'white';
		this.altitudeLabel.innerHTML = "Altitude:";
		document.body.appendChild( this.altitudeLabel );

	}

	removeFrom( object ) {

		this.object = null;

		document.body.removeChild( this.altitudeLabel );

	}

	actuate( deltaTime ) {

		const prevFlipPressed = this.flipPressed;
		this.flipPressed = this.controller.y < 0;
		if ( this.flipPressed && ! prevFlipPressed ) this.object.scale.y *= -1;

		let thrusterControl = Math.max( this.active ? 0.25 : 0, this.controller.y );
		const velocity = thrusterControl * this.maxVelocity;
		const thrustForce = 100;
		this.tempVec3_1.set( velocity, 0, 0 );
		this.object.localToWorld( this.tempVec3_1 ).sub( this.object.position );
		this.game.getObjectVelocity( this.object, this.tempVec3_2 );
		this.tempVec3_1.sub( this.tempVec3_2 );
		this.tempVec3_1.multiplyScalar( thrustForce * this.object.userData.mass * deltaTime );
		this.tempBtVec3_1.setValue( this.tempVec3_1.x, this.tempVec3_1.y, 0 );
		this.object.userData.rigidBody.applyForce( this.tempBtVec3_1 );

		this.game.getObjectAngularVelocity( this.object, this.tempVec3_1 );
		const angVel = this.tempVec3_1.z;
		const desiredAngVel = - this.controller.x * 1.2;
		const torque = ( desiredAngVel - angVel ) * this.object.userData.mass * deltaTime * 15000;
		this.tempBtVec3_1.setValue( 0, 0, torque );
		this.object.userData.rigidBody.applyLocalTorque( this.tempBtVec3_1 );

		// Read altitude

		this.tempVec3_1.set( 0, -20, 0 );
		this.object.localToWorld( this.tempVec3_1 );

		this.tempVec3_2.set( 0, -10000, 0 ).add( this.tempVec3_1 );

		const objectHit = this.game.castPhysicsRay( this.tempVec3_1, this.tempVec3_2, this.tempVec3_3, this.tempVec3_4 );

		if ( objectHit ) {

			const altitude = this.tempVec3_3.sub( this.tempVec3_1 ).length();
			this.altitudeLabel.innerHTML = "Altitude:" + ( altitude < 2000 ? Math.floor( altitude ) + " m" : "Out Of Range" );

		}

	}

}

export { PlaneActuator };
