/**
 * Pixel Adventure Main Game Engine
 */
class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 512;
    this.canvas.height = 288;
    this.ctx.imageSmoothingEnabled = false;

    // Components
    this.levelManager = new LevelManager();
    this.particles = new ParticleManager();

    // Game stats
    this.fruitsCollected = 0;
    this.totalFruits = 0;
    this.deaths = 0;
    this.timer = 0;
    this.isLevelWon = false;

    // Last frame time
    this.lastTime = performance.now();

    // Top-right interactive buttons coordinates (canvas pixel coordinates)
    this.topButtons = [
      { id: 'prev', x: 432, y: 8, w: 21, h: 22, action: () => this.levelManager.prevLevel() },
      { id: 'next', x: 455, y: 8, w: 21, h: 22, action: () => this.levelManager.nextLevel() },
      { id: 'restart', x: 478, y: 8, w: 21, h: 22, action: () => this.levelManager.restart() }
    ];
    this.btnImages = {};
    this.hoveredBtn = null;

    this.init();
  }

  async init() {
    // Load button images
    const [pImg, nImg, rImg] = await Promise.all([
      window.sprites.loadImage('/assets/Menu/Buttons/Previous.png'),
      window.sprites.loadImage('/assets/Menu/Buttons/Next.png'),
      window.sprites.loadImage('/assets/Menu/Buttons/Restart.png')
    ]);
    this.btnImages = { prev: pImg, next: nImg, restart: rImg };

    // Bind canvas clicks and hovers for the 3 top-right buttons
    this.bindCanvasControls();

    // Bind UI elements
    this.bindUI();

    // Start with Level 1
    await this.levelManager.loadLevel(1);

    // Start main game loop
    requestAnimationFrame(this.loop.bind(this));
  }

  bindCanvasControls() {
    const getCanvasPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };

    this.canvas.addEventListener('mousemove', (e) => {
      const pos = getCanvasPos(e);
      this.hoveredBtn = null;
      for (const btn of this.topButtons) {
        if (
          pos.x >= btn.x && pos.x <= btn.x + btn.w &&
          pos.y >= btn.y && pos.y <= btn.y + btn.h
        ) {
          this.hoveredBtn = btn;
          this.canvas.style.cursor = 'pointer';
          return;
        }
      }
      this.canvas.style.cursor = 'default';
    });

    this.canvas.addEventListener('click', (e) => {
      const pos = getCanvasPos(e);
      for (const btn of this.topButtons) {
        if (
          pos.x >= btn.x && pos.x <= btn.x + btn.w &&
          pos.y >= btn.y && pos.y <= btn.y + btn.h
        ) {
          if (window.audio) window.audio.playButton();
          btn.action();
          return;
        }
      }
    });
  }

  bindUI() {
    // Top bar buttons
    document.getElementById('btnPrevLevel')?.addEventListener('click', () => {
      if (window.audio) window.audio.playButton();
      this.levelManager.prevLevel();
    });
    document.getElementById('btnNextLevel')?.addEventListener('click', () => {
      if (window.audio) window.audio.playButton();
      this.levelManager.nextLevel();
    });
    document.getElementById('btnRestart')?.addEventListener('click', () => {
      if (window.audio) window.audio.playButton();
      this.levelManager.restart();
    });

    // Sound toggle
    document.getElementById('btnAudioToggle')?.addEventListener('click', () => {
      const isMuted = window.audio.toggleMute();
      document.getElementById('btnAudioToggle').innerText = isMuted ? '🔇 SOUND OFF' : '🔊 SOUND ON';
    });

    // Character selector
    document.getElementById('characterSelect')?.addEventListener('change', (e) => {
      const selected = e.target.value;
      if (this.levelManager.player) {
        this.levelManager.player.loadAnimations(selected);
      }
    });

    // Win Modal actions
    document.getElementById('modalNextBtn')?.addEventListener('click', () => {
      document.getElementById('winModal').classList.remove('active');
      this.levelManager.nextLevel();
    });
    document.getElementById('modalReplayBtn')?.addEventListener('click', () => {
      document.getElementById('winModal').classList.remove('active');
      this.levelManager.restart();
    });
  }

  onLevelLoaded(data) {
    this.fruitsCollected = 0;
    this.totalFruits = data.fruits ? data.fruits.length : 0;
    this.timer = 0;
    this.isLevelWon = false;

    // Update HUD
    document.getElementById('hudLevelName').innerText = `LVL ${data.id}`;
    document.getElementById('hudFruitCount').innerText = `${this.fruitsCollected}/${this.totalFruits}`;
    document.getElementById('hudDeathCount').innerText = `${this.deaths}`;

    // Sync character dropdown
    const charSelect = document.getElementById('characterSelect');
    if (charSelect && data.character) {
      charSelect.value = data.character;
    }

    // Hide modals
    document.getElementById('winModal')?.classList.remove('active');
  }

  onPlayerDied() {
    this.deaths++;
    document.getElementById('hudDeathCount').innerText = `${this.deaths}`;
  }

  onFruitCollected(fruit) {
    this.fruitsCollected++;
    document.getElementById('hudFruitCount').innerText = `${this.fruitsCollected}/${this.totalFruits}`;

    // Check level completion
    if (this.fruitsCollected >= this.totalFruits && !this.isLevelWon) {
      this.onLevelCompleted();
    }
  }

  async onLevelCompleted() {
    this.isLevelWon = true;
    if (window.audio) window.audio.playWin();

    // Show modal stats
    const timeFormatted = this.timer.toFixed(1) + 's';
    document.getElementById('winFruitCount').innerText = `${this.fruitsCollected}/${this.totalFruits}`;
    document.getElementById('winTime').innerText = timeFormatted;
    document.getElementById('winDeaths').innerText = `${this.deaths}`;
    document.getElementById('winModal')?.classList.add('active');

    // Submit score to FastAPI backend
    try {
      await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          levelId: this.levelManager.currentLevelId,
          playerName: 'Player 1',
          fruitsCollected: this.fruitsCollected,
          totalFruits: this.totalFruits,
          timeElapsed: this.timer,
          deaths: this.deaths
        })
      });
    } catch (e) {
      console.warn('Could not submit score to backend', e);
    }
  }

  loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    requestAnimationFrame(this.loop.bind(this));
  }

  update(dt) {
    // Handle keyboard shortcuts
    if (window.input.restartTriggered) {
      this.levelManager.restart();
    } else if (window.input.nextLevelTriggered) {
      this.levelManager.nextLevel();
    } else if (window.input.prevLevelTriggered) {
      this.levelManager.prevLevel();
    }

    // Timer update
    if (!this.isLevelWon && this.levelManager.isLoaded) {
      this.timer += dt;
      document.getElementById('hudTimer').innerText = this.timer.toFixed(1) + 's';
    }

    // Update level entities
    this.levelManager.update(dt);

    // Update particles
    this.particles.update(dt);

    // Clear single-press input triggers
    window.input.resetFrame();
  }

  render() {
    this.ctx.clearRect(0, 0, 512, 288);

    // 1. Draw level and entities
    this.levelManager.draw(this.ctx);

    // 2. Draw particles
    this.particles.draw(this.ctx);

    // 3. Draw top right interactive buttons (Previous, Next, Restart)
    this.drawTopButtons();
  }

  drawTopButtons() {
    for (const btn of this.topButtons) {
      const img = this.btnImages[btn.id];
      if (img) {
        this.ctx.drawImage(img, btn.x, btn.y, btn.w, btn.h);
        // Highlight on hover
        if (this.hoveredBtn === btn) {
          this.ctx.strokeStyle = '#ffd15c';
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(btn.x - 0.5, btn.y - 0.5, btn.w + 1, btn.h + 1);
        }
      }
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
