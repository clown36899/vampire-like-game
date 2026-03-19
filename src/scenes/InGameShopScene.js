import Phaser from 'phaser'
import { Store, CHARACTERS, SKINS } from '../Store.js'

// 인게임 구매 가능 아이템
const SHOP_ITEMS = [
  { id: 'hp_potion',  name: 'HP 물약',    emoji: '🧪', desc: 'HP +80 즉시 회복',       price: 80,  color: 0xff4444, type: 'consumable' },
  { id: 'bolt',       name: '마법 볼트',   emoji: '⚡', desc: '볼트 구매 / 강화',       price: 150, color: 0xffff00, type: 'weapon' },
  { id: 'orb',        name: '마법 구슬',   emoji: '🔮', desc: '구슬 구매 / 강화',       price: 160, color: 0xaa44ff, type: 'weapon' },
  { id: 'garlic',     name: '마늘 오라',   emoji: '🧄', desc: '마늘 구매 / 강화',       price: 140, color: 0x88ff44, type: 'weapon' },
  { id: 'missile',    name: '미사일',      emoji: '🚀', desc: '미사일 구매 / 강화',     price: 200, color: 0xff6600, type: 'weapon' },
  { id: 'magnet',     name: '아이템 자석', emoji: '🧲', desc: '자석 구매 / 강화',          price: 120, color: 0x00ccff, type: 'weapon' },
  { id: 'dagger',     name: '단검',       emoji: '🗡️', desc: '단검 구매 / 강화',           price: 130, color: 0xccddff, type: 'weapon' },
  { id: 'ice_lance',  name: '빙창',       emoji: '🧊', desc: '빙창 구매 / 강화',           price: 150, color: 0x44aaff, type: 'weapon' },
  { id: 'max_hp_up',  name: 'HP 강화',    emoji: '💗', desc: '최대 HP +30 + 즉시 회복',    price: 200, color: 0xff88aa, type: 'consumable' },
  { id: 'speed_up',   name: '스피드 업',   emoji: '💨', desc: '이동속도 +15% (최대 380)',  price: 180, color: 0x00ffff, type: 'consumable' },
]

export default class InGameShopScene extends Phaser.Scene {
  constructor() { super('InGameShop') }

  init(data) {
    this.gameScene = data.gameScene
  }

  create() {
    const W = this.scale.width
    const H = this.scale.height
    const s = W / 960

    this.coins = Store.getCoins()

    // 반투명 오버레이
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.82)

    // 타이틀
    this.add.text(W / 2, 22 * s, '🛒  즉석 상점', {
      fontSize: `${26 * s}px`, color: '#ffff00', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4 * s
    }).setOrigin(0.5, 0)

    // 코인 표시
    this.coinText = this.add.text(W / 2, 54 * s, `🪙 ${this.coins}`, {
      fontSize: `${18 * s}px`, color: '#ffd700', fontStyle: 'bold'
    }).setOrigin(0.5, 0)

    this.add.text(W / 2, 76 * s, '[ B ] 또는 버튼으로 닫기', {
      fontSize: `${11 * s}px`, color: '#555555'
    }).setOrigin(0.5, 0)

    // 아이템 카드 영역
    this.itemContainer = this.add.container(0, 0)
    this.buildItems(s, W, H)

    // ── [DEV] 스킨 즉시 변경 버튼 (컨테이너로 동적 재빌드) ──
    this.add.text(W / 2, H - 126 * s, '[DEV] 스킨:', {
      fontSize: `${10 * s}px`, color: '#555555'
    }).setOrigin(0.5, 1)
    this._devSkinContainer = this.add.container(0, 0)
    this._devS = s
    this._devW = W
    this._devH = H
    this.buildDevSkinBtns()

    // ── [DEV] 캐릭터 즉시 변경 버튼 ──
    this.add.text(W / 2, H - 90 * s, '[DEV] 캐릭터:', {
      fontSize: `${10 * s}px`, color: '#555555'
    }).setOrigin(0.5, 1)

    const cBtnW = 80 * s
    const cBtnGap = 6 * s
    const cTotalW = CHARACTERS.length * cBtnW + (CHARACTERS.length - 1) * cBtnGap
    const cStartX = W / 2 - cTotalW / 2
    CHARACTERS.forEach((char, i) => {
      const btn = this.add.text(cStartX + i * (cBtnW + cBtnGap), H - 72 * s,
        `${char.emoji} ${char.name}`, {
          fontSize: `${11 * s}px`, color: '#ffcc88',
          backgroundColor: '#221100', padding: { x: 5 * s, y: 3 * s }
        }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true })
      btn.on('pointerover', () => btn.setStyle({ color: '#ffffff' }))
      btn.on('pointerout',  () => btn.setStyle({ color: '#ffcc88' }))
      btn.on('pointerdown', () => {
        this.gameScene.devChangeChar(char.id)
        this.buildDevSkinBtns()
      })
    })

    // ── [DEV] 날씨 즉시 변경 버튼 ──
    this.add.text(W / 2, H - 54 * s, '[DEV] 날씨 즉시 변경:', {
      fontSize: `${10 * s}px`, color: '#555555'
    }).setOrigin(0.5, 1)

    const weatherTypes = [
      { key: 'clear', label: '☀️ 맑음' },
      { key: 'rain',  label: '🌧️ 비' },
      { key: 'fog',   label: '🌫️ 안개' },
      { key: 'storm', label: '⛈️ 폭풍' },
    ]
    const wBtnW = 88 * s
    const wBtnGap = 6 * s
    const wTotalW = weatherTypes.length * wBtnW + (weatherTypes.length - 1) * wBtnGap
    const wStartX = W / 2 - wTotalW / 2
    weatherTypes.forEach((wt, i) => {
      const btn = this.add.text(wStartX + i * (wBtnW + wBtnGap), H - 36 * s, wt.label, {
        fontSize: `${11 * s}px`, color: '#88ddff',
        backgroundColor: '#001122', padding: { x: 5 * s, y: 3 * s }
      }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true })
      btn.on('pointerover', () => btn.setStyle({ color: '#ffffff' }))
      btn.on('pointerout',  () => btn.setStyle({ color: '#88ddff' }))
      btn.on('pointerdown', () => this.gameScene.changeWeather(wt.key))
    })

    // 하단 버튼 행: [조합 가이드]  [▶ 계속 게임]
    const guideBtn = this.add.text(W / 2 - 10 * s, H - 14 * s, '📖  조합 가이드', {
      fontSize: `${13 * s}px`, color: '#88cc88',
      backgroundColor: '#0a1a0a', padding: { x: 10 * s, y: 4 * s }
    }).setOrigin(1, 1).setInteractive({ useHandCursor: true })
    guideBtn.on('pointerover', () => guideBtn.setStyle({ color: '#ffffff' }))
    guideBtn.on('pointerout',  () => guideBtn.setStyle({ color: '#88cc88' }))
    guideBtn.on('pointerdown', () => {
      this.gameScene.openGuide()
    })

    // 닫기 버튼
    const closeBtn = this.add.text(W / 2 + 10 * s, H - 14 * s, '▶  계속 게임', {
      fontSize: `${18 * s}px`, color: '#aaaaaa'
    }).setOrigin(0, 1).setInteractive({ useHandCursor: true })
    closeBtn.on('pointerover', () => closeBtn.setStyle({ color: '#ffffff' }))
    closeBtn.on('pointerout',  () => closeBtn.setStyle({ color: '#aaaaaa' }))
    closeBtn.on('pointerdown', () => this.close())

    // B키로 닫기
    this.input.keyboard.once('keydown-B', () => this.close())
    this.input.keyboard.once('keydown-ESC', () => this.close())
  }

  buildItems(s, W, H) {
    this.itemContainer.removeAll(true)

    const cols   = 5
    const rows   = 2
    const cw     = 158 * s
    const ch     = 110 * s
    const gapX   = 12 * s
    const gapY   = 16 * s
    const totalW = cols * cw + (cols - 1) * gapX
    const startX = (W - totalW) / 2 + cw / 2
    const startY = 130 * s

    SHOP_ITEMS.forEach((item, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x   = startX + col * (cw + gapX)
      const y   = startY + row * (ch + gapY) + ch / 2

      const gs   = this.gameScene
      const wpLv = gs.weapons[item.id]?.level ?? -1
      const maxed = (item.type === 'weapon' && wpLv >= 5)
                 || (item.id === 'speed_up' && gs.playerStats.speed >= 380)
      const canBuy = this.coins >= item.price && !maxed

      const bgColor     = maxed ? 0x111111 : 0x0e0e2e
      const borderColor = maxed ? 0x333333 : canBuy ? item.color : 0x222244

      const bg = this.add.rectangle(x, y, cw, ch, bgColor).setStrokeStyle(2 * s, borderColor)
      bg.setInteractive({ useHandCursor: !maxed })

      const emojiT = this.add.text(x - cw / 2 + 16 * s, y - 28 * s, item.emoji, { fontSize: `${22 * s}px` }).setOrigin(0, 0.5)

      // 무기라면 현재 레벨 표시
      let nameStr = item.name
      if (item.type === 'weapon' && wpLv >= 0) {
        nameStr += wpLv === 0 ? '' : ` Lv${wpLv}`
      }
      const nameT = this.add.text(x + 4 * s, y - 28 * s, nameStr, {
        fontSize: `${13 * s}px`, color: maxed ? '#444444' : '#ffffff', fontStyle: 'bold'
      }).setOrigin(0.5, 0.5)

      const descT = this.add.text(x, y + 2 * s, maxed ? 'MAX 레벨' : item.desc, {
        fontSize: `${10 * s}px`, color: maxed ? '#333333' : '#888888', align: 'center', wordWrap: { width: 170 * s }
      }).setOrigin(0.5)

      const priceT = this.add.text(x, y + 36 * s, maxed ? '—' : `🪙 ${item.price}`, {
        fontSize: `${13 * s}px`, color: maxed ? '#333333' : canBuy ? '#ffd700' : '#444444', fontStyle: 'bold'
      }).setOrigin(0.5)

      if (!maxed) {
        bg.on('pointerover', () => { if (canBuy) bg.setFillStyle(0x1e1e4e) })
        bg.on('pointerout',  () => bg.setFillStyle(bgColor))
        bg.on('pointerdown', () => {
          if (!canBuy) return
          Store.addCoins(-item.price)
          this.applyPurchase(item.id)
          this.coins = Store.getCoins()
          this.coinText.setText(`🪙 ${this.coins}`)
          // 카드 갱신
          this.buildItems(s, W, H)
        })
      }

      this.itemContainer.add([bg, emojiT, nameT, descT, priceT])
    })
  }

  buildDevSkinBtns() {
    this._devSkinContainer.removeAll(true)
    const s = this._devS, W = this._devW, H = this._devH
    const curCharId = this.gameScene.charId || 'default'
    const devSkins = SKINS
      .filter(sk => sk.charId === curCharId)
      .map(sk => ({ tex: sk.tex, label: `${sk.emoji}${sk.name}` }))
    const sBtnW = 72 * s
    const sBtnGap = 5 * s
    const sTotalW = devSkins.length * sBtnW + (devSkins.length - 1) * sBtnGap
    const sStartX = W / 2 - sTotalW / 2
    devSkins.forEach((sk, i) => {
      const btn = this.add.text(sStartX + i * (sBtnW + sBtnGap), H - 108 * s, sk.label, {
        fontSize: `${10 * s}px`, color: '#ffaaff',
        backgroundColor: '#1a0022', padding: { x: 4 * s, y: 3 * s }
      }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true })
      btn.on('pointerover', () => btn.setStyle({ color: '#ffffff' }))
      btn.on('pointerout',  () => btn.setStyle({ color: '#ffaaff' }))
      btn.on('pointerdown', () => this.gameScene.devChangeSkin(sk.tex))
      this._devSkinContainer.add(btn)
    })
  }

  applyPurchase(id) {
    const gs = this.gameScene
    switch (id) {
      case 'hp_potion':
        gs.playerStats.hp = Math.min(gs.playerStats.maxHp, gs.playerStats.hp + 80)
        break
      case 'max_hp_up':
        gs.playerStats.maxHp += 30
        gs.playerStats.hp = Math.min(gs.playerStats.maxHp, gs.playerStats.hp + 30)
        break
      case 'speed_up':
        gs.playerStats.speed = Math.min(380, Math.round(gs.playerStats.speed * 1.15))
        break
      default:
        // 무기 구매 / 강화
        if (gs.weapons[id] !== undefined) {
          gs.weapons[id].level = Math.min(5, gs.weapons[id].level + 1)
        }
    }
  }

  close() {
    const gs = this.gameScene

    // 진화 가능 조건 직접 확인
    const evolutions = []
    if (!gs.evolved.thunder_storm && gs.weapons.bolt.level >= 5 && gs.weapons.garlic.level >= 3)
      evolutions.push('ev_thunder_storm')
    if (!gs.evolved.plasma_cannon && gs.weapons.orb.level >= 5 && gs.weapons.missile.level >= 3)
      evolutions.push('ev_plasma_cannon')
    if (!gs.evolved.storm_blade && gs.weapons.dagger.level >= 5 && gs.weapons.ice_lance.level >= 3)
      evolutions.push('ev_storm_blade')

    this.scene.stop()

    if (evolutions.length > 0) {
      // 진화 카드 선택 팝업
      gs.paused = true
      gs.physics.pause()
      gs.scene.launch('LevelUp', {
        gameScene: gs,
        forceOptions: evolutions
      })
    } else {
      gs.paused = false
      gs.physics.resume()
    }
  }
}
