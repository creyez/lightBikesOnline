/* globals
    createCanvas, background, point, keyIsDown
    stroke, width, height, strokeWeight
    UP_ARROW, DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW, get,
    fill, rect, textSize, textAlign, image, text, loadImage, 
    CENTER, collidePointRect, collideLineRect, colorMode, 
    HSB, createButton, frameRate, createElement, loadSound, 
    mouseX, mouseY, push, pop
    // Custom Classes
    Bike, Socket
*/
let canTeleport = true;
let setupComplete = false;
let local;
let remotes = [];
let bikes = [];
let gameOver = true;
let rate;
let button;
let title;
let socket;
let teleport;
let tpSound;
let crash;
let noTeleports;
let music;
let sound;
let slash;
let musicOff;
let soundOff;
let backgroundMusic;
let buttonSound;

function preload() {
  socket = new Socket();
  title = loadImage(
    "https://cdn.glitch.com/fafe8181-f2a8-472d-9f67-a537c4bcff6d%2Ftitle.png?v=1596054805359"
  );
  music = loadImage(
    "https://cdn.glitch.com/fafe8181-f2a8-472d-9f67-a537c4bcff6d%2Fmusic.png?v=1596046245016"
  );
  sound = loadImage(
    "https://cdn.glitch.com/fafe8181-f2a8-472d-9f67-a537c4bcff6d%2Fsound-on-solid.png?v=1596046249712"
  );
  slash = loadImage(
    "https://cdn.glitch.com/fafe8181-f2a8-472d-9f67-a537c4bcff6d%2Fslash.png?v=1596050112318"
  );
  teleport = loadImage(
    "https://cdn.glitch.com/fafe8181-f2a8-472d-9f67-a537c4bcff6d%2Fthumbnails%2Fteleport.png?1595958766095"
  );
  tpSound = loadSound(
    "https://cdn.glitch.com/fafe8181-f2a8-472d-9f67-a537c4bcff6d%2Fteleport.wav?v=1596041995884"
  );
  crash = loadSound(
    "https://cdn.glitch.com/fafe8181-f2a8-472d-9f67-a537c4bcff6d%2Fcrash.wav?v=1596044755159"
  );
  noTeleports = loadSound(
    "https://cdn.glitch.com/fafe8181-f2a8-472d-9f67-a537c4bcff6d%2Fnoammo.wav?v=1596045212715"
  );
  backgroundMusic = loadSound(
    "https://cdn.glitch.com/fafe8181-f2a8-472d-9f67-a537c4bcff6d%2Fbackground%20music.wav?v=1596052874381"
  );
  buttonSound = loadSound(
    "https://cdn.glitch.com/fafe8181-f2a8-472d-9f67-a537c4bcff6d%2Fbutton.wav?v=1596053663530"
  );
}

async function setup() {
  musicOff = false;
  soundOff = false;
  backgroundMusic.setVolume(0.15);
  backgroundMusic.loop();
  buttonSound.setVolume(0.8);
  crash.setVolume(0.9);
  noTeleports.setVolume(0.2);
  colorMode(HSB);
  createCanvas(650, 500);
  background(185, 60, 90);
  textSize(18);
  textAlign(CENTER);

  fill(0);
  rect(30, 75, 400, 400);
  const [localPlr, remotePlrs] = await socket.init();
  local = Bike.from(localPlr);
  remotes = remotePlrs.map(data => Bike.from(data));
  bikes = [local, ...remotes];

  // bikes = [
  //   new Bike(45, 90, "RIGHT", [180, 95, 95]),
  //   new Bike(width - 235, height - 40, "LEFT", [30, 95, 95])
  // ];

  image(title, 25, 5, 405, 70);
  image(music, 550, 25, 30, 30);
  image(sound, 600, 25, 30, 30);

  button = createButton("Start");
  button.position(200, 275);
  button.mousePressed(start);
  setupComplete = true;
}

function draw() {
  if (setupComplete == false) return;
  displayInfo();
  if (gameOver == true) return;

  checkWin();

  let players = socket.getAll();
  bikes = players.map(plr => Bike.from(plr));
  local = bikes.find(bike => bike.id === socket.id);
  remotes = bikes.filter(bike => bike.id !== socket.id);

  local.draw();
  remotes.forEach(bike => bike.draw());

  local.update();
  handleMotion();
  socket.sendUpdate(local.toJSON());
}

function checkWin() {
  if (socket.status === "Draw") {
    fill(255);
    text("GAME OVER", 220, 230);
    push();
    textSize(12);
    text("DRAW", 220, 250);
    pop();
    gameOver = true;
  } else if (socket.status === "Win") {
    fill(255);
    text("GAME OVER", 220, 230);
    push();
    textSize(12);
    text(`WINNER: ${socket.winner}`, 220, 250);
    pop();
    gameOver = true;
  } else if (socket.status === "Ongoing") {
    if (local.notBlack() && !socket.gameIsOver) {
      crash.play();
      socket.gameOver();
    }
  }
  //   if (bikes[0].notBlack() && bikes[1].notBlack()) {
  //     crash.play();
  //     fill(255);
  //     text("GAME OVER", 220, 230);
  //     text("Draw", 220, 260);
  //     gameOver = true;
  //     button.show();
  //     return;
  //   }

  //   if (bikes[0].notBlack() == true) {
  //     crash.play();
  //     fill(255);
  //     text("GAME OVER", 220, 230);
  //     text("Bike 2 Wins", 220, 260);
  //     gameOver = true;
  //     button.show();
  //     return;
  //   }

  //   if (bikes[1].notBlack() == true) {
  //     crash.play();
  //     fill(255);
  //     text("GAME OVER", 220, 230);
  //     text("Bike 1 Wins", 220, 260);
  //     gameOver = true;
  //     button.show();
  //     return;
  //   }
}

function displayInfo() {
  let players = socket.getAll();
  let player = players.find(bike => bike.id === socket.id);
  players = players.filter(bike => bike.id !== socket.id);

  fill(255);
  rect(440, 75, 200, 400);

  fill(0);
  push();
  textSize(10);
  text("LOCAL", 510, 100);
  pop();
  for (let i = 0; i < bikes[0].numberOfTeleports; i++) {
    image(teleport, 450 + i * 60, 130, 40, 50);
  }

  players.forEach((bike, idx) => {
    push();
    textSize(10);
    text(`PLAYER ${bike.id}`, 540, 300 + idx * 200);
    pop();
    for (let i = 0; i < bike.numberOfTeleports; i++) {
      image(teleport, 450 + i * 60, 330 + idx * 200, 40, 50);
    }
  });
}

function handleMotion() {
  if (keyIsDown(87)) {
    local.setDir("UP");
  } else if (keyIsDown(83)) {
    local.setDir("DOWN");
  } else if (keyIsDown(65)) {
    local.setDir("LEFT");
  } else if (keyIsDown(68)) {
    local.setDir("RIGHT");
  }

  // SPACEBAR Key
  if (keyIsDown(32) && canTeleport === true) {
    canTeleport = false;
    setTimeout(() => {
      canTeleport = true;
    }, 1000);
    if (local.numberOfTeleports > 0) {
      tpSound.play();
    } else {
      noTeleports.play();
    }
    local.teleport();
  }
}

function start() {
  gameOver = false;
  fill(0);
  rect(30, 75, 400, 400);
  rate = 60;
  bikes.forEach(bike => bike.reset());
  button.hide();
}

function mousePressed() {
  if (
    musicOff == false &&
    mouseX > 550 &&
    mouseX < 580 &&
    mouseY > 25 &&
    mouseY < 55
  ) {
    buttonSound.play();
    backgroundMusic.setVolume(0);
    musicOff = true;
    image(slash, 555, 17, 27, 45);
    image(music, 550, 25, 30, 30);
  } else if (
    musicOff == true &&
    mouseX > 550 &&
    mouseX < 580 &&
    mouseY > 25 &&
    mouseY < 55
  ) {
    buttonSound.play();
    backgroundMusic.setVolume(0.15);
    musicOff = false;
    fill(185, 60, 90);
    strokeWeight(0);
    rect(550, 17, 34, 45);
    image(music, 550, 25, 30, 30);
  }

  if (
    soundOff == false &&
    mouseX > 600 &&
    mouseX < 630 &&
    mouseY > 25 &&
    mouseY < 55
  ) {
    buttonSound.play();
    tpSound.setVolume(0);
    crash.setVolume(0);
    noTeleports.setVolume(0);
    buttonSound.setVolume(0);
    soundOff = true;
    image(slash, 602, 17, 27, 45);
    image(sound, 600, 25, 30, 30);
  } else if (
    soundOff == true &&
    mouseX > 600 &&
    mouseX < 630 &&
    mouseY > 25 &&
    mouseY < 55
  ) {
    buttonSound.play();
    crash.setVolume(0.8);
    tpSound.setVolume(1);
    noTeleports.setVolume(0.2);
    buttonSound.setVolume(0.8);
    soundOff = false;
    fill(185, 60, 90);
    strokeWeight(0);
    rect(600, 17, 34, 45);
    image(sound, 600, 25, 30, 30);
  }
}
