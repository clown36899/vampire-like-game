import Phaser from 'phaser'

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot')
  }

  create() {
    this.createTextures()
    this.scene.start('Menu')
  }

  createTextures() {
    // ── Player (파란 원, 눈 있음) ──
    const pg = this.make.graphics({ add: false })
    pg.fillStyle(0x4fc3f7)
    pg.fillCircle(18, 18, 16)
    pg.fillStyle(0x1a88cc)
    pg.fillCircle(18, 18, 10)
    pg.fillStyle(0xffffff)
    pg.fillCircle(22, 14, 5)
    pg.fillStyle(0x000022)
    pg.fillCircle(23, 14, 3)
    pg.generateTexture('player', 36, 36)
    pg.destroy()

    // ── Enemy normal (빨강 사각형) ──
    const eg = this.make.graphics({ add: false })
    eg.fillStyle(0xff3333)
    eg.fillRoundedRect(2, 2, 22, 22, 4)
    eg.fillStyle(0xffff00)
    eg.fillCircle(8, 8, 3)
    eg.fillCircle(18, 8, 3)
    eg.lineStyle(2, 0xff0000)
    eg.strokeRoundedRect(2, 2, 22, 22, 4)
    eg.generateTexture('enemy_normal', 26, 26)
    eg.destroy()

    // ── Enemy fast (주황 삼각형) ──
    const efg = this.make.graphics({ add: false })
    efg.fillStyle(0xff8800)
    efg.fillTriangle(13, 1, 1, 25, 25, 25)
    efg.fillStyle(0xffff00)
    efg.fillCircle(13, 19, 2)
    efg.generateTexture('enemy_fast', 26, 26)
    efg.destroy()

    // ── Enemy tank (진홍 큰 사각형) ──
    const etg = this.make.graphics({ add: false })
    etg.fillStyle(0x880000)
    etg.fillRoundedRect(2, 2, 42, 42, 6)
    etg.fillStyle(0xff4444)
    etg.fillRoundedRect(6, 6, 34, 34, 4)
    etg.fillStyle(0xffff00)
    etg.fillCircle(14, 14, 5)
    etg.fillCircle(32, 14, 5)
    etg.fillStyle(0xff0000)
    etg.fillRect(14, 28, 18, 4)
    etg.generateTexture('enemy_tank', 46, 46)
    etg.destroy()

    // ── XP Gem (밝은 초록 다이아) ──
    const gemg = this.make.graphics({ add: false })
    gemg.fillStyle(0x00ffaa)
    gemg.fillTriangle(9, 0, 0, 9, 18, 9)
    gemg.fillTriangle(9, 18, 0, 9, 18, 9)
    gemg.fillStyle(0xaaffdd)
    gemg.fillTriangle(9, 3, 4, 9, 14, 9)
    gemg.generateTexture('gem', 18, 18)
    gemg.destroy()

    // ── 투사체 (밝은 노란 볼트) ──
    const kg = this.make.graphics({ add: false })
    kg.fillStyle(0xffff00)
    kg.fillRect(0, 3, 28, 6)          // 몸통
    kg.fillStyle(0xffffff)
    kg.fillRect(4, 4, 18, 4)          // 하이라이트
    kg.fillStyle(0xffcc00)
    kg.fillTriangle(28, 0, 28, 12, 38, 6)  // 화살촉
    kg.generateTexture('bolt', 40, 12)
    kg.destroy()

    // ── Magic Orb ──
    const og = this.make.graphics({ add: false })
    og.fillStyle(0x9900ff, 0.5)
    og.fillCircle(12, 12, 12)
    og.fillStyle(0xcc44ff)
    og.fillCircle(12, 12, 8)
    og.fillStyle(0xffffff)
    og.fillCircle(9, 9, 4)
    og.generateTexture('orb', 24, 24)
    og.destroy()

    // ── Garlic aura ──
    const gg = this.make.graphics({ add: false })
    gg.fillStyle(0xffff88, 0.15)
    gg.fillCircle(72, 72, 72)
    gg.lineStyle(3, 0xffff00, 0.4)
    gg.strokeCircle(72, 72, 72)
    gg.generateTexture('garlic', 144, 144)
    gg.destroy()

    // ── Missile (유도탄) ──
    const missileg = this.make.graphics({ add: false })
    missileg.fillStyle(0xff4400)
    missileg.fillRect(4, 3, 20, 6)
    missileg.fillStyle(0xff9900)
    missileg.fillRect(6, 4, 12, 4)
    missileg.fillStyle(0xff2200)
    missileg.fillTriangle(24, 0, 24, 12, 32, 6)
    missileg.fillStyle(0x44aaff)
    missileg.fillTriangle(4, 2, 4, 10, 0, 6)
    missileg.generateTexture('missile', 34, 12)
    missileg.destroy()

    // ── Ground tile (격자) ──
    const grg = this.make.graphics({ add: false })
    grg.fillStyle(0x1c3a1c)
    grg.fillRect(0, 0, 64, 64)
    grg.lineStyle(1, 0x0d2a0d, 0.9)
    grg.strokeRect(0, 0, 64, 64)
    grg.generateTexture('ground', 64, 64)
    grg.destroy()
  }
}
