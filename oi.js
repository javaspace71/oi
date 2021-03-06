window.onload = init;

function init() {
	//SETTINGS
	var width = 1250;
	var height = 750;
	var worldBorderOffset = 25;
	var collisionVelocityThreshold = 5;
	var bgColor = 0x777AAA;

	//ALIASES
	//pixi js
	var Container = PIXI.Container,
		autoDetectRenderer = PIXI.autoDetectRenderer,
		loader = PIXI.loader,
		resources = PIXI.loader.resources,
		Sprite = PIXI.Sprite;
	//matter js
	var Engine = Matter.Engine,
	    World = Matter.World,
	    Bodies = Matter.Bodies;

	//pixi js RENDERER & STAGE
	var renderer = PIXI.autoDetectRenderer(width, height),
		stage = new PIXI.Container();
	renderer.backgroundColor = bgColor;
	document.body.appendChild(renderer.view);

	//matter js ENGINE
	var engine = Engine.create();


	var enter = keyboard(13);
	enter.press = function() {
		if(gameState === intro){
			gameState = game;
		} else {
			if(engine.world.gravity.y === 1){
				engine.world.gravity.y = -0.5;
				engine.world.gravity.x = ((Math.random()>0.5)?-1:1) * (Math.floor(Math.random() * 0.2) + 0.05)
			} else {
				engine.world.gravity.y = 1;
				engine.world.gravity.x = 0;
			}
		}
	};
	enter.release = function() {};

	//IMAGE LOADING
	loader
		.add("boxImage", "img/box.png")
		.add("wallImage", "img/stone.jpg")
		.add("playerImage", "img/player.png")
		.load(setup);


	//sprites, etc.
	var gameState, message;
	var bodies = [];

	var helper = new Helper(stage, bodies, World , engine);

	var introInitHasBeenCalled = false;
	var gameInitHasBeenCalled = false;

	Matter.Events.on(engine, 'collisionStart', function(event) {
		var pairs = event.pairs;

		for (var i = 0; i < pairs.length; i++) {
			var pair = pairs[i];

			//play collision sound only if velocity is high enough
			if(pair.bodyA.velocity.y > collisionVelocityThreshold || pair.bodyA.velocity.x > collisionVelocityThreshold ||
			pair.bodyB.velocity.y > collisionVelocityThreshold || pair.bodyB.velocity.x > collisionVelocityThreshold){
				playSound("boxCollision");
			}
		}
	});

	//SETUP
	function setup() {
		// gameState = intro;
		gameState = game;

		//borders
		World.add(engine.world, [
		    Bodies.rectangle(width/2, - worldBorderOffset, width + .5 + 2 * worldBorderOffset, 50+ .5, { isStatic: true }),
		    Bodies.rectangle(width/2, height + worldBorderOffset, width + .5 + 2 * worldBorderOffset, 50 +.5, { isStatic: true }),
		    Bodies.rectangle(width + worldBorderOffset, height/2, 50 + .5, height + .5 + 2 * worldBorderOffset, { isStatic: true }),
		    Bodies.rectangle(- worldBorderOffset, height/2, 50 + .5, height + .5 + 2 * worldBorderOffset, { isStatic: true })
		]);

		gameLoop();
	};

	//GAME LOOP
	function gameLoop() {

		//Loop this function at 60 frames per second
		requestAnimationFrame(gameLoop);

		gameState();

		//Render the stage to see the animation
		renderer.render(stage);
	}

	var intro = function() {
		if(!introInitHasBeenCalled){
			message = new PIXI.Text(
				"   READY PLAYER ONE \n Press Enter to Start", {
					font: "25px Source Code Pro",
					fill: "white"
				}
			);
			message.position.set(width/2-160, height/2-20);
			stage.addChild(message);

			introInitHasBeenCalled = true;
		}
	};

	var game = function() {
		if(!gameInitHasBeenCalled){
			stage.removeChild(message);

			var ground = new Wall(width/2, height-15, width, 30, { isStatic: true, tiling: true, label: 'Ground' });
			helper.addBody(ground);

			var player = new Player(width/2, height/2, 50, 100,{ label: 'Player' });
			helper.addBody(player);

			helper.addRandomBoxes(width, height,15);

			Engine.run(engine);

			gameInitHasBeenCalled = true;
		}

		for(var b in bodies) {
			bodies[b].sprite.position = bodies[b].physicsObject.position;
			bodies[b].sprite.rotation = bodies[b].physicsObject.angle;
		}
	};
}
