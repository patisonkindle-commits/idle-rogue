import Phaser from 'phaser'

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot')
  }

  create() {
    // Generate all sprites programmatically (no external assets needed)
    this.generateTiles()
    this.generateEnemies()
    this.generateItems()
    this.generatePlayer()
    this.generateEffects()
    this.generateUI()
    
    this.scene.start('Game')
    this.scene.launch('UI')
  }

  generateTiles() {
    const g = this.make.graphics({ add: false })
    
    // Floor tile
    g.clear()
    g.fillStyle(0x1a1a2e)
    g.fillRect(0, 0, 32, 32)
    g.fillStyle(0x16213e)
    g.fillRect(1, 1, 30, 30)
    g.generateTexture('tile_floor', 32, 32)
    
    // Wall tile
    g.clear()
    g.fillStyle(0x0f3460)
    g.fillRect(0, 0, 32, 32)
    g.fillStyle(0x533483)
    g.fillRect(2, 2, 28, 28)
    g.fillStyle(0x0f3460)
    g.fillRect(4, 4, 24, 24)
    g.generateTexture('tile_wall', 32, 32)
    
    // Door
    g.clear()
    g.fillStyle(0x1a1a2e)
    g.fillRect(0, 0, 32, 32)
    g.fillStyle(0xe94560)
    g.fillRect(8, 2, 16, 28)
    g.fillStyle(0xffd700)
    g.fillRect(22, 16, 4, 4)
    g.generateTexture('tile_door', 32, 32)
    
    // Stairs down
    g.clear()
    g.fillStyle(0x1a1a2e)
    g.fillRect(0, 0, 32, 32)
    g.fillStyle(0x00b4d8)
    g.fillRect(4, 4, 24, 24)
    g.fillStyle(0x0077b6)
    for(let i = 0; i < 4; i++) {
      g.fillRect(6 + i*2, 6 + i*5, 20 - i*4, 4)
    }
    g.generateTexture('tile_stairs', 32, 32)
    
    g.destroy()
  }

  generateEnemies() {
    const g = this.make.graphics({ add: false })
    const types = [
      { name: 'enemy_slime', color: 0x2ecc71, size: 12 },
      { name: 'enemy_skeleton', color: 0xecf0f1, size: 14 },
      { name: 'enemy_orc', color: 0x27ae60, size: 16 },
      { name: 'enemy_demon', color: 0xe74c3c, size: 18 },
      { name: 'enemy_dragon', color: 0x8e44ad, size: 20 },
    ]
    
    types.forEach(({ name, color, size }) => {
      g.clear()
      // Body
      g.fillStyle(color)
      g.fillCircle(16, 16, size)
      // Eyes
      g.fillStyle(0xffffff)
      g.fillCircle(12, 12, 3)
      g.fillCircle(20, 12, 3)
      g.fillStyle(0x000000)
      g.fillCircle(13, 13, 1.5)
      g.fillCircle(21, 13, 1.5)
      g.generateTexture(name, 32, 32)
    })
    g.destroy()
  }

  generateItems() {
    const g = this.make.graphics({ add: false })
    
    // Gold coin
    g.clear()
    g.fillStyle(0xffd700)
    g.fillCircle(8, 8, 6)
    g.fillStyle(0xf39c12)
    g.fillCircle(8, 8, 3)
    g.generateTexture('item_gold', 16, 16)
    
    // Health potion
    g.clear()
    g.fillStyle(0xff0000)
    g.fillRect(4, 2, 8, 10)
    g.fillStyle(0xcccccc)
    g.fillRect(6, 0, 4, 3)
    g.generateTexture('item_hp_potion', 16, 16)
    
    // Sword
    g.clear()
    g.fillStyle(0xbdc3c7)
    g.fillRect(7, 0, 2, 10)
    g.fillStyle(0x8e6d3c)
    g.fillRect(4, 10, 8, 3)
    g.generateTexture('item_sword', 16, 16)
    
    // Shield
    g.clear()
    g.fillStyle(0x3498db)
    g.fillCircle(8, 8, 7)
    g.fillStyle(0x2980b9)
    g.fillCircle(8, 8, 4)
    g.generateTexture('item_shield', 16, 16)
    
    g.destroy()
  }

  generatePlayer() {
    const g = this.make.graphics({ add: false })
    
    // Player character
    g.clear()
    g.fillStyle(0xe94560)
    g.fillCircle(16, 16, 12)
    // Helmet
    g.fillStyle(0xf39c12)
    g.fillRect(8, 2, 16, 6)
    // Eyes
    g.fillStyle(0xffffff)
    g.fillCircle(12, 12, 3)
    g.fillCircle(20, 12, 3)
    g.fillStyle(0x000000)
    g.fillCircle(13, 13, 1.5)
    g.fillCircle(21, 13, 1.5)
    g.generateTexture('player', 32, 32)
    
    g.destroy()
  }

  generateEffects() {
    const g = this.make.graphics({ add: false })
    
    // Hit effect
    g.clear()
    g.fillStyle(0xffffff, 0.8)
    g.fillCircle(8, 8, 6)
    g.fillStyle(0xffd700, 0.5)
    g.fillCircle(8, 8, 4)
    g.generateTexture('effect_hit', 16, 16)
    
    // Gold pickup
    g.clear()
    g.fillStyle(0xffd700)
    g.fillCircle(4, 4, 3)
    g.generateTexture('effect_gold', 8, 8)
    
    g.destroy()
  }

  generateUI() {
    const g = this.make.graphics({ add: false })
    
    // HP bar background
    g.clear()
    g.fillStyle(0x333333)
    g.fillRoundedRect(0, 0, 200, 20, 4)
    g.generateTexture('bar_bg', 200, 20)
    
    // HP bar fill
    g.clear()
    g.fillStyle(0xe74c3c)
    g.fillRoundedRect(0, 0, 200, 20, 4)
    g.generateTexture('bar_hp', 200, 20)
    
    // EXP bar fill
    g.clear()
    g.fillStyle(0x3498db)
    g.fillRoundedRect(0, 0, 200, 20, 4)
    g.generateTexture('bar_exp', 200, 20)
    
    // Button
    g.clear()
    g.fillStyle(0xe94560)
    g.fillRoundedRect(0, 0, 120, 40, 8)
    g.generateTexture('btn', 120, 40)
    
    g.destroy()
  }
}