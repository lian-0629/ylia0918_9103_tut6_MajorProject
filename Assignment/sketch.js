const colourPalette = ['#E54379', '#CB010B', '#782221', 'purple'];
const colorKeys = ["flower", "leaves", "endLeaves", "endLeavesStroke"];
let circles = [];
let dots = [];
let centerSphereSize,endSphereSize,endSphereStroke;
let c1; let c2;

function setup() { 
  createCanvas(windowWidth, windowHeight);
  initializeElements();
  c1 = color(20, 0, 20);
  c2 = color(153, 121, 80);

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
      let leafCount = random(8, 15);
    
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
        circles.push({ x, y, r, leafCount,colors });
      }
    }
  }

  angleMode(DEGREES);
  centerSphereSize = random(10, 30); // size of the cirle in the center of the flower
  endSphereSize = centerSphereSize/2; // size of the circle in the end of the leaves
  endSphereStroke = endSphereSize/3; // size of the circle stroke in the end of the leaves

  // Initialize background dots
  initializeDots(int((width*height)/800));
}

// Main drawing function
function draw() {
  background(80, 50, 150, 100); // Set background color
  setGradientBlock(0, width / 2, 0, height, c1, c2, 100);
  setGradientBlock(width / 2, width, 0, height, c2, c1, 100);

  // Scale mouse to control flower size
  let diameter = map(mouseY, 0, height, 0.8, 1.5); //let the change of mouseY will change the flowers' size
  let leafnum = map(mouseX, 0, width, 1, 1.2); //let the change of mouseX will change the number of leaf

  for (let i = 0; i < circles.length; i++) {
    /* 
    INPUT PARAM:
    1, x: x position of the flower
    2, y: y position of the flower
    3, leafCount: number of the flower leaves
    4, leaflength: number of the flower leaves
    5, colors: color pallet for the flower
     */ 
    drawFlower(circles[i].x, circles[i].y, circles[i].leafCount * leafnum, circles[i].r * diameter, circles[i].colors); 
  }
  drawDots();
}

// Draw flowers
function drawFlower(x, y, leafCount, leafLength, colors) {
  push();
  translate(x, y);
  let angleStep = 360 / leafCount; // Rotation angle per leaf

  // Draw leaves
  for (let i = 0; i < leafCount; i++) {
    drawLeaves(angleStep, leafLength,colors); // Pass leaf length to drawing function
  }
  // Draw central sphere
  fill(color(colors.flower));
  noStroke();
  ellipse(0, 0, centerSphereSize, centerSphereSize); // Draw central sphere

  pop();
}

// Draw flowers
function drawLeaves(angle, leafLength,colors) {
  let segments = 15; // number of segments per the length of the leaf (curve)
  let px, py;

  //attributes of the leaves (curve)
  strokeWeight(5);  // Set leaf stem line width thicker
  stroke(color(colors.leaves));

  rotate(angle); // Rotate leaf to respective angle
  noFill(); // Ensure stem part is not filled

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
function createRandomDotsAttributes() {
  return {
    x: random(width), // Random X-coordinate
    y: random(height), // Random Y-coordinate
    size: random(5, 15), // Set dot size between 5 and 15
    chosenColor: randomColor(), // Randomly select color from color pallet
    noiseOffset: random(300) // Random noise offset for unique movement
  };
}
//////

// Initialize background dots
function initializeDots(numDots) {
  dots = [];
  for (let i = 0; i < numDots; i++) {
    dots.push(createRandomDotsAttributes());
  }
}

// Draw and Move dots
function drawDots() {
  noStroke(); // Remove outline
  for (let dot of dots) {
    fill(dot.chosenColor);
      
    // Update position using Perlin noise and constrain within boundaries
    dot.x += map(noise(dot.noiseOffset), 0, 1, -2, 2);
    dot.y += map(noise(dot.noiseOffset + 100), 0, 1, -2, 2);

    ellipse(dot.x, dot.y, dot.size * 0.5, dot.size * 0.5); // Shrink dot size and draw
    dot.noiseOffset += 0.01; // Increase noise offset for smooth movement
  
    // Keep dots within canvas boundaries
    if (dot.x < 0 || width < dot.x || dot.y < 0 || height < dot.y){
      dot = createRandomDotsAttributes();
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initializeElements(); // Reinitialize elements for new window size

  endSphereStroke = min(windowWidth, windowHeight) / 250; 
}

function setGradientBlock(min, max, y, h, c1, c2, alpha) {
  for (let i = min; i <= max; i++) {
    let amt = map(i, min, max, 0, 1);
    let c3 = lerpColor(c1, c2, amt);
    c3.setAlpha(alpha);
    stroke(c3);
    line(i, y, i, y + h);
  }
}
