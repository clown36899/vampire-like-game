import Phaser from 'phaser'
import { Store, SKINS, CARDS } from '../Store.js'

export default class ShopScene extends Phaser.Scene {
  constructor() { super('Shop') }

  create() {
    const W = this.scale.width
    const H = this.scale.height
    const s = W / 960

    this.coins = Store.getCoins()
    this.equippedSkin = Store.getEquippedSkin()

    // 배경
    this.add.rectangle(W / 2, H / 2, W, H, 0x08081a)

    // 타이틀
    this.add.text(W / 2, 22 * s, '🛒  상점', {
      fontSize: `${26 * s}px`, color: '#ffff00', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4 * s
    }).setOrigin(0.5, 0)

    // 코인 표시
    this.coinText = this.add.text(W - 16 * s, 18 * s, `🪙 ${this.coins}`, {
      fontSize: `${18 * s}px`, color: '#ffd700', fontStyle: 'bold'
    }).setOrigin(1, 0)

    // DEV 버튼 (개발자용 코인 충전)
    const devBtn = this.add.text(16 * s, 18 * s, '[DEV] +9999코인', {
      fontSize: `${12 * s}px`, color: '#444444',
      backgroundColor: '#1a1a1a', padding: { x: 7 * s, y: 3 * s }
    }).setOrigin(0, 0).setInteractive({ useHandCursor: true })
    devBtn.on('pointerover', () => devBtn.setStyle({ color: '#ffff00' }))
    devBtn.on('pointerout',  () => devBtn.setStyle({ color: '#444444' }))
    devBtn.on('pointerdown', () => {
      Store.addCoins(9999)
      this.coins = Store.getCoins()
      this.coinText.setText(`🪙 ${this.coins}`)
      this.refreshAll()
    })

    // 구분선
    this.add.rectangle(W / 2, 60 * s, W - 40 * s, 1, 0x333355).setOrigin(0.5, 0)

    // 섹션 라벨
    this.add.text(24 * s, 68 * s, '🎨  스킨', {
      fontSize: `${15 * s}px`, color: '#aaaacc', fontStyle: 'bold'
    })
    this.add.text(24 * s, 240 * s, '🃏  패시브 카드', {
      fontSize: `${15 * s}px`, color: '#aaaacc', fontStyle: 'bold'
    })

    // 컨테이너
    this.skinContainer = this.add.container(0, 0)
    this.cardContainer = this.add.container(0, 0)

    this.refreshAll()

    // 뒤로가기 버튼
    const backBtn = this.add.text(W / 2, H - 20 * s, '← 메뉴로 돌아가기', {
      fontSize: `${16 * s}px`, color: '#777777'
    }).setOrigin(0.5, 1).setInteractive({ useHandCursor: true })
    backBtn.on('pointerover', () => backBtn.setStyle({ color: '#ffffff' }))
    backBtn.on('pointerout',  () => backBtn.setStyle({ color: '#777777' }))
    backBtn.on('pointerdown', () => this.scene.start('Menu'))
  }

  refreshAll() {
    this.coins = Store.getCoins()
    this.coinText?.setText(`🪙 ${this.coins}`)
    this.skinContainer.removeAll(true)
    this.cardContainer.removeAll(true)
    this.buildSkinCards()
    this.buildCardCards()
  }

  buildSkinCards() {
    const s  = this.scale.width / 960
    const W  = this.scale.width
    const cw = 140 * s, ch = 148 * s, gap = 16 * s
    const totalW = SKINS.length * cw + (SKINS.length - 1) * gap
    const startX = (W - totalW) / 2 + cw / 2
    const y = 155 * s

    SKINS.forEach((skin, i) => {
      const x     = startX + i * (cw + gap)
      const owned    = Store.ownsSkin(skin.id)
      const equipped = this.equippedSkin === skin.id

      const bgColor     = equipped ? 0x0d1f0d : 0x0e0e2e
      const borderColor = equipped ? 0x00ff88 : owned ? 0x4488ff : 0x333355

      const bg = this.add.rectangle(x, y, cw, ch, bgColor).setStrokeStyle(2 * s, borderColor)
      bg.setInteractive({ useHandCursor: true })

      const emojiT  = this.add.text(x, y - 44 * s, skin.emoji, { fontSize: `${30 * s}px` }).setOrigin(0.5)
      const nameT   = this.add.text(x, y - 10 * s, skin.name,  { fontSize: `${13 * s}px`, color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5)
      const descT   = this.add.text(x, y + 16 * s, skin.desc,  { fontSize: `${10 * s}px`, color: '#888888', align: 'center', wordWrap: { width: 120 * s } }).setOrigin(0.5)

      let labelT
      if (equipped) {
        labelT = this.add.text(x, y + 52 * s, '✅ 장착중', { fontSize: `${11 * s}px`, color: '#00ff88', fontStyle: 'bold' }).setOrigin(0.5)
      } else if (owned) {
        labelT = this.add.text(x, y + 52 * s, '▶ 장착하기', { fontSize: `${11 * s}px`, color: '#4488ff', fontStyle: 'bold' }).setOrigin(0.5)
      } else {
        const afford = this.coins >= skin.price
        labelT = this.add.text(x, y + 52 * s, `🪙 ${skin.price}`, {
          fontSize: `${12 * s}px`, color: afford ? '#ffd700' : '#444444', fontStyle: 'bold'
        }).setOrigin(0.5)
      }

      // 색상 미리보기 점
      const dot = this.add.circle(x, y - 62 * s, 5 * s, skin.preview)

      bg.on('pointerover', () => { if (!equipped) bg.setFillStyle(0x1a1a3a) })
      bg.on('pointerout',  () => { bg.setFillStyle(equipped ? 0x0d1f0d : 0x0e0e2e) })
      bg.on('pointerdown', () => {
        if (equipped) return
        if (owned) {
          this.equippedSkin = skin.id
          Store.setEquippedSkin(skin.id)
          this.refreshAll()
        } else if (this.coins >= skin.price) {
          Store.addCoins(-skin.price)
          Store.addSkin(skin.id)
          this.equippedSkin = skin.id
          Store.setEquippedSkin(skin.id)
          this.coins = Store.getCoins()
          this.refreshAll()
        }
      })

      this.skinContainer.add([bg, dot, emojiT, nameT, descT, labelT])
    })
  }

  buildCardCards() {
    const s  = this.scale.width / 960
    const W  = this.scale.width
    const cw = 220 * s, ch = 120 * s, gap = 28 * s
    const totalW = CARDS.length * cw + (CARDS.length - 1) * gap
    const startX = (W - totalW) / 2 + cw / 2
    const y = 345 * s

    CARDS.forEach((card, i) => {
      const x     = startX + i * (cw + gap)
      const owned = Store.ownsCard(card.id)

      const bgColor     = owned ? 0x141400 : 0x0e0e2e
      const borderColor = owned ? 0xffaa00 : 0x333355

      const bg = this.add.rectangle(x, y, cw, ch, bgColor).setStrokeStyle(2 * s, borderColor)
      bg.setInteractive({ useHandCursor: true })

      const emojiT = this.add.text(x - cw / 2 + 20 * s, y - 30 * s, card.emoji, { fontSize: `${24 * s}px` }).setOrigin(0, 0.5)
      const nameT  = this.add.text(x + 4 * s, y - 28 * s, card.name, { fontSize: `${14 * s}px`, color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5, 0.5)
      const descT  = this.add.text(x, y + 2 * s, card.desc,  { fontSize: `${11 * s}px`, color: '#999999', align: 'center', wordWrap: { width: 190 * s } }).setOrigin(0.5)

      let labelT
      if (owned) {
        labelT = this.add.text(x, y + 38 * s, '✅ 보유중 · 게임 시작시 자동 적용', {
          fontSize: `${10 * s}px`, color: '#ffaa00'
        }).setOrigin(0.5)
      } else {
        const afford = this.coins >= card.price
        labelT = this.add.text(x, y + 38 * s, `🪙 ${card.price}  구매`, {
          fontSize: `${12 * s}px`, color: afford ? '#ffd700' : '#444444', fontStyle: 'bold'
        }).setOrigin(0.5)
      }

      bg.on('pointerover', () => { if (!owned) bg.setFillStyle(0x1a1a2a) })
      bg.on('pointerout',  () => { bg.setFillStyle(owned ? 0x141400 : 0x0e0e2e) })
      bg.on('pointerdown', () => {
        if (owned || this.coins < card.price) return
        Store.addCoins(-card.price)
        Store.addCard(card.id)
        this.coins = Store.getCoins()
        this.refreshAll()
      })

      this.cardContainer.add([bg, emojiT, nameT, descT, labelT])
    })
  }
}
