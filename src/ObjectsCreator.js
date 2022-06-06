import {
	Vector3,
} from 'three';

import { ObjectsUtils } from './ObjectsUtils.js';
import { LaserActuator } from './actuators/LaserActuator.js';
import { PlaneActuator } from './actuators/PlaneActuator.js';
import { UFOActuator } from './actuators/UFOActuator.js';
import { BombActuator } from './actuators/BombActuator.js';
import { TurretActuator } from './actuators/TurretActuator.js';

class ObjectsCreator {

	constructor( game ) {

		this.game = game;

		this.objectsUtils = new ObjectsUtils( game );

	}

	createPlane( position, callback ) {

		const scope = this;

		const game = this.game;

		this.objectsUtils.createObject( './toyplane.svg', ( plane ) => {

			const planeActuator = new PlaneActuator( game );
			planeActuator.addTo( plane );
			planeActuator.controller = game.controller;
			game.actuators.push( planeActuator );

			const laserActuator = new LaserActuator( game );
			laserActuator.addTo( plane );
			laserActuator.controller = game.controller;
			game.actuators.push( laserActuator );

			const bombActuator = new BombActuator( game );
			bombActuator.addTo( plane );
			bombActuator.controller = game.controller;
			game.actuators.push( bombActuator );

			game.assignDamageTrigger( plane, 1000, () => {

				game.removeDebris( plane );
				game.explodeObject( plane, 16, 200 );
				game.playSound( game.sounds.soundExplosion1 );

			} );

			if ( callback ) callback( plane );

		}, position, 10 );

	}

	createUFO( position, callback ) {

		const scope = this;

		const game = this.game;

		this.objectsUtils.createObject( './ufo.svg', ( ufo ) => {

			const ufoActuator = new UFOActuator( game );
			ufoActuator.addTo( ufo );
			ufoActuator.controller = game.controller;
			game.actuators.push( ufoActuator );

			const laserActuator = new LaserActuator( game );
			laserActuator.addTo( ufo );
			laserActuator.controller = game.controller;
			game.actuators.push( laserActuator );

			const bombActuator = new BombActuator( game );
			bombActuator.addTo( ufo );
			bombActuator.controller = game.controller;
			game.actuators.push( bombActuator );

			game.assignDamageTrigger( ufo, 1000, () => {

				game.removeDebris( ufo );
				game.explodeObject( ufo, 16, 200 );
				game.playSound( game.sounds.soundExplosion1 );

			} );

			if ( callback ) callback( ufo );

		}, position, 10 );

	}

	createDeposit( position, callback ) {

		const scope = this;

		const game = this.game;

		this.objectsUtils.createObject( './deposit.svg', ( deposit ) => {

			game.assignDamageTrigger( deposit, 1000, () => {

				game.removeDebris( deposit );
				game.explodeObject( deposit, 28, 150 );
				game.playSound( game.sounds.soundExplosion2 );

			} );

			if ( callback ) callback( deposit );

		}, position, 300 );

	}

	createDepositAndStructure( position, callback ) {

		this.objectsUtils.createObject( './structure.svg', () => {

			this.createDeposit( position, () => {

				if ( callback ) callback();
			} );
		}, position );

	}

	createCannon( position, target, callback ) {

		const scope = this;

		const game = this.game;

		this.objectsUtils.createObject( './structure.svg', ( structure ) => {

			scope.objectsUtils.createObject( './cannon.svg', ( cannon ) => {

				game.assignDamageTrigger( cannon, 1000, () => {

					game.removeDebris( cannon );
					game.explodeObject( cannon, 12, 200 );
					game.playSound( game.sounds.soundExplosion2 );

				} );

				scope.objectsUtils.createObject( './turret.svg', ( turret ) => {

					this.game.assignDamageTrigger( turret, 1000, () => {

						game.removeDebris( turret );
						game.explodeObject( turret, 12, 200 );
						game.playSound( game.sounds.soundExplosion2 );

						game.makeDamage( cannon, 10000 );

					} );

					const pivotA = new game.Ammo.btVector3( 0, 32, 0 );
					const pivotB = new game.Ammo.btVector3( 0, 0, 0 );
					const axis = new game.Ammo.btVector3( 0, 0, 1 );
					cannon.userData.hinge = new game.Ammo.btHingeConstraint( turret.userData.rigidBody, cannon.userData.rigidBody, pivotA, pivotB, axis, axis, true );
					turret.userData.hinge = cannon.userData.hinge;
					cannon.userData.hinge.setLimit( 0, Math.PI, 0.9, 0.3, 1 );
					game.physicsWorld.addConstraint( cannon.userData.hinge, true );

					cannon.userData.hinge.enableMotor( true );
					cannon.userData.hinge.setMaxMotorImpulse( 30 );

					const turretActuator = new TurretActuator( game );
					turretActuator.addTo( cannon );
					turretActuator.target = target;
					game.actuators.push( turretActuator );

					if ( callback ) callback();

				}, position );

			}, new Vector3( 0, 32, 0 ).add( position ), 1.2, 1 );

		}, position );

	}

}

export { ObjectsCreator };
