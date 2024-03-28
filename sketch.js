// sizes and margins
const margin = 8;
// corner radius
const cornerRadiusL = 32;
const cornerRadiusSM = 16;
const cornerRadiusXS = 8;
const cornerRadiusRounded = 9999;

// positions
let basePosX;
let basePosY;
let cupPosX;
let cupPosY;
let cupWidth;
let cupHeight;

// tea level
let teaLevel = 0;
let targetTeaLevel = 0;

// assets
let strawImg;
let titleImg;
let teaIcon;
let bobaIcon;
let zoboIcon;

// colors
let alpha = 255;
let colorWhite;
let colorBlack;
let colorPrimary;
let colorRed;
let colorTeal;
let teaSaturation;

// button
let buttonTea;
let buttonZobo;
let buttonBoba;

// bubbles
let bubbles = [];
let bubbleSize = 8;
let minDist; // Initialize minDist variable

// Load the image and create a p5.Image object.
function preload() {
  vendingMachineWithBaseImg = loadImage('assets/vendingmachine_withbase.png');
  titleImg = loadImage('assets/title.png');
  teaIcon = loadImage('assets/icon_tea.png');
  bobaIcon = loadImage('assets/icon_boba.png');
  zoboIcon = loadImage('assets/icon_zobo.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // modes
  rectMode(CORNER);
  imageMode(CORNER);
  colorMode(HSB);
  // positions
  // base vending machine position
  basePosX = windowWidth / 2 - (vendingMachineWithBaseImg.width / 3.4); // reduce number to move right
  basePosY = windowHeight / 2 - (vendingMachineWithBaseImg.height / 4); // reduce number to move bottom

  // cup position
  cupPosX = basePosX + 474;
  cupPosY = basePosY + 140;

  // Initialize minDist with a default value based on initial bubbleSize
  minDist = bubbleSize * 0.5;

  // colors
  colorWhite = color(360, 0, 100, alpha);
  colorBlack = color(360, 0, 0, alpha);
  // tea color
  teaSaturation = 71;
  colorPrimary = color(29, teaSaturation, 95, alpha);
  colorRed = color(11, 68, 100, alpha);
  colorTeal = color(174, 78, 63, alpha);

  // tea button object
  buttonTea = new Button(basePosX + (margin * 3), basePosY + (margin * 24), 64, 64, cornerRadiusSM, colorRed, teaIcon);
  buttonZobo = new Button(basePosX + (margin * 3), basePosY + (margin * 35), 64, 64, cornerRadiusSM, colorTeal, zoboIcon);
  buttonBoba = new Button(basePosX + (margin * 3), basePosY + (margin * 46), 64, 64, cornerRadiusSM, colorPrimary, bobaIcon);
}

function draw() {
  background(colorWhite);

  // vending machine with base
  push();
  translate(basePosX, basePosY);
  scale(0.6);
  image(vendingMachineWithBaseImg, 0, 0);
  pop();

  // title text
  push();
  let titleImgPosX = basePosX - 5;
  let titleImgPosY = basePosY - 5;
  translate(titleImgPosX, titleImgPosY);
  image(titleImg, 0, 0, titleImg.width * 0.5, titleImg.height * 0.5);
  pop();

  // render tea button
  buttonTea.buttonShadow();
  buttonTea.display();

  // render zobo button
  buttonZobo.buttonShadow();
  buttonZobo.display();

  // render boba button
  buttonBoba.buttonShadow();
  buttonBoba.display();

  // Update the tea level smoothly
  teaLevel = lerp(teaLevel, targetTeaLevel, 0.1);

  // Draw the cup base
  push();
  noFill();
  stroke(colorBlack);
  strokeWeight(3);
  cupWidth = 100;
  cupHeight = 120;
  quad(cupPosX, cupPosY, //top left
    cupPosX + cupWidth, cupPosY, // top right
    cupPosX + cupWidth - 15, cupPosY + cupHeight, // bottom right
    cupPosX + 15, cupPosY + cupHeight); // bottom left
  pop();

  // Create a clipping mask for the tea level
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.moveTo(cupPosX + margin, cupPosY + margin);
  drawingContext.lineTo(cupPosX + cupWidth - margin, cupPosY + margin);
  drawingContext.lineTo(cupPosX + cupWidth - margin - 13, cupPosY + cupHeight - margin);
  drawingContext.lineTo(cupPosX + 13 + margin, cupPosY + cupHeight - margin);
  drawingContext.closePath();
  drawingContext.clip();

  // Draw the tea level inside the clipping mask
  drawTeaLevel();

  // Restore the previous clipping region
  drawingContext.restore();

  // Display bubbles inside the cup
  for (let b of bubbles) {
    b.display();
  }
}

function drawTeaLevel() {
  // Draw the tea level
  fill(colorPrimary);
  noStroke();
  rect(cupPosX + margin, cupPosY + cupHeight - margin - teaLevel, cupWidth - margin * 2, teaLevel);
}

// Add bubbles
function addBubble(x, y) {
  let newBubble = new Bubble(x, y, bubbleSize);

  // Check if the bubble is within the cup boundaries
  if (
    x >= cupPosX + margin &&
    x <= cupPosX + cupWidth - margin &&
    y >= cupPosY + margin &&
    y <= cupPosY + cupHeight - teaLevel - margin
  ) {
    // Check for overlapping with existing bubbles
    let overlapping = checkOverlap(newBubble);

    // Add the bubble if it's within the cup and not overlapping
    if (!overlapping) {
      bubbles.push(newBubble);
    }
  }
}

function checkOverlap(newBubble) {
  // Check for overlapping with existing bubbles
  for (let existingBubble of bubbles) {
    let d = dist(newBubble.x, newBubble.y, existingBubble.x, existingBubble.y);
    if (d < newBubble.r + existingBubble.r) {
      return true;
    }
  }
  return false;
}

function mousePressed() {
  buttonTea.handleTeaLevelClick();
  buttonZobo.handleTeaColorClick();
  buttonBoba.handleAddBobaClick();
}

function mouseReleased() {
  buttonTea.handleRelease();
  buttonZobo.handleRelease();
  buttonBoba.handleRelease();
}

// Button class start
class Button {
  constructor(x, y, width, height, cornerRadius, fillColor, buttonIcon) {
    this.x = x;
    this.y = y;
    this.originalX = x;
    this.originalY = y;
    this.width = width;
    this.height = height;
    this.cornerRadius = cornerRadius;
    this.fillColor = fillColor;
    this.buttonIcon = buttonIcon;
    this.shadowOffsetX = margin * 1;
    this.shadowOffsetY = margin * 1;
    this.shadowBlur = 0;
    this.strokeColor = colorBlack;
    this.strokeWeight = 2;
    this.isHovered = false;
    this.isClicked = false;
    this.movement = 0;
    this.directionUp = -1;
    this.directionDown = 1;
    this.easingFactor = 0.1; // Adjust this value to control the easing effect
  }

  increaseSaturation() {
    const saturationIncrement = 5;
    const maxSaturation = 90; // Set your maximum saturation value
    teaSaturation = min(teaSaturation + saturationIncrement, maxSaturation);
  }

  decreaseSaturation() {
    const saturationDecrement = 5;
    const minSaturation = 30; // Set your minimum saturation value
    teaSaturation = max(teaSaturation - saturationDecrement, minSaturation);
  }

  adjustTeaLevel() {
    targetTeaLevel = min(targetTeaLevel + 10, cupHeight - margin * 2);
  }
  adjustZoboLevel() {
    targetTeaLevel = min(targetTeaLevel + 5, cupHeight - margin * 2);
  }

  updateColor() {
    colorPrimary = color(29, teaSaturation, 95, alpha);
  }

  display() {
    // Check if the mouse is over the button
    this.isHovered = this.isMouseOver();

    // Calculate the target movement based on the hover and click state
    let targetMovement = (this.isHovered && !this.isClicked) ? this.shadowOffsetX : 0;

    // Apply easing to the movement
    this.movement += (targetMovement - this.movement) * this.easingFactor;

    // Draw the button
    push();
    translate(this.movement * this.directionUp, this.movement * this.directionUp);

    // Draw the button fill
    fill(this.fillColor);
    rect(this.x, this.y, this.width, this.height, this.cornerRadius);

    // Draw the button stroke
    stroke(this.strokeColor);
    strokeWeight(this.strokeWeight);
    fill(this.fillColor);
    rect(this.x, this.y, this.width, this.height, this.cornerRadius);

    // Draw the button icon
    let iconWidth = this.width * 0.6;
    let iconHeight = this.height * 0.6;
    let iconX = this.x + (this.width - iconWidth) / 2;
    let iconY = this.y + (this.height - iconHeight) / 2;
    image(this.buttonIcon, iconX, iconY, iconWidth, iconHeight);

    pop(); // Restore the previous transformation
  }

  buttonShadow() {
    // Button Shadow
    stroke(this.strokeColor);
    strokeWeight(this.strokeWeight);
    fill(colorBlack);
    rect(this.x, this.y, this.width, this.height, this.cornerRadius);
  }

  isMouseOver() {
    return (
      mouseX > this.x &&
      mouseX < this.x + this.width &&
      mouseY > this.y &&
      mouseY < this.y + this.height
    );
  }

  handleTeaLevelClick() {
    if (this.isMouseOver()) {
      this.isClicked = true;
      this.adjustTeaLevel();
      this.increaseSaturation();
      this.updateColor();
    }
  }

  handleTeaColorClick() {
    if (this.isMouseOver()) {
      this.isClicked = true;
      this.adjustZoboLevel();
      this.decreaseSaturation();
      this.updateColor();
    }
  }

  handleAddBobaClick() {
    if (this.isMouseOver()) {
      this.isClicked = true;
      // Add bubbles to the fixed position inside the cup
      let x = random(cupPosX + margin, cupPosX + cupWidth - margin);
      let y = random(cupPosY + margin, cupPosY + cupHeight - teaLevel - margin);
      addBubble(x, y);
    }
  }

  handleRelease() {
    this.isClicked = false;
  }
}
// Button class end

// Bubble class start
class Bubble {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.opacity = 150; // Initial opacity
  }

  display() {
    // Set opacity based on overlap status
    if (this.overlapping()) {
      this.opacity = 150; // Reduce opacity if overlapped
    } else {
      this.opacity = 180; // Restore opacity if no overlap
    }

    // Outer bubble
    noStroke();
    fill(0, this.opacity); // Black with some transparency
    ellipse(this.x, this.y, this.r * 2);

    // Inner highlight
    fill(0, 30); // Black with lower transparency
    ellipse(this.x - this.r / 3, this.y - this.r / 3, this.r / 2);

    // Inner shadow
    ellipse(this.x + this.r / 3, this.y + this.r / 3, this.r / 2);
  }

  overlapping() {
    for (let other of bubbles) {
      if (other !== this) {
        let d = dist(this.x, this.y, other.x, other.y);
        let bubbleSpacing = this.r + other.r - minDist; // Adjust this value for spacing
        if (d < bubbleSpacing) {
          return true; // Return true if overlap detected
        }
      }
    }
    return false; // Return false if no overlap detected
  }
}
// Bubble class end
