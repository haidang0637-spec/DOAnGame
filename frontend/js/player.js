/**
 * Pixel Adventure Player Entity
 */
class Player {
  constructor(x, y, characterName = "Virtual Guy") {
    this.spawnX = x;
    this.spawnY = y;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;

    // Movement parameters
    this.ACCEL = 1200;
    this.FRICTION = 900;
    this.MAX_SPEED = 140;
    this.GRAVITY = 850;
    this.JUMP_SPEED = -280;
    this.DOUBLE_JUMP_SPEED = -250;
    this.MAX_FALL_SPEED = 380;
    this.WALL_SLIDE_SPEED = 65;

    // Hitbox (tight inside 32x32)
    this.hitboxW = 16;
    this.hitboxH = 24;
    this.hitboxOffsetX = 8;
    this.hitboxOffsetY = 8;

    // Status flags
    this.isGrounded = false;
    this.touchingLeft = false;
    this.touchingRight = false;
    this.canDoubleJump = true;
    this.isWallSliding = false;
    this.isDead = false;
    this.flipX = false;

    // Timers
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.respawnTimer = 0;

    this.characterName = characterName;
    this.animations = {};
    this.currentAnim = null;

    this.loadAnimations(characterName);
  }

  async loadAnimations(characterName) {
    this.characterName = characterName;
    const base = `/assets/Main Characters/${characterName}`;

    const [
      idleImg, runImg, jumpImg, doubleJumpImg, fallImg, wallJumpImg, hitImg,
      appearImg
    ] = await Promise.all([
      window.sprites.loadImage(`${base}/Idle (32x32).png`),
      window.sprites.loadImage(`${base}/Run (32x32).png`),
      window.sprites.loadImage(`${base}/Jump (32x32).png`),
      window.sprites.loadImage(`${base}/Double Jump (32x32).png`),
      window.sprites.loadImage(`${base}/Fall (32x32).png`),
      window.sprites.loadImage(`${base}/Wall Jump (32x32).png`),
      window.sprites.loadImage(`${base}/Hit (32x32).png`),
      window.sprites.loadImage(`/assets/Main Characters/Appearing (96x96).png`)
    ]);

    this.animations = {
      idle: new Animation(idleImg, 32, 32, 11, 0.05, true),
      run: new Animation(runImg, 32, 32, 12, 0.045, true),
      jump: new Animation(jumpImg, 32, 32, 1, 0.1, false),
      doubleJump: new Animation(doubleJumpImg, 32, 32, 6, 0.04, false),
      fall: new Animation(fallImg, 32, 32, 1, 0.1, false),
      wallJump: new Animation(wallJumpImg, 32, 32, 5, 0.05, true),
      hit: new Animation(hitImg, 32, 32, 7, 0.05, false),
      appear: new Animation(appearImg, 96, 96, 7, 0.05, false)
    };

    this.currentAnim = this.animations.idle;
  }

  getHitbox() {
    return {
      x: this.x + this.hitboxOffsetX,
      y: this.y + this.hitboxOffsetY,
      w: this.hitboxW,
      h: this.hitboxH
    };
  }

  kill() {
    if (this.isDead) return;
    this.isDead = true;
    this.vx = 0;
    this.vy = -180;
    this.currentAnim = this.animations.hit;
    if (this.currentAnim) this.currentAnim.reset();
    if (window.audio) window.audio.playHit();
    this.respawnTimer = 0.8;
  }

  respawn() {
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.vx = 0;
    this.vy = 0;
    this.isDead = false;
    this.canDoubleJump = true;
    this.currentAnim = this.animations.idle;
    if (window.audio) window.audio.playJump();
  }

  update(dt, solids, oneWayPlatforms, fallingPlatforms) {
    // Death sequence
    if (this.isDead) {
      this.vy += this.GRAVITY * dt;
      this.y += this.vy * dt;
      if (this.currentAnim) this.currentAnim.update(dt);
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        this.respawn();
        window.game.onPlayerDied();
      }
      return;
    }

    // 1. Horizontal Input & Movement
    const keys = window.input.keys;
    if (keys.left && !keys.right) {
      this.vx = Math.max(this.vx - this.ACCEL * dt, -this.MAX_SPEED);
      this.flipX = true;
    } else if (keys.right && !keys.left) {
      this.vx = Math.min(this.vx + this.ACCEL * dt, this.MAX_SPEED);
      this.flipX = false;
    } else {
      // Friction
      if (this.vx > 0) {
        this.vx = Math.max(0, this.vx - this.FRICTION * dt);
      } else if (this.vx < 0) {
        this.vx = Math.min(0, this.vx + this.FRICTION * dt);
      }
    }

    // 2. Timers (coyote time & jump buffer)
    if (this.isGrounded) {
      this.coyoteTimer = 0.08;
      this.canDoubleJump = true;
    } else {
      this.coyoteTimer -= dt;
    }

    if (keys.jumpPressed) {
      this.jumpBufferTimer = 0.08;
    } else {
      this.jumpBufferTimer -= dt;
    }

    // 3. Wall slide check
    this.isWallSliding = false;
    if (!this.isGrounded && this.vy > 0) {
      if ((this.touchingLeft && keys.left) || (this.touchingRight && keys.right)) {
        this.isWallSliding = true;
        this.vy = Math.min(this.vy, this.WALL_SLIDE_SPEED);
      }
    }

    // 4. Jump & Double Jump
    if (this.jumpBufferTimer > 0) {
      if (this.coyoteTimer > 0) {
        // Ground Jump
        this.vy = this.JUMP_SPEED;
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;
        this.isGrounded = false;
        if (window.audio) window.audio.playJump();
        if (window.game.particles) window.game.particles.createDust(this.x + 8, this.y + 24);
      } else if (this.isWallSliding) {
        // Wall Jump
        const wallDir = this.touchingLeft ? -1 : 1;
        this.vx = -wallDir * 170;
        this.vy = -260;
        this.flipX = wallDir > 0;
        this.jumpBufferTimer = 0;
        this.canDoubleJump = true;
        if (window.audio) window.audio.playJump();
      } else if (this.canDoubleJump) {
        // Double Jump
        this.vy = this.DOUBLE_JUMP_SPEED;
        this.canDoubleJump = false;
        this.jumpBufferTimer = 0;
        if (this.animations.doubleJump) {
          this.currentAnim = this.animations.doubleJump;
          this.currentAnim.reset();
        }
        if (window.audio) window.audio.playDoubleJump();
        if (window.game.particles) window.game.particles.createDust(this.x + 8, this.y + 24);
      }
    }

    // Variable jump height: cut jump short if jump key is released
    if (!keys.jump && this.vy < -70) {
      this.vy *= 0.55;
    }

    // 5. Gravity & Terminal velocity
    this.vy = Math.min(this.vy + this.GRAVITY * dt, this.MAX_FALL_SPEED);

    // 6. Physics Collision Resolution
    Physics.moveAndCollide(this, solids, oneWayPlatforms, fallingPlatforms, dt);

    // 7. Fell into pit
    if (this.y > 288) {
      this.kill();
    }

    // 8. Animation State Machine
    this.updateAnimation(dt);
  }

  updateAnimation(dt) {
    if (!this.animations.idle) return;

    if (this.currentAnim === this.animations.doubleJump && !this.currentAnim.finished) {
      // Keep playing double jump until finished
    } else if (this.isWallSliding) {
      this.currentAnim = this.animations.wallJump;
    } else if (!this.isGrounded) {
      if (this.vy < 0) {
        this.currentAnim = this.animations.jump;
      } else {
        this.currentAnim = this.animations.fall;
      }
    } else if (Math.abs(this.vx) > 10) {
      this.currentAnim = this.animations.run;
    } else {
      this.currentAnim = this.animations.idle;
    }

    if (this.currentAnim) {
      this.currentAnim.update(dt);
    }
  }

  draw(ctx) {
    if (this.currentAnim) {
      this.currentAnim.draw(ctx, this.x, this.y, this.flipX);
    }
  }
}

window.Player = Player;
