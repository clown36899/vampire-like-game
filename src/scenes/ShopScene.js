import Phaser from 'phaser'
import { Store, SKINS, CARDS, CHARACTERS } from '../Store.js'

export default class ShopScene extends Phaser.Scene {
  constructor() { super('Shop') }

  create() {
    const W = this.scale.width
    const H = this.scale.height
    const s = W / 960

    this.coins = Store.getCoins()
    this.equippedChar = Store.getEquippedChar()
    this.equippedSkin = Store.getEquippedSkin(this.equippedChar)

    // 배경
    this.add.rectangle(W / 2, H / 2, W, H, 0x08081a)

    // 타이틀
    this.add.text(W / 2, 14 * s, '🛒  상점', {
      fontSize: `${22 * s}px`, color: '#ffff00', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4 * s
    }).setOrigin(0.5, 0)

    // 코인 표시
    this.coinText = this.add.text(W - 14 * s, 14 * s, `🪙 ${this.coins}`, {
      fontSize: `${16 * s}px`, color: '#ffd700', fontStyle: 'bold'
    }).setOrigin(1, 0)

    // DEV 버튼 (개발자용 코인 충전)
    const devBtn = this.add.text(14 * s, 14 * s, '[DEV] +9999코인', {
      fontSize: `${11 * s}px`, color: '#444444',
      backgroundColor: '#1a1a1a', padding: { x: 6 * s, y: 2 * s }
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
    this.add.rectangle(W / 2, 48 * s, W - 40 * s, 1, 0x333355).setOrigin(0.5, 0)

    // 섹션 라벨
    this.add.text(20 * s, 52 * s, '🎭  캐릭터', {
      fontSize: `${13 * s}px`, color: '#ffcc88', fontStyle: 'bold'
    })
    this.skinLabelY = 200 * s
    this.skinLabelS  = s
    this.skinLabelText = this.add.text(20 * s, this.skinLabelY, '🎨  스킨', {
      fontSize: `${13 * s}px`, color: '#aaaacc', fontStyle: 'bold'
    })
    this.add.text(20 * s, 340 * s, '🃏  패시브 카드', {
      fontSize: `${13 * s}px`, color: '#aaaacc', fontStyle: 'bold'
    })

    // 컨테이너
    this.charContainer = this.add.container(0, 0)
    this.skinContainer = this.add.container(0, 0)
    this.cardContainer = this.add.container(0, 0)

    this.refreshAll()

    // 뒤로가기 버튼
    const backBtn = this.add.text(W / 2, H - 14 * s, '← 메뉴로 돌아가기', {
      fontSize: `${14 * s}px`, color: '#777777'
    }).setOrigin(0.5, 1).setInteractive({ useHandCursor: true })
    backBtn.on('pointerover', () => backBtn.setStyle({ color: '#ffffff' }))
    backBtn.on('pointerout',  () => backBtn.setStyle({ color: '#777777' }))
    backBtn.on('pointerdown', () => this.scene.start('Menu'))
  }

  refreshAll() {
    this.coins = Store.getCoins()
    this.equippedChar = Store.getEquippedChar()
    this.equippedSkin = Store.getEquippedSkin(this.equippedChar)
    this.coinText?.setText(`🪙 ${this.coins}`)
    // 스킨 섹션 라벨 갱신 (destroy 후 재생성으로 확실히 반영)
    const charDef = CHARACTERS.find(c => c.id === this.equippedChar)
    const skinLabel = `🎨  스킨  (${charDef?.name || '기본'} 전용)`
    if (this.skinLabelText && !this.skinLabelText.destroyed) this.skinLabelText.destroy()
    this.skinLabelText = this.add.text(20 * this.skinLabelS, this.skinLabelY, skinLabel, {
      fontSize: `${13 * this.skinLabelS}px`, color: '#aaaacc', fontStyle: 'bold'
    })
    this.charContainer.removeAll(true)
    this.skinContainer.removeAll(true)
    this.cardContainer.removeAll(true)
    this.buildCharCards()
    this.buildSkinCards()
    this.buildCardCards()
  }

  // ─── 캐릭터 (y: 52~195) ───
  buildCharCards() {
    const s  = this.scale.width / 960
    const W  = this.scale.width
    const cw = 148 * s, ch = 118 * s, gap = 12 * s
    const totalW = CHARACTERS.length * cw + (CHARACTERS.length - 1) * gap
    const startX = (W - totalW) / 2 + cw / 2
    const y = 130 * s   // center

    CHARACTERS.forEach((char, i) => {
      const x       = startX + i * (cw + gap)
      const owned   = Store.ownsChar(char.id)
      const equipped = this.equippedChar === char.id

      const bgColor     = equipped ? 0x1a1200 : 0x0e0e2e
      const borderColor = equipped ? 0xffcc00 : owned ? char.color : 0x333355

      const bg = this.add.rectangle(x, y, cw, ch, bgColor).setStrokeStyle(2 * s, borderColor)
      bg.setInteractive({ useHandCursor: true })

      const emojiT = this.add.text(x, y - 38 * s, char.emoji, { fontSize: `${24 * s}px` }).setOrigin(0.5)
      const nameT  = this.add.text(x, y - 10 * s, char.name,  { fontSize: `${12 * s}px`, color: equipped ? '#ffcc00' : '#ffffff', fontStyle: 'bold' }).setOrigin(0.5)
      const descT  = this.add.text(x, y + 10 * s, char.desc,  { fontSize: `${8.5 * s}px`, color: '#888888', align: 'center', wordWrap: { width: 130 * s } }).setOrigin(0.5)

      let labelT
      if (equipped) {
        labelT = this.add.text(x, y + 48 * s, '✅ 선택됨', { fontSize: `${10 * s}px`, color: '#ffcc00', fontStyle: 'bold' }).setOrigin(0.5)
      } else if (owned) {
        labelT = this.add.text(x, y + 48 * s, '▶ 선택하기', { fontSize: `${10 * s}px`, color: '#88aaff', fontStyle: 'bold' }).setOrigin(0.5)
      } else {
        const afford = this.coins >= char.price
        labelT = this.add.text(x, y + 48 * s, `🪙 ${char.price}`, {
          fontSize: `${11 * s}px`, color: afford ? '#ffd700' : '#444444', fontStyle: 'bold'
        }).setOrigin(0.5)
      }

      bg.on('pointerover', () => { if (!equipped) bg.setFillStyle(0x1a1a3a) })
      bg.on('pointerout',  () => { bg.setFillStyle(equipped ? 0x1a1200 : 0x0e0e2e) })
      bg.on('pointerdown', () => {
        if (equipped) return
        if (owned) {
          Store.setEquippedChar(char.id)
        } else if (this.coins >= char.price) {
          Store.addCoins(-char.price)
          Store.addChar(char.id)
          Store.setEquippedChar(char.id)
        } else {
          return
        }
        this.refreshAll()
      })

      this.charContainer.add([bg, emojiT, nameT, descT, labelT])
    })
  }

  // ─── 스킨 (y: 200~335) ───
  buildSkinCards() {
    const s  = this.scale.width / 960
    const W  = this.scale.width
    const cw = 130 * s, ch = 118 * s, gap = 12 * s
    const charSkins = SKINS.filter(sk => sk.charId === this.equippedChar)
    const totalW = charSkins.length * cw + (charSkins.length - 1) * gap
    const startX = (W - totalW) / 2 + cw / 2
    const y = 272 * s   // center

    charSkins.forEach((skin, i) => {
      const x     = startX + i * (cw + gap)
      const owned    = Store.ownsSkin(skin.id)
      const equipped = this.equippedSkin === skin.id

      const bgColor     = equipped ? 0x0d1f0d : 0x0e0e2e
      const borderColor = equipped ? 0x00ff88 : owned ? 0x4488ff : 0x333355

      const bg = this.add.rectangle(x, y, cw, ch, bgColor).setStrokeStyle(2 * s, borderColor)
      bg.setInteractive({ useHandCursor: true })

      const dot    = this.add.circle(x, y - 54 * s, 4 * s, skin.preview)
      const emojiT = this.add.text(x, y - 38 * s, skin.emoji, { fontSize: `${24 * s}px` }).setOrigin(0.5)
      const nameT  = this.add.text(x, y - 10 * s, skin.name,  { fontSize: `${12 * s}px`, color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5)
      const descT  = this.add.text(x, y + 10 * s, skin.desc,  { fontSize: `${9 * s}px`,  color: '#888888', align: 'center', wordWrap: { width: 110 * s } }).setOrigin(0.5)

      let labelT
      if (equipped) {
        labelT = this.add.text(x, y + 48 * s, '✅ 장착중', { fontSize: `${10 * s}px`, color: '#00ff88', fontStyle: 'bold' }).setOrigin(0.5)
      } else if (owned) {
        labelT = this.add.text(x, y + 48 * s, '▶ 장착하기', { fontSize: `${10 * s}px`, color: '#4488ff', fontStyle: 'bold' }).setOrigin(0.5)
      } else {
        const afford = this.coins >= skin.price
        labelT = this.add.text(x, y + 48 * s, `🪙 ${skin.price}`, {
          fontSize: `${11 * s}px`, color: afford ? '#ffd700' : '#444444', fontStyle: 'bold'
        }).setOrigin(0.5)
      }

      bg.on('pointerover', () => { if (!equipped) bg.setFillStyle(0x1a1a3a) })
      bg.on('pointerout',  () => { bg.setFillStyle(equipped ? 0x0d1f0d : 0x0e0e2e) })
      bg.on('pointerdown', () => {
        if (equipped) return
        if (owned) {
          Store.setEquippedSkin(this.equippedChar, skin.id)
        } else if (this.coins >= skin.price) {
          Store.addCoins(-skin.price)
          Store.addSkin(skin.id)
          Store.setEquippedSkin(this.equippedChar, skin.id)
        } else {
          return
        }
        this.refreshAll()
      })

      this.skinContainer.add([bg, dot, emojiT, nameT, descT, labelT])
    })
  }

  // ─── 패시브 카드 (y: 340~480) ───
  buildCardCards() {
    const s  = this.scale.width / 960
    const W  = this.scale.width
    const cw = 200 * s, ch = 105 * s, gap = 22 * s
    const totalW = CARDS.length * cw + (CARDS.length - 1) * gap
    const startX = (W - totalW) / 2 + cw / 2
    const y = 410 * s   // center

    CARDS.forEach((card, i) => {
      const x     = startX + i * (cw + gap)
      const owned = Store.ownsCard(card.id)

      const bgColor     = owned ? 0x141400 : 0x0e0e2e
      const borderColor = owned ? 0xffaa00 : 0x333355

      const bg = this.add.rectangle(x, y, cw, ch, bgColor).setStrokeStyle(2 * s, borderColor)
      bg.setInteractive({ useHandCursor: true })

      const emojiT = this.add.text(x - cw / 2 + 18 * s, y - 26 * s, card.emoji, { fontSize: `${22 * s}px` }).setOrigin(0, 0.5)
      const nameT  = this.add.text(x + 4 * s, y - 24 * s, card.name, { fontSize: `${12 * s}px`, color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5, 0.5)
      const descT  = this.add.text(x, y + 2 * s, card.desc,  { fontSize: `${10 * s}px`, color: '#999999', align: 'center', wordWrap: { width: 175 * s } }).setOrigin(0.5)

      let labelT
      if (owned) {
        labelT = this.add.text(x, y + 36 * s, '✅ 보유중 · 게임 시작시 자동 적용', {
          fontSize: `${9 * s}px`, color: '#ffaa00'
        }).setOrigin(0.5)
      } else {
        const afford = this.coins >= card.price
        labelT = this.add.text(x, y + 36 * s, `🪙 ${card.price}  구매`, {
          fontSize: `${11 * s}px`, color: afford ? '#ffd700' : '#444444', fontStyle: 'bold'
        }).setOrigin(0.5)
      }

      bg.on('pointerover', () => { if (!owned) bg.setFillStyle(0x1a1a2a) })
      bg.on('pointerout',  () => { bg.setFillStyle(owned ? 0x141400 : 0x0e0e2e) })
      bg.on('pointerdown', () => {
        if (owned || this.coins < card.price) return
        Store.addCoins(-card.price)
        Store.addCard(card.id)
        this.refreshAll()
      })

      this.cardContainer.add([bg, emojiT, nameT, descT, labelT])
    })
  }
}
