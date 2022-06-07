
import {
	Vector3
} from 'three';


import { Actuator } from '../Actuator.js';

class VehicleActuator extends Actuator {

	constructor( game ) {

		super( game );

		this.controller = null;

	}

	addTo( object ) {

		super.addTo( object );

		this.object.isVehicle = true;
		this.object.userData.vehicleActuator = this;

		const scope = this;
		let enterExitPressedPrevious = undefined;
		this.game.addCollisionTrigger( this.game.player, this.object, ( objectsToRemove ) => {

			const enterExitPressed = scope.controller.fire1 > 0 && scope.controller.fire2 > 0;
			if ( ! scope.object.userData.occupied && enterExitPressed && enterExitPressedPrevious === false ) {

				scope.game.enterVehicle( scope.game.player, scope.object, objectsToRemove );

			}

			enterExitPressedPrevious = enterExitPressed;

		} );

	}

	removeFrom( object ) {

		super.removeFrom( object );

		this.game.removeCollisionTrigger( this.game.player, object );

	}

}

export { VehicleActuator };
