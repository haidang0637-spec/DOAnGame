/**
 * Pixel Adventure Entities (Fruits, Saws, Falling Platforms, Particles)
 */

class Fruit {
  constructor(type, x, y) {
    this.type = type;
    this.baseX = x;
    this.baseY = y;
    this.x = x;
    this.y = y;
    this.bobTimer = Math.random() * Math.PI * 2;
    this.collected = false;

    this.anim = null;
    this.initSprite();
  }

  async initSprite() {
    const img = await window.sprites.loadImage(`/assets/Items/Fruits/${this.type}.png`);
    this.anim = new Animation(img, 32, 32, 17, 0.045, true);
  }

  update(dt, player) {
    if (this.collected) return;

    this.bobTimer += dt * 3.5;
    this.y = this.baseY + Math.sin(this.bobTimer) * 2;

    if (this.anim) this.anim.update(dt);

    // Collision with player
    const fruitBox = { x: this.x + 8, y: this.y + 8, w: 16, h: 16 };
    const playerHitbox = player.getHitbox();

    if (!player.isDead && Physics.checkAABB(fruitBox, playerHitbox)) {
      this.collected = true;
      if (window.audio) window.audio.playCollect();
      if (window.game.particles) {
        window.game.particles.createBurst(this.x, this.y);
      }
      window.game.onFruitCollected(this);
    }
  }

  draw(ctx) {
    if (this.collected) return;
    if (this.anim) {
      this.anim.draw(ctx, this.x, this.y);
    }
  }
}

class Saw {
  constructor(config) {
    this.startX = config.startX;
    this.startY = config.startY;
    this.endX = config.endX;
    this.endY = config.endY;
    this.x = config.startX;
    this.y = config.startY;
    this.speed = config.speed || 40;
    this.axis = config.axis || 'x';
    this.dir = 1;

    this.anim = null;
    this.initSprite();
  }

  async initSprite() {
    const img = await window.sprites.loadImage('/assets/Traps/Saw/On (38x38).png');
    this.anim = new Animation(img, 38, 38, 8, 0.03, true);
  }

  update(dt, player) {
    if (this.anim) this.anim.update(dt);

    // Patrol movement
    if (this.axis === 'x') {
      this.x += this.dir * this.speed * dt;
      if (this.dir > 0 && this.x >= this.endX) {
        this.x = this.endX;
        this.dir = -1;
      } else if (this.dir < 0 && this.x <= this.startX) {
        this.x = this.startX;
        this.dir = 1;
      }
    } else {
      this.y += this.dir * this.speed * dt;
      if (this.dir > 0 && this.y >= this.endY) {
        this.y = this.endY;
        this.dir = -1;
      } else if (this.dir < 0 && this.y <= this.startY) {
        this.y = this.startY;
        this.dir = 1;
      }
    }

    // Lethal circular hitbox
    const circle = {
      x: this.x + 19,
      y: this.y + 19,
      r: 13
    };

    if (!player.isDead && Physics.checkCircleAABB(circle, player.getHitbox())) {
      player.kill();
    }
  }

  draw(ctx) {
    if (this.anim) {
      this.anim.draw(ctx, this.x, this.y);
    }
  }
}

class FallingPlatform {
  constructor(config) {
    this.origX = config.x;
    this.origY = config.y;
    this.x = config.x;
    this.y = config.y;
    this.w = config.w || 32;
    this.h = config.h || 10;

    this.state = 'IDLE'; // IDLE, SHAKE, FALL, GONE
    this.shakeTimer = 0;
    this.respawnTimer = 0;
    this.fallVy = 0;
    this.offsetX = 0;
    this.isGone = false;

    this.anim = null;
    this.initSprite();
  }

  async initSprite() {
    const img = await window.sprites.loadImage('/assets/Traps/Falling Platforms/On (32x10).png');
    this.anim = new Animation(img, 32, 10, 4, 0.08, true);
  }

  onSteppedOn() {
    if (this.state === 'IDLE') {
      this.state = 'SHAKE';
      this.shakeTimer = 0.4;
      if (window.audio) window.audio.playPlatformDrop();
    }
  }

  update(dt) {
    if (this.anim) this.anim.update(dt);

    if (this.state === 'SHAKE') {
      this.shakeTimer -= dt;
      this.offsetX = Math.sin(this.shakeTimer * 50) * 1.5;
      if (this.shakeTimer <= 0) {
        this.state = 'FALL';
        this.fallVy = 50;
      }
    } else if (this.state === 'FALL') {
      this.fallVy += 450 * dt;
      this.y += this.fallVy * dt;
      if (this.y > 300) {
        this.state = 'GONE';
        this.isGone = true;
        this.respawnTimer = 2.5;
      }
    } else if (this.state === 'GONE') {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        this.state = 'IDLE';
        this.isGone = false;
        this.x = this.origX;
        this.y = this.origY;
        this.fallVy = 0;
        this.offsetX = 0;
      }
    }
  }

  draw(ctx) {
    if (this.isGone) return;
    if (this.anim) {
      this.anim.draw(ctx, this.x + this.offsetX, this.y);
    }
  }
}

class ParticleManager {
  constructor() {
    this.bursts = [];
    this.dusts = [];
    this.burstImg = null;
    this.init();
  }

  async init() {
    this.burstImg = await window.sprites.loadImage('/assets/Items/Fruits/Collected.png');
  }

  createBurst(x, y) {
    if (!this.burstImg) return;
    const anim = new Animation(this.burstImg, 32, 32, 6, 0.045, false);
    this.bursts.push({ x, y, anim });
  }

  createDust(x, y) {
    this.dusts.push({
      x, y,
      vx: (Math.random() - 0.5) * 40,
      vy: -15 - Math.random() * 20,
      r: 2 + Math.random() * 2,
      alpha: 1.0,
      life: 0.25
    });
  }

  update(dt) {
    // Update bursts
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const b = this.bursts[i];
      b.anim.update(dt);
      if (b.anim.finished) {
        this.bursts.splice(i, 1);
      }
    }

    // Update dusts
    for (let i = this.dusts.length - 1; i >= 0; i--) {
      const d = this.dusts[i];
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.life -= dt;
      d.alpha = Math.max(0, d.life / 0.25);
      if (d.life <= 0) {
        this.dusts.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    // Draw fruit bursts
    for (const b of this.bursts) {
      b.anim.draw(ctx, b.x, b.y);
    }

    // Draw dust particles
    for (const d of this.dusts) {
      ctx.fillStyle = `rgba(220, 220, 240, ${d.alpha})`;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

window.Fruit = Fruit;
window.Saw = Saw;
window.FallingPlatform = FallingPlatform;
window.ParticleManager = ParticleManager;
