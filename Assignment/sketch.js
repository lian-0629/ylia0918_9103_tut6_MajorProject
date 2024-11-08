const colourPalette = ['#E54379', '#CB010B', '#782221', 'purple'];
const colorKeys = ["flower", "leaves", "endLeaves", "endLeavesStroke"];
let circles = [];
let dots = [];
let centerSphereSize, endSphereSize, endSphereStroke;
let c1, c2;

function setup() { 
  createCanvas(windowWidth, windowHeight);
  initializeElements();
  c1 = color(50, 0, 50);
  c2 = color(250, 200, 200);
}

function initializeElements() {
  circles = []; // Clear the existing circle data
  const gridSize = windowWidth / 5; 
  const rows = ceil(windowHeight / gridSize);
  const cols = ceil(windowWidth / gridSize);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Randomize position within the grid cell, with a small random offset
      let x = col * gridSize + random(gridSize * 0.2, gridSize * 0.8);
      let y = row * gridSize + random(gridSize * 0.2, gridSize * 0.8);
      let r = random(50, 100);
      leafCount = Math.floor(random(8,15));
      let noiseOffset = random(300);
    
      // Check if this circle overlaps with any previous circle in `circles`
      let overlapping = false;
      for (let other of circles) {
        let d = dist(x, y, other.x, other.y);
        if (d < r + other.r) {
          overlapping = true;
          break;
        }
      }

      // Only add the circle if it’s not overlapping
      if (!overlapping) {
        // Define Colors to each circle
        let colors = Object.fromEntries(
          colorKeys.map(key => [key, colourPalette[floor(random(colourPalette.length))]])
        );
        circles.push({ x, y, r, leafCount, colors, noiseOffset});
      }
    }
  }

  angleMode(DEGREES);
  centerSphereSize = random(10, 30); // size of the cirle in the center of the flower
  endSphereSize = centerSphereSize/2; // size of the circle in the end of the leaves
  endSphereStroke = endSphereSize/3; // size of the circle stroke in the end of the leaves

  // Initialize background dots
  let numDots = int(width/5);
  dots = [];
  // Push new dots when there're dots moving out of the boundries
  for (let i = 0; i < numDots; i++){
    dots.push(new dot());
  }
}

// Main drawing function
function draw() {
  background(20, 0, 50); // Set background color
  setGradientBlock(0, width / 2, 0, height, c2, c1, 80); //set two blocks with gradient colour, adding deepth on the background
  setGradientBlock(width / 2, width, 0, height, c1, c2, 80);

  // Scale mouseX and Y to control flower size
  let diameter = map(mouseY, 0, height, 0.8, 1.5); 
  let leafnum = map(mouseX, 0, width, 1, 1.2);

  for (let i = 0; i < circles.length; i++) {
    /* 
    INPUT PARAM:
    1, x: x position of the flower
    2, y: y position of the flower
    3, leafCount: number of the flower leaves
    4, leaflength: number of the flower leaves
    5, colors: color pallet for the flower
     */ 
    drawFlower(circles[i].x, circles[i].y, circles[i].leafCount * leafnum, circles[i].r * diameter, circles[i].colors, circles[i].noiseOffset); 
    // Let the move of mouseY change the flowers' size
    // Let the move of mouseX change the leaf to make a spining effect
    circles[i].noiseOffset += 0.01; // Update noise offset for growth animation
  } 

  // Draw dots
  for(let dot of dots){
    dot.update();
    dot.draw();
  }
}

// Draw flowers
function drawFlower(x, y, leafCount, leafLength, colors, noiseOffset) {
  push();
  translate(x, y);
  let angleStep = 360 / leafCount; // Rotation angle per leaf
  let growth = map(noise(noiseOffset), 0, 1, 0.8, 1.2);
  let radiusGrowing = leafLength * growth;

  // Draw leaves
  for (let i = 0; i < leafCount; i++) {
    drawLeaves(angleStep, radiusGrowing, colors, noiseOffset + i * 0.1); // Pass leaf length to drawing function
  }
  // Draw central sphere
  fill(color(colors.flower));
  noStroke();
  ellipse(0, 0, centerSphereSize * growth, centerSphereSize * growth); // Draw central sphere

  pop();
}

// Draw Leaves
function drawLeaves(angle, leafLength, colors, leafNoiseOffset) {
  let segments = 15; // number of segments per the length of the leaf (curve)
  let px, py;

  //attributes of the leaves (curve)
  strokeWeight(5);  // Set leaf stem line width thicker
  stroke(color(colors.leaves));

  //rotate(angle); // Rotate leaf to respective angle
  //noFill(); // Ensure stem part is not filled

  let swingAngle = angle + map(noise(leafNoiseOffset), 0, 1, -5, 10);
  rotate(swingAngle);
  noFill();

  beginShape();
  // leaf curve
  for (let i = 0; i < segments; i++) {
    px = map(i, 0, segments, 0, leafLength); //define x position of the end of the leaf curve
    py = sin(i * 10) * 50; //define y position of the end of the leaf curve, increase frequency and amplitude, make curvature more obvious
    vertex(px, py);
  }
  endShape();

  drawEndLeaf(px, py,colors); // Add small sphere at leaf tip, align with line end
}

function drawEndLeaf(x, y,colors) {
  fill(color(colors.endLeaves));
  strokeWeight(endSphereStroke);
  stroke(color(colors.endLeavesStroke));
  ellipse(x, y, endSphereSize, endSphereSize); // Draw small circle with stroke
}

// Util functions
function randomColor() {
  return colourPalette[floor(random(colourPalette.length))];
}

class dot {
  constructor() {
    this.redraw();
  }

  redraw(){
    this.x = random(width); // Random X-coordinate
    this.y = random(height); // Random Y-coordinate
    this.size = random(5, 15); // Set dot size between 5 and 15
    this.chosenColor = randomColor(); // Randomly select color from color pallet
    this.noiseOffset = random(300); // Random noise offset for unique movement
  }

  update(){
    // Update position using Perlin noise and constrain within boundaries
    this.x += map(noise(this.noiseOffset), 0, 1, -2, 2);
    this.y += map(noise(this.noiseOffset + 100), 0, 1, -2, 2);
    this.noiseOffset += 0.01; // Increase noise offset for smooth movement

    // Call redraw() when dots floating beyond boundaries
    if (this.x < 0 || width < this.x || this.y < 0 || height < this.y){
      this.redraw();
    }
  }

  draw(){
    fill(this.chosenColor);
    noStroke();
    ellipse(this.x, this.y, this.size * random(0, 1), this.size * random(0, 1));
    // Shrink dot size and draw
    // Add randomness to the size and it will change while the canvas reframing, making dots look like sparkling
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initializeElements(); // Reinitialize elements for new window size

  endSphereStroke = min(windowWidth, windowHeight) / 250; 
}

// Set a function to create gradient effect in the background
function setGradientBlock(min, max, y, h, c1, c2, alpha) {
  for (let i = min; i <= max; i++) {
    let amt = map(i, min, max, 0, 1);
    let c3 = lerpColor(c1, c2, amt);
    c3.setAlpha(alpha);
    stroke(c3);
    line(i, y, i, y + h);
  }
}

// Save the art work as a jpg image
function keyTyped() {
  if (key === "s") {
    save("NtangeII_Grass_new.jpg");
  }
}
