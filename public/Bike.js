/* globals
  push, stroke, strokeWeight, point, pop,
  collideLineLine, line, get,
  width, height, createVector
*/

class Bike {
  constructor(x, y, dir, id, c, numberOfTeleports = 3) {
    this.originalPos = createVector(x, y);
    this.originalDir = dir;
    this.x = x;
    this.y = y;
    this.vel = 1;
    this.dir = dir;
    this.color = c;
    this.numberOfTeleports = numberOfTeleports;
    this.id = id;
  }

  static from({ x, y, dir, id, c, numberOfTeleports }) {
    return new Bike(x, y, dir, id, c, numberOfTeleports);
  }

  draw() {
    push();
    stroke(this.color);
    strokeWeight(1);
    point(this.x, this.y);
    pop();
  }

  teleport() {
    if (this.numberOfTeleports > 0) {
      this.numberOfTeleports--;
      if (this.dir === "LEFT") {
        this.x -= 30;
      } else if (this.dir === "RIGHT") {
        this.x += 30;
      } else if (this.dir === "UP") {
        this.y -= 30;
      } else if (this.dir === "DOWN") {
        this.y += 30;
      }
    }
  }

  update() {
    if (this.dir === "LEFT") {
      this.x -= this.vel;
    } else if (this.dir === "RIGHT") {
      this.x += this.vel;
    } else if (this.dir === "UP") {
      this.y -= this.vel;
    } else if (this.dir === "DOWN") {
      this.y += this.vel;
    }
  }

  // Set direction of the bike
  setDir(direction) {
    if (this.dir === "UP" && direction !== "DOWN") {
      this.dir = direction;
    }
    if (this.dir === "DOWN" && direction !== "UP") {
      this.dir = direction;
    }
    if (this.dir === "LEFT" && direction !== "RIGHT") {
      this.dir = direction;
    }
    if (this.dir === "RIGHT" && direction !== "LEFT") {
      this.dir = direction;
    }
  }

  notBlack() {
    let a = get(this.x, this.y);
    if (this.x >= width || this.x <= 0) return true;
    if (this.y >= height || this.y <= 0) return true;
    if (a[0] != 0) return true;
    else if (a[1] != 0) return true;
    else if (a[2] != 0) return true;
    return false;
  }

  reset() {
    this.x = this.originalPos.x;
    this.y = this.originalPos.y;
    this.dir = this.originalDir;
    this.numberOfTeleports = 3;
  }

  toJSON() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      dir: this.dir,
      c: this.color,
      numberOfTeleports: this.numberOfTeleports
    };
  }
}
