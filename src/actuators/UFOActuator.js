
import {
	Vector3
} from 'three';


import { Actuator } from '../Actuator.js';
import { VehicleActuator } from './VehicleActuator.js';

class UFOActuator extends VehicleActuator {

	constructor( game ) {

		super( game );

		this.thrusterForce = 300;

		this.altitudeLabel = null;

		this.tempBtVec3_1 = new game.Ammo.btVector3( 0, 0, 0 );
		this.tempVec3_1 = new Vector3();
		this.tempVec3_2 = new Vector3();
		this.tempVec3_3 = new Vector3();
		this.tempVec3_4 = new Vector3();

	}

	addTo( object ) {

		super.addTo( object );

		this.altitudeLabel = document.createElement( 'span' );
		this.altitudeLabel.style.position = 'absolute';
		this.altitudeLabel.style.top = '20px';
		this.altitudeLabel.style.left = '60px';
		this.altitudeLabel.style.color = 'white';
		this.altitudeLabel.innerHTML = "Altitude:";
		document.body.appendChild( this.altitudeLabel );

	}

	removeFrom( object ) {

		super.removeFrom( object );

		document.body.removeChild( this.altitudeLabel );

	}

	actuate( deltaTime ) {

		if ( ! this.active ) return;

		let thrusterControl = Math.max( 0, this.controller.y );
		const userTorque = - this.controller.x * this.object.userData.mass * 280;

		this.tempBtVec3_1.setValue( 0, thrusterControl * this.thrusterForce, 0 );
		this.object.userData.rigidBody.applyCentralLocalForce( this.tempBtVec3_1 );

		const autoTorque = 0;//- this.object.rotation.z * 50 * this.object.userData.mass;
		const torque = autoTorque + userTorque;
		this.tempBtVec3_1.setValue( 0, 0, torque );
		this.object.userData.rigidBody.applyTorque( this.tempBtVec3_1 );

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

export { UFOActuator };
