import Phaser from 'phaser'
import SoundManager from '../SoundManager.js'
import { Store, SKINS, CHARACTERS } from '../Store.js'

const WORLD = 4000
const MAGNET_RADIUS = 180

// 데일리 퀘스트 풀
const QUEST_POOL = [
  { id: 'kill_50',    desc: '적 50마리 처치',   type: 'kills',   goal: 50,  reward: 30 },
  { id: 'kill_100',   desc: '적 100마리 처치',  type: 'kills',   goal: 100, reward: 60 },
  { id: 'survive_5',  desc: '5분 이상 생존',     type: 'seconds', goal: 300, reward: 40 },
  { id: 'survive_8',  desc: '8분 이상 생존',     type: 'seconds', goal: 480, reward: 70 },
  { id: 'reach_lv10', desc: '레벨 10 도달',      type: 'level',   goal: 10,  reward: 50 },
  { id: 'reach_lv15', desc: '레벨 15 도달',      type: 'level',   goal: 15,  reward: 80 },
]

export default class GameScene extends Phaser.Scene {
  constructor() { super('Game') }

  init() {
    this.gameTimer    = 0
    this.paused       = false
    this.isGameOver   = false
    this.waveMinute   = 0
    this.killCount    = 0
    this.orbSprites   = []
    this.garlicSprite = null
    this.knifeTimer   = 0
    this.orbAngle     = 0
    this.garlicDmgTimer  = 0
    this.missileTimer    = 0
    this.daggerTimer     = 0
    this.iceLanceTimer   = 0
    this.devWaveBonus    = 0
    // 콤보
    this.combo        = 0
    this.comboDecay   = 0
    this.comboDmgMult = 1.0
    // 이세계
    this.isekaiMode      = false
    this.isekaiActivating = false
    // 트럭
    this.truckTimer   = 0
    this.truckInterval = Phaser.Math.Between(90000, 140000)
    this.truckActive  = false
    // 보스
    this.bossAlive    = false
    this.lastBossMinute = -1
    this.activeBoss   = null
    // 날씨
    this.weather      = 'clear'
    this.weatherTimer = 0
    this.weatherInterval = Phaser.Math.Between(60000, 90000)
    this.weatherSpeedMod = 1.0
    this.weatherEnemyMod = 1.0
    this.weatherParticleTimer = null
    // 무기 진화
    this.evolved = { thunder_storm: false, plasma_cannon: false, storm_blade: false }
    this.thunderTimer = 0
    this.plasmaAngle  = 0
    // 번개폭풍 구름
    this.cloudSprites = []
    this.cloudAngle   = 0
  }

  create() {
    const W = this.scale.width
    const H = this.scale.height

    this.physics.world.setBounds(0, 0, WORLD, WORLD)

    // 배경
    this.bgTile = this.add.tileSprite(0, 0, WORLD, WORLD, 'ground').setOrigin(0, 0).setDepth(-1)

    // 날씨 오버레이
    this.weatherOverlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0)
      .setScrollFactor(0).setDepth(95)

    // 그룹
    this.enemies     = this.physics.add.group()
    this.projectiles = this.physics.add.group()
    this.gems        = this.physics.add.group()
    this.orbGroup    = this.physics.add.group()
    this.missiles    = this.physics.add.group()
    this.trucks      = this.physics.add.group()
    this.iceLances   = this.physics.add.group()

    // 플레이어
    this.player = this.physics.add.sprite(WORLD / 2, WORLD / 2, 'player')
    this.player.setCollideWorldBounds(true).setDepth(13)
    this.player.body.setSize(28, 28)

    // 카메라
    this.cameras.main.setBounds(0, 0, WORLD, WORLD)
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09)

    // 입력
    this.cursors = this.input.keyboard.createCursorKeys()
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W, down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A, right: Phaser.Input.Keyboard.KeyCodes.D
    })
    this.input.keyboard.on('keydown-B', () => this.openInGameShop())

    // 플레이어 스탯
    this.playerStats = { hp: 250, maxHp: 250, speed: 200, damage: 1.0, xp: 0, level: 1, xpToNext: 10 }

    // 무기
    this.weapons = {
      bolt: { level: 1 }, orb: { level: 0 }, garlic: { level: 0 },
      missile: { level: 0 }, magnet: { level: 0 },
      dagger: { level: 0 }, ice_lance: { level: 0 }
    }

    // 충돌
    this.physics.add.overlap(this.player,      this.enemies,    this.playerHitByEnemy,   null, this)
    this.physics.add.overlap(this.projectiles, this.enemies,    this.projectileHitEnemy, null, this)
    this.physics.add.overlap(this.player,      this.gems,       this.collectGem,          null, this)
    this.physics.add.overlap(this.orbGroup,    this.enemies,    this.orbHitEnemy,         null, this)
    this.physics.add.overlap(this.missiles,    this.enemies,    this.missileHitEnemy,     null, this)
    this.physics.add.overlap(this.trucks,      this.player,     this.truckHitsPlayer,    null, this)
    this.physics.add.overlap(this.iceLances,   this.enemies,    this.iceLanceHitEnemy,   null, this)

    // 스폰 타이머
    this.time.delayedCall(3000, () => {
      this.spawnTimer = this.time.addEvent({
        delay: 1800, callback: this.spawnEnemies, callbackScope: this, loop: true
      })
    })

    // 카드 효과
    if (Store.ownsCard('speed_up'))    this.playerStats.speed  = Math.min(380, Math.round(this.playerStats.speed * 1.2))
    if (Store.ownsCard('hp_boost'))  { this.playerStats.maxHp += 50; this.playerStats.hp += 50 }
    if (Store.ownsCard('lucky_start')) {
      const pick = Phaser.Utils.Array.GetRandom(['orb', 'garlic', 'missile', 'magnet', 'dagger', 'ice_lance'])
      this.weapons[pick].level = 1
    }

    // 캐릭터 효과 + 스킨 적용 (캐릭터 전용 스킨 우선, 상점 스킨으로 override 가능)
    const charId   = Store.getEquippedChar()
    const charDef  = CHARACTERS.find(c => c.id === charId)
    this.charId    = charId
    if (charDef?.stats) {
      const st = charDef.stats
      if (st.maxHpBonus) { this.playerStats.maxHp = Math.max(50, this.playerStats.maxHp + st.maxHpBonus); this.playerStats.hp = this.playerStats.maxHp }
      if (st.damageMult) this.playerStats.damage  *= st.damageMult
      if (st.speedMult)  this.playerStats.speed    = Math.min(380, Math.round(this.playerStats.speed * st.speedMult))
      if (st.startWeapon && this.weapons[st.startWeapon] !== undefined) this.weapons[st.startWeapon].level = Math.max(1, this.weapons[st.startWeapon].level)
    }
    // 스킨: 해당 캐릭터의 장착 스킨 적용
    const equippedSkinId = Store.getEquippedSkin(charId)
    const skinTex = SKINS.find(s => s.id === equippedSkinId)?.tex || charDef?.skin || 'player'
    this.player.setTexture(skinTex)

    // 데일리 퀘스트 초기화
    this.initDailyQuests()

    // 사운드
    this.sfx = new SoundManager()

    // UI
    this.createUI(W, H)
  }

  // ─────────────────────────────────
  //  데일리 퀘스트
  // ─────────────────────────────────
  initDailyQuests() {
    const today = new Date().toDateString()
    if (Store.getDailyDate() !== today) {
      const shuffled = Phaser.Utils.Array.Shuffle([...QUEST_POOL])
      const quests   = shuffled.slice(0, 3).map(q => ({ ...q, progress: 0, done: false }))
      Store.setDailyQuests(quests)
      Store.setDailyDate(today)
    }
    this.dailyQuests = Store.getDailyQuests()
  }

  updateDailyQuests() {
    if (!this.dailyQuests) return
    let changed = false
    this.dailyQuests.forEach(q => {
      if (q.done) return
      let prog = 0
      if (q.type === 'kills')   prog = this.killCount
      if (q.type === 'seconds') prog = Math.floor(this.gameTimer / 1000)
      if (q.type === 'level')   prog = this.playerStats.level
      q.progress = Math.min(q.goal, prog)
      if (q.progress >= q.goal) {
        q.done = true; changed = true
        Store.addCoins(q.reward)
        this.showQuestComplete(q)
      }
    })
    if (changed) Store.setDailyQuests(this.dailyQuests)
  }

  showQuestComplete(q) {
    const W = this.scale.width
    const s = W / 960
    const txt = this.add.text(W / 2, this.scale.height * 0.35,
      `✅ 퀘스트 완료!\n${q.desc}\n+${q.reward}🪙`, {
        fontSize: `${16 * s}px`, color: '#ffff88', fontStyle: 'bold',
        stroke: '#000000', strokeThickness: 3, align: 'center'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(200)
    this.tweens.add({ targets: txt, y: txt.y - 40, alpha: 0, duration: 2500, delay: 500, onComplete: () => txt.destroy() })
  }

  // ─────────────────────────────────
  //  UI 생성
  // ─────────────────────────────────
  createUI(W, H) {
    const s  = W / 960
    const p  = 12 * s
    const bw = 220 * s, bh = 20 * s, xh = 12 * s

    // HP 바
    this.add.rectangle(p, p, bw, bh, 0x222222).setOrigin(0, 0).setScrollFactor(0).setDepth(100)
    this.hpBarFill = this.add.rectangle(p, p, bw, bh, 0xff3333).setOrigin(0, 0).setScrollFactor(0).setDepth(101)
    this.hpBarWidth = bw
    this.hpLabel = this.add.text(p + bw / 2, p + 1, 'HP 250 / 250', {
      fontSize: `${12 * s}px`, color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(102)

    // XP 바
    const xpY = p + bh + 4 * s
    this.add.rectangle(p, xpY, bw, xh, 0x111111).setOrigin(0, 0).setScrollFactor(0).setDepth(100)
    this.xpBarFill = this.add.rectangle(p, xpY, 0, xh, 0x00ffaa).setOrigin(0, 0).setScrollFactor(0).setDepth(101)
    this.xpBarWidth = bw
    this.xpLabel = this.add.text(p, xpY + xh + 3 * s, 'XP 0 / 10', {
      fontSize: `${11 * s}px`, color: '#00ffaa'
    }).setScrollFactor(0).setDepth(102)

    this.levelBadge = this.add.text(p, xpY + xh + 18 * s, 'Lv. 1', {
      fontSize: `${16 * s}px`, color: '#ffff00', fontStyle: 'bold'
    }).setScrollFactor(0).setDepth(102)

    // 타이머
    this.timerText = this.add.text(W / 2, p, '00:00', {
      fontSize: `${22 * s}px`, color: '#ffffff', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3 * s
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(102)

    // 날씨 표시 (아이콘 + 효과 설명, 클릭하면 날씨 정보 팝업)
    this.weatherText = this.add.text(W / 2, p + 28 * s, '', {
      fontSize: `${13 * s}px`, color: '#aaddff', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 2 * s
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(102)
      .setInteractive({ useHandCursor: true })
    this.weatherEffectText = this.add.text(W / 2, p + 46 * s, '', {
      fontSize: `${10 * s}px`, color: '#778899'
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(102)

    this.weatherText.on('pointerover', () => this.weatherText.setStyle({ color: '#ffffff' }))
    this.weatherText.on('pointerout',  () => this.weatherText.setStyle({ color: '#aaddff' }))
    this.weatherText.on('pointerdown', () => this.showWeatherPopup())

    // 날씨 정보 버튼 (우측 상단)
    const weatherInfoBtn = this.add.text(W - p, p + 62 * s, '🌤 날씨', {
      fontSize: `${12 * s}px`, color: '#88ddff',
      backgroundColor: '#001122', padding: { x: 6 * s, y: 3 * s }
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(102).setInteractive({ useHandCursor: true })
    weatherInfoBtn.on('pointerover', () => weatherInfoBtn.setStyle({ color: '#ffffff' }))
    weatherInfoBtn.on('pointerout',  () => weatherInfoBtn.setStyle({ color: '#88ddff' }))
    weatherInfoBtn.on('pointerdown', () => this.showWeatherPopup())

    // 킬
    this.killText = this.add.text(W - p, p, '💀 0', {
      fontSize: `${16 * s}px`, color: '#ffaaaa', fontStyle: 'bold'
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(102)

    // 코인
    this.coinText = this.add.text(W - p, p + 22 * s, `🪙 ${Store.getCoins()}`, {
      fontSize: `${14 * s}px`, color: '#ffd700', fontStyle: 'bold'
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(102)

    // 상점 버튼
    const shopBtn = this.add.text(W - p, p + 42 * s, '[B] 상점', {
      fontSize: `${12 * s}px`, color: '#aaaaff',
      backgroundColor: '#111133', padding: { x: 6 * s, y: 3 * s }
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(102).setInteractive({ useHandCursor: true })
    shopBtn.on('pointerover', () => shopBtn.setStyle({ color: '#ffffff' }))
    shopBtn.on('pointerout',  () => shopBtn.setStyle({ color: '#aaaaff' }))
    shopBtn.on('pointerdown', () => this.openInGameShop())

    // 콤보 텍스트
    this.comboText = this.add.text(W / 2, H * 0.15, '', {
      fontSize: `${20 * s}px`, color: '#ff8800', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3 * s
    }).setOrigin(0.5).setScrollFactor(0).setDepth(103).setAlpha(0)

    // 보스 HP 바 (상단 중앙)
    const bossBgW = 300 * s
    this.bossHpBg   = this.add.rectangle(W / 2, H - 28 * s, bossBgW, 16 * s, 0x330000).setScrollFactor(0).setDepth(102).setVisible(false)
    this.bossHpFill = this.add.rectangle(W / 2 - bossBgW / 2, H - 28 * s, bossBgW, 16 * s, 0xff2200).setOrigin(0, 0.5).setScrollFactor(0).setDepth(103).setVisible(false)
    this.bossHpLabel = this.add.text(W / 2, H - 28 * s, '👑 BOSS', {
      fontSize: `${11 * s}px`, color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(104).setVisible(false)
    this.bossBarWidth = bossBgW

    // 이세계 배지
    this.isekaiLabel = this.add.text(p, p + 80 * s, '', {
      fontSize: `${13 * s}px`, color: '#cc88ff', fontStyle: 'bold',
      backgroundColor: '#220044', padding: { x: 6 * s, y: 3 * s }
    }).setScrollFactor(0).setDepth(102)

    // 무기 슬롯 (하단)
    this.weaponSlotText = this.add.text(p, H - 18 * s, '', {
      fontSize: `${12 * s}px`, color: '#aaaacc'
    }).setScrollFactor(0).setDepth(102)

    // DEV 웨이브 조절
    const devY = H - 48 * s
    this.add.text(p, devY, '[DEV]', { fontSize: `${10 * s}px`, color: '#333333' }).setScrollFactor(0).setDepth(102)
    this.devWaveLabel = this.add.text(p, devY + 13 * s, 'WAVE +0', {
      fontSize: `${12 * s}px`, color: '#ff8844', fontStyle: 'bold'
    }).setScrollFactor(0).setDepth(102)
    const btnStyle = { fontSize: `${13 * s}px`, color: '#ff8844', backgroundColor: '#221100', padding: { x: 6 * s, y: 2 * s } }
    const minusBtn = this.add.text(p + 72 * s, devY + 11 * s, '−', btnStyle).setScrollFactor(0).setDepth(102).setInteractive({ useHandCursor: true })
    const plusBtn  = this.add.text(p + 94 * s, devY + 11 * s, '+', btnStyle).setScrollFactor(0).setDepth(102).setInteractive({ useHandCursor: true })
    minusBtn.on('pointerdown', () => { this.devWaveBonus = Math.max(0, this.devWaveBonus - 1); this.waveMinute = Math.floor(this.gameTimer / 60000) + this.devWaveBonus - 1; this.devWaveLabel.setText(`WAVE +${this.devWaveBonus}`) })
    plusBtn.on('pointerdown',  () => { this.devWaveBonus++; this.waveMinute = Math.floor(this.gameTimer / 60000) + this.devWaveBonus - 1; this.devWaveLabel.setText(`WAVE +${this.devWaveBonus}`) })

    // 레벨업 플래시
    this.levelUpFlash = this.add.text(W / 2, 60 * s, '', {
      fontSize: `${24 * s}px`, color: '#ffff00', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4 * s
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(103).setAlpha(0)
  }

  // ─────────────────────────────────
  //  메인 루프
  // ─────────────────────────────────
  update(time, delta) {
    if (this.isGameOver || this.paused) return
    this.gameTimer += delta
    this.movePlayer()
    this.updateWeapons(delta)
    this.updateGemMagnet()
    this.updateEnemyMovement()
    this.updateCombo(delta)
    this.updateWeather(delta)
    this.updateTruck(delta)
    this.checkBossSpawn()
    this.updateDailyQuests()
    this.updateUI()
    this.checkWave()
    this.checkWin()
  }

  // ─────────────────────────────────
  //  콤보 시스템
  // ─────────────────────────────────
  addCombo() {
    this.combo++
    this.comboDecay = 3000  // 3초 리셋
    if      (this.combo >= 20) this.comboDmgMult = 2.0
    else if (this.combo >= 10) this.comboDmgMult = 1.5
    else if (this.combo >= 5)  this.comboDmgMult = 1.2
    else                       this.comboDmgMult = 1.0

    if (this.combo >= 5) {
      const s = this.scale.width / 960
      this.comboText.setText(`🔥 ${this.combo} COMBO  x${this.comboDmgMult.toFixed(1)}`)
      this.comboText.setAlpha(1)
      this.tweens.killTweensOf(this.comboText)
      this.tweens.add({ targets: this.comboText, alpha: 0, duration: 1200, delay: 800 })
    }
  }

  updateCombo(delta) {
    if (this.combo === 0) return
    this.comboDecay -= delta
    if (this.comboDecay <= 0) {
      this.combo = 0
      this.comboDmgMult = 1.0
      this.comboText.setAlpha(0)
    }
  }

  // ─────────────────────────────────
  //  날씨 시스템
  // ─────────────────────────────────
  updateWeather(delta) {
    this.weatherTimer += delta
    if (this.weatherTimer >= this.weatherInterval) {
      this.weatherTimer = 0
      this.weatherInterval = Phaser.Math.Between(60000, 90000)
      const types = ['clear', 'clear', 'rain', 'fog', 'storm']
      this.changeWeather(types[Phaser.Math.Between(0, types.length - 1)])
    }

    // 폭풍 번개 효과
    if (this.weather === 'storm') {
      this.thunderTimer = (this.thunderTimer || 0) + delta
      if (this.thunderTimer > 5000) {
        this.thunderTimer = 0
        // 랜덤 적 피격
        const enemies = this.enemies.getChildren().filter(e => e.active)
        if (enemies.length > 0) {
          const target = enemies[Phaser.Math.Between(0, enemies.length - 1)]
          const flash = this.add.rectangle(target.x, target.y, 8, 200, 0xffffff, 0.9).setDepth(30)
          this.tweens.add({ targets: flash, alpha: 0, duration: 200, onComplete: () => flash.destroy() })
          this.damageEnemy(target, 80 * this.playerStats.damage)
        }
      }
    }
  }

  changeWeather(type) {
    if (this.weather === type) return
    this.weather = type
    const configs = {
      clear: { color: 0x000000, alpha: 0,    speedMod: 1.0, enemyMod: 1.0 },
      rain:  { color: 0x0033aa, alpha: 0.12, speedMod: 0.9, enemyMod: 1.0 },
      fog:   { color: 0x888888, alpha: 0.22, speedMod: 1.0, enemyMod: 0.85 },
      storm: { color: 0x111133, alpha: 0.35, speedMod: 0.85, enemyMod: 1.2 },
    }
    const cfg = configs[type]
    this.tweens.add({ targets: this.weatherOverlay, alpha: cfg.alpha, duration: 2000 })
    this.weatherOverlay.setFillStyle(cfg.color)
    this.weatherSpeedMod = cfg.speedMod
    this.weatherEnemyMod = cfg.enemyMod

    const labels   = { clear: '☀️ 맑음', rain: '🌧️ 비', fog: '🌫️ 안개', storm: '⛈️ 폭풍!' }
    const effects  = {
      clear: '',
      rain:  '이동속도 -10%',
      fog:   '적 이동속도 -15%',
      storm: '이동속도 -15%  적 +20%  번개 공격',
    }
    this.weatherText.setText(labels[type])
    this.weatherEffectText?.setText(effects[type])

    // 날씨 변경 화면 알림
    const W = this.scale.width
    const s = W / 960
    if (type !== 'clear') {
      const wtxt = this.add.text(W / 2, this.scale.height / 2, labels[type], {
        fontSize: `${28 * s}px`, color: '#aaddff', fontStyle: 'bold',
        stroke: '#000000', strokeThickness: 4
      }).setOrigin(0.5).setScrollFactor(0).setDepth(200)
      this.tweens.add({ targets: wtxt, alpha: 0, y: wtxt.y - 50, duration: 2000, delay: 400, onComplete: () => wtxt.destroy() })
    }

    // 시각 파티클 시작
    this.startWeatherParticles(type)
  }

  devChangeChar(id) {
    const charDef = CHARACTERS.find(c => c.id === id)
    if (!charDef) return

    // 스탯 리셋 후 카드 → 캐릭터 순 재적용
    this.playerStats.maxHp  = 250
    this.playerStats.speed  = 200
    this.playerStats.damage = 1.0
    if (Store.ownsCard('speed_up')) this.playerStats.speed = Math.min(380, Math.round(this.playerStats.speed * 1.2))
    if (Store.ownsCard('hp_boost')) this.playerStats.maxHp += 50

    const st = charDef.stats
    if (st.maxHpBonus) this.playerStats.maxHp = Math.max(50, this.playerStats.maxHp + st.maxHpBonus)
    if (st.damageMult) this.playerStats.damage *= st.damageMult
    if (st.speedMult)  this.playerStats.speed  = Math.min(380, Math.round(this.playerStats.speed * st.speedMult))
    if (st.startWeapon && this.weapons[st.startWeapon] !== undefined)
      this.weapons[st.startWeapon].level = Math.max(1, this.weapons[st.startWeapon].level)

    this.playerStats.hp = Math.min(this.playerStats.hp, this.playerStats.maxHp)
    this.charId = id

    // 캐릭터 전용 스킨 적용 (해당 캐릭터의 장착 스킨)
    const devSkinId = Store.getEquippedSkin(id)
    const devSkinTex = SKINS.find(s => s.id === devSkinId)?.tex || charDef.skin || 'player'
    this.player.setTexture(devSkinTex)

    // 화면 알림
    const W = this.scale.width
    const s = W / 960
    const ntxt = this.add.text(W / 2, this.scale.height * 0.38,
      `${charDef.emoji} ${charDef.name} 적용됨`, {
        fontSize: `${22 * s}px`, color: '#ffcc00', fontStyle: 'bold',
        stroke: '#000000', strokeThickness: 3
      }).setOrigin(0.5).setScrollFactor(0).setDepth(200)
    this.tweens.add({ targets: ntxt, alpha: 0, y: ntxt.y - 40, duration: 1800, delay: 300, onComplete: () => ntxt.destroy() })
  }

  devChangeSkin(texKey) {
    this.player.setTexture(texKey)
  }

  startWeatherParticles(type) {
    // 기존 파티클 정리
    if (this.weatherParticleTimer) {
      this.weatherParticleTimer.destroy()
      this.weatherParticleTimer = null
    }
    const W = this.scale.width
    const H = this.scale.height

    if (type === 'rain') {
      this.weatherParticleTimer = this.time.addEvent({
        delay: 55, loop: true,
        callback: () => {
          if (this.paused || this.isGameOver) return
          const x = Phaser.Math.Between(-10, W + 10)
          const drop = this.add.rectangle(x, -6, 1.5, 11, 0x5599cc, 0.55)
            .setScrollFactor(0).setDepth(91)
          this.tweens.add({
            targets: drop, x: x + 32, y: H + 12,
            duration: Phaser.Math.Between(500, 750),
            onComplete: () => drop.destroy()
          })
        }
      })
    } else if (type === 'storm') {
      this.weatherParticleTimer = this.time.addEvent({
        delay: 32, loop: true,
        callback: () => {
          if (this.paused || this.isGameOver) return
          const x = Phaser.Math.Between(-10, W + 10)
          const drop = this.add.rectangle(x, -6, 2, 13, 0x6677bb, 0.65)
            .setScrollFactor(0).setDepth(91)
          this.tweens.add({
            targets: drop, x: x + 40, y: H + 12,
            duration: Phaser.Math.Between(350, 550),
            onComplete: () => drop.destroy()
          })
        }
      })
    } else if (type === 'fog') {
      this.weatherParticleTimer = this.time.addEvent({
        delay: 700, loop: true,
        callback: () => {
          if (this.paused || this.isGameOver) return
          const x = Phaser.Math.Between(-80, W)
          const y = Phaser.Math.Between(H * 0.25, H * 0.85)
          const wisp = this.add.ellipse(x, y, Phaser.Math.Between(90, 160), Phaser.Math.Between(20, 40), 0xaabbcc, 0.1)
            .setScrollFactor(0).setDepth(91)
          this.tweens.add({
            targets: wisp, x: x + Phaser.Math.Between(60, 130),
            alpha: 0, duration: Phaser.Math.Between(3500, 5000),
            onComplete: () => wisp.destroy()
          })
        }
      })
    } else if (type === 'clear') {
      // 햇살 빛줄기 효과
      this.weatherParticleTimer = this.time.addEvent({
        delay: 1800, loop: true,
        callback: () => {
          if (this.paused || this.isGameOver) return
          const x = Phaser.Math.Between(W * 0.1, W * 0.9)
          const ray = this.add.rectangle(x, 0, Phaser.Math.Between(2, 5), H * 0.45, 0xffee88, 0.07)
            .setScrollFactor(0).setDepth(91).setOrigin(0.5, 0)
          this.tweens.add({
            targets: ray, alpha: 0, scaleX: 4,
            duration: 2200, ease: 'Quad.Out',
            onComplete: () => ray.destroy()
          })
        }
      })
    }
  }

  // ─────────────────────────────────
  //  트럭 + 이세계
  // ─────────────────────────────────
  updateTruck(delta) {
    if (this.truckActive) return
    this.truckTimer += delta
    if (this.truckTimer >= this.truckInterval && this.gameTimer > 30000) {
      this.truckTimer = 0
      this.truckInterval = Phaser.Math.Between(90000, 140000)
      this.spawnTruck()
    }
  }

  spawnTruck() {
    const W = this.scale.width
    const s = W / 960
    // 경고 텍스트
    const warn = this.add.text(W / 2, this.scale.height * 0.4, '⚠️  트럭 접근!!  ⚠️', {
      fontSize: `${26 * s}px`, color: '#ff4400', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200)
    this.tweens.add({ targets: warn, alpha: 0, duration: 2500, delay: 1000, onComplete: () => warn.destroy() })

    // 트럭 스폰 (카메라 왼쪽 → 오른쪽)
    this.time.delayedCall(1800, () => {
      if (this.isGameOver) return
      this.truckActive = true
      const cam = this.cameras.main
      const ty  = this.player.y + Phaser.Math.Between(-60, 60)
      const truck = this.physics.add.sprite(
        this.player.x - cam.width / 2 - 100, ty, 'truck'
      )
      truck.setDepth(12).setVelocityX(1200).body.setAllowGravity(false)
      this.trucks.add(truck)

      // 화면 밖 나가면 제거
      this.time.addEvent({
        delay: 100, repeat: 60, callbackScope: this,
        callback: () => {
          if (!truck.active) return
          if (truck.x > this.player.x + cam.width / 2 + 200) {
            truck.destroy()
            this.truckActive = false
          }
        }
      })
    })
  }

  truckHitsPlayer(truck, player) {
    if (!truck.active) return
    truck.destroy()
    this.truckActive = false

    if (this.isekaiMode || this.isekaiActivating) return  // 이미 이세계거나 진행중이면 스킵
    this.isekaiActivating = true

    // 충격
    this.cameras.main.shake(500, 0.018)
    const W = this.scale.width
    const flash = this.add.rectangle(W / 2, this.scale.height / 2, W, this.scale.height, 0xffffff, 0.85).setScrollFactor(0).setDepth(300)
    this.tweens.add({ targets: flash, alpha: 0, duration: 400, onComplete: () => flash.destroy() })

    this.time.delayedCall(400, () => {
      this.isekaiActivating = false
      if (!this.isGameOver) this.activateIsekai()
    })
  }

  activateIsekai() {
    this.isekaiMode = true

    // 플레이어 버프
    this.playerStats.damage *= 1.5
    this.playerStats.hp = Math.min(this.playerStats.maxHp, this.playerStats.hp + 100)

    // 시각 변환
    this.bgTile.setTint(0x330055)
    this.player.setTint(0xcc88ff)
    this.weatherOverlay.setFillStyle(0x220033).setAlpha(0.18)

    // 이세계 배지
    this.isekaiLabel.setText('🌀 이세계 전생!')

    // 선언 텍스트
    const W = this.scale.width
    const s = W / 960
    const txt = this.add.text(W / 2, this.scale.height / 2, '🌀  이세계로 전생!!  🌀\n데미지 +50%  HP +100', {
      fontSize: `${24 * s}px`, color: '#cc88ff', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 5, align: 'center'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200)
    this.tweens.add({ targets: txt, y: txt.y - 60, alpha: 0, duration: 3000, delay: 800, onComplete: () => txt.destroy() })

    // 적들 보라색으로 변환
    this.enemies.getChildren().forEach(e => { if (e.active) e.setTint(0xaa00ff) })
  }

  // ─────────────────────────────────
  //  보스 시스템
  // ─────────────────────────────────
  checkBossSpawn() {
    if (this.bossAlive || !this.spawnTimer) return
    const minute = Math.floor(this.gameTimer / 60000) + this.devWaveBonus
    const bossMinute = Math.floor(minute / 2) * 2  // 0, 2, 4, 6, 8분
    if (bossMinute > 0 && bossMinute > this.lastBossMinute) {
      this.lastBossMinute = bossMinute
      this.spawnBoss(minute)
    }
  }

  spawnBoss(minute) {
    const cam    = this.cameras.main
    const side   = Phaser.Math.Between(0, 3)
    const hw = cam.width / 2, hh = cam.height / 2
    let x, y
    switch (side) {
      case 0: x = this.player.x + Phaser.Math.Between(-hw, hw); y = this.player.y - hh - 80; break
      case 1: x = this.player.x + hw + 80; y = this.player.y + Phaser.Math.Between(-hh, hh); break
      case 2: x = this.player.x + Phaser.Math.Between(-hw, hw); y = this.player.y + hh + 80; break
      default: x = this.player.x - hw - 80; y = this.player.y + Phaser.Math.Between(-hh, hh); break
    }
    x = Phaser.Math.Clamp(x, 50, WORLD - 50)
    y = Phaser.Math.Clamp(y, 50, WORLD - 50)

    const boss = this.physics.add.sprite(x, y, 'enemy_boss')
    boss.setDepth(8).setScale(1.4)
    boss.hp     = 1500 + minute * 400
    boss.maxHp  = boss.hp
    boss.speed  = 50 + minute * 3
    boss.damage = 20 + minute * 3
    boss.xpValue = 50 + minute * 10
    boss.isBoss  = true
    boss.lastHit = 0
    this.enemies.add(boss)
    this.bossAlive = true
    this.activeBoss = boss

    // 보스 HP 바 표시
    this.bossHpBg.setVisible(true)
    this.bossHpFill.setVisible(true)
    this.bossHpLabel.setVisible(true)

    // 등장 경고
    const W = this.scale.width
    const s = W / 960
    const txt = this.add.text(W / 2, this.scale.height * 0.4, '👑  BOSS 등장!', {
      fontSize: `${28 * s}px`, color: '#ff2200', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 5
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200)
    this.tweens.add({ targets: txt, alpha: 0, y: txt.y - 40, duration: 2500, delay: 600, onComplete: () => txt.destroy() })
    this.cameras.main.shake(400, 0.01)
  }

  // ─────────────────────────────────
  //  무기 진화 조건 확인 (LevelUpScene의 buildOptions에서 직접 체크)
  // ─────────────────────────────────

  showWeatherPopup() {
    if (this.weatherPopupOpen) return
    this.weatherPopupOpen = true
    this.paused = true
    this.physics.pause()

    const W = this.scale.width
    const H = this.scale.height
    const s = W / 960
    const allObjs = []

    const mk = (obj) => { allObjs.push(obj); return obj }

    const overlay = mk(this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.6).setScrollFactor(0).setDepth(300).setInteractive())
    const panel   = mk(this.add.rectangle(W / 2, H / 2, 480 * s, 310 * s, 0x08081a).setScrollFactor(0).setDepth(301))
    panel.setStrokeStyle(2 * s, 0x3366aa)

    mk(this.add.text(W / 2, H / 2 - 130 * s, '🌤  날씨 시스템', {
      fontSize: `${18 * s}px`, color: '#88ddff', fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302))

    const weathers = [
      { emoji: '☀️', name: '맑음',  key: 'clear', effect: '효과 없음',                              color: '#ffee88' },
      { emoji: '🌧️', name: '비',    key: 'rain',  effect: '플레이어 이동속도 -10%',                 color: '#88aaff' },
      { emoji: '🌫️', name: '안개',  key: 'fog',   effect: '적 이동속도 -15% (적이 느려짐)',          color: '#aabbcc' },
      { emoji: '⛈️', name: '폭풍',  key: 'storm', effect: '플레이어 -15% / 적 +20% / 번개 자동공격', color: '#cc88ff' },
    ]

    const rowH = 48 * s
    const startY = H / 2 - 70 * s
    weathers.forEach((w, i) => {
      const y = startY + i * rowH
      if (this.weather === w.key) {
        mk(this.add.rectangle(W / 2, y, 450 * s, 38 * s, 0x112233).setScrollFactor(0).setDepth(301))
      }
      mk(this.add.text(W / 2 - 210 * s, y, `${w.emoji}  ${w.name}`, {
        fontSize: `${13 * s}px`, color: w.color, fontStyle: 'bold'
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(302))
      mk(this.add.text(W / 2 - 100 * s, y, w.effect, {
        fontSize: `${11 * s}px`, color: '#aaaaaa'
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(302))
      if (this.weather === w.key) {
        mk(this.add.text(W / 2 + 210 * s, y, '◀ 현재', {
          fontSize: `${11 * s}px`, color: '#ffff00'
        }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(302))
      }
    })

    mk(this.add.text(W / 2, H / 2 + 130 * s, '클릭하여 닫기', {
      fontSize: `${13 * s}px`, color: '#555555'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302))

    const close = () => {
      allObjs.forEach(o => o.destroy())
      this.weatherPopupOpen = false
      this.paused = false
      this.physics.resume()
    }
    overlay.on('pointerdown', close)
    panel.setInteractive()
    panel.on('pointerdown', close)
  }

  showEvolutionAnnounce(msg) {
    const W = this.scale.width
    const s = W / 960
    const txt = this.add.text(W / 2, this.scale.height / 2, `✨ ${msg} ✨`, {
      fontSize: `${26 * s}px`, color: '#ffff00', fontStyle: 'bold',
      stroke: '#ff8800', strokeThickness: 5
    }).setOrigin(0.5).setScrollFactor(0).setDepth(250)
    this.tweens.add({ targets: txt, scaleX: 1.3, scaleY: 1.3, yoyo: true, duration: 300, repeat: 1 })
    this.tweens.add({ targets: txt, alpha: 0, y: txt.y - 60, duration: 2500, delay: 800, onComplete: () => txt.destroy() })
    this.cameras.main.shake(300, 0.015)
  }

  fireLightningStorm() {
    let hit = false
    // 각 구름에서 가장 가까운 적에게 번개 발사
    this.cloudSprites.forEach(cloud => {
      const target = this.getNearestEnemyTo(cloud.x, cloud.y, 360)
      if (!target) return
      hit = true
      // 구름 번쩍 효과
      this.tweens.add({ targets: cloud, scaleX: 1.35, scaleY: 1.35, duration: 55, yoyo: true })
      this.drawLightning(cloud.x, cloud.y + 12, target.x, target.y)
      this.damageEnemy(target, 34 * this.playerStats.damage)
    })

    // 구름 없거나 범위 내 적 없으면 4방향 볼트 폴백
    if (!hit) {
      for (let i = 0; i < 4; i++) {
        const angle = (Math.PI * 2 * i / 4)
        const b = this.projectiles.create(this.player.x, this.player.y, 'bolt')
        b.setDepth(8).setRotation(angle).setTint(0x8888ff)
        b.damage = 28 * this.playerStats.damage
        b.setVelocity(Math.cos(angle) * 620, Math.sin(angle) * 620)
        this.time.delayedCall(900, () => { if (b?.active) b.destroy() })
      }
    }
    this.sfx.shoot()
  }

  drawLightning(x1, y1, x2, y2) {
    const g = this.add.graphics().setDepth(25)
    const steps = 7
    // 꼬불꼬불 경유점 생성
    const pts = [[x1, y1]]
    for (let i = 1; i < steps; i++) {
      const t = i / steps
      const jitter = (1 - Math.abs(t - 0.5) * 2) * 36
      pts.push([
        x1 + (x2 - x1) * t + (Math.random() - 0.5) * jitter,
        y1 + (y2 - y1) * t + (Math.random() - 0.5) * jitter * 0.4
      ])
    }
    pts.push([x2, y2])

    // 외곽 글로우
    g.lineStyle(5, 0x2255cc, 0.4)
    g.beginPath(); g.moveTo(pts[0][0], pts[0][1])
    pts.slice(1).forEach(p => g.lineTo(p[0], p[1])); g.strokePath()

    // 메인 번개
    g.lineStyle(2.5, 0x88ccff, 1)
    g.beginPath(); g.moveTo(pts[0][0], pts[0][1])
    pts.slice(1).forEach(p => g.lineTo(p[0], p[1])); g.strokePath()

    // 흰 코어
    g.lineStyle(1, 0xffffff, 0.9)
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.strokePath()

    // 착탄 플래시
    const flash = this.add.circle(x2, y2, 18, 0xffffff, 0.85).setDepth(26)
    const ring  = this.add.circle(x2, y2, 8, 0x88ccff, 0.6).setDepth(26)
    this.tweens.add({ targets: g, alpha: 0, duration: 200, onComplete: () => g.destroy() })
    this.tweens.add({ targets: flash, scaleX: 2.5, scaleY: 2.5, alpha: 0, duration: 220, onComplete: () => flash.destroy() })
    this.tweens.add({ targets: ring, scaleX: 3, scaleY: 3, alpha: 0, duration: 300, onComplete: () => ring.destroy() })
  }

  getNearestEnemyTo(x, y, range = Infinity) {
    let nearest = null, minDist = range
    this.enemies.getChildren().forEach(e => {
      if (!e.active) return
      const d = Phaser.Math.Distance.Between(x, y, e.x, e.y)
      if (d < minDist) { minDist = d; nearest = e }
    })
    return nearest
  }

  firePlasmaCannon() {
    // 현재 orb 위치들에서 미사일 발사
    this.orbSprites.forEach(orb => {
      if (!orb.active) return
      const angle = Phaser.Math.Angle.Between(orb.x, orb.y, this.player.x + Math.random() * 200 - 100, this.player.y + Math.random() * 200 - 100)
      const m = this.missiles.create(orb.x, orb.y, 'plasma_bolt')
      m.setDepth(8).setRotation(angle)
      m.damage = 35 * this.playerStats.damage
      m.currentAngle = angle
      m.mspeed = 300
      m.setVelocity(Math.cos(angle) * 300, Math.sin(angle) * 300)
      this.time.delayedCall(2000, () => { if (m?.active) m.destroy() })
    })
    this.sfx.shoot()
  }

  // ─────────────────────────────────
  //  이동
  // ─────────────────────────────────
  movePlayer() {
    const speed = this.playerStats.speed * this.weatherSpeedMod
    let vx = 0, vy = 0

    const ptr = this.input.activePointer
    if (ptr.isDown) {
      const cx = this.cameras.main.width / 2, cy = this.cameras.main.height / 2
      const dx = ptr.x - cx, dy = ptr.y - cy
      const len = Math.sqrt(dx * dx + dy * dy)
      if (len > 20) { vx = (dx / len) * speed; vy = (dy / len) * speed }
    } else {
      if (this.cursors.left.isDown  || this.wasd.left.isDown)  vx = -speed
      else if (this.cursors.right.isDown || this.wasd.right.isDown) vx = speed
      if (this.cursors.up.isDown    || this.wasd.up.isDown)    vy = -speed
      else if (this.cursors.down.isDown  || this.wasd.down.isDown)  vy = speed
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
    // 볼트 (진화시 번개폭풍)
    if (this.weapons.bolt.level > 0) {
      this.knifeTimer += delta
      const rate = this.evolved.thunder_storm
        ? Math.max(180, 700 - (this.weapons.bolt.level - 1) * 100)
        : Math.max(220, 1000 - (this.weapons.bolt.level - 1) * 150)
      if (this.knifeTimer >= rate) {
        this.knifeTimer = 0
        this.evolved.thunder_storm ? this.fireLightningStorm() : this.fireBolt()
      }

      // 번개폭풍 진화시 구름 생성 & 궤도 업데이트
      if (this.evolved.thunder_storm) {
        this.cloudAngle += 0.009
        const cloudCount = 3
        while (this.cloudSprites.length < cloudCount) {
          const c = this.add.sprite(0, 0, 'cloud_storm').setDepth(11).setAlpha(0.88)
          this.cloudSprites.push(c)
        }
        this.cloudSprites.forEach((cloud, i) => {
          const a = this.cloudAngle + (i / cloudCount) * Math.PI * 2
          cloud.x = this.player.x + Math.cos(a) * 140
          cloud.y = this.player.y + Math.sin(a) * 80 - 30  // 타원형, 약간 위
        })
      }
    }

    // 마법 구슬 (진화시 플라즈마포 추가 발사)
    if (this.weapons.orb.level > 0) {
      const orbCount = Math.min(this.weapons.orb.level, 5)
      const radius   = 80 + this.weapons.orb.level * 18
      this.orbAngle += 0.028 + this.weapons.orb.level * 0.006 + (this.evolved.plasma_cannon ? 0.01 : 0)

      while (this.orbSprites.length < orbCount) {
        const o = this.physics.add.sprite(0, 0, this.evolved.plasma_cannon ? 'plasma_orb' : 'orb')
        o.setDepth(9)
        o.hitCooldowns = new Map()
        this.orbSprites.push(o)
        this.orbGroup.add(o)
      }
      while (this.orbSprites.length > orbCount) {
        const o = this.orbSprites.pop(); this.orbGroup.remove(o, true, true)
      }
      this.orbSprites.forEach((orb, i) => {
        const angle = this.orbAngle + (i / orbCount) * Math.PI * 2
        orb.x = this.player.x + Math.cos(angle) * radius
        orb.y = this.player.y + Math.sin(angle) * radius
        if (orb.body) orb.body.reset(orb.x, orb.y)
      })

      // 플라즈마포 자동 발사
      if (this.evolved.plasma_cannon) {
        this.plasmaTimer = (this.plasmaTimer || 0) + delta
        if (this.plasmaTimer > 2000) { this.plasmaTimer = 0; this.firePlasmaCannon() }
      }
    }

    // 미사일
    if (this.weapons.missile.level > 0) {
      this.missileTimer += delta
      const rate = Math.max(2000, 3500 - (this.weapons.missile.level - 1) * 300)
      if (this.missileTimer >= rate) { this.missileTimer = 0; this.fireMissiles() }
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
        if (!m.lastSmokeX) { m.lastSmokeX = m.x; m.lastSmokeY = m.y }
        if (Phaser.Math.Distance.Between(m.lastSmokeX, m.lastSmokeY, m.x, m.y) > 18) {
          m.lastSmokeX = m.x; m.lastSmokeY = m.y
          const smoke = this.add.circle(m.x, m.y, 2 + Math.random() * 2, 0x888888, 0.35).setDepth(7)
          this.tweens.add({ targets: smoke, alpha: 0, scaleX: 2.5, scaleY: 2.5, duration: 380, onComplete: () => smoke.destroy() })
        }
      })
    }

    // 단검 (진화시 폭풍 블레이드: 8방향 광역)
    if (this.weapons.dagger.level > 0) {
      this.daggerTimer += delta
      const rate = this.evolved.storm_blade
        ? Math.max(80, 320 - (this.weapons.dagger.level - 1) * 40)
        : Math.max(120, 500 - (this.weapons.dagger.level - 1) * 70)
      if (this.daggerTimer >= rate) {
        this.daggerTimer = 0
        this.evolved.storm_blade ? this.fireStormBlade() : this.fireDagger()
      }
    }

    // 빙창 (진화시 더 빠른 발사 + 2배 탄수)
    if (this.weapons.ice_lance.level > 0) {
      this.iceLanceTimer += delta
      const rate = this.evolved.storm_blade
        ? Math.max(800, 2000 - (this.weapons.ice_lance.level - 1) * 200)
        : Math.max(1200, 3000 - (this.weapons.ice_lance.level - 1) * 300)
      if (this.iceLanceTimer >= rate) {
        this.iceLanceTimer = 0
        this.fireIceLance()
      }
    }

    // 마늘
    if (this.weapons.garlic.level > 0) {
      const radius = 90 + this.weapons.garlic.level * 28
      if (!this.garlicSprite || !this.garlicSprite.active) {
        this.garlicSprite = this.add.sprite(this.player.x, this.player.y, 'garlic').setDepth(5).setAlpha(0.5)
        if (this.evolved.thunder_storm) this.garlicSprite.setTint(0x8888ff)
      }
      this.garlicSprite.x = this.player.x; this.garlicSprite.y = this.player.y
      this.garlicSprite.setScale(radius / 72)
      this.garlicDmgTimer += delta
      if (this.garlicDmgTimer >= 500) {
        this.garlicDmgTimer = 0
        const dmg = (this.evolved.thunder_storm ? 14 : 8) * this.weapons.garlic.level * this.playerStats.damage
        this.enemies.getChildren().forEach(e => {
          if (!e.active) return
          if (Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y) <= radius)
            this.damageEnemy(e, dmg)
        })
      }
    }
  }

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

  fireMissiles() {
    const count = 4 + (this.weapons.missile.level - 1) * 3
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i / count) + (Math.random() - 0.5) * 0.7
      const spd   = 140 + Math.random() * 80
      const m = this.missiles.create(this.player.x, this.player.y, 'missile')
      m.setDepth(8).setRotation(angle)
      m.damage = 10 * this.weapons.missile.level * this.playerStats.damage
      m.currentAngle = angle; m.mspeed = spd
      m.setVelocity(Math.cos(angle) * spd, Math.sin(angle) * spd)
      this.time.delayedCall(3000, () => { if (m?.active) m.destroy() })
    }
    this.sfx.shoot()
  }

  fireDagger() {
    const nearest = this.getNearestEnemy()
    if (!nearest) return
    const count = 1 + Math.floor((this.weapons.dagger.level - 1) / 2)
    const base  = Phaser.Math.Angle.Between(this.player.x, this.player.y, nearest.x, nearest.y)
    for (let i = 0; i < count; i++) {
      const spread = count === 1 ? 0 : (i - (count - 1) / 2) * 0.28
      const angle  = base + spread
      const d = this.projectiles.create(this.player.x, this.player.y, 'dagger')
      d.setDepth(8).setRotation(angle).setTint(0xccddff)
      d.damage = 8 * this.weapons.dagger.level * this.playerStats.damage
      d.setVelocity(Math.cos(angle) * 680, Math.sin(angle) * 680)
      this.time.delayedCall(700, () => { if (d?.active) d.destroy() })
    }
    this.sfx.shoot()
  }

  fireStormBlade() {
    // 8방향 발사
    const dirs = this.evolved.storm_blade ? 8 : 4
    for (let i = 0; i < dirs; i++) {
      const angle = (Math.PI * 2 * i / dirs)
      const d = this.projectiles.create(this.player.x, this.player.y, 'dagger')
      d.setDepth(8).setRotation(angle).setTint(0xaaffcc)
      d.damage = 12 * this.weapons.dagger.level * this.playerStats.damage
      d.setVelocity(Math.cos(angle) * 580, Math.sin(angle) * 580)
      this.time.delayedCall(900, () => { if (d?.active) d.destroy() })
    }
    this.sfx.shoot()
  }

  fireIceLance() {
    const dirs = this.evolved.storm_blade ? 8 : 4
    for (let i = 0; i < dirs; i++) {
      const angle = (Math.PI * 2 * i / dirs)
      const il = this.iceLances.create(this.player.x, this.player.y, 'ice_lance')
      il.setDepth(8).setRotation(angle).setTint(0x88ddff)
      il.setScale(1 + this.weapons.ice_lance.level * 0.15)
      il.damage = 25 * this.weapons.ice_lance.level * this.playerStats.damage
      il.hitCooldowns = new Map()
      il.setVelocity(Math.cos(angle) * 300, Math.sin(angle) * 300)
      this.time.delayedCall(1800, () => { if (il?.active) il.destroy() })
    }
    this.sfx.shoot()
  }

  iceLanceHitEnemy(lance, enemy) {
    if (!lance.active || !enemy.active) return
    if (!lance.hitCooldowns) lance.hitCooldowns = new Map()
    const now = this.time.now
    if (now - (lance.hitCooldowns.get(enemy) || 0) < 500) return
    lance.hitCooldowns.set(enemy, now)
    this.damageEnemy(enemy, lance.damage || 25)
    // 빙결 시각 효과
    const frost = this.add.circle(enemy.x, enemy.y, 12, 0x88eeff, 0.4).setDepth(16)
    this.tweens.add({ targets: frost, scaleX: 2, scaleY: 2, alpha: 0, duration: 300, onComplete: () => frost.destroy() })
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
  //  젬 자석
  // ─────────────────────────────────
  updateGemMagnet() {
    const magnetLv = this.weapons.magnet.level
    const radius = MAGNET_RADIUS + magnetLv * 150
    const maxSpd = 400 + magnetLv * 120
    const px = this.player.x, py = this.player.y
    this.gems.getChildren().forEach(gem => {
      if (!gem.active) return
      const dist = Phaser.Math.Distance.Between(px, py, gem.x, gem.y)
      if (dist < radius) {
        const angle = Phaser.Math.Angle.Between(gem.x, gem.y, px, py)
        gem.body.setVelocity(Math.cos(angle) * Math.min(maxSpd, 180 + (radius - dist) * 2.5), Math.sin(angle) * Math.min(maxSpd, 180 + (radius - dist) * 2.5))
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
    const minute = Math.floor(this.gameTimer / 60000) + this.devWaveBonus
    const count  = 2 + minute * 2
    for (let i = 0; i < count; i++) this.spawnOneEnemy(minute)
  }

  spawnOneEnemy(minute) {
    const cam = this.cameras.main
    const margin = 70, side = Phaser.Math.Between(0, 3)
    const hw = cam.width / 2, hh = cam.height / 2
    let x, y
    switch (side) {
      case 0: x = this.player.x + Phaser.Math.Between(-hw, hw); y = this.player.y - hh - margin; break
      case 1: x = this.player.x + hw + margin; y = this.player.y + Phaser.Math.Between(-hh, hh); break
      case 2: x = this.player.x + Phaser.Math.Between(-hw, hw); y = this.player.y + hh + margin; break
      default: x = this.player.x - hw - margin; y = this.player.y + Phaser.Math.Between(-hh, hh); break
    }
    x = Phaser.Math.Clamp(x, 30, WORLD - 30)
    y = Phaser.Math.Clamp(y, 30, WORLD - 30)

    const r = Math.random()
    let type = 'normal'
    if (minute >= 1 && r < 0.25) type = 'fast'
    if (minute >= 2 && r < 0.08) type = 'tank'

    const texMap = { normal: 'enemy_normal', fast: 'enemy_fast', tank: 'enemy_tank' }
    const e = this.physics.add.sprite(x, y, texMap[type]).setDepth(7)
    const configs = {
      normal: { hp: 20 + minute * 12, spd: 55 + minute * 5,  dmg: 3 + minute,      xp: 2 },
      fast:   { hp: 12 + minute * 6,  spd: 110 + minute * 8, dmg: 2 + minute,      xp: 3 },
      tank:   { hp: 100 + minute * 45, spd: 35 + minute * 3, dmg: 8 + minute * 3,  xp: 10 }
    }
    const cfg = configs[type]
    e.hp = cfg.hp; e.maxHp = cfg.hp
    e.speed = cfg.spd * this.weatherEnemyMod
    e.damage = cfg.dmg; e.xpValue = cfg.xp; e.lastHit = 0
    if (this.isekaiMode) e.setTint(0xaa00ff)
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
    // 콤보 끊김
    this.combo = 0; this.comboDmgMult = 1.0; this.comboDecay = 0
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
    const dmg = (this.evolved.plasma_cannon ? 35 : 18) * this.weapons.orb.level * this.playerStats.damage
    this.damageEnemy(enemy, dmg)
  }

  damageEnemy(enemy, damage) {
    if (!enemy?.active) return
    const finalDmg = damage * this.comboDmgMult
    enemy.hp -= finalDmg
    this.tweens.add({ targets: enemy, alpha: 0.25, duration: 60, yoyo: true })
    this.sfx.hit()
    this.showDamageText(enemy.x, enemy.y, Math.round(finalDmg))
    if (enemy.hp <= 0) this.killEnemy(enemy)
  }

  showDamageText(x, y, value) {
    const color = this.comboDmgMult > 1 ? '#ff8800' : '#ffee00'
    const txt = this.add.text(x, y - 10, `-${value}`, {
      fontSize: '13px', color, fontStyle: 'bold', stroke: '#000000', strokeThickness: 2
    }).setDepth(20)
    this.tweens.add({ targets: txt, y: y - 45, alpha: 0, duration: 700, onComplete: () => txt.destroy() })
  }

  killEnemy(enemy) {
    const gem = this.physics.add.sprite(enemy.x, enemy.y, 'gem').setDepth(6)
    gem.xpValue = enemy.xpValue || 2
    gem.body.setVelocity(0, 0)
    this.gems.add(gem)

    // 보스 처치 특별 처리
    if (enemy.isBoss) {
      this.bossAlive = false
      this.activeBoss = null
      this.bossHpBg.setVisible(false)
      this.bossHpFill.setVisible(false)
      this.bossHpLabel.setVisible(false)
      Store.addCoins(50)
      this.coinText?.setText(`🪙 ${Store.getCoins()}`)
      const W = this.scale.width
      const s = W / 960
      const txt = this.add.text(W / 2, this.scale.height * 0.4, '👑  BOSS 처치!\n+50🪙', {
        fontSize: `${22 * s}px`, color: '#ffff00', fontStyle: 'bold',
        stroke: '#000000', strokeThickness: 4, align: 'center'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(200)
      this.tweens.add({ targets: txt, alpha: 0, y: txt.y - 40, duration: 2500, delay: 800, onComplete: () => txt.destroy() })
    }

    // 코인 드롭
    const coinDrop = enemy.xpValue >= 10 ? 8 : enemy.xpValue >= 3 ? 3 : 1
    if (Math.random() < 0.4) {
      Store.addCoins(coinDrop)
      this.coinText?.setText(`🪙 ${Store.getCoins()}`)
      const ct = this.add.text(enemy.x, enemy.y - 18, `+${coinDrop}🪙`, {
        fontSize: '11px', color: '#ffd700', stroke: '#000000', strokeThickness: 2
      }).setDepth(21)
      this.tweens.add({ targets: ct, y: enemy.y - 50, alpha: 0, duration: 700, onComplete: () => ct.destroy() })
    }

    this.addCombo()
    this.killCount++
    this.sfx.kill()
    enemy.destroy()
  }

  openInGameShop() {
    if (this.isGameOver || this.scene.isActive('InGameShop') || this.scene.isActive('LevelUp')) return
    this.paused = true
    this.physics.pause()
    this.scene.launch('InGameShop', { gameScene: this })
  }

  openGuide() {
    this.scene.stop('InGameShop')
    this.paused = true
    this.physics.pause()
    this.scene.launch('Guide', { gameScene: this, fromShop: true })
  }

  collectGem(player, gem) {
    if (!gem.active) return
    const xpVal = gem.xpValue || 2
    const txt = this.add.text(gem.x, gem.y, `+${xpVal} XP`, {
      fontSize: '12px', color: '#00ffaa', stroke: '#004422', strokeThickness: 2
    }).setDepth(20)
    this.tweens.add({ targets: txt, y: gem.y - 35, alpha: 0, duration: 600, onComplete: () => txt.destroy() })
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
    this.levelUpFlash.setText('⬆ LEVEL UP! Lv.' + this.playerStats.level)
    this.levelUpFlash.setAlpha(1)
    this.tweens.add({ targets: this.levelUpFlash, alpha: 0, duration: 1200, delay: 400 })
    this.sfx.levelUp()
    // 성직자: 레벨업시 HP 회복
    if (this.charId === 'priest') {
      this.playerStats.hp = Math.min(this.playerStats.maxHp, this.playerStats.hp + 20)
    }
    this.paused = true
    this.physics.pause()
    this.scene.launch('LevelUp', { gameScene: this })
  }

  onWeaponChosen(key) {
    if (key === 'hp') {
      this.playerStats.hp = Math.min(this.playerStats.maxHp, this.playerStats.hp + 40)
    } else if (key === 'ev_thunder_storm') {
      this.evolved.thunder_storm = true
      this.showEvolutionAnnounce('⛈️ 번개 폭풍 진화!')
    } else if (key === 'ev_plasma_cannon') {
      this.evolved.plasma_cannon = true
      this.showEvolutionAnnounce('🌀 플라즈마 포 진화!')
    } else if (key === 'ev_storm_blade') {
      this.evolved.storm_blade = true
      this.showEvolutionAnnounce('🌪️ 폭풍 블레이드 진화!')
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

    const hpRatio = Math.max(0, s.hp / s.maxHp)
    this.hpBarFill.setSize(this.hpBarWidth * hpRatio, this.hpBarFill.height)
    this.hpLabel.setText(`HP ${s.hp} / ${s.maxHp}`)
    this.hpBarFill.setFillStyle(hpRatio > 0.5 ? 0xff3333 : hpRatio > 0.25 ? 0xff8800 : 0xff0000)

    const xpRatio = s.xp / s.xpToNext
    this.xpBarFill.setSize(this.xpBarWidth * xpRatio, this.xpBarFill.height)
    this.xpLabel.setText(`XP ${s.xp} / ${s.xpToNext}`)
    this.levelBadge.setText('Lv. ' + s.level)

    const sec = Math.floor(this.gameTimer / 1000)
    this.timerText.setText(`${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`)

    this.killText.setText(`💀 ${this.killCount}`)
    this.coinText.setText(`🪙 ${Store.getCoins()}`)

    // 보스 HP 바
    if (this.bossAlive && this.activeBoss?.active) {
      const ratio = Math.max(0, this.activeBoss.hp / this.activeBoss.maxHp)
      this.bossHpFill.setSize(this.bossBarWidth * ratio, this.bossHpFill.height)
      this.bossHpFill.setFillStyle(ratio > 0.5 ? 0xff2200 : ratio > 0.25 ? 0xff8800 : 0xff0000)
    }

    // 무기 슬롯
    const wSlot = []
    if (this.evolved.thunder_storm) wSlot.push('⛈️ 번개폭풍')
    else if (this.weapons.bolt.level > 0) wSlot.push(`🗡 볼트 Lv${this.weapons.bolt.level}`)
    if (this.evolved.plasma_cannon) wSlot.push('🌀 플라즈마포')
    else if (this.weapons.orb.level > 0) wSlot.push(`🔮 구슬 Lv${this.weapons.orb.level}`)
    if (this.weapons.garlic.level    > 0) wSlot.push(`🧄 마늘 Lv${this.weapons.garlic.level}`)
    if (this.weapons.missile.level   > 0) wSlot.push(`🚀 미사일 Lv${this.weapons.missile.level}`)
    if (this.weapons.magnet.level    > 0) wSlot.push(`🧲 자석 Lv${this.weapons.magnet.level}`)
    if (this.evolved.storm_blade) wSlot.push('🌪️ 폭풍블레이드')
    else {
      if (this.weapons.dagger.level    > 0) wSlot.push(`🗡️ 단검 Lv${this.weapons.dagger.level}`)
      if (this.weapons.ice_lance.level > 0) wSlot.push(`🧊 빙창 Lv${this.weapons.ice_lance.level}`)
    }
    this.weaponSlotText.setText(wSlot.join('   '))
  }

  // ─────────────────────────────────
  //  웨이브 / 승리
  // ─────────────────────────────────
  checkWave() {
    if (!this.spawnTimer) return
    const minute = Math.floor(this.gameTimer / 60000) + this.devWaveBonus
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
    this.cloudSprites.forEach(c => c?.destroy())
    this.cloudSprites = []
    if (this.weatherParticleTimer) { this.weatherParticleTimer.destroy(); this.weatherParticleTimer = null }
    const sec = Math.floor(this.gameTimer / 1000)
    const timeStr = `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`
    win ? this.sfx.victory() : this.sfx.gameOver()
    this.time.delayedCall(400, () => {
      this.scene.stop('LevelUp')
      this.scene.start('GameOver', { win, time: timeStr, kills: this.killCount, level: this.playerStats.level })
    })
  }
}
