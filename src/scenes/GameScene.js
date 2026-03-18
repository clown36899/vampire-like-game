import Phaser from 'phaser'
import SoundManager from '../SoundManager.js'

const WORLD = 4000
const MAGNET_RADIUS = 180  // 젬 자석 반경

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game')
  }

  init() {
    this.gameTimer = 0
    this.paused = false
    this.isGameOver = false
    this.waveMinute = 0
    this.killCount = 0
    this.orbSprites = []
    this.garlicSprite = null
    this.knifeTimer = 0
    this.orbAngle = 0
    this.garlicDmgTimer = 0
    this.missileTimer = 0
  }

  create() {
    const W = this.scale.width
    const H = this.scale.height

    this.physics.world.setBounds(0, 0, WORLD, WORLD)

    // 배경
    this.add.tileSprite(0, 0, WORLD, WORLD, 'ground').setOrigin(0, 0).setDepth(-1)

    // 그룹
    this.enemies    = this.physics.add.group()
    this.projectiles = this.physics.add.group()
    this.gems       = this.physics.add.group()
    this.orbGroup   = this.physics.add.group()
    this.missiles   = this.physics.add.group()

    // 플레이어
    this.player = this.physics.add.sprite(WORLD / 2, WORLD / 2, 'player')
    this.player.setCollideWorldBounds(true)
    this.player.setDepth(10)
    this.player.body.setSize(28, 28)

    // 카메라
    this.cameras.main.setBounds(0, 0, WORLD, WORLD)
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09)

    // 입력
    this.cursors = this.input.keyboard.createCursorKeys()
    this.wasd = this.input.keyboard.addKeys({
      up:    Phaser.Input.Keyboard.KeyCodes.W,
      down:  Phaser.Input.Keyboard.KeyCodes.S,
      left:  Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    })

    // 플레이어 스탯
    this.playerStats = {
      hp: 250, maxHp: 250,
      speed: 200,
      damage: 1.0,
      xp: 0, level: 1, xpToNext: 10
    }

    // 무기
    this.weapons = {
      bolt:    { level: 1 },
      orb:     { level: 0 },
      garlic:  { level: 0 },
      missile: { level: 0 }
    }

    // 충돌
    this.physics.add.overlap(this.player,      this.enemies,    this.playerHitByEnemy,   null, this)
    this.physics.add.overlap(this.projectiles, this.enemies,    this.projectileHitEnemy, null, this)
    this.physics.add.overlap(this.player,      this.gems,       this.collectGem,          null, this)
    this.physics.add.overlap(this.orbGroup,    this.enemies,    this.orbHitEnemy,         null, this)
    this.physics.add.overlap(this.missiles,    this.enemies,    this.missileHitEnemy,     null, this)

    // 적 스폰 타이머 (처음 3초 유예)
    this.time.delayedCall(3000, () => {
      this.spawnTimer = this.time.addEvent({
        delay: 1800,
        callback: this.spawnEnemies,
        callbackScope: this,
        loop: true
      })
    })

    // 사운드
    this.sfx = new SoundManager()

    // UI 생성
    this.createUI(W, H)
  }

  createUI(W, H) {
    const s = W / 960   // DPR 스케일 팩터 (Retina=2, 일반=1)
    const p = 12 * s    // 기본 패딩
    const bw = 220 * s  // HP/XP 바 너비
    const bh = 20 * s   // HP 바 높이
    const xh = 12 * s   // XP 바 높이

    // ── HP 바 ──
    this.add.rectangle(p, p, bw, bh, 0x222222).setOrigin(0, 0).setScrollFactor(0).setDepth(100)
    this.hpBarFill = this.add.rectangle(p, p, bw, bh, 0xff3333).setOrigin(0, 0).setScrollFactor(0).setDepth(101)
    this.hpBarWidth = bw
    this.hpLabel = this.add.text(p + bw / 2, p + 1, 'HP 250 / 250', {
      fontSize: `${12 * s}px`, color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(102)

    // ── XP 바 ──
    const xpY = p + bh + 4 * s
    this.add.rectangle(p, xpY, bw, xh, 0x111111).setOrigin(0, 0).setScrollFactor(0).setDepth(100)
    this.xpBarFill = this.add.rectangle(p, xpY, 0, xh, 0x00ffaa).setOrigin(0, 0).setScrollFactor(0).setDepth(101)
    this.xpBarWidth = bw
    this.xpLabel = this.add.text(p, xpY + xh + 3 * s, 'XP 0 / 10', {
      fontSize: `${11 * s}px`, color: '#00ffaa'
    }).setScrollFactor(0).setDepth(102)

    // ── 레벨 ──
    this.levelBadge = this.add.text(p, xpY + xh + 18 * s, 'Lv. 1', {
      fontSize: `${16 * s}px`, color: '#ffff00', fontStyle: 'bold'
    }).setScrollFactor(0).setDepth(102)

    // ── 타이머 (중앙 상단) ──
    this.timerText = this.add.text(W / 2, p, '00:00', {
      fontSize: `${22 * s}px`, color: '#ffffff', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3 * s
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(102)

    // ── 킬 카운트 (우상단) ──
    this.killText = this.add.text(W - p, p, '💀 0', {
      fontSize: `${16 * s}px`, color: '#ffaaaa', fontStyle: 'bold'
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(102)

    // ── 무기 슬롯 (하단) ──
    this.weaponSlotText = this.add.text(p, H - 18 * s, '', {
      fontSize: `${12 * s}px`, color: '#aaaacc'
    }).setScrollFactor(0).setDepth(102)

    // ── 레벨업 플래시 ──
    this.levelUpFlash = this.add.text(W / 2, 60 * s, '', {
      fontSize: `${24 * s}px`, color: '#ffff00', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4 * s
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(103).setAlpha(0)
  }

  update(time, delta) {
    if (this.isGameOver || this.paused) return

    this.gameTimer += delta
    this.movePlayer()
    this.updateWeapons(delta)
    this.updateGemMagnet()
    this.updateEnemyMovement()
    this.updateUI()
    this.checkWave()
    this.checkWin()
  }

  // ─────────────────────────────────
  //  이동
  // ─────────────────────────────────
  movePlayer() {
    const speed = this.playerStats.speed
    let vx = 0, vy = 0

    const ptr = this.input.activePointer
    if (ptr.isDown) {
      const cx = this.cameras.main.width / 2
      const cy = this.cameras.main.height / 2
      const dx = ptr.x - cx
      const dy = ptr.y - cy
      const len = Math.sqrt(dx * dx + dy * dy)
      if (len > 20) { vx = (dx / len) * speed; vy = (dy / len) * speed }
    } else {
      if (this.cursors.left.isDown  || this.wasd.left.isDown)  vx = -speed
      else if (this.cursors.right.isDown || this.wasd.right.isDown) vx =  speed
      if (this.cursors.up.isDown    || this.wasd.up.isDown)    vy = -speed
      else if (this.cursors.down.isDown  || this.wasd.down.isDown)  vy =  speed
      if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707 }
    }

    if (vx !== 0 || vy !== 0) this.sfx.resume()
    this.player.setVelocity(vx, vy)
    if (vx < 0) this.player.setFlipX(true)
    else if (vx > 0) this.player.setFlipX(false)
  }

  // ─────────────────────────────────
  //  무기 업데이트
  // ─────────────────────────────────
  updateWeapons(delta) {
    // ── 투사체(볼트) ──
    if (this.weapons.bolt.level > 0) {
      this.knifeTimer += delta
      const rate = Math.max(220, 1000 - (this.weapons.bolt.level - 1) * 150)
      if (this.knifeTimer >= rate) {
        this.knifeTimer = 0
        this.fireBolt()
      }
    }

    // ── 마법 구슬 ──
    if (this.weapons.orb.level > 0) {
      const orbCount = Math.min(this.weapons.orb.level, 5)
      const radius   = 80 + this.weapons.orb.level * 18
      this.orbAngle += 0.028 + this.weapons.orb.level * 0.006

      while (this.orbSprites.length < orbCount) {
        const o = this.physics.add.sprite(0, 0, 'orb')
        o.setDepth(9)
        o.hitCooldowns = new Map()
        this.orbSprites.push(o)
        this.orbGroup.add(o)
      }
      while (this.orbSprites.length > orbCount) {
        const o = this.orbSprites.pop()
        this.orbGroup.remove(o, true, true)
      }
      this.orbSprites.forEach((orb, i) => {
        const angle = this.orbAngle + (i / orbCount) * Math.PI * 2
        orb.x = this.player.x + Math.cos(angle) * radius
        orb.y = this.player.y + Math.sin(angle) * radius
        if (orb.body) orb.body.reset(orb.x, orb.y)
      })
    }

    // ── 마크로스 미사일 ──
    if (this.weapons.missile.level > 0) {
      this.missileTimer += delta
      const rate = Math.max(2000, 3500 - (this.weapons.missile.level - 1) * 300)
      if (this.missileTimer >= rate) {
        this.missileTimer = 0
        this.fireMissiles()
      }
      // 유도 업데이트 (매 프레임)
      this.missiles.getChildren().forEach(m => {
        if (!m.active) return
        const target = this.getNearestEnemy()
        if (!target) return
        const targetAngle = Phaser.Math.Angle.Between(m.x, m.y, target.x, target.y)
        const turnRate = 0.05 + this.weapons.missile.level * 0.012
        m.currentAngle = Phaser.Math.Angle.RotateTo(m.currentAngle, targetAngle, turnRate)
        m.mspeed = Math.min((m.mspeed || 160) + 4, 480)
        m.setVelocity(Math.cos(m.currentAngle) * m.mspeed, Math.sin(m.currentAngle) * m.mspeed)
        m.setRotation(m.currentAngle)
        // 연기 잔상
        if (!m.lastSmokeX) { m.lastSmokeX = m.x; m.lastSmokeY = m.y }
        const sd = Phaser.Math.Distance.Between(m.lastSmokeX, m.lastSmokeY, m.x, m.y)
        if (sd > 18) {
          m.lastSmokeX = m.x; m.lastSmokeY = m.y
          const smoke = this.add.circle(m.x, m.y, 2 + Math.random() * 2, 0x888888, 0.35).setDepth(7)
          this.tweens.add({ targets: smoke, alpha: 0, scaleX: 2.5, scaleY: 2.5, duration: 380, onComplete: () => smoke.destroy() })
        }
      })
    }

    // ── 마늘 ──
    if (this.weapons.garlic.level > 0) {
      const radius = 90 + this.weapons.garlic.level * 28

      if (!this.garlicSprite || !this.garlicSprite.active) {
        this.garlicSprite = this.add.sprite(this.player.x, this.player.y, 'garlic')
        this.garlicSprite.setDepth(5).setAlpha(0.5)
      }
      this.garlicSprite.x = this.player.x
      this.garlicSprite.y = this.player.y
      this.garlicSprite.setScale(radius / 72)

      this.garlicDmgTimer += delta
      if (this.garlicDmgTimer >= 500) {
        this.garlicDmgTimer = 0
        const dmg = 8 * this.weapons.garlic.level * this.playerStats.damage
        this.enemies.getChildren().forEach(e => {
          if (!e.active) return
          if (Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y) <= radius)
            this.damageEnemy(e, dmg)
        })
      }
    }
  }

  // 볼트 발사
  fireBolt() {
    const nearest = this.getNearestEnemy()
    if (!nearest) return

    const count = Math.min(1 + Math.floor((this.weapons.bolt.level - 1) / 2), 5)
    const base  = Phaser.Math.Angle.Between(this.player.x, this.player.y, nearest.x, nearest.y)

    for (let i = 0; i < count; i++) {
      const spread = count === 1 ? 0 : (i - (count - 1) / 2) * 0.22
      const angle  = base + spread

      const b = this.projectiles.create(this.player.x, this.player.y, 'bolt')
      b.setDepth(8).setRotation(angle)
      b.damage = 14 * this.weapons.bolt.level * this.playerStats.damage
      b.setVelocity(Math.cos(angle) * 560, Math.sin(angle) * 560)
      this.time.delayedCall(1200, () => { if (b?.active) b.destroy() })
    }
    this.sfx.shoot()
  }

  // 마크로스 미사일 발사 (전방향 난수 살포 → 유도)
  fireMissiles() {
    const count = 4 + (this.weapons.missile.level - 1) * 3  // 4, 7, 10, 13, 16발
    for (let i = 0; i < count; i++) {
      // 360도 균등 분산 + 약간 랜덤 흔들림
      const angle = (Math.PI * 2 * i / count) + (Math.random() - 0.5) * 0.7
      const spd   = 140 + Math.random() * 80
      const m = this.missiles.create(this.player.x, this.player.y, 'missile')
      m.setDepth(8).setRotation(angle)
      m.damage = 10 * this.weapons.missile.level * this.playerStats.damage
      m.currentAngle = angle
      m.mspeed = spd
      m.setVelocity(Math.cos(angle) * spd, Math.sin(angle) * spd)
      this.time.delayedCall(3000, () => { if (m?.active) m.destroy() })
    }
    this.sfx.shoot()
  }

  missileHitEnemy(missile, enemy) {
    if (!missile.active || !enemy.active) return
    this.damageEnemy(enemy, missile.damage || 10)
    this.showExplosion(missile.x, missile.y)
    missile.destroy()
  }

  showExplosion(x, y) {
    const ring = this.add.circle(x, y, 10, 0xff6600, 0.85).setDepth(15)
    this.tweens.add({ targets: ring, scaleX: 3, scaleY: 3, alpha: 0, duration: 220, onComplete: () => ring.destroy() })
  }

  getNearestEnemy() {
    let nearest = null, minDist = Infinity
    this.enemies.getChildren().forEach(e => {
      if (!e.active) return
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y)
      if (d < minDist) { minDist = d; nearest = e }
    })
    return nearest
  }

  // ─────────────────────────────────
  //  젬 자석 (핵심 기능)
  // ─────────────────────────────────
  updateGemMagnet() {
    const px = this.player.x, py = this.player.y
    this.gems.getChildren().forEach(gem => {
      if (!gem.active) return
      const dist = Phaser.Math.Distance.Between(px, py, gem.x, gem.y)
      if (dist < MAGNET_RADIUS) {
        const angle = Phaser.Math.Angle.Between(gem.x, gem.y, px, py)
        const spd   = Math.min(400, 180 + (MAGNET_RADIUS - dist) * 2.5)
        gem.body.setVelocity(Math.cos(angle) * spd, Math.sin(angle) * spd)
      } else {
        gem.body.setVelocity(0, 0)
      }
    })
  }

  // ─────────────────────────────────
  //  적 스폰
  // ─────────────────────────────────
  spawnEnemies() {
    if (this.paused || this.isGameOver) return
    const minute = Math.floor(this.gameTimer / 60000)
    const count  = 2 + minute * 2
    for (let i = 0; i < count; i++) this.spawnOneEnemy(minute)
  }

  spawnOneEnemy(minute) {
    const cam    = this.cameras.main
    const margin = 70
    const side   = Phaser.Math.Between(0, 3)
    const hw = cam.width / 2, hh = cam.height / 2
    let x, y
    switch (side) {
      case 0: x = this.player.x + Phaser.Math.Between(-hw, hw); y = this.player.y - hh - margin; break
      case 1: x = this.player.x + hw + margin; y = this.player.y + Phaser.Math.Between(-hh, hh); break
      case 2: x = this.player.x + Phaser.Math.Between(-hw, hw); y = this.player.y + hh + margin; break
      case 3: x = this.player.x - hw - margin; y = this.player.y + Phaser.Math.Between(-hh, hh); break
    }
    x = Phaser.Math.Clamp(x, 30, WORLD - 30)
    y = Phaser.Math.Clamp(y, 30, WORLD - 30)

    const r = Math.random()
    let type = 'normal'
    if (minute >= 1 && r < 0.25) type = 'fast'
    if (minute >= 2 && r < 0.08) type = 'tank'

    const texMap = { normal: 'enemy_normal', fast: 'enemy_fast', tank: 'enemy_tank' }
    const e = this.physics.add.sprite(x, y, texMap[type])
    e.setDepth(7)

    // 스탯 (밸런싱: 초반 여유롭게, 분 경과에 따라 증가)
    const configs = {
      normal: { hp: 20 + minute * 12, spd: 55 + minute * 5, dmg: 3 + minute,      xp: 2 },
      fast:   { hp: 12 + minute * 6,  spd: 110 + minute * 8, dmg: 2 + minute,     xp: 3 },
      tank:   { hp: 100 + minute * 45, spd: 35 + minute * 3, dmg: 8 + minute * 3, xp: 10 }
    }
    const cfg = configs[type]
    e.hp = cfg.hp; e.maxHp = cfg.hp
    e.speed = cfg.spd; e.damage = cfg.dmg; e.xpValue = cfg.xp
    e.lastHit = 0

    this.enemies.add(e)
  }

  updateEnemyMovement() {
    this.enemies.getChildren().forEach(e => {
      if (!e.active) return
      const angle = Phaser.Math.Angle.Between(e.x, e.y, this.player.x, this.player.y)
      this.physics.velocityFromAngle(Phaser.Math.RadToDeg(angle), e.speed, e.body.velocity)
    })
  }

  // ─────────────────────────────────
  //  충돌 처리
  // ─────────────────────────────────
  playerHitByEnemy(player, enemy) {
    if (!enemy.active) return
    const now = this.time.now
    if (now - enemy.lastHit < 1200) return
    enemy.lastHit = now

    this.playerStats.hp = Math.max(0, this.playerStats.hp - enemy.damage)
    this.cameras.main.shake(150, 0.006)
    this.tweens.add({ targets: player, alpha: 0.2, duration: 80, yoyo: true, repeat: 2 })
    this.sfx.playerHit()

    if (this.playerStats.hp <= 0) this.triggerGameOver(false)
  }

  projectileHitEnemy(projectile, enemy) {
    if (!projectile.active || !enemy.active) return
    this.damageEnemy(enemy, projectile.damage || 14)
    projectile.destroy()
  }

  orbHitEnemy(orb, enemy) {
    if (!enemy.active) return
    if (!orb.hitCooldowns) orb.hitCooldowns = new Map()
    const now = this.time.now
    if (now - (orb.hitCooldowns.get(enemy) || 0) < 700) return
    orb.hitCooldowns.set(enemy, now)
    this.damageEnemy(enemy, 18 * this.weapons.orb.level * this.playerStats.damage)
  }

  damageEnemy(enemy, damage) {
    if (!enemy?.active) return
    enemy.hp -= damage
    this.tweens.add({ targets: enemy, alpha: 0.25, duration: 60, yoyo: true })
    this.sfx.hit()
    // 데미지 숫자 표시
    this.showDamageText(enemy.x, enemy.y, Math.round(damage))
    if (enemy.hp <= 0) this.killEnemy(enemy)
  }

  showDamageText(x, y, value) {
    const txt = this.add.text(x, y - 10, `-${value}`, {
      fontSize: '13px', color: '#ffee00', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 2
    }).setDepth(20)
    this.tweens.add({
      targets: txt, y: y - 45, alpha: 0, duration: 700,
      onComplete: () => txt.destroy()
    })
  }

  killEnemy(enemy) {
    // XP 젬 드랍
    const gem = this.physics.add.sprite(enemy.x, enemy.y, 'gem')
    gem.setDepth(6)
    gem.xpValue = enemy.xpValue || 2
    gem.body.setVelocity(0, 0)
    this.gems.add(gem)

    this.killCount++
    this.sfx.kill()
    enemy.destroy()
  }

  collectGem(player, gem) {
    if (!gem.active) return
    const xpVal = gem.xpValue || 2
    // 수집 텍스트
    const txt = this.add.text(gem.x, gem.y, `+${xpVal} XP`, {
      fontSize: '12px', color: '#00ffaa',
      stroke: '#004422', strokeThickness: 2
    }).setDepth(20)
    this.tweens.add({
      targets: txt, y: gem.y - 35, alpha: 0, duration: 600,
      onComplete: () => txt.destroy()
    })
    gem.destroy()
    this.sfx.gem()
    this.addXP(xpVal)
  }

  addXP(amount) {
    this.playerStats.xp += amount
    while (this.playerStats.xp >= this.playerStats.xpToNext) {
      this.playerStats.xp -= this.playerStats.xpToNext
      this.doLevelUp()
    }
  }

  doLevelUp() {
    this.playerStats.level++
    this.playerStats.xpToNext = Math.floor(this.playerStats.xpToNext * 1.5)

    // 레벨업 플래시 텍스트
    this.levelUpFlash.setText('⬆ LEVEL UP! Lv.' + this.playerStats.level)
    this.levelUpFlash.setAlpha(1)
    this.tweens.add({ targets: this.levelUpFlash, alpha: 0, duration: 1200, delay: 400 })

    this.sfx.levelUp()
    this.paused = true
    this.physics.pause()
    this.scene.launch('LevelUp', { gameScene: this, weapons: this.weapons })
  }

  onWeaponChosen(key) {
    if (key === 'hp') {
      this.playerStats.hp = Math.min(this.playerStats.maxHp, this.playerStats.hp + 40)
    } else {
      this.weapons[key].level++
    }
    this.paused = false
    this.physics.resume()
  }

  // ─────────────────────────────────
  //  UI 업데이트
  // ─────────────────────────────────
  updateUI() {
    const s = this.playerStats

    // HP
    const hpRatio = Math.max(0, s.hp / s.maxHp)
    this.hpBarFill.setSize(this.hpBarWidth * hpRatio, this.hpBarFill.height)
    this.hpLabel.setText(`HP ${s.hp} / ${s.maxHp}`)

    // HP 색상 변화
    const hpColor = hpRatio > 0.5 ? 0xff3333 : hpRatio > 0.25 ? 0xff8800 : 0xff0000
    this.hpBarFill.setFillStyle(hpColor)

    // XP
    const xpRatio = s.xp / s.xpToNext
    this.xpBarFill.setSize(this.xpBarWidth * xpRatio, this.xpBarFill.height)
    this.xpLabel.setText(`XP ${s.xp} / ${s.xpToNext}`)

    // 레벨
    this.levelBadge.setText('Lv. ' + s.level)

    // 타이머
    const sec = Math.floor(this.gameTimer / 1000)
    this.timerText.setText(
      `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`
    )

    // 킬
    this.killText.setText(`💀 ${this.killCount}`)

    // 무기
    const wSlot = []
    if (this.weapons.bolt.level    > 0) wSlot.push(`🗡 볼트 Lv${this.weapons.bolt.level}`)
    if (this.weapons.orb.level     > 0) wSlot.push(`🔮 구슬 Lv${this.weapons.orb.level}`)
    if (this.weapons.garlic.level  > 0) wSlot.push(`🧄 마늘 Lv${this.weapons.garlic.level}`)
    if (this.weapons.missile.level > 0) wSlot.push(`🚀 미사일 Lv${this.weapons.missile.level}`)
    this.weaponSlotText.setText(wSlot.join('   '))
  }

  // ─────────────────────────────────
  //  웨이브 / 승리
  // ─────────────────────────────────
  checkWave() {
    if (!this.spawnTimer) return
    const minute = Math.floor(this.gameTimer / 60000)
    if (minute > this.waveMinute) {
      this.waveMinute = minute
      const d = Math.max(400, 1800 - minute * 100)
      this.spawnTimer.reset({ delay: d, callback: this.spawnEnemies, callbackScope: this, loop: true })
    }
  }

  checkWin() {
    if (this.gameTimer >= 600000) this.triggerGameOver(true)
  }

  triggerGameOver(win) {
    if (this.isGameOver) return
    this.isGameOver = true
    this.physics.pause()
    const sec = Math.floor(this.gameTimer / 1000)
    const timeStr = `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`
    win ? this.sfx.victory() : this.sfx.gameOver()
    this.time.delayedCall(400, () => {
      this.scene.stop('LevelUp')
      this.scene.start('GameOver', {
        win, time: timeStr, kills: this.killCount, level: this.playerStats.level
      })
    })
  }
}
