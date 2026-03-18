import Phaser from 'phaser'

const WEAPON_INFO = {
  bolt:    { name: '마법 볼트',       emoji: '⚡', desc: '가장 가까운 적에게\n자동 투사체 발사',   color: 0xffff00 },
  orb:     { name: '마법 구슬',       emoji: '🔮', desc: '플레이어 주위를\n회전하며 충돌 타격',   color: 0xaa44ff },
  garlic:  { name: '마늘 오라',       emoji: '🧄', desc: '주변 범위에\n지속 데미지 필드',         color: 0x88ff44 },
  missile: { name: '마크로스 미사일', emoji: '🚀', desc: '전방향 난수 발사 후\n적에게 자동 유도', color: 0xff6600 },
  hp:      { name: '체력 회복',       emoji: '❤️', desc: 'HP 40 즉시 회복',                       color: 0xff4444 }
}

export default class LevelUpScene extends Phaser.Scene {
  constructor() {
    super('LevelUp')
  }

  init(data) {
    this.gameScene = data.gameScene
    this.weapons   = data.weapons
  }

  create() {
    const W = this.scale.width
    const H = this.scale.height

    // 반투명 오버레이
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.75)

    // 제목
    this.add.text(W / 2, H * 0.12, '⬆  LEVEL UP!', {
      fontSize: '44px', color: '#ffff00', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 5
    }).setOrigin(0.5)

    this.add.text(W / 2, H * 0.22, '업그레이드를 선택하세요', {
      fontSize: '18px', color: '#cccccc'
    }).setOrigin(0.5)

    // 현재 레벨 표시
    this.add.text(W / 2, H * 0.29, `현재 레벨: ${this.gameScene.playerStats.level}`, {
      fontSize: '15px', color: '#aaaaaa'
    }).setOrigin(0.5)

    const options = this.buildOptions()
    this.optionKeys = options

    const s     = W / 960
    const cardW = 220 * s
    const gap   = 30 * s
    const total = options.length * cardW + (options.length - 1) * gap
    const startX = (W - total) / 2 + cardW / 2

    options.forEach((key, i) => {
      this.createCard(startX + i * (cardW + gap), H * 0.56, key, i, s)
    })

    // 키보드 단축키 1/2/3
    const numKeys = [
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE)
    ]
    numKeys.forEach((k, i) => {
      k.once('down', () => { if (this.optionKeys[i]) this.choose(this.optionKeys[i]) })
    })
  }

  buildOptions() {
    const pool      = ['bolt', 'orb', 'garlic', 'missile', 'hp']
    const available = pool.filter(k => k === 'hp' || (this.weapons[k] && this.weapons[k].level < 5))
    Phaser.Utils.Array.Shuffle(available)
    return available.slice(0, 3)
  }

  createCard(x, y, key, index, s = 1) {
    const info  = WEAPON_INFO[key]
    const curLv = this.weapons[key]?.level ?? 0
    const cw = 220 * s, ch = 280 * s

    const bg = this.add.rectangle(x, y, cw, ch, 0x0e0e2e)
    bg.setStrokeStyle(2, info.color)
    bg.setInteractive({ useHandCursor: true })

    this.add.text(x, y - 100 * s, info.emoji, { fontSize: `${44 * s}px` }).setOrigin(0.5)

    this.add.text(x, y - 48 * s, info.name, {
      fontSize: `${19 * s}px`, color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5)

    if (key !== 'hp') {
      const lvColor = curLv === 0 ? '#88ff88' : '#aaaaff'
      this.add.text(x, y - 22 * s, curLv === 0 ? '신규 획득!' : `Lv ${curLv}  →  ${curLv + 1}`, {
        fontSize: `${13 * s}px`, color: lvColor
      }).setOrigin(0.5)
    }

    this.add.text(x, y + 22 * s, info.desc, {
      fontSize: `${13 * s}px`, color: '#dddddd',
      align: 'center', wordWrap: { width: 180 * s }
    }).setOrigin(0.5)

    this.add.text(x, y + 110 * s, `키 [${index + 1}]`, {
      fontSize: `${13 * s}px`, color: '#555555'
    }).setOrigin(0.5)

    bg.on('pointerover', () => {
      bg.setFillStyle(0x1e1e4e)
      this.tweens.add({ targets: bg, scaleX: 1.05, scaleY: 1.05, duration: 80 })
    })
    bg.on('pointerout', () => {
      bg.setFillStyle(0x0e0e2e)
      this.tweens.add({ targets: bg, scaleX: 1, scaleY: 1, duration: 80 })
    })
    bg.on('pointerdown', () => this.choose(key))
  }

  choose(key) {
    this.gameScene.onWeaponChosen(key)
    this.scene.stop()
  }
}
