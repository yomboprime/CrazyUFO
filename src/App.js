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

class App {

	init() {

		app = this;
		const scope = this;

		Ammo().then( function ( AmmoLib ) {

			Ammo = AmmoLib;

			const cameraWidth = xResolution * 0.5;
			const cameraHeight = yResolution * 0.5;
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

function animate() {

	const deltaTime = app.clock.getDelta();

	requestAnimationFrame( animate );

	game.step( deltaTime );

	renderer.render( game.scene, camera );

}

export default App;
