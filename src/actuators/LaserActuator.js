
import {
	Vector3,
	Line,
	BufferGeometry,
	Float32BufferAttribute
} from 'three';

import { Actuator } from '../Actuator.js';

class LaserActuator extends Actuator {

	constructor( game ) {

		super( game );

		this.object = null;
		this.controller = null;

		this.spark = null;
		this.laser = null;

		this.tempVec3_1 = new Vector3();
		this.tempVec3_2 = new Vector3();
		this.tempVec3_3 = new Vector3();
		this.tempVec3_4 = new Vector3();


	}

	addTo( object ) {

		this.object = object;
		this.active = true;

		this.game.loadSVG( './spark.svg', {}, ( spark ) => {

			this.spark = spark;
			this.spark.position.set( 0, 0, 0 );
			this.game.scene.add( this.spark );

		} );

		const vertices = [ 0, 0, 0, 0, 0, 0 ];
		const laserGeometry = new BufferGeometry();
		laserGeometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		this.laser = new Line( laserGeometry, this.game.createColor( 'red' ) );
		this.laser.frustumCulled = false;
		this.game.scene.add( this.laser );

	}

	removeFrom( object ) {

		this.game.scene.remove( this.spark );
		this.game.scene.remove( this.laser );
		this.object = null;

	}

	actuate( deltaTime ) {

		if ( ! this.spark ) return;

		if ( this.controller.fire1 > 0 && this.controller.fire2 === 0 ) {

			this.tempVec3_1.set( 10, 6, 0 );
			this.object.localToWorld( this.tempVec3_1 );

			this.tempVec3_2.setFromMatrixColumn( this.object.matrixWorld, 0 ).multiplyScalar( 1000 ).add( this.tempVec3_1 );

			const objectHit = this.game.castPhysicsRay( this.tempVec3_1, this.tempVec3_2, this.tempVec3_3, this.tempVec3_4 );

			if ( objectHit ) {

				this.spark.position.copy( this.tempVec3_3 );
				this.spark.visible = true;

				if ( objectHit.userData.damage ) objectHit.userData.damage( 100 );

			}
			else {

				this.spark.visible = false;
				this.tempVec3_3.copy( this.tempVec3_2 );

			}

			const vertsAttrib = this.laser.geometry.getAttribute( 'position' );
			const verts = vertsAttrib.array;
			this.tempVec3_1.toArray( verts, 0 );
			this.tempVec3_3.toArray( verts, 3 );
			vertsAttrib.needsUpdate = true;

			this.laser.visible = true;

		}
		else {

			this.spark.visible = false;
			this.laser.visible = false;

		}

	}

}

export { LaserActuator };
