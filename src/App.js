import {
	Vector3,
	BoxGeometry,
	Mesh,
	Clock,
	MeshStandardMaterial,
	OrthographicCamera,
	PerspectiveCamera,
	PointLight,
	Scene,
	ShapeGeometry,
	WebGLRenderer
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader, Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { Game } from './Game.js';

let app, game, camera, renderer;

const xResolution = 640;
const yResolution = 480;
const aspect = xResolution / yResolution;

let clientWidth = 0;
let clientHeight = 0;

let connectedGamepads = [];
let joy1GamepadIndex = null;
let joy2GamepadIndex = null;
let joy1Controller = null;
let joy2Controller = null;

class App {

	init() {

		app = this;
		const scope = this;

		Ammo().then( function ( AmmoLib ) {

			Ammo = AmmoLib;

			const f = 0.5;
			//const f = 0.2;
			const cameraWidth = xResolution * f;
			const cameraHeight = yResolution * f;
			camera = new OrthographicCamera( - cameraWidth, cameraWidth, cameraHeight, - cameraHeight, 0.1, 2000 );
			//camera = new PerspectiveCamera( 45, xResolution / yResolution, 0.1, 2000 );
			camera.position.set( 0, 0, 20 );

			renderer = new WebGLRenderer( { antialias: false } );
			renderer.setPixelRatio( window.devicePixelRatio );
			renderer.setSize( xResolution, yResolution );
			document.body.appendChild( renderer.domElement );

			scope.clock = new Clock();

			window.addEventListener( 'resize', onWindowResize, false );

			/*
			const controls = new OrbitControls( camera, renderer.domElement );
			controls.addEventListener( 'change', () => {

				game.onWindowResize( camera, yResolution );

			} );
			*/

			document.body.addEventListener( 'keydown', ( event ) => {

				switch ( event.code ) {

					case 'ArrowUp':
						game.controller.y = 1;
						break;

					case 'ArrowDown':
						game.controller.y = - 1;
						break;

					case 'ArrowLeft':
						game.controller.x = - 1;
						break;

					case 'ArrowRight':
						game.controller.x = 1;
						break;

					case 'Space':
						game.controller.fire1 = 1;
						break;

					case 'KeyM':
						game.controller.fire2 = 1;
						break;

				}

			}, false );

			document.body.addEventListener( 'keyup', ( event ) => {

				switch ( event.code ) {

					case 'ArrowUp':
						game.controller.y = 0;
						break;

					case 'ArrowDown':
						game.controller.y = 0;
						break;

					case 'ArrowLeft':
						game.controller.x = 0;
						break;

					case 'ArrowRight':
						game.controller.x = 0;
						break;

					case 'Space':
						game.controller.fire1 = 0;
						break;

					case 'KeyM':
						game.controller.fire2 = 0;
						break;

				}

			}, false );

			game = new Game( renderer, camera, Ammo );

			joy1Controller = game.controller;
			window.addEventListener( 'gamepadconnected', onGamepadConnected );
			window.addEventListener( 'gamepaddisconnected', onGamepadDisconnected );

			onWindowResize();
			animate();

		} );

	}

}

function onWindowResize() {

	// Layout video image

	const guiSize = 0;

	var a = window.innerWidth;
	var b = Math.max( 0, window.innerHeight - guiSize );
	var aspectWindow = a / b;
	var width = b * aspect;
	var height = b;
	if ( aspect > aspectWindow ) {
		width = a;
		height = a / aspect;
	}

	const resolutionIsMultiple = true;
	if ( resolutionIsMultiple ) {

		var quotient = 1;
		if ( aspectWindow >= 1 ) {

			quotient = Math.floor( width / xResolution );

		}
		else {

			quotient = Math.floor( height / yResolution );

		}

		if ( quotient > 0 ) {

			width = xResolution * quotient;
			height = yResolution * quotient;

		}

	}

	const canvas = renderer.domElement;
	canvas.style.position = 'absolute';
	canvas.style.width = width + "px";
	canvas.style.height = height + "px";
	canvas.style.left = ( a - width ) / 2 + "px";
	canvas.style.top = ( guiSize + ( b - height ) / 2 ) + "px";
	canvas.style.imageRendering = "crisp-edges";

	clientWidth = width;
	clientHeight = height;

	game.onWindowResize( camera, yResolution );

}

function onGamepadConnected( e ) {

	const gamepad = e.gamepad;

	console.log( "Gamepad connected: " + gamepad.index + ", id:" + gamepad.id + ", num buttons: " + gamepad.buttons.length + ", num axes: " + gamepad.axes.length + ", mapping: " + gamepad.mapping + "." );

	for ( let i = 0, n = connectedGamepads.length; i < n; i ++ ) {

		if ( connectedGamepads[ i ].id === gamepad.id ) {

			return;

		}

	}

	if ( joy1GamepadIndex === null ) {

		joy1GamepadIndex = gamepad.index;

	}
	else if ( joy2GamepadIndex === null ) {

		joy2GamepadIndex = gamepad.index;

	}

	connectedGamepads.push( gamepad );

}

function onGamepadDisconnected( e ) {

	const gamepad = e.gamepad;

	console.log( "Gamepad disconnected, index: " + e.gamepad.index + ", id:" + e.gamepad.id );

	for ( let i = 0, n = connectedGamepads.length; i < n; i ++ ) {

		if ( connectedGamepads[ i ].id === gamepad.id ) {

			if ( joy1GamepadIndex === gamepad.index ) {

				joy1GamepadIndex = null;

			}
			else if ( hostGamepadMappingJoy2 === gamepad.index ) {

				joy2GamepadIndex = null;

			}

			connectedGamepads.splice( i, 1 );

			return;

		}

	}

}

function pollGamepads() {

	if ( joy1GamepadIndex !== null && joy1Controller !== null) {

		pollGamepad( joy1GamepadIndex, joy1Controller );

	}

	if ( joy2GamepadIndex !== null && joy2Controller !== null) {

		pollGamepad( joy2GamepadIndex, joy2Controller );

	}


}

function pollGamepad( gamepadIndex, controller ) {

	const gamepad = navigator.getGamepads()[ gamepadIndex ];

	if ( ! gamepad ) return;

	var numButtons = gamepad.buttons.length;
	for ( let i = 0, n = Math.min( numButtons, 2 ); i < n; i ++ ) {

		const pressed = gamepad.buttons[ i ].pressed;

		const button = i === 0 ? 'fire1' : 'fire2';
		controller[ button ] = pressed ? 1 : 0;

		if ( pressed ) console.log( button );

	}

	controller.x = gamepad.axes[ 0 ];
	controller.y = - gamepad.axes[ 1 ];

}

function animate() {

	const deltaTime = app.clock.getDelta();

	requestAnimationFrame( animate );

	pollGamepads();

	game.step( deltaTime );
	//game.step( 1 / 60 );

	renderer.render( game.scene, camera );

}

export default App;
