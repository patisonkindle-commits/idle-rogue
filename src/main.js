import Phaser from 'phaser'
import { BootScene } from './scenes/Boot.js'
import { GameScene } from './scenes/Game.js'
import { UIScene } from './scenes/UI.js'

const config = {
  type: Phaser.AUTO,
  parent: document.body,
  width: 480,
  height: 854,
  backgroundColor: '#0a0a0a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, GameScene, UIScene],
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  }
}

new Phaser.Game(config)