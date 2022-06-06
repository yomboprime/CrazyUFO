import {
	Points,
	Vector3,
	Color,
	Plane,
	Quaternion,
	Mesh,
	DoubleSide,
	Group,
	MathUtils,
	MeshBasicMaterial,
	DataTexture,
	RGBAFormat,
	FloatType,
	ShaderMaterial,
	BufferGeometry,
	ShapeGeometry,
	BoxGeometry,
	Float32BufferAttribute,
	Scene,
	AudioListener,
	Audio,
	AudioLoader
} from 'three';

import { ConvexObjectBreaker } from 'three/examples/jsm/misc/ConvexObjectBreaker.js';
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

import { ObjectsCreator } from './ObjectsCreator.js';
import { ObjectsUtils } from './ObjectsUtils.js';
import { TimerActuator } from './actuators/TimerActuator.js';
import { Controller } from './Controller.js';



class Game {

	constructor( renderer, camera, Ammo ) {

		this.scene = new Scene();
		this.scene.background = new Color( 0x285f6fff );

		this.camera = camera;

		// Physics variables
		this.Ammo = Ammo;
		this.gravityConstant = 9.8;
		this.collisionConfiguration = null;
		this.dispatcher = null;
		this.broadphase = null;
		this.solver = null;
		this.physicsWorld = null;
		this.margin = 0.1;
		this.convexBreaker = new ConvexObjectBreaker();
		this.rigidBodies = [];
		this.pos = new Vector3();
		this.quat = new Quaternion();
		this.transformAux1 = null;
		this.tempVec3_1 = null;

		this.tempVRayOrigin = null;
		this.tempVRayDest = null;

		this.tempBtVec3_1 = null;
		this.tempBtVec3_2 = null;
		this.tempBtVec3_3 = null;
		this.tempbtQuat = null;
		this.closestRayResultCallback = null;

		this.initPhysics();

		this.actuators = [];
		this.controller = new Controller();

		this.collisionTriggers = {};

		this.listener = new AudioListener();
		this.camera.add( this.listener );

		this.time = 0;


		this.meanUFOSpeed = 0;

		this.vehicle = null;
		this.scenery = null;
		this.spark = null;


		// Sounds

		this.sounds = {};

		const scope = this;
		const audioLoader = new AudioLoader();

		function loadSound( path ) {

			const sound = new Audio( scope.listener );

			audioLoader.load( path, ( buffer ) => {

				sound.setBuffer( buffer );
				sound.setVolume( 1 );

			} );

			return sound;

		}

		this.sounds.soundExplosion1 = loadSound( 'Explosion3__003.ogg' );
		this.sounds.soundExplosion2 = loadSound( 'Explosion 4 - Sound effects Pack 2.ogg' );
		this.sounds.soundShot1 = loadSound( 'Pew__009.ogg' );
		this.sounds.soundHit1 = loadSound( 'Punch__008.ogg' );

		// A box
		this.scene.add( new Mesh( new BoxGeometry(), new MeshBasicMaterial( { color: 'blue' } ) ) );

		// Floor
		const floor = new this.Ammo.btStaticPlaneShape( new this.Ammo.btVector3( 0, 1, 0 ), 0 );
		this.createRigidBody( null, floor, 0, null, null, null, null );

		//this.createDebris( 15, 5, 5, 'yellow', new Vector3( 35, 20, 0 ) );

		//this.fillWithDebris( 15, 2, 5, 'yellow', new Vector3( -5, 30, 0 ), new Vector3( 35, 20, 0 ) );

		//this.createWall( 50, 20, new Vector3( 20, 11, 0 ), 100, 'green' );

		const bar = this.createParalellepipedWithPhysics( 10, 5, 2, 5, new Vector3( -500, 680, 0 ), new Quaternion( 0, 0, 0, 1 ), this.createColor( 'white' ) );

		this.assignDamageTrigger( bar, 1000, () => {

			scope.removeDebris( bar );
			scope.explodeObject( bar, 16, 200 );
			scope.playSound( scope.sounds.soundExplosion2 );

		} );

		const objectsCreator = new ObjectsCreator( this );
		const objectsUtils = new ObjectsUtils( this );

		const urlParams = new URLSearchParams( window.location.search );
		const vehicleFunc = urlParams.get( 'plane' ) ? 'createPlane' : 'createUFO';
		//objectsCreator.createUFO( new Vector3( -540, 750, 0 ), ( vehicle ) => {
		//objectsCreator.createPlane( new Vector3( -540, 750, 0 ), ( vehicle ) => {
		objectsCreator[ vehicleFunc ]( new Vector3( -750, 750, 0 ), ( vehicle ) => {

			scope.vehicle = vehicle;

			scope.addCollisionTrigger( vehicle, bar, ( objectsToRemove ) => {

				scope.makeDamage( bar, 10000 );

			} );

			objectsCreator.createDepositAndStructure( new Vector3( -400, 655, 0 ) );
			objectsCreator.createDepositAndStructure( new Vector3( -450, 655, 0 ) );

			objectsCreator.createCannon( new Vector3( -295, 560, 0 ), vehicle );
			objectsCreator.createDepositAndStructure( new Vector3( -350, 550, 0 ) );

			objectsCreator.createCannon( new Vector3( 240, 620, 0 ), vehicle );
			objectsCreator.createCannon( new Vector3( 280, 620, 0 ), vehicle );
			objectsCreator.createDepositAndStructure( new Vector3( 326, 620, 0 ) );

			objectsCreator.createCannon( new Vector3( 600, 530, 0 ), vehicle );
			objectsCreator.createCannon( new Vector3( 650, 530, 0 ), vehicle );

			objectsCreator.createCannon( new Vector3( 700, 510, 0 ), vehicle );
			objectsCreator.createCannon( new Vector3( 750, 470, 0 ), vehicle );

			objectsCreator.createDepositAndStructure( new Vector3( 820, 300, 0 ) );
			objectsCreator.createDepositAndStructure( new Vector3( 860, 300, 0 ) );
			objectsCreator.createDepositAndStructure( new Vector3( 900, 300, 0 ) );

			objectsCreator.createCannon( new Vector3( 1200, 865, 0 ), vehicle );
			objectsCreator.createCannon( new Vector3( 1280, 865, 0 ), vehicle );
			objectsCreator.createCannon( new Vector3( 1360, 865, 0 ), vehicle );

			objectsCreator.createDepositAndStructure( new Vector3( 1450, 860, 0 ) );
			objectsCreator.createDepositAndStructure( new Vector3( 1500, 840, 0 ) );
		} );

		this.loadSVG( './scenery1.svg', {}, ( scenery ) => {

			scope.scenery = scenery;
			scenery.position.z = 0.1;
			scenery.userData.mass = 0;
			scope.createDebrisFromBreakableObject( scenery, 10, true );

		} );

		this.loadSVG( './spark.svg', {}, ( spark ) => {

			scope.spark = spark;

		} );

/*
		this.loadSVG( './strangeRock.svg', {}, ( rock ) => {

			rock.userData.mass = 0;
			rock.position.set( -500, 680, 0 );
			scope.createDebrisFromBreakableObject( rock, 1, true );

		} );
*/
	}

	createColor( color ) {

		return new MeshBasicMaterial( { color: color } );

	}

	loadSVG( url, options, callback ) {

		const scope = this;

		new SVGLoader().load( url, ( data ) => {

			scope.parseSVG( data, options, callback );

		} );

	}

	parseSVG( data, options, callback ) {

		const paths = data.paths;

		const group = new Group();

	/*
		group.scale.multiplyScalar( 0.25 );
		group.position.x = - 70;
		group.position.y = 70;
		group.scale.y *= - 1;
	*/

		for ( let i = 0; i < paths.length; i ++ ) {

			const path = paths[ i ];

			let wheelNumber = NaN;
			let mass = 0;

			const id = path.userData.node.id;
			const idParts = id.split( '_' );
			for ( let i = 1, l = idParts.length; i < l; i ++ ) {

				const tokens = idParts[ i ].split( '=' );
				if ( tokens.length === 2 ) {

					switch ( tokens[ 0 ] ) {

						case 'w':
							wheelNumber = parseInt( tokens[ 1 ] );
							break;

						case 'm':
							mass = parseFloat( tokens[ 1 ] );
							break;

						default:
							break;
					}
				}

			}

			const fillColor = path.userData.style.fill;
			if ( fillColor !== undefined && fillColor !== 'none' ) {

				const material = new MeshBasicMaterial( {
					color: new Color().setStyle( fillColor ),//.convertSRGBToLinear(),
					opacity: path.userData.style.fillOpacity,
					side: DoubleSide,
					transparent: path.userData.style.fillOpacity < 1
				} );

				const shapes = SVGLoader.createShapes( path );

				for ( let j = 0; j < shapes.length; j ++ ) {

					const shape = shapes[ j ];

					const geometry = new ShapeGeometry( shape );
					geometry.scale( 1, -1, 1 );

					const mesh = new Mesh( geometry, material );

					mesh.userData.shape = shape;

					group.add( mesh );

				}

			}

		}

		callback( group );

	}

	initPhysics() {

		// Physics configuration

		this.collisionConfiguration = new this.Ammo.btDefaultCollisionConfiguration();
		this.dispatcher = new this.Ammo.btCollisionDispatcher( this.collisionConfiguration );
		this.broadphase = new this.Ammo.btDbvtBroadphase();
		this.solver = new this.Ammo.btSequentialImpulseConstraintSolver();
		this.physicsWorld = new this.Ammo.btDiscreteDynamicsWorld( this.dispatcher, this.broadphase, this.solver, this.collisionConfiguration );
		this.physicsWorld.setGravity( new this.Ammo.btVector3( 0, - this.gravityConstant, 0 ) );

		this.transformAux1 = new this.Ammo.btTransform();
		this.tempVec3_1 = new Vector3();

		this.tempVRayOrigin = new this.Ammo.btVector3();
		this.tempVRayDest = new this.Ammo.btVector3();

		this.tempBtVec3_1 = new this.Ammo.btVector3( 0, 0, 0 );
		this.tempBtVec3_2 = new this.Ammo.btVector3( 0, 0, 0 );
		this.tempBtVec3_3 = new this.Ammo.btVector3( 0, 0, 0 );

		this.tempbtQuat = new this.Ammo.btQuaternion();
		this.closestRayResultCallback = new this.Ammo.ClosestRayResultCallback( this.tempVRayOrigin, this.tempVRayDest );

	}

	getTriggerHash( object1, object2 ) {

		return object1.id + '_' + ( object2 ? object2.id : '' );

	}

	addCollisionTrigger( object1, object2, trigger ) {

		const hash1 = this.getTriggerHash( object1, object2 );
		const hash2 = this.getTriggerHash( object2, object1 );

		this.collisionTriggers[ hash1 ] = trigger;
		this.collisionTriggers[ hash2 ] = trigger;

	}

	addSingleCollisionTrigger( object, trigger ) {

		const hash = this.getTriggerHash( object );

		this.collisionTriggers[ hash ] = trigger;

	}

	assignDamageTrigger( object, shield, trigger ) {

		object.userData.shield = shield;
		const scope = this;
		object.userData.damage = ( damage ) => {

			object.userData.shield -= damage;
			if ( object.userData.shield < 0 ) {

				object.userData.destroyed = true;
				if ( trigger ) trigger();

			}

		}
	}

	makeDamage( object, damage, objectsToRemove ) {

		if ( object.userData.damage ) object.userData.damage( damage );
		else if ( object.userData.mass > 0 ) objectsToRemove.push( object );

	}

	getObjectVelocity( object, result ) {

		const v = object.userData.rigidBody.getLinearVelocity();
		result.set( v.x(), v.y(), v.z() );
	}

	getObjectAngularVelocity( object, result ) {

		const v = object.userData.rigidBody.getAngularVelocity();
		result.set( v.x(), v.y(), v.z() );

	}

	playSound( sound ) {

		if ( sound.isPlaying ) sound.stop();
		sound.play();

	}

	castPhysicsRay( origin, dest, intersectionPoint, intersectionNormal ) {

		// Returns null or object if ray hit, and returns intersection data on the last two vector parameters
		// TODO Mask and group filters can be added to the test (rayCallBack.m_collisionFilterGroup and m_collisionFilterMask)

		// Reset closestRayResultCallback to reuse it
		const rayCallBack = this.Ammo.castObject( this.closestRayResultCallback, this.Ammo.RayResultCallback );
		rayCallBack.set_m_closestHitFraction( 1 );
		rayCallBack.set_m_collisionObject( null );

		// Set closestRayResultCallback origin and dest
		this.tempVRayOrigin.setValue( origin.x, origin.y, origin.z );
		this.tempVRayDest.setValue( dest.x, dest.y, dest.z );
		this.closestRayResultCallback.get_m_rayFromWorld().setValue( origin.x, origin.y, origin.z );
		this.closestRayResultCallback.get_m_rayToWorld().setValue( dest.x, dest.y, dest.z );

		// Perform ray test
		this.physicsWorld.rayTest( this.tempVRayOrigin, this.tempVRayDest, this.closestRayResultCallback );

		if ( this.closestRayResultCallback.hasHit() ) {

			if ( intersectionPoint ) {
				const point = this.closestRayResultCallback.get_m_hitPointWorld();
				intersectionPoint.set( point.x(), point.y(), point.z() );
			}

			if ( intersectionNormal ) {
				const normal = this.closestRayResultCallback.get_m_hitNormalWorld();
				intersectionNormal.set( normal.x(), normal.y(), normal.z() );
			}

			const rb = this.closestRayResultCallback.m_collisionObject;
			if ( rb ) {

				const btv3 = this.Ammo.castObject( rb.getUserPointer(), this.Ammo.btVector3 );

				if ( btv3 && btv3.threeObject ) return btv3.threeObject;

				return null;

			}

		}
		else {

			return null;

		}

	}

	createParalellepipedWithPhysics( sx, sy, sz, mass, pos, quat, material ) {

		const object = new Mesh( new BoxGeometry( sx, sy, sz, 1, 1, 1 ), material );
		const shape = new this.Ammo.btBoxShape( new this.Ammo.btVector3( sx * 0.5, sy * 0.5, sz * 0.5 ) );
		shape.setMargin( this.margin );

		this.createRigidBody( object, shape, mass, pos, quat );

		return object;

	}

	explodeObject( object, radius, strength ) {

		this.createExplosion( object.position, radius, strength );

	}

	createExplosion( pos, radius, strength ) {

		if ( ! this.spark ) return;

		const sparkRadius = 3;

		for ( let i = 0, l = Math.ceil( radius * radius / ( sparkRadius * sparkRadius ) ); i < l; i ++ ) {

			const spark = this.spark.clone();

			const angle = Math.random() * Math.PI;
			spark.position.set( Math.cos( angle ) * Math.random() * radius, Math.sin( angle ) * Math.random() * radius, 0 ).add( pos );
			const f = Math.random();
			spark.userData.velocity = new Vector3( Math.cos( angle ) * f * strength, Math.sin( angle ) * f * strength );
			spark.userData.angularVelocity = new Vector3( 0, 0, Math.random() * strength );

			const sparkShape = new this.Ammo.btSphereShape( sparkRadius );
			sparkShape.setMargin( this.margin );

			this.createRigidBody( spark, sparkShape, 0.5, spark.position, spark.quaternion, spark.userData.velocity, spark.userData.angularVelocity );

			const timer = new TimerActuator( this );
			timer.addTo( spark );
			timer.expiration = this.time + 2 + Math.random() * 3;
			this.actuators.push( timer );

		}
	}

	fillWithDebris( numPoints, radius, mass, color, minPos, maxPos ) {

		for ( let j = 0, jl = Math.ceil( ( maxPos.y - minPos.y ) / ( 2 * radius ) ); j < jl; j ++ ) {

			for ( let i = 0, il = Math.ceil( ( maxPos.x - minPos.x ) / ( 2 * radius ) ); i < il; i ++ ) {

				this.tempVec3_1.set( minPos.x + i * 2 * radius, minPos.y + j * 2 * radius, 0 );
				this.createDebris( numPoints, radius, mass, color, this.tempVec3_1 );

			}

		}

	}

	createWall( width, height, pos, mass, color ) {

		const vertices = [];

		vertices.push( new Vector3( pos.x - width * 0.5, pos.y - height * 0.5, - 0.5 ) );
		vertices.push( new Vector3( pos.x + width * 0.5, pos.y - height * 0.5, - 0.5 ) );
		vertices.push( new Vector3( pos.x - width * 0.5, pos.y + height * 0.5, - 0.5 ) );
		vertices.push( new Vector3( pos.x + width * 0.5, pos.y + height * 0.5, - 0.5 ) );

		vertices.push( new Vector3( pos.x - width * 0.5, pos.y - height * 0.5, + 0.5 ) );
		vertices.push( new Vector3( pos.x + width * 0.5, pos.y - height * 0.5, + 0.5 ) );
		vertices.push( new Vector3( pos.x - width * 0.5, pos.y + height * 0.5, + 0.5 ) );
		vertices.push( new Vector3( pos.x + width * 0.5, pos.y + height * 0.5, + 0.5 ) );

		const geometry = new ConvexGeometry( vertices );
		const object = new Mesh( geometry, this.createColor( color ) );
		object.userData.mass = mass;

		this.convexBreaker.prepareBreakableObject( object, mass, new Vector3(), new Vector3(), true );
		this.createDebrisFromBreakableObject( object );

		const scope = this;
		subdivide( object, 40 );

		function subdivide( object, iteration ) {

			const output = {};

			object.geometry.computeBoundingBox();

			object.geometry.boundingBox.getSize( scope.tempVec3_1 );
			const d = scope.tempVec3_1.y * ( 2 * Math.random() - 1 );
			const plane = new Plane( new Vector3( 2 * Math.random() - 1, 2 * Math.random() - 1, 0 ).normalize(), d );

			scope.convexBreaker.cutByPlane( object, plane, output );

			scope.removeDebris( object );

			if ( output.object1 ) {

				if ( iteration > 0 ) subdivide( output.object1, iteration - 1 );
				else scope.createDebrisFromBreakableObject( output.object1 );

			}

			if ( output.object2 ) {

				if ( iteration > 0 ) subdivide( output.object2, iteration - 1 );
				else scope.createDebrisFromBreakableObject( output.object2 );

			}

		}

	}

	createDebris( numPoints, radius, mass, color, pos ) {

		const vertices = [];

		for ( let i = 0; i < numPoints; i ++ ) {

			const x = radius * ( 2 * Math.random() - 1 );
			const y = radius * ( 2 * Math.random() - 1 );

			vertices.push( new Vector3( x, y, - 0.5 ) );
			vertices.push( new Vector3( x, y, + 0.5 ) );

		}

		const geometry = new ConvexGeometry( vertices );
		const object = new Mesh( geometry, this.createColor( color ) );
		object.position.copy( pos );
		object.userData.mass = mass;

		//convexBreaker.prepareBreakableObject( object, mass, new Vector3(), new Vector3(), true );
		this.createDebrisFromBreakableObject( object );

	}

	createDebrisFromBreakableObject( object, scale = 1, dupPoints ) {

		let shape = null;
		if ( object.isGroup ) shape = this.createCompoundPhysicsShape( object, scale, object.userData.mass === 0, dupPoints );
		else {

			object.geometry.scale( scale, scale, 1 );
			shape = this.createConvexHullPhysicsShape( object.geometry.attributes.position.array, dupPoints );

		}

		shape.setMargin( this.margin );

		const body = this.createRigidBody( object, shape, object.userData.mass, object.position, object.quaternion, object.userData.velocity, object.userData.angularVelocity );

	}

	removeDebris( object ) {

		this.scene.remove( object );
		this.physicsWorld.removeRigidBody( object.userData.rigidBody );

	}

	createCompoundPhysicsShape( group, scale = 1, isStatic, dupPoints ) {

		const compoundShape = new this.Ammo.btCompoundShape();

		this.transformAux1.setIdentity();
		const scope = this;

		group.traverse( ( c ) => {

			if ( c.isMesh ) {

				c.geometry.scale( scale, scale, 1 );

				let childShape = null;

				if ( isStatic ) childShape = scope.createBVHPhysicsShape( c, scale );
				else childShape = scope.createConvexHullPhysicsShape( c.geometry.attributes.position.array, dupPoints );

				compoundShape.addChildShape( scope.transformAux1, childShape );

			}

		} );

		return compoundShape;


	}

	createConvexHullPhysicsShape( coords, dupPoints ) {

		const shape = new this.Ammo.btConvexHullShape();

		for ( let i = 0, il = coords.length; i < il; i += 3 ) {

			this.tempBtVec3_1.setValue( coords[ i ], coords[ i + 1 ], dupPoints ? 1 : coords[ i + 2 ] );
			const lastOne = ( i >= ( il - 3 ) ) && ! dupPoints;
			shape.addPoint( this.tempBtVec3_1, lastOne );

			if ( dupPoints ) {

				this.tempBtVec3_1.setValue( coords[ i ], coords[ i + 1 ], - coords[ i + 2 ] );
				const lastOne = ( i >= ( il - 3 ) );
				shape.addPoint( this.tempBtVec3_1, lastOne );

			}

		}

		return shape;

	}

	createBVHPhysicsShape( mesh, scale ) {

		// Flags: 32 bit indices?, 4 components?
		const shapeTriMesh = new this.Ammo.btTriangleMesh( true , false );
		const indices = mesh.geometry.getIndex().array;
		const positions = mesh.geometry.getAttribute( 'position' ).array;

		for ( let i = 0, il = indices.length; i < il; i+= 3 ) {

			var pos = indices[ i ] * 3;
			this.tempBtVec3_1.setValue( positions[ pos ], positions[ pos + 1 ], positions[ pos + 2 ] );
			pos = indices[ i + 1 ] * 3;
			this.tempBtVec3_2.setValue( positions[ pos ], positions[ pos + 1 ], positions[ pos + 2 ] );
			pos = indices[ i + 2 ] * 3;
			this.tempBtVec3_3.setValue( positions[ pos ], positions[ pos + 1 ], positions[ pos + 2 ] );

			shapeTriMesh.addTriangle( this.tempBtVec3_1, this.tempBtVec3_2, this.tempBtVec3_3, i >= il - 3 );
			//shapeTriMesh.addTriangle( this.tempBtVec3_1, this.tempBtVec3_2, this.tempBtVec3_3, false );

		}

		const s = scale;
		const curves = mesh.userData.shape.curves;
		for ( let i = 0, il = curves.length; i < il; i ++ ) {

			this.tempBtVec3_1.setValue( s * curves[ i ].v1.x, - s * curves[ i ].v1.y, 1 );
			this.tempBtVec3_2.setValue( s * curves[ i ].v2.x, - s * curves[ i ].v2.y, 1 );
			this.tempBtVec3_3.setValue( s * curves[ i ].v1.x, - s * curves[ i ].v1.y, -1 );

			shapeTriMesh.addTriangle( this.tempBtVec3_1, this.tempBtVec3_2, this.tempBtVec3_3, false );


			this.tempBtVec3_1.setValue( s * curves[ i ].v2.x, - s * curves[ i ].v2.y, 1 );
			this.tempBtVec3_2.setValue( s * curves[ i ].v1.x, - s * curves[ i ].v1.y, -1 );
			this.tempBtVec3_3.setValue( s * curves[ i ].v2.x, - s * curves[ i ].v2.y, -1 );

			shapeTriMesh.addTriangle( this.tempBtVec3_1, this.tempBtVec3_2, this.tempBtVec3_3, i >= il - 1 );

		}

		// Flags: aabb compression?, buildbvh?
		var shape = new this.Ammo.btBvhTriangleMeshShape( shapeTriMesh, true , true );
		shape.setMargin( this.margin );

		return shape;

	}

	createRigidBody( object, physicsShape, mass, pos, quat, vel, angVel ) {

		if ( object ) {

			if ( pos ) {

				object.position.copy( pos );

			} else {

				pos = object.position;

			}

			if ( quat ) {

				object.quaternion.copy( quat );

			} else {

				quat = object.quaternion;

			}

		}

		const transform = new this.Ammo.btTransform();
		transform.setIdentity();
		if ( pos ) transform.setOrigin( new this.Ammo.btVector3( pos.x, pos.y, pos.z ) );
		else transform.setOrigin( new this.Ammo.btVector3( 0, 0, 0 ) );
		if ( quat ) transform.setRotation( new this.Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
		else transform.setRotation( new this.Ammo.btQuaternion( 0, 0, 0, 1 ) );
		const motionState = new this.Ammo.btDefaultMotionState( transform );

		const localInertia = new this.Ammo.btVector3( 0, 0, 0 );
		physicsShape.calculateLocalInertia( mass, localInertia );

		const rbInfo = new this.Ammo.btRigidBodyConstructionInfo( mass, motionState, physicsShape, localInertia );
		const body = new this.Ammo.btRigidBody( rbInfo );

		body.setFriction( 0.5 );

		this.tempBtVec3_1.setValue( 1, 1, 0 );
		body.setLinearFactor( this.tempBtVec3_1 );
		this.tempBtVec3_1.setValue( 0, 0, 1 );
		body.setAngularFactor( this.tempBtVec3_1 );

		if ( vel ) {

			body.setLinearVelocity( new this.Ammo.btVector3( vel.x, vel.y, vel.z ) );

		}

		if ( angVel ) {

			body.setAngularVelocity( new this.Ammo.btVector3( angVel.x, angVel.y, angVel.z ) );

		}

		if ( object ) {

			object.userData.rigidBody = body;
			object.userData.collided = false;
			object.userData.mass = mass;

			const btVecUserData = new this.Ammo.btVector3( 0, 0, 0 );
			btVecUserData.threeObject = object;
			body.setUserPointer( btVecUserData );

			this.scene.add( object );

		}

		if ( mass > 0 ) {

			if ( object ) this.rigidBodies.push( object );

			// Disable deactivation
			body.setActivationState( 4 );

		}

		this.physicsWorld.addRigidBody( body );

		return body;

	}


	step( deltaTime ) {

		for ( let i = 0, l = this.actuators.length; i < l; ) {

			this.actuators[ i ].actuate( deltaTime );

			if ( this.actuators[ i ].isDestroyed() ) {

				this.actuators.splice( i, 1 );
				l --;

			}
			else i ++;

		}

		if ( this.vehicle ) {

			this.camera.position.x = this.vehicle.position.x;
			this.camera.position.y = this.vehicle.position.y;

			//const speed = this.vehicle.userData.rigidBody.getLinearVelocity().length();
			//this.meanUFOSpeed = this.meanUFOSpeed * 0.99 + speed * 0.01;

//			if ( this.meanUFOSpeed > 0 ) this.camera.zoom = Math.max( 0.5, Math.min( 1, 1 / this.meanUFOSpeed ) );
//			else this.camera.zoom = 1;
//console.log( this.camera.zoom );

			this.camera.updateProjectionMatrix();

		}

		this.updatePhysics( deltaTime );

		this.time += deltaTime;

	}

	onWindowResize( camera, yResolution ) {

		//this.particlesObject.material.uniforms[ 'cameraConstant' ].value = this.getCameraConstant( camera, yResolution );

	}

	getCameraConstant( camera, yResolution ) {

		return yResolution / ( Math.tan( MathUtils.DEG2RAD * 0.5 * camera.fov ) / camera.zoom );

	}

	updatePhysics( deltaTime ) {

		// Step world
		this.physicsWorld.stepSimulation( deltaTime, 10 );

		// Update rigid bodies
		for ( let i = 0, il = this.rigidBodies.length; i < il; i ++ ) {

			const objThree = this.rigidBodies[ i ];
			const objPhys = objThree.userData.rigidBody;
			const ms = objPhys.getMotionState();

			if ( ms ) {

				ms.getWorldTransform( this.transformAux1 );
				const p = this.transformAux1.getOrigin();
				const q = this.transformAux1.getRotation();
				objThree.position.set( p.x(), p.y(), p.z() );
				objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );

			}

		}

		this.checkCollisions();

	}

	checkCollisions() {

		const objectsToRemove = [];

		for ( let i = 0, il = this.dispatcher.getNumManifolds(); i < il; i ++ ) {

			const contactManifold = this.dispatcher.getManifoldByIndexInternal( i );
			const rb0 = this.Ammo.castObject( contactManifold.getBody0(), this.Ammo.btRigidBody );
			const rb1 = this.Ammo.castObject( contactManifold.getBody1(), this.Ammo.btRigidBody );

			const threeObject0 = this.Ammo.castObject( rb0.getUserPointer(), this.Ammo.btVector3 ).threeObject;
			const threeObject1 = this.Ammo.castObject( rb1.getUserPointer(), this.Ammo.btVector3 ).threeObject;

			if ( ! threeObject0 || ! threeObject1 ) {

				continue;

			}

			let contact = false;
			for ( let j = 0, jl = contactManifold.getNumContacts(); j < jl; j ++ ) {

				const contactPoint = contactManifold.getContactPoint( j );

				if ( contactPoint.getDistance() < 0 ) {

					contact = true;
					break;

				}

			}

			// If no point has contact, abort
			if ( ! contact ) continue;

			const hash = this.getTriggerHash( threeObject0, threeObject1 );
			const trigger = this.collisionTriggers[ hash ];
			if ( trigger ) {

				trigger( objectsToRemove );

			}

			const hash2 = this.getTriggerHash( threeObject0 );
			const trigger2 = this.collisionTriggers[ hash2 ];
			if ( trigger2 ) {

				trigger2( objectsToRemove, threeObject1 );

			}

			const hash3 = this.getTriggerHash( threeObject1 );
			const trigger3 = this.collisionTriggers[ hash3 ];
			if ( trigger3 ) {

				trigger3( objectsToRemove, threeObject0 );

			}


		}

		for ( let i = 0, l = objectsToRemove.length; i < l; i ++ ) {

			this.removeDebris( objectsToRemove[ i ] );

		}

	}

}

export { Game };
