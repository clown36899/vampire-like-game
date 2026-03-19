import Phaser from 'phaser'

const WEAPON_INFO = {
  bolt:    { name: '마법 볼트',       emoji: '⚡', desc: '가장 가까운 적에게\n자동 투사체 발사',   color: 0xffff00 },
  orb:     { name: '마법 구슬',       emoji: '🔮', desc: '플레이어 주위를\n회전하며 충돌 타격',   color: 0xaa44ff },
  garlic:  { name: '마늘 오라',       emoji: '🧄', desc: '주변 범위에\n지속 데미지 필드',         color: 0x88ff44 },
  missile: { name: '마크로스 미사일', emoji: '🚀', desc: '전방향 난수 발사 후\n적에게 자동 유도', color: 0xff6600 },
  magnet:    { name: '아이템 자석',   emoji: '🧲', desc: '젬 흡수 범위와\n속도가 크게 증가',          color: 0x00ccff },
  dagger:    { name: '단검',         emoji: '🗡️', desc: '빠른 연사로 가장 가까운\n적에게 단검 투척',   color: 0xccddff },
  ice_lance: { name: '빙창',         emoji: '🧊', desc: '4방향으로 관통하는\n얼음 창을 발사',          color: 0x44aaff },
  hp:        { name: '체력 회복',     emoji: '❤️', desc: 'HP 40 즉시 회복',                           color: 0xff4444 },

  // ── 진화 카드 ──
  ev_thunder_storm: {
    name: '번개폭풍 진화!', emoji: '⛈️',
    desc: '볼트 Lv5 + 마늘 Lv3\n구름에서 번개를 내리치는\n광역 폭풍 무기로 진화!',
    color: 0xffcc00, evolved: true
  },
  ev_plasma_cannon: {
    name: '플라즈마포 진화!', emoji: '🌀',
    desc: '구슬 Lv5 + 미사일 Lv3\n구슬 위치에서 플라즈마\n미사일을 자동 발사!',
    color: 0xff44ff, evolved: true
  },
  ev_storm_blade: {
    name: '폭풍 블레이드 진화!', emoji: '🌪️',
    desc: '단검 Lv5 + 빙창 Lv3\n8방향 고속 단검 + 빠른 빙창\n연사로 폭풍 같은 공격!',
    color: 0x88ffcc, evolved: true
  },
}

export default class LevelUpScene extends Phaser.Scene {
  constructor() {
    super('LevelUp')
  }

  init(data) {
    this.gameScene    = data.gameScene
    this.forceOptions = data.forceOptions || null
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
    // 외부에서 강제 지정된 옵션 (진화 전용 팝업)
    if (this.forceOptions) return this.forceOptions.slice(0, 3)

    const weapons = this.gameScene.weapons
    const evolved = this.gameScene.evolved

    // 진화 가능 조건 확인 → 진화 카드 우선 배치
    const evCards = []
    if (!evolved.thunder_storm && weapons.bolt?.level >= 5 && weapons.garlic?.level >= 3)
      evCards.push('ev_thunder_storm')
    if (!evolved.plasma_cannon && weapons.orb?.level >= 5 && weapons.missile?.level >= 3)
      evCards.push('ev_plasma_cannon')
    if (!evolved.storm_blade && weapons.dagger?.level >= 5 && weapons.ice_lance?.level >= 3)
      evCards.push('ev_storm_blade')

    const pool      = ['bolt', 'orb', 'garlic', 'missile', 'magnet', 'dagger', 'ice_lance', 'hp']
    const available = pool.filter(k => k === 'hp' || (weapons[k] && weapons[k].level < 5))
    Phaser.Utils.Array.Shuffle(available)

    return [...evCards, ...available].slice(0, 3)
  }

  createCard(x, y, key, index, s = 1) {
    const info    = WEAPON_INFO[key]
    const curLv   = this.gameScene.weapons[key]?.level ?? 0
    const isEvolved = !!info.evolved
    const cw = 220 * s, ch = 280 * s

    const bgColor = isEvolved ? 0x1a1200 : 0x0e0e2e
    const bg = this.add.rectangle(x, y, cw, ch, bgColor)
    bg.setStrokeStyle(isEvolved ? 3 * s : 2, info.color)
    bg.setInteractive({ useHandCursor: true })

    // 진화 카드 상단 빛나는 배지
    if (isEvolved) {
      const badge = this.add.text(x, y - 128 * s, '✨ EVOLUTION ✨', {
        fontSize: `${11 * s}px`, color: '#ffcc00', fontStyle: 'bold',
        backgroundColor: '#331100', padding: { x: 8 * s, y: 3 * s }
      }).setOrigin(0.5)
      this.tweens.add({ targets: badge, alpha: 0.3, duration: 500, yoyo: true, repeat: -1 })
    }

    this.add.text(x, y - 100 * s, info.emoji, { fontSize: `${44 * s}px` }).setOrigin(0.5)

    this.add.text(x, y - 48 * s, info.name, {
      fontSize: `${17 * s}px`, color: isEvolved ? '#ffcc00' : '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5)

    if (!isEvolved && key !== 'hp') {
      const lvColor = curLv === 0 ? '#88ff88' : '#aaaaff'
      this.add.text(x, y - 22 * s, curLv === 0 ? '신규 획득!' : `Lv ${curLv}  →  ${curLv + 1}`, {
        fontSize: `${13 * s}px`, color: lvColor
      }).setOrigin(0.5)
    }

    this.add.text(x, y + (isEvolved ? 10 : 22) * s, info.desc, {
      fontSize: `${12 * s}px`, color: isEvolved ? '#ffeeaa' : '#dddddd',
      align: 'center', wordWrap: { width: 180 * s }
    }).setOrigin(0.5)

    this.add.text(x, y + 110 * s, `키 [${index + 1}]`, {
      fontSize: `${13 * s}px`, color: '#555555'
    }).setOrigin(0.5)

    bg.on('pointerover', () => {
      bg.setFillStyle(isEvolved ? 0x2a2000 : 0x1e1e4e)
      this.tweens.add({ targets: bg, scaleX: 1.05, scaleY: 1.05, duration: 80 })
    })
    bg.on('pointerout', () => {
      bg.setFillStyle(bgColor)
      this.tweens.add({ targets: bg, scaleX: 1, scaleY: 1, duration: 80 })
    })
    bg.on('pointerdown', () => this.choose(key))
  }

  choose(key) {
    this.gameScene.onWeaponChosen(key)
    this.scene.stop()
  }
}
