/**
 * Pixel Adventure Level Controller
 */
class LevelManager {
  constructor() {
    this.currentLevelId = 1;
    this.levelData = null;
    this.backdropImg = null;

    this.solids = [];
    this.oneWayPlatforms = [];
    this.traps = [];
    this.fallingPlatforms = [];
    this.fruits = [];
    this.player = null;

    this.isLoaded = false;
    this.isLoading = false;
  }

  async loadLevel(levelId, overrideCharacter = null) {
    this.isLoading = true;
    this.isLoaded = false;
    this.currentLevelId = levelId;

    try {
      const res = await fetch(`/api/levels/${levelId}`);
      if (!res.ok) throw new Error(`Failed to load level ${levelId}`);
      this.levelData = await res.json();

      // Load clean backdrop
      this.backdropImg = await window.sprites.loadImage(this.levelData.backdrop);

      // Setup solids & one-way platforms
      this.solids = this.levelData.solids || [];
      this.oneWayPlatforms = this.levelData.oneWayPlatforms || [];

      // Setup Traps
      this.traps = (this.levelData.traps || []).map(t => new Saw(t));

      // Setup Falling Platforms
      this.fallingPlatforms = (this.levelData.fallingPlatforms || []).map(fp => new FallingPlatform(fp));

      // Setup Fruits
      this.fruits = (this.levelData.fruits || []).map(f => new Fruit(f.type, f.x, f.y));

      // Setup Player
      const charToUse = overrideCharacter || this.levelData.character || "Virtual Guy";
      const spawn = this.levelData.playerSpawn || { x: 50, y: 150 };
      this.player = new Player(spawn.x, spawn.y, charToUse);

      this.isLoaded = true;
      this.isLoading = false;

      // Update UI
      window.game.onLevelLoaded(this.levelData);
    } catch (err) {
      console.error(err);
      this.isLoading = false;
    }
  }

  restart() {
    if (!this.levelData) return;
    const charName = this.player ? this.player.characterName : this.levelData.character;
    this.loadLevel(this.currentLevelId, charName);
  }

  nextLevel() {
    const nextId = this.currentLevelId === 1 ? 2 : 1;
    this.loadLevel(nextId);
  }

  prevLevel() {
    const prevId = this.currentLevelId === 2 ? 1 : 2;
    this.loadLevel(prevId);
  }

  update(dt) {
    if (!this.isLoaded) return;

    // 1. Update Falling platforms
    for (const fp of this.fallingPlatforms) {
      fp.update(dt);
    }

    // 2. Update Player
    if (this.player) {
      this.player.update(dt, this.solids, this.oneWayPlatforms, this.fallingPlatforms);
    }

    // 3. Update Traps (Saws)
    for (const trap of this.traps) {
      trap.update(dt, this.player);
    }

    // 4. Update Fruits
    for (const fruit of this.fruits) {
      fruit.update(dt, this.player);
    }
  }

  draw(ctx) {
    if (!this.isLoaded) {
      // Loading screen
      ctx.fillStyle = "#211f30";
      ctx.fillRect(0, 0, 512, 288);
      ctx.fillStyle = "#ffd15c";
      ctx.font = "12px 'Press Start 2P', monospace";
      ctx.textAlign = "center";
      ctx.fillText("LOADING LEVEL...", 256, 144);
      return;
    }

    // 1. Draw backdrop (which has the complete pixel-accurate pixel adventure scene!)
    if (this.backdropImg) {
      ctx.drawImage(this.backdropImg, 0, 0, 512, 288);
    }

    // 2. Draw Falling Platforms
    for (const fp of this.fallingPlatforms) {
      fp.draw(ctx);
    }

    // 3. Draw Fruits
    for (const fruit of this.fruits) {
      fruit.draw(ctx);
    }

    // 4. Draw Traps (Saws)
    for (const trap of this.traps) {
      trap.draw(ctx);
    }

    // 5. Draw Player
    if (this.player) {
      this.player.draw(ctx);
    }
  }
}

window.LevelManager = LevelManager;
