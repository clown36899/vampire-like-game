import Phaser from 'phaser'

const EVOLUTIONS = [
  {
    result:  { emoji: '⛈️', name: '번개폭풍', desc: '구름 3개가 플레이어 주위를 공전하며\n가까운 적에게 번개를 내리침' },
    recipe:  [
      { emoji: '⚡', name: '마법 볼트', level: 'Lv 5' },
      { emoji: '🧄', name: '마늘 오라', level: 'Lv 3' },
    ]
  },
  {
    result:  { emoji: '🌀', name: '플라즈마포', desc: '구슬들이 2초마다 근처 적에게\n플라즈마 미사일을 자동 발사' },
    recipe:  [
      { emoji: '🔮', name: '마법 구슬',       level: 'Lv 5' },
      { emoji: '🚀', name: '마크로스 미사일', level: 'Lv 3' },
    ]
  },
]

const WEAPONS = [
  { emoji: '⚡', name: '마법 볼트',       desc: '가장 가까운 적에게 투사체 자동 발사. 레벨 업시 발사 수·속도 증가' },
  { emoji: '🔮', name: '마법 구슬',       desc: '플레이어 주위를 공전하며 닿는 적 피해. 레벨 업시 구슬 수 증가' },
  { emoji: '🧄', name: '마늘 오라',       desc: '주위 적에게 범위 지속 피해. 레벨 업시 범위·피해 증가' },
  { emoji: '🚀', name: '마크로스 미사일', desc: '전방향 발사 후 가장 가까운 적에게 자동 유도' },
  { emoji: '🧲', name: '아이템 자석',     desc: '경험치 젬을 자동 흡입. 레벨 업시 흡입 범위 증가' },
]

const WEATHERS = [
  { emoji: '☀️', name: '맑음',  effect: '효과 없음',                              color: '#ffee88', bg: 0x111100 },
  { emoji: '🌧️', name: '비',    effect: '플레이어 이동속도 -10%',                  color: '#88aaff', bg: 0x000d22 },
  { emoji: '🌫️', name: '안개',  effect: '적 이동속도 -15% (적이 느려짐)',           color: '#aabbcc', bg: 0x111118 },
  { emoji: '⛈️', name: '폭풍',  effect: '플레이어 -15%속도 / 적 +20% / 번개 자동공격', color: '#cc88ff', bg: 0x0a0a1a },
]

const CARDS = [
  { emoji: '💨', name: '스피드 카드',  desc: '게임 시작시 이동속도 +20%' },
  { emoji: '💪', name: '체력 카드',    desc: '게임 시작시 최대 HP +50' },
  { emoji: '🎰', name: '럭키 스타트', desc: '게임 시작시 랜덤 무기 Lv1 획득' },
]

export default class GuideScene extends Phaser.Scene {
  constructor() { super('Guide') }

  init(data) {
    this.returnData = data || null
  }

  create() {
    const W = this.scale.width
    const H = this.scale.height
    const s = W / 960

    // 배경 (고정)
    this.add.rectangle(W / 2, H / 2, W, H, 0x08081a).setScrollFactor(0).setDepth(0)

    // 타이틀 (고정)
    const TITLE_H = 62 * s
    this.add.rectangle(W / 2, TITLE_H / 2, W, TITLE_H, 0x050510).setScrollFactor(0).setDepth(10)
    this.add.text(W / 2, 14 * s, '📖  조합 & 무기 가이드', {
      fontSize: `${22 * s}px`, color: '#ffff00', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4 * s
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(11)

    // 하단 뒤로가기 바 (고정)
    const FOOTER_H = 36 * s
    this.add.rectangle(W / 2, H - FOOTER_H / 2, W, FOOTER_H, 0x050510).setScrollFactor(0).setDepth(10)
    const backLabel = this.returnData?.fromShop ? '← 상점으로 돌아가기'
                    : this.returnData?.gameScene ? '← 게임으로 돌아가기'
                    : '← 메뉴로 돌아가기'
    const backBtn = this.add.text(W / 2, H - FOOTER_H / 2, backLabel, {
      fontSize: `${15 * s}px`, color: '#666666'
    }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(11).setInteractive({ useHandCursor: true })
    backBtn.on('pointerover', () => backBtn.setStyle({ color: '#ffffff' }))
    backBtn.on('pointerout',  () => backBtn.setStyle({ color: '#666666' }))
    backBtn.on('pointerdown', () => this.goBack())
    this.input.keyboard.once('keydown-ESC', () => this.goBack())

    // 스크롤 가능한 컨텐츠 영역
    const SCROLL_TOP = TITLE_H + 4 * s
    const SCROLL_BOT = H - FOOTER_H - 4 * s
    const SCROLL_H   = SCROLL_BOT - SCROLL_TOP

    // 컨텐츠 컨테이너 (카메라로 스크롤)
    this.scrollContainer = this.add.container(0, SCROLL_TOP)

    let curY = 8 * s

    const addToScroll = (obj) => {
      this.scrollContainer.add(obj)
      return obj
    }

    // ── 무기 진화 조합표 ──────────────────────────
    addToScroll(this.add.text(22 * s, curY, '⚗️  무기 진화 조합', {
      fontSize: `${14 * s}px`, color: '#ff8800', fontStyle: 'bold'
    }))
    curY += 22 * s

    EVOLUTIONS.forEach(ev => {
      const cardW = W - 44 * s
      const cardH = 68 * s
      addToScroll(this.add.rectangle(W / 2, curY + cardH / 2, cardW, cardH, 0x0d0d22)
        .setStrokeStyle(1.5 * s, 0xff8800))

      const cx = 28 * s
      ev.recipe.forEach((mat, i) => {
        const mx = cx + i * (90 * s)
        addToScroll(this.add.text(mx, curY + 10 * s, mat.emoji, { fontSize: `${22 * s}px` }))
        addToScroll(this.add.text(mx + 28 * s, curY + 10 * s, mat.name, {
          fontSize: `${12 * s}px`, color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0, 0))
        addToScroll(this.add.text(mx + 28 * s, curY + 27 * s, mat.level, {
          fontSize: `${11 * s}px`, color: '#aaaaaa'
        }))
        if (i === 0) {
          addToScroll(this.add.text(mx + 88 * s, curY + 16 * s, '+', {
            fontSize: `${18 * s}px`, color: '#888888', fontStyle: 'bold'
          }).setOrigin(0, 0))
        }
      })

      const arrowX = W / 2 - 10 * s
      addToScroll(this.add.text(arrowX, curY + 14 * s, '➜', {
        fontSize: `${20 * s}px`, color: '#ff8800'
      }).setOrigin(0.5, 0))

      const rx = arrowX + 32 * s
      addToScroll(this.add.text(rx, curY + 8 * s, `${ev.result.emoji} ${ev.result.name}`, {
        fontSize: `${15 * s}px`, color: '#ffcc00', fontStyle: 'bold'
      }))
      addToScroll(this.add.text(rx, curY + 30 * s, ev.result.desc, {
        fontSize: `${10 * s}px`, color: '#888888', wordWrap: { width: W / 2 - 50 * s }
      }))

      curY += cardH + 8 * s
    })

    curY += 6 * s
    addToScroll(this.add.rectangle(W / 2, curY, W - 40 * s, 1, 0x333355).setOrigin(0.5, 0))
    curY += 10 * s

    // ── 무기 목록 ──────────────────────────────────
    addToScroll(this.add.text(22 * s, curY, '⚔️  무기 목록', {
      fontSize: `${14 * s}px`, color: '#88ccff', fontStyle: 'bold'
    }))
    curY += 20 * s

    const colW = (W - 44 * s) / 2 - 6 * s
    WEAPONS.forEach((wp, i) => {
      const col = i % 2
      const row = Math.floor(i / 2)
      const x = 22 * s + col * (colW + 12 * s)
      const y = curY + row * 44 * s

      addToScroll(this.add.rectangle(x + colW / 2, y + 18 * s, colW, 38 * s, 0x111133)
        .setStrokeStyle(1 * s, 0x334466))
      addToScroll(this.add.text(x + 6 * s, y + 4 * s, `${wp.emoji}  ${wp.name}`, {
        fontSize: `${12 * s}px`, color: '#ffffff', fontStyle: 'bold'
      }))
      addToScroll(this.add.text(x + 6 * s, y + 22 * s, wp.desc, {
        fontSize: `${9 * s}px`, color: '#777799', wordWrap: { width: colW - 10 * s }
      }))
    })

    curY += Math.ceil(WEAPONS.length / 2) * 44 * s + 10 * s
    addToScroll(this.add.rectangle(W / 2, curY, W - 40 * s, 1, 0x333355).setOrigin(0.5, 0))
    curY += 10 * s

    // ── 패시브 카드 ────────────────────────────────
    addToScroll(this.add.text(22 * s, curY, '🃏  패시브 카드 (상점 구매)', {
      fontSize: `${14 * s}px`, color: '#ffaa44', fontStyle: 'bold'
    }))
    curY += 20 * s

    const cardColW = (W - 44 * s) / CARDS.length - 8 * s
    CARDS.forEach((card, i) => {
      const x = 22 * s + i * (cardColW + 8 * s)
      addToScroll(this.add.rectangle(x + cardColW / 2, curY + 22 * s, cardColW, 42 * s, 0x111100)
        .setStrokeStyle(1 * s, 0x554422))
      addToScroll(this.add.text(x + 8 * s, curY + 4 * s, `${card.emoji}  ${card.name}`, {
        fontSize: `${11 * s}px`, color: '#ffcc88', fontStyle: 'bold'
      }))
      addToScroll(this.add.text(x + 8 * s, curY + 22 * s, card.desc, {
        fontSize: `${9 * s}px`, color: '#886644', wordWrap: { width: cardColW - 10 * s }
      }))
    })

    curY += 52 * s
    addToScroll(this.add.rectangle(W / 2, curY, W - 40 * s, 1, 0x333355).setOrigin(0.5, 0))
    curY += 10 * s

    // ── 날씨 시스템 ───────────────────────────────────
    addToScroll(this.add.text(22 * s, curY, '🌤️  날씨 시스템 (60~90초마다 랜덤 변경)', {
      fontSize: `${14 * s}px`, color: '#88ddff', fontStyle: 'bold'
    }))
    curY += 20 * s

    const wColW = (W - 44 * s) / 2 - 6 * s
    WEATHERS.forEach((w, i) => {
      const col = i % 2
      const row = Math.floor(i / 2)
      const x = 22 * s + col * (wColW + 12 * s)
      const y = curY + row * 44 * s

      addToScroll(this.add.rectangle(x + wColW / 2, y + 18 * s, wColW, 38 * s, w.bg)
        .setStrokeStyle(1 * s, 0x334466))
      addToScroll(this.add.text(x + 6 * s, y + 4 * s, `${w.emoji}  ${w.name}`, {
        fontSize: `${12 * s}px`, color: w.color, fontStyle: 'bold'
      }))
      addToScroll(this.add.text(x + 6 * s, y + 22 * s, w.effect, {
        fontSize: `${9 * s}px`, color: '#778899', wordWrap: { width: wColW - 10 * s }
      }))
    })
    curY += Math.ceil(WEATHERS.length / 2) * 44 * s + 16 * s

    // 총 컨텐츠 높이
    this.contentHeight = curY
    this.scrollY = 0
    this.maxScroll = Math.max(0, this.contentHeight - SCROLL_H)

    // 스크롤 힌트
    if (this.maxScroll > 0) {
      this.add.text(W / 2, SCROLL_BOT - 2 * s, '▼ 스크롤하여 더 보기', {
        fontSize: `${10 * s}px`, color: '#334455'
      }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(11)

      // 스크롤바 트랙
      this.scrollTrack = this.add.rectangle(W - 8 * s, SCROLL_TOP + SCROLL_H / 2, 4 * s, SCROLL_H, 0x222233)
        .setScrollFactor(0).setDepth(11)
      this.scrollThumb = this.add.rectangle(W - 8 * s, SCROLL_TOP, 4 * s, 0, 0x4466aa)
        .setScrollFactor(0).setDepth(12).setOrigin(0.5, 0)
      this.updateScrollbar(SCROLL_TOP, SCROLL_H, s)
    }

    // 마우스 휠 스크롤
    this.input.on('wheel', (pointer, objects, dx, dy) => {
      this.scrollY = Phaser.Math.Clamp(this.scrollY + dy * 0.8, 0, this.maxScroll)
      this.scrollContainer.y = SCROLL_TOP - this.scrollY
      this.updateScrollbar(SCROLL_TOP, SCROLL_H, s)
    })

    // 터치/드래그 스크롤
    this.input.on('pointermove', (pointer) => {
      if (!pointer.isDown) return
      this.scrollY = Phaser.Math.Clamp(this.scrollY - pointer.velocity.y * 0.3, 0, this.maxScroll)
      this.scrollContainer.y = SCROLL_TOP - this.scrollY
      this.updateScrollbar(SCROLL_TOP, SCROLL_H, s)
    })

    // 스크롤 영역 마스크 (클리핑)
    this.maskGraphics = this.add.graphics()
    this.maskGraphics.fillRect(0, SCROLL_TOP, W, SCROLL_H)
    this.scrollMask = this.maskGraphics.createGeometryMask()
    this.scrollContainer.setMask(this.scrollMask)
  }

  shutdown() {
    // 씬 종료 시 마스크 명시적 해제 (게임 화면 깨짐 방지)
    if (this.scrollContainer) {
      this.scrollContainer.clearMask()
    }
    if (this.scrollMask) {
      this.scrollMask.destroy()
      this.scrollMask = null
    }
    if (this.maskGraphics) {
      this.maskGraphics.destroy()
      this.maskGraphics = null
    }
  }

  updateScrollbar(scrollTop, scrollH, s) {
    if (!this.scrollThumb) return
    const ratio    = scrollH / (this.contentHeight)
    const thumbH   = Math.max(30 * s, scrollH * ratio)
    const thumbY   = scrollTop + (this.scrollY / this.maxScroll) * (scrollH - thumbH)
    this.scrollThumb.setSize(4 * s, thumbH)
    this.scrollThumb.y = isNaN(thumbY) ? scrollTop : thumbY
  }

  goBack() {
    const gs = this.returnData?.gameScene
    if (gs) {
      this.shutdown()
      this.scene.stop()
      if (this.returnData?.fromShop) {
        // 상점으로 돌아가기
        gs.scene.launch('InGameShop', { gameScene: gs })
      } else {
        // 게임 재개
        gs.paused = false
        if (gs.physics.world.isPaused) gs.physics.resume()
      }
    } else {
      this.scene.start('Menu')
    }
  }
}
