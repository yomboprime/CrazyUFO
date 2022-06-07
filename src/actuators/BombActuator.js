
import {
	Vector3,
	Line,
	Audio,
	AudioLoader,
	BufferGeometry,
	Float32BufferAttribute
} from 'three';

import { Actuator } from '../Actuator.js';

class BombActuator extends Actuator {

	constructor( game ) {

		super( game );

		this.controller = null;

		this.game.loadSVG( './bomb.svg', {}, ( bomb ) => {

			this.bomb = bomb;

		} );

		this.nextBombTime = game.time;

		this.tempVec3_1 = new Vector3();
		this.tempVec3_2 = new Vector3();
		this.tempVec3_3 = new Vector3();
		this.tempVec3_4 = new Vector3();

	}

	actuate( deltaTime ) {

		if ( ! this.bomb ) return;

		if ( ! this.active ) return;

		if ( this.game.time < this.nextBombTime ) return;

		if ( this.controller.fire1 === 0 && this.controller.fire2 > 0 ) {

			this.tempVec3_1.set( 0, -15, 0 );
			this.object.localToWorld( this.tempVec3_1 );

			this.tempVec3_2.setFromMatrixColumn( this.object.matrixWorld, 1 ).multiplyScalar( -1 );

			const bomb = this.bomb.clone();

			bomb.position.copy( this.tempVec3_1 );
			bomb.rotation.z = Math.atan( this.tempVec3_2.y / this.tempVec3_2.x );
			this.game.getObjectVelocity( this.object, this.tempVec3_3 );
			bomb.userData.velocity = new Vector3().copy( this.tempVec3_2 ).multiplyScalar( 20 ).add( this.tempVec3_3 );
			bomb.userData.mass = 2;

			this.game.createDebrisFromBreakableObject( bomb, 1, true );

			const scope = this;

			this.game.addSingleCollisionTrigger( bomb, ( objectsToRemove, theOtherObject ) => {

				this.game.makeDamage( bomb, 1500, objectsToRemove );

				if ( theOtherObject ) this.game.makeDamage( theOtherObject, 1500, objectsToRemove );
			} );

			this.game.assignDamageTrigger( bomb, 50, () => {

				scope.game.removeDebris( bomb );
				scope.game.explodeObject( bomb, 12, 200 );
				scope.game.playSound( scope.game.sounds.soundExplosion1 );

			} );

			this.nextBombTime = this.game.time + 1.1;

		}

	}

	isDestroyed() {

		return this.object.destroyed;

	}

}

export { BombActuator };
