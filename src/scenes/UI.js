import Phaser from 'phaser'

export class UIScene extends Phaser.Scene {
  constructor() {
    super('UI')
  }

  create() {
    this.gameScene = this.scene.get('Game')
    
    this.createUI()
    this.setupListeners()
    this.updateUI()
  }

  createUI() {
    // Background panel
    const panel = this.add.rectangle(240, 427, 480, 120, 0x000000, 0.8)
    panel.setDepth(100)
    
    // Level & Floor
    this.levelText = this.add.text(10, 370, '', {
      fontSize: '14px', color: '#f39c12', fontStyle: 'bold'
    }).setDepth(101)
    
    this.floorText = this.add.text(10, 390, '', {
      fontSize: '12px', color: '#95a5a6'
    }).setDepth(101)
    
    // HP Bar
    this.add.text(10, 410, 'HP', {
      fontSize: '10px', color: '#e74c3c'
    }).setDepth(101)
    
    this.hpBarBg = this.add.rectangle(35, 416, 200, 12, 0x333333).setOrigin(0, 0.5).setDepth(101)
    this.hpBarFill = this.add.rectangle(35, 416, 200, 12, 0xe74c3c).setOrigin(0, 0.5).setDepth(101)
    this.hpText = this.add.text(135, 416, '', {
      fontSize: '10px', color: '#ffffff', stroke: '#000000', strokeThickness: 1
    }).setDepth(101).setOrigin(0.5)
    
    // EXP Bar
    this.add.text(10, 435, 'EXP', {
      fontSize: '10px', color: '#3498db'
    }).setDepth(101)
    
    this.expBarBg = this.add.rectangle(35, 441, 200, 12, 0x333333).setOrigin(0, 0.5).setDepth(101)
    this.expBarFill = this.add.rectangle(35, 441, 200, 12, 0x3498db).setOrigin(0, 0.5).setDepth(101)
    this.expText = this.add.text(135, 441, '', {
      fontSize: '10px', color: '#ffffff', stroke: '#000000', strokeThickness: 1
    }).setDepth(101).setOrigin(0.5)
    
    // Stats
    this.statsText = this.add.text(10, 460, '', {
      fontSize: '11px', color: '#ecf0f1', lineSpacing: 4
    }).setDepth(101)
    
    // Gold
    this.goldText = this.add.text(350, 370, '', {
      fontSize: '16px', color: '#ffd700', fontStyle: 'bold'
    }).setDepth(101)
    
    // Kills
    this.killsText = this.add.text(350, 395, '', {
      fontSize: '11px', color: '#95a5a6'
    }).setDepth(101)
    
    // Equipment
    this.equipText = this.add.text(350, 415, '', {
      fontSize: '10px', color: '#bdc3c7', lineSpacing: 2
    }).setDepth(101)
    
    // Controls hint
    this.add.text(10, 485, 'WASD / Touch: Move | Auto-attack nearby', {
      fontSize: '9px', color: '#7f8c8d'
    }).setDepth(101)
    
    // Offline earnings popup
    if (this.gameScene.state.offlineEarnings > 0) {
      this.showOfflineEarnings(this.gameScene.state.offlineEarnings)
      this.gameScene.state.offlineEarnings = 0
    }
  }

  showOfflineEarnings(gold) {
    const bg = this.add.rectangle(240, 200, 300, 100, 0x000000, 0.9).setDepth(200)
    const title = this.add.text(240, 175, '💤 Offline Earnings', {
      fontSize: '16px', color: '#f39c12', fontStyle: 'bold'
    }).setDepth(201).setOrigin(0.5)
    const amount = this.add.text(240, 205, `+${gold} Gold`, {
      fontSize: '20px', color: '#ffd700'
    }).setDepth(201).setOrigin(0.5)
    const hint = this.add.text(240, 235, 'Tap to continue', {
      fontSize: '10px', color: '#95a5a6'
    }).setDepth(201).setOrigin(0.5)
    
    this.input.once('pointerdown', () => {
      bg.destroy()
      title.destroy()
      amount.destroy()
      hint.destroy()
    })
  }

  setupListeners() {
    this.gameScene.events.on('updateUI', () => this.updateUI())
  }

  updateUI() {
    const s = this.gameScene.state
    
    this.levelText.setText(`Level ${s.level}`)
    this.floorText.setText(`Floor ${s.floor}`)
    this.goldText.setText(`${s.gold} G`)
    this.killsText.setText(`Kills: ${s.kills}`)
    
    // HP bar
    const hpPct = s.hp / s.maxHp
    this.hpBarFill.setDisplaySize(200 * hpPct, 12)
    this.hpText.setText(`${s.hp}/${s.maxHp}`)
    
    // EXP bar
    const expPct = s.exp / s.expToNext
    this.expBarFill.setDisplaySize(200 * expPct, 12)
    this.expText.setText(`${s.exp}/${s.expToNext}`)
    
    // Stats
    this.statsText.setText(
      `ATK: ${s.atk}  DEF: ${s.def}`
    )
    
    // Equipment
    this.equipText.setText(
      `Swords: ${s.sword}  Shields: ${s.shield}`
    )
  }
}