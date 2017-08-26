

//vars that hold the images for the kernel and the popcorn
var kernelImg;
var popcornImg;
var burntImg;

//vars for the arrays of kernels and popped corn
var kernels; //group of unpopped corn
var corn; //group for popped corns

var burnt = 0; //counter for burnt popcorn
var popped = 0; //counter for popped kernels
var unpopped = 20; //how many kernels do we start with? (keep this above 10 for the outcomes to be assigned correctly)
var outcome = ""; //this will hold the result we give to the player, but it's blank for now

var centerPull = 0.01;

//it's advisable (but not necessary) to load the images in the preload function
//of your sketch otherwise they may appear with a little delay
function preload() {
	kernelImg = loadImage("assets/kernel.png");
	popcornImg = loadImage("assets/popcorn.png");
	burntImg = loadImage("assets/burnt.png");
}

function setup() {
	var canvas = createCanvas(600,400); // create the canvas with the specficed size
	canvas.parent("container"); //position the canvas within the html, look in the index.html file for the div called "container"

	kernels = new Group(); //set kernels to an empty group
	corn = new Group(); //set corn to an empty group

	//loop through the for loop from 0 until i is equal to "unpopped"
	for(var i = 0; i < unpopped; i++){
		var newKernel = createSprite(random(0,width), random(0,height)); //create a new sprite at a random positon
		newKernel.addAnimation("prePop", kernelImg);	//add the kernal image to the sprite with a label (the first one will be the default image)
		newKernel.addAnimation("postPop", popcornImg);	//add the popcorn image to the sprite with a label
		newKernel.addAnimation("burnt", burntImg);		//add the burnt image to the sprite with a label

		newKernel.setVelocity(0.25 + random(-1, 1),		//give the kernal an init velocity
								0.25 + random(-1, 1));

		newKernel.bounce = 0.99;	//add a new variable to sprite for how bouncy it should be (this is a neat feature of js)

		newKernel.direction = random(-1.5, 1.5); //give each kernal a random direction to rotate in
		newKernel.rotation = random(-90, 90);	//give each kernal a random rotation at the start

		newKernel.heat = 0; //here's that cool javascript parameter creation again!

		kernels.add(newKernel); //add the newKernel to the kernels group
	}

	textSize(20);	//set the textSize to 20
}

function draw() {
	background(0);	//draw a black background

	drawSprites(kernels);	//draw all the sprites in the kernels group
	drawSprites(corn);		//draw all the sprites in the corn group

	kernels.collide(kernels, bounce);	//make kernels collide with other kernels, call the "bounce" function (line 180) when they do
	kernels.collide(corn, bounce);		//make kernels collide with corn, call the "bounce" function (line 180) when they do
	corn.collide(corn, bounce);			//make corn collide with other corn, call the "bounce" function (line 180) when they do

	for(var i = 0; i < kernels.length; i++){ //for each sprite in the kernel group

		var kernel = kernels.get(i);	//get the ith sprite out of the group

		bounceOfEdges(kernel);	//call the "bounceOfEdges" on each sprite, see line 186

		//we want the popcorn kernels to cluster in the center
		//if they make it outside the center we coax them back toward the center
		if (kernel.position.x < width/4) {	//if in the first quarter of the canvas horizontally
			kernel.velocity.x += centerPull;	//push towards the center
		} else if (kernel.position.x > width - (width/4)) { //if in the last quarter of the canvas horizontally
			kernel.velocity.x -= centerPull;	//push towards the center
		}

		if (kernel.position.y < height/4) {	//if in the first quarter of the canvas vertically
			kernel.velocity.y += centerPull;	//push towards the center
		} else if (kernel.position.y > height - (height/4)) {	//if in the last quarter of the canvas vertically
			kernel.velocity.y -= centerPull;	//push towards the center
		}

		kernel.rotation += kernel.direction;	//rotate the kernel a little bit each frame

		//now we're checking to see if this kernel is close to the cursor, if so we start heating it up
		if (dist(kernel.position.x, kernel.position.y, mouseX, mouseY) < 25) {
			kernel.heat += 1;
		}
		//once kernels have a heat rating above 20, they're going to pop!
		if (kernel.heat > 20) {
			kernel.changeImage("postPop");	//change the image of the sprite to the popcorn image
			console.log("POP!");	//print out the word "POP!" to the console, this is a useful tool for debugging

			corn.add(kernel);	//add the kernel to the corn group
		
			//take the current velocity then add a huge burst in both x & y movement
			//so that the kernel pops like popcorn
			kernel.velocity.y = kernel.velocity.y + 15 * random(-1, 1);
			kernel.velocity.x = kernel.velocity.x + 15 * random(-1, 1);
	
			kernel.rotation *= -2; //increase and reverse the rotation on a pop
			kernel.bounce = 0.5; //popped corn is less bouncy than kernels 

			kernel.heat = 0;	//reset the heat parameter
			kernel.burnt = false;	//add a parameter to check whether the kernel is burnt
			
			kernels.remove(kernel);	//now remove the kernel from the kernels group, it's now in the corn group

			//increment (add one to) the popped corn & decrement (subtract one from) the kernels
			popped += 1;
			unpopped -= 1;
		}
	}

	for(var i = 0; i < corn.length; i++){	//for each sprite in the corn group

		var popcorn = corn.get(i);	//get the ith sprite out of the group

		popcorn.rotation += popcorn.direction;	//rotate the corn a little bit each frame

		bounceOfEdges(popcorn);	//call the "bounceOfEdges" on each sprite, see line 186

		//just like the kernels, we're tracking heat on the popcorn
		if (dist(popcorn.position.x, popcorn.position.y, mouseX, mouseY) < 40) {
			popcorn.heat += 1;
		}

		//we're not doing anything to coax these back to the center, which makes it easier to avoid burning them

		//if the popcorn gets too hot, it's going to burn
		//but we only want to burn each kernel once, so we check whether it's already burnt
		if (popcorn.heat > 20 && popcorn.burnt == false){
		
			console.log("BURNT!");	//print out the word "BURNT!" to the console

			popcorn.changeImage("burnt");  //change the image to the burnt image
			
			burnt += 1;	//increment the burnt counter
			popcorn.burnt = true;	//set burnt to true so we don't burn this twice
		}
	}

	//once we have no more unpopped corn, we set the outcome
	if (unpopped == 0) {
    	if (burnt == 0) {
			outcome = "FLAWLESS POP!";
		} else if (burnt < popped / 10) {  //we're dividing by 10, etc so we can alter number of kernels
			outcome = "TOP POP!";
		} else if (burnt < popped / 8) {
			outcome = "GOOD POP!";
		} else if (burnt < popped / 6) {
			outcome = "A LIL' BURNT!";
		} else if (burnt < popped / 4) {
			outcome = "KINDA BURNT!";
		} else if (burnt < popped / 2) {
			outcome = "QUITE BURNT!";
		} else if (burnt < popped) {
			outcome = "MOSTLY BURNT";
		} else if (burnt == popped) {
			outcome = "TOTALLY BURNT!";
		}
	}

	fill(255);	//change the color of the text to white
	text("Popped: " + popped, 32, 32);	//display the number of "Popped" corn
	text("Unpopped: " + unpopped, 32, 64);	//display the number of "Unpopped" corn
	text("Burnt: " + burnt, 32, 96);	//display the number of "Burnt" corn

	//if we have an outcome, display it
	if (outcome != "") {
		text(outcome, width/2 - 40, height/2);
	}
}

//function called when sprites collide. Reverves direction, modified by how bouncy they are
function bounce(sprite){
		sprite.velocity.x = -sprite.velocity.x * sprite.bounce;
		sprite.velocity.y = -sprite.velocity.y * sprite.bounce;
}

//function that makes all sprites bounce at the screen edges
function bounceOfEdges(sprite){
	if(sprite.position.x<0) {	//if the sprite is beyond the edge of the canvas on the left
		sprite.position.x = 1;	//put it back on the canvas on the left
		sprite.velocity.x = -sprite.velocity.x * sprite.bounce;	//reverse the x velocity and modify it by how bouncy the sprite is
	}
  
	if(sprite.position.x>width) {	//if the sprite is beyond the edge of the canvas on the right
		sprite.position.x = width-1;	//put it back on the canvas on the right
		sprite.velocity.x = -abs(sprite.velocity.x) * sprite.bounce;	//reverse the x velocity and modify it by how bouncy the sprite is
	}
  
	if(sprite.position.y<0) {	//if the sprite is beyond the edge of the canvas on the top
		sprite.position.y = 1;	//put it back on the canvas at the top
		sprite.velocity.y = abs(sprite.velocity.y) * sprite.bounce;	//reverse the y velocity and modify it by how bouncy the sprite is
	}
  
	if(sprite.position.y>height) {	//if the sprite is beyond the edge of the canvas on the bottom
		sprite.position.y = height-1;	//put it back on the canvas on the bottom
		sprite.velocity.y = -abs(sprite.velocity.y) * sprite.bounce;	//reverse the y velocity and modify it by how bouncy the sprite is
	}
}