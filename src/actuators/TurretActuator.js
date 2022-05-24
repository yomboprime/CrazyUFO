
import {
	Vector3
} from 'three';

import { Actuator } from '../Actuator.js';
import { TimerActuator } from './TimerActuator.js';

class TurretActuator extends Actuator {

	constructor( game ) {

		super( game );

		this.cannon = null;
		this.target = null;

		this.bullet = null;

		this.timeNextShot = game.time;
		this.isAlreadyDestroyed = false;

		this.tempVec3_1 = new Vector3();
		this.tempVec3_2 = new Vector3();
		this.tempVec3_3 = new Vector3();
		this.tempVec3_4 = new Vector3();

		const scope = this;
		this.game.loadSVG( './bullet.svg', {}, ( bullet ) => {

			scope.bullet = bullet;

		} );

	}

	addTo( object ) {

		this.cannon = object;

	}

	removeFrom( object ) {

		this.cannon = null;

	}

	actuate( deltaTime ) {

		if ( this.cannon.userData.destroyed ) {

			this.isAlreadyDestroyed = true;
			return;

		}

		this.tempVec3_1.copy( this.target.position ).sub( this.cannon.position );
		let angle = Math.atan( this.tempVec3_1.y / this.tempVec3_1.x );
		if ( this.tempVec3_1.x < 0 ) angle += Math.PI;
		this.cannon.userData.hinge.setMotorTarget( angle, deltaTime );

		if ( this.bullet && this.timeNextShot < this.game.time ) {

			this.tempVec3_2.setFromMatrixColumn( this.cannon.matrixWorld, 0 ).multiplyScalar( 20 ).add( this.cannon.position );
			this.tempVec3_3.setFromMatrixColumn( this.cannon.matrixWorld, 0 ).multiplyScalar( 1000 ).add( this.cannon.position );

			const objectHit = this.game.castPhysicsRay( this.tempVec3_2, this.tempVec3_3 );

			if ( objectHit === this.target ) {

				const bullet = this.bullet.clone();
				bullet.position.set( 35, 0, 0 );
				this.cannon.localToWorld( bullet.position );

				this.tempVec3_4.setFromMatrixColumn( this.cannon.matrixWorld, 0 ).multiplyScalar( 80 );
				bullet.userData.velocity = new Vector3().copy( this.tempVec3_4 );

				bullet.userData.mass = 1.5;
				this.game.createDebrisFromBreakableObject( bullet, 1, true );

				const timer = new TimerActuator( this.game );
				timer.addTo( bullet );
				timer.expiration = this.game.time + 5;
				this.game.actuators.push( timer );

				const scope = this;
				this.game.addSingleCollisionTrigger( bullet, ( objectsToRemove, theOtherObject ) => {

					scope.game.makeDamage( bullet, 250, objectsToRemove );

					if ( theOtherObject ) scope.game.makeDamage( theOtherObject, 250, objectsToRemove );

				} );

				this.game.assignDamageTrigger( bullet, 200, () => {

					scope.game.removeDebris( bullet );
					scope.game.explodeObject( bullet, 6, 120 );
					scope.game.playSound( scope.game.sounds.soundHit1 );

				} );


				this.game.playSound( this.game.sounds.soundShot1 );

				this.timeNextShot = this.game.time + 3.5;

			}

		}

	}

	isDestroyed() {

		return this.isAlreadyDestroyed;

	}

}

export { TurretActuator };
