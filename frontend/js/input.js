/**
 * Pixel Adventure Input Handler
 */
class InputHandler {
  constructor() {
    this.keys = {
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false,
      jumpPressed: false
    };

    this.restartTriggered = false;
    this.nextLevelTriggered = false;
    this.prevLevelTriggered = false;

    this.bindKeyboard();
    this.bindTouch();
  }

  bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      // Audio context unlock on first key
      if (window.audio) window.audio.init();

      switch (e.code) {
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = true;
          break;
        case 'KeyW':
        case 'ArrowUp':
        case 'Space':
          if (!this.keys.jump) {
            this.keys.jumpPressed = true;
          }
          this.keys.jump = true;
          e.preventDefault();
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.down = true;
          break;
        case 'KeyR':
          this.restartTriggered = true;
          break;
        case 'KeyN':
          this.nextLevelTriggered = true;
          break;
        case 'KeyP':
          this.prevLevelTriggered = true;
          break;
        case 'KeyM':
          if (window.audio) window.audio.toggleMute();
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = false;
          break;
        case 'KeyW':
        case 'ArrowUp':
        case 'Space':
          this.keys.jump = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.down = false;
          break;
      }
    });
  }

  bindTouch() {
    const bindBtn = (id, keyName, isSinglePress = false) => {
      const el = document.getElementById(id);
      if (!el) return;

      const start = (e) => {
        e.preventDefault();
        if (window.audio) window.audio.init();
        if (isSinglePress) {
          this.keys.jumpPressed = true;
        }
        this.keys[keyName] = true;
      };

      const end = (e) => {
        e.preventDefault();
        this.keys[keyName] = false;
      };

      el.addEventListener('touchstart', start, { passive: false });
      el.addEventListener('touchend', end, { passive: false });
      el.addEventListener('mousedown', start);
      el.addEventListener('mouseup', end);
      el.addEventListener('mouseleave', end);
    };

    bindBtn('touchLeft', 'left');
    bindBtn('touchRight', 'right');
    bindBtn('touchDown', 'down');
    bindBtn('touchJump', 'jump', true);
  }

  // Called at end of frame to clear single-press triggers
  resetFrame() {
    this.keys.jumpPressed = false;
    this.restartTriggered = false;
    this.nextLevelTriggered = false;
    this.prevLevelTriggered = false;
  }
}

window.input = new InputHandler();
