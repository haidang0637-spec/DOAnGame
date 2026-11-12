/**
 * Pixel Adventure Physics Engine
 */
class Physics {
  static checkAABB(b1, b2) {
    return (
      b1.x < b2.x + b2.w &&
      b1.x + b1.w > b2.x &&
      b1.y < b2.y + b2.h &&
      b1.y + b1.h > b2.y
    );
  }

  static checkCircleAABB(circle, box) {
    // Find closest point on box to circle center
    const closestX = Math.max(box.x, Math.min(circle.x, box.x + box.w));
    const closestY = Math.max(box.y, Math.min(circle.y, box.y + box.h));

    const dx = circle.x - closestX;
    const dy = circle.y - closestY;

    return dx * dx + dy * dy < circle.r * circle.r;
  }

  /**
   * Resolves player movement against solids and one-way platforms
   */
  static moveAndCollide(player, solids, oneWayPlatforms, fallingPlatforms, dt) {
    const hitbox = player.getHitbox();

    // 1. Move horizontally
    player.x += player.vx * dt;
    hitbox.x = player.x + player.hitboxOffsetX;
    player.touchingLeft = false;
    player.touchingRight = false;

    for (const solid of solids) {
      if (Physics.checkAABB(hitbox, solid)) {
        if (player.vx > 0) {
          player.x = solid.x - hitbox.w - player.hitboxOffsetX;
          player.vx = 0;
          player.touchingRight = true;
        } else if (player.vx < 0) {
          player.x = solid.x + solid.w - player.hitboxOffsetX;
          player.vx = 0;
          player.touchingLeft = true;
        }
        hitbox.x = player.x + player.hitboxOffsetX;
      }
    }

    // 2. Move vertically
    const prevY = player.y;
    player.y += player.vy * dt;
    hitbox.y = player.y + player.hitboxOffsetY;
    player.isGrounded = false;

    // Check solids
    for (const solid of solids) {
      if (Physics.checkAABB(hitbox, solid)) {
        if (player.vy > 0) {
          // Landing on floor
          player.y = solid.y - hitbox.h - player.hitboxOffsetY;
          player.vy = 0;
          player.isGrounded = true;
        } else if (player.vy < 0) {
          // Hitting ceiling
          player.y = solid.y + solid.h - player.hitboxOffsetY;
          player.vy = 0;
        }
        hitbox.y = player.y + player.hitboxOffsetY;
      }
    }

    // Check one-way platforms (only if falling and not pressing DOWN)
    if (player.vy >= 0 && !window.input.keys.down) {
      const prevBottom = prevY + player.hitboxOffsetY + hitbox.h;
      for (const plat of oneWayPlatforms) {
        // If player was at or above platform top in previous frame
        if (prevBottom <= plat.y + 4) {
          if (
            hitbox.x + hitbox.w > plat.x &&
            hitbox.x < plat.x + plat.w &&
            hitbox.y + hitbox.h >= plat.y &&
            hitbox.y + hitbox.h <= plat.y + 10
          ) {
            player.y = plat.y - hitbox.h - player.hitboxOffsetY;
            player.vy = 0;
            player.isGrounded = true;
            hitbox.y = player.y + player.hitboxOffsetY;
          }
        }
      }

      // Check falling platforms
      if (fallingPlatforms) {
        for (const fp of fallingPlatforms) {
          if (!fp.isGone && prevBottom <= fp.y + 4) {
            if (
              hitbox.x + hitbox.w > fp.x &&
              hitbox.x < fp.x + fp.w &&
              hitbox.y + hitbox.h >= fp.y &&
              hitbox.y + hitbox.h <= fp.y + 10
            ) {
              player.y = fp.y - hitbox.h - player.hitboxOffsetY;
              player.vy = 0;
              player.isGrounded = true;
              fp.onSteppedOn();
              hitbox.y = player.y + player.hitboxOffsetY;
            }
          }
        }
      }
    }
  }
}

window.Physics = Physics;
