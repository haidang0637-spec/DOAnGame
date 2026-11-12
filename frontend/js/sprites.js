/**
 * Pixel Adventure Sprite & Animation Manager
 */
class SpriteSheetManager {
  constructor() {
    this.images = new Map();
  }

  loadImage(url) {
    if (this.images.has(url)) {
      return Promise.resolve(this.images.get(url));
    }
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.images.set(url, img);
        resolve(img);
      };
      img.onerror = () => {
        console.warn(`Could not load sprite: ${url}`);
        resolve(null);
      };
      img.src = url;
    });
  }

  getImage(url) {
    return this.images.get(url) || null;
  }
}

class Animation {
  constructor(image, frameWidth, frameHeight, frameCount, frameDuration = 0.05, loop = true) {
    this.image = image;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.frameCount = frameCount;
    this.frameDuration = frameDuration;
    this.loop = loop;
    this.timer = 0;
    this.currentFrame = 0;
    this.finished = false;
  }

  update(dt) {
    if (this.finished && !this.loop) return;

    this.timer += dt;
    if (this.timer >= this.frameDuration) {
      this.timer -= this.frameDuration;
      this.currentFrame++;
      if (this.currentFrame >= this.frameCount) {
        if (this.loop) {
          this.currentFrame = 0;
        } else {
          this.currentFrame = this.frameCount - 1;
          this.finished = true;
        }
      }
    }
  }

  reset() {
    this.timer = 0;
    this.currentFrame = 0;
    this.finished = false;
  }

  draw(ctx, x, y, flipX = false) {
    if (!this.image) return;

    ctx.save();
    if (flipX) {
      ctx.translate(Math.round(x + this.frameWidth), Math.round(y));
      ctx.scale(-1, 1);
      ctx.drawImage(
        this.image,
        this.currentFrame * this.frameWidth, 0,
        this.frameWidth, this.frameHeight,
        0, 0,
        this.frameWidth, this.frameHeight
      );
    } else {
      ctx.drawImage(
        this.image,
        this.currentFrame * this.frameWidth, 0,
        this.frameWidth, this.frameHeight,
        Math.round(x), Math.round(y),
        this.frameWidth, this.frameHeight
      );
    }
    ctx.restore();
  }
}

window.sprites = new SpriteSheetManager();
window.Animation = Animation;
