import Phaser from 'phaser'

const ENEMIES = [
  { name: 'Slime', tex: 'enemy_slime', hp: 5, atk: 1, gold: 2, exp: 3 },
  { name: 'Skeleton', tex: 'enemy_skeleton', hp: 12, atk: 3, gold: 5, exp: 8 },
  { name: 'Orc', tex: 'enemy_orc', hp: 25, atk: 6, gold: 10, exp: 15 },
  { name: 'Demon', tex: 'enemy_demon', hp: 50, atk: 12, gold: 25, exp: 30 },
  { name: 'Dragon', tex: 'enemy_dragon', hp: 100, atk: 25, gold: 50, exp: 60 },
]

const ITEMS = [
  { name: 'Sword', tex: 'item_sword', type: 'atk', value: 2 },
  { name: 'Shield', tex: 'item_shield', type: 'def', value: 2 },
  { name: 'HP Potion', tex: 'item_hp_potion', type: 'heal', value: 20 },
]

export class GameScene extends Phaser.Scene {
  constructor() {
    super('Game')
    this.state = this.getDefaultState()
  }

  getDefaultState() {
    return {
      gold: 0,
      level: 1,
      exp: 0,
      expToNext: 10,
      hp: 100,
      maxHp: 100,
      atk: 5,
      def: 2,
      floor: 1,
      kills: 0,
      sword: 0,
      shield: 0,
      autoAtkTimer: 0,
      autoAtkSpeed: 1000,
      lastSave: Date.now(),
      offlineEarnings: 0
    }
  }

  create() {
    this.loadGame()
    this.calculateOfflineEarnings()
    this.createDungeon()
    this.createPlayer()
    this.createEnemy()
    this.setupTimers()
    this.setupInput()
  }

  calculateOfflineEarnings() {
    const now = Date.now()
    const elapsed = (now - this.state.lastSave) / 1000
    if (elapsed > 60) {
      const goldPerSec = this.state.level * 0.5
      const offlineGold = Math.floor(elapsed * goldPerSec * 0.5)
      if (offlineGold > 0) {
        this.state.offlineEarnings = offlineGold
        this.state.gold += offlineGold
      }
    }
  }

  createDungeon() {
    this.dungeon = []
    this.dungeonGroup = this.add.group()
    
    const w = 15, h = 20
    this.dungeonW = w
    this.dungeonH = h
    
    // Generate rooms
    for (let y = 0; y < h; y++) {
      this.dungeon[y] = []
      for (let x = 0; x < w; x++) {
        this.dungeon[y][x] = 1 // wall
      }
    }
    
    // Carve rooms
    const rooms = []
    for (let i = 0; i < 6; i++) {
      const rw = 3 + Math.floor(Math.random() * 3)
      const rh = 3 + Math.floor(Math.random() * 3)
      const rx = 1 + Math.floor(Math.random() * (w - rw - 2))
      const ry = 1 + Math.floor(Math.random() * (h - rh - 2))
      
      let overlap = false
      for (const room of rooms) {
        if (rx < room.x + room.w + 1 && rx + rw + 1 > room.x &&
            ry < room.y + room.h + 1 && ry + rh + 1 > room.y) {
          overlap = true
          break
        }
      }
      if (overlap) continue
      
      for (let y = ry; y < ry + rh; y++) {
        for (let x = rx; x < rx + rw; x++) {
          this.dungeon[y][x] = 0
        }
      }
      rooms.push({ x: rx, y: ry, w: rw, h: rh })
    }
    
    // Connect rooms
    for (let i = 1; i < rooms.length; i++) {
      const a = rooms[i - 1]
      const b = rooms[i]
      const ax = Math.floor(a.x + a.w / 2)
      const ay = Math.floor(a.y + a.h / 2)
      const bx = Math.floor(b.x + b.w / 2)
      const by = Math.floor(b.y + b.h / 2)
      
      let x = ax, y = ay
      while (x !== bx) {
        this.dungeon[y][x] = 0
        x += x < bx ? 1 : -1
      }
      while (y !== by) {
        this.dungeon[y][x] = 0
        y += y < by ? 1 : -1
      }
    }
    
    // Ensure at least 1 room — force-place if needed
    if (rooms.length === 0) {
      const rx = 2, ry = 2, rw = 4, rh = 4
      for (let y = ry; y < ry + rh; y++) {
        for (let x = rx; x < rx + rw; x++) {
          this.dungeon[y][x] = 0
        }
      }
      rooms.push({ x: rx, y: ry, w: rw, h: rh })
    }
    
    // Place stairs in last room
    const lastRoom = rooms[rooms.length - 1]
    const sx = Math.floor(lastRoom.x + lastRoom.w / 2)
    const sy = Math.floor(lastRoom.y + lastRoom.h / 2)
    this.dungeon[sy][sx] = 3 // stairs
    
    // Render
    this.tileSprites = []
    for (let y = 0; y < h; y++) {
      this.tileSprites[y] = []
      for (let x = 0; x < w; x++) {
        let tex = 'tile_wall'
        if (this.dungeon[y][x] === 0) tex = 'tile_floor'
        if (this.dungeon[y][x] === 3) tex = 'tile_stairs'
        
        const sprite = this.add.image(x * 32, y * 32, tex)
        sprite.setOrigin(0)
        this.tileSprites[y][x] = sprite
      }
    }
    
    // Store first room center for player spawn
    this.playerSpawn = {
      x: Math.floor(rooms[0].x + rooms[0].w / 2) * 32 + 16,
      y: Math.floor(rooms[0].y + rooms[0].h / 2) * 32 + 16
    }
    
    // Store stairs position
    this.stairsPos = { x: sx * 32 + 16, y: sy * 32 + 16 }
  }

  createPlayer() {
    this.player = this.physics.add.sprite(this.playerSpawn.x, this.playerSpawn.y, 'player')
    this.player.setDepth(10)
    this.player.body.setSize(20, 20)
    
    // Camera follow
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)
    this.cameras.main.setBounds(0, 0, this.dungeonW * 32, this.dungeonH * 32)
    
    // Collision with walls
    this.wallGroup = this.physics.add.staticGroup()
    for (let y = 0; y < this.dungeonH; y++) {
      for (let x = 0; x < this.dungeonW; x++) {
        if (this.dungeon[y][x] === 1) {
          const wall = this.wallGroup.create(x * 32, y * 32, 'tile_wall')
          wall.setSize(32, 32)
          wall.setOrigin(0)
          wall.refreshBody()
        }
      }
    }
    this.physics.add.collider(this.player, this.wallGroup)
    
    // Speed
    this.playerSpeed = 150
  }

  destroyEnemyUI() {
    if (this.enemyHpBg) { this.enemyHpBg.destroy(); this.enemyHpBg = null }
    if (this.enemyHpFill) { this.enemyHpFill.destroy(); this.enemyHpFill = null }
    if (this.enemyName) { this.enemyName.destroy(); this.enemyName = null }
  }

  createEnemy() {
    if (this.enemy) {
      this.enemy.destroy()
      this.destroyEnemyUI()
    }
    if (this.wanderTimer) { this.wanderTimer.destroy(); this.wanderTimer = null }
    
    // Pick random floor tile (not player spawn or stairs)
    let ex, ey, attempts = 0
    do {
      ex = 1 + Math.floor(Math.random() * (this.dungeonW - 2))
      ey = 1 + Math.floor(Math.random() * (this.dungeonH - 2))
      attempts++
    } while (
      (this.dungeon[ey][ex] !== 0 ||
       (Math.abs(ex * 32 - this.playerSpawn.x) < 96 &&
        Math.abs(ey * 32 - this.playerSpawn.y) < 96) ||
       (Math.abs(ex * 32 - this.stairsPos.x) < 64 &&
        Math.abs(ey * 32 - this.stairsPos.y) < 64)) &&
      attempts < 100
    )
    
    // Pick enemy type based on floor
    const maxType = Math.min(Math.floor(this.state.floor / 3), ENEMIES.length - 1)
    const typeIdx = Math.floor(Math.random() * (maxType + 1))
    const type = ENEMIES[typeIdx]
    
    const scaleFactor = 1 + (this.state.floor - 1) * 0.15
    this.enemy = this.physics.add.sprite(ex * 32 + 16, ey * 32 + 16, type.tex)
    this.enemy.setDepth(10)
    this.enemy.body.setSize(20, 20)
    this.enemy.data = {
      ...type,
      hp: Math.floor(type.hp * scaleFactor),
      maxHp: Math.floor(type.hp * scaleFactor),
      atk: Math.floor(type.atk * scaleFactor),
      gold: Math.floor(type.gold * scaleFactor),
      exp: Math.floor(type.exp * scaleFactor)
    }
    
    // Enemy HP bar
    this.enemyHpBg = this.add.rectangle(0, 0, 30, 4, 0x333333).setDepth(20)
    this.enemyHpFill = this.add.rectangle(0, 0, 30, 4, 0xe74c3c).setDepth(20)
    this.enemyName = this.add.text(0, 0, type.name, {
      fontSize: '10px', color: '#ffffff', stroke: '#000000', strokeThickness: 2
    }).setDepth(20).setOrigin(0.5, 1)
    
    // Enemy AI - wander
    this.wanderTimer = this.time.addEvent({
      delay: 2000,
      loop: true,
      callback: () => {
        if (this.enemy && this.enemy.active) {
          const speed = 40
          this.enemy.body.setVelocity(
            Phaser.Math.Between(-speed, speed),
            Phaser.Math.Between(-speed, speed)
          )
        }
      }
    })
    
    // Collision
    this.physics.add.collider(this.enemy, this.wallGroup)
  }

  setupTimers() {
    // Auto-attack timer
    this.autoAtkEvent = this.time.addEvent({
      delay: this.state.autoAtkSpeed,
      loop: true,
      callback: () => this.autoAttack()
    })
    
    // Passive gold
    this.time.addEvent({
      delay: 3000,
      loop: true,
      callback: () => {
        const passiveGold = Math.floor(this.state.level * 0.3)
        if (passiveGold > 0) {
          this.state.gold += passiveGold
          this.events.emit('updateUI')
        }
      }
    })
    
    // Auto-save
    this.time.addEvent({
      delay: 30000,
      loop: true,
      callback: () => this.saveGame()
    })
  }

  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys()
    this.wasd = {
      up: this.input.keyboard.addKey('W'),
      down: this.input.keyboard.addKey('S'),
      left: this.input.keyboard.addKey('A'),
      right: this.input.keyboard.addKey('D')
    }
  }

  autoAttack() {
    if (!this.enemy || !this.enemy.active) return
    
    const dist = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.enemy.x, this.enemy.y
    )
    
    if (dist < 60) {
      // Player attacks
      const dmg = Math.max(1, this.state.atk - Math.floor(this.enemy.data.atk * 0.3))
      this.enemy.data.hp -= dmg
      this.showDamage(this.enemy.x, this.enemy.y - 20, dmg, 0xe74c3c)
      this.showHitEffect(this.enemy.x, this.enemy.y)
      
      // Enemy attacks back
      if (this.enemy.data.hp > 0) {
        const enemyDmg = Math.max(1, this.enemy.data.atk - this.state.def)
        this.state.hp -= enemyDmg
        this.showDamage(this.player.x, this.player.y - 20, enemyDmg, 0xff6b6b)
        
        // Check death
        if (this.state.hp <= 0) {
          this.state.hp = this.state.maxHp
          this.state.floor = Math.max(1, this.state.floor - 1)
          this.state.gold = Math.floor(this.state.gold * 0.8)
          this.cameras.main.shake(300, 0.02)
          this.scene.restart()
          return
        }
      }
      
      // Check enemy death
      if (this.enemy.data.hp <= 0) {
        this.onEnemyKilled()
      }
      
      this.events.emit('updateUI')
    }
  }

  showDamage(x, y, amount, color) {
    const text = this.add.text(x, y, `-${amount}`, {
      fontSize: '14px',
      color: color === 0xe74c3c ? '#e74c3c' : '#ff6b6b',
      stroke: '#000000',
      strokeThickness: 2
    }).setDepth(30).setOrigin(0.5)
    
    this.tweens.add({
      targets: text,
      y: y - 30,
      alpha: 0,
      duration: 800,
      onComplete: () => text.destroy()
    })
  }

  showHitEffect(x, y) {
    const fx = this.add.image(x, y, 'effect_hit').setDepth(25).setScale(1.5)
    this.tweens.add({
      targets: fx,
      alpha: 0,
      scale: 2,
      duration: 200,
      onComplete: () => fx.destroy()
    })
  }

  onEnemyKilled() {
    const data = this.enemy.data
    
    // Rewards
    this.state.gold += data.gold
    this.state.exp += data.exp
    this.state.kills += 1
    
    // Show gold gain
    const goldText = this.add.text(this.enemy.x, this.enemy.y, `+${data.gold}G`, {
      fontSize: '12px', color: '#ffd700', stroke: '#000000', strokeThickness: 2
    }).setDepth(30).setOrigin(0.5)
    
    this.tweens.add({
      targets: goldText,
      y: this.enemy.y - 40,
      alpha: 0,
      duration: 1000,
      onComplete: () => goldText.destroy()
    })
    
    // Check level up
    while (this.state.exp >= this.state.expToNext) {
      this.state.exp -= this.state.expToNext
      this.state.level += 1
      this.state.maxHp += 10
      this.state.hp = this.state.maxHp
      this.state.atk += 2
      this.state.def += 1
      this.state.expToNext = Math.floor(this.state.expToNext * 1.5)
      
      // Level up effect
      this.cameras.main.flash(300, 233, 69, 96)
    }
    
    // Random item drop (15% chance)
    if (Math.random() < 0.15) {
      this.dropItem(this.enemy.x, this.enemy.y)
    }
    
    // Create new enemy
    this.createEnemy()
    this.events.emit('updateUI')
    this.saveGame()
  }

  dropItem(x, y) {
    const item = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    
    if (item.type === 'heal') {
      this.state.hp = Math.min(this.state.maxHp, this.state.hp + item.value)
      this.showFloatingText(x, y, `+${item.value} HP`, '#2ecc71')
    } else if (item.type === 'atk') {
      this.state.atk += item.value
      this.showFloatingText(x, y, `+${item.value} ATK`, '#e74c3c')
      this.state.sword += 1
    } else if (item.type === 'def') {
      this.state.def += item.value
      this.showFloatingText(x, y, `+${item.value} DEF`, '#3498db')
      this.state.shield += 1
    }
  }

  showFloatingText(x, y, text, color) {
    const t = this.add.text(x, y, text, {
      fontSize: '11px', color, stroke: '#000000', strokeThickness: 2
    }).setDepth(30).setOrigin(0.5)
    
    this.tweens.add({
      targets: t,
      y: y - 40,
      alpha: 0,
      duration: 1200,
      onComplete: () => t.destroy()
    })
  }

  update(time, delta) {
    // Player movement
    const speed = this.playerSpeed
    this.player.body.setVelocity(0)
    
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.body.setVelocityX(-speed)
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.body.setVelocityX(speed)
    }
    
    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.body.setVelocityY(-speed)
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.body.setVelocityY(speed)
    }
    
    // Touch movement
    if (this.input.activePointer.isDown) {
      const worldPoint = this.cameras.main.getWorldPoint(
        this.input.activePointer.x,
        this.input.activePointer.y
      )
      const angle = Phaser.Math.Angle.Between(
        this.player.x, this.player.y,
        worldPoint.x, worldPoint.y
      )
      
      if (Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        worldPoint.x, worldPoint.y
      ) > 20) {
        this.player.body.setVelocity(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed
        )
      }
    }
    
    // Check stairs
    if (this.stairsPos) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        this.stairsPos.x, this.stairsPos.y
      )
      if (dist < 24) {
        this.state.floor += 1
        this.scene.restart()
      }
    }
    
    // Update enemy UI
    if (this.enemy && this.enemy.active) {
      this.enemyHpBg.setPosition(this.enemy.x - 15, this.enemy.y - 24)
      const hpPct = this.enemy.data.hp / this.enemy.data.maxHp
      this.enemyHpFill.setPosition(
        this.enemy.x - 15,
        this.enemy.y - 24
      )
      this.enemyHpFill.setDisplaySize(30 * hpPct, 4)
      this.enemyName.setPosition(this.enemy.x, this.enemy.y - 30)
    }
  }

  saveGame() {
    this.state.lastSave = Date.now()
    localStorage.setItem('idle_rogue_save', JSON.stringify(this.state))
  }

  loadGame() {
    const saved = localStorage.getItem('idle_rogue_save')
    if (saved) {
      const parsed = JSON.parse(saved)
      this.state = { ...this.getDefaultState(), ...parsed }
    }
  }
}