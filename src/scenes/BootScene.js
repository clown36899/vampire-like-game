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
    // ── 스킨: default (파란 원, 눈 있음) ──
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

    // ── 스킨: vampire (뱀파이어 - 빨간 망토 + 송곳니) ──
    const vg = this.make.graphics({ add: false })
    // 망토
    vg.fillStyle(0x880000)
    vg.fillTriangle(4, 12, 32, 12, 28, 36)
    vg.fillTriangle(4, 12, 8, 36, 28, 36)
    // 머리
    vg.fillStyle(0xf0d0d0)
    vg.fillCircle(18, 14, 12)
    // 눈 (붉은 눈)
    vg.fillStyle(0xff0000)
    vg.fillCircle(13, 11, 4)
    vg.fillCircle(23, 11, 4)
    vg.fillStyle(0x440000)
    vg.fillCircle(14, 11, 2)
    vg.fillCircle(24, 11, 2)
    // 송곳니
    vg.fillStyle(0xffffff)
    vg.fillTriangle(15, 22, 13, 27, 17, 27)
    vg.fillTriangle(21, 22, 19, 27, 23, 27)
    vg.generateTexture('skin_vampire', 36, 36)
    vg.destroy()

    // ── 스킨: ghost (유령 - 흰 물방울 + 눈) ──
    const gg2 = this.make.graphics({ add: false })
    // 몸통 (물방울형)
    gg2.fillStyle(0xddeeff, 0.9)
    gg2.fillCircle(18, 14, 13)
    gg2.fillRect(5, 14, 26, 16)
    // 아래 물결
    gg2.fillStyle(0x0a0a1e)
    gg2.fillCircle(9,  30, 5)
    gg2.fillCircle(18, 32, 5)
    gg2.fillCircle(27, 30, 5)
    // 눈 (검은 동그라미)
    gg2.fillStyle(0x334455)
    gg2.fillEllipse(13, 13, 8, 10)
    gg2.fillEllipse(23, 13, 8, 10)
    gg2.fillStyle(0xffffff)
    gg2.fillCircle(14, 11, 2)
    gg2.fillCircle(24, 11, 2)
    gg2.generateTexture('skin_ghost', 36, 36)
    gg2.destroy()

    // ── 스킨: gold (황금 기사 - 금빛 갑옷) ──
    const goldg = this.make.graphics({ add: false })
    // 갑옷 몸체
    goldg.fillStyle(0xcc9900)
    goldg.fillRoundedRect(6, 14, 24, 20, 4)
    // 투구
    goldg.fillStyle(0xffcc00)
    goldg.fillCircle(18, 13, 13)
    goldg.fillStyle(0xcc9900)
    goldg.fillRect(5, 11, 26, 6)
    // 눈 틈
    goldg.fillStyle(0x000000)
    goldg.fillRect(10, 12, 6, 3)
    goldg.fillRect(20, 12, 6, 3)
    // 광택
    goldg.fillStyle(0xffee88)
    goldg.fillCircle(12, 8, 4)
    goldg.generateTexture('skin_gold', 36, 36)
    goldg.destroy()

    // ── 스킨: shadow (그림자 - 보라 실루엣 + 빛나는 눈) ──
    const sg = this.make.graphics({ add: false })
    // 몸체 실루엣
    sg.fillStyle(0x220044)
    sg.fillCircle(18, 15, 14)
    sg.fillRoundedRect(7, 15, 22, 18, 3)
    // 빛나는 보라 눈
    sg.fillStyle(0xdd00ff)
    sg.fillCircle(13, 13, 5)
    sg.fillCircle(23, 13, 5)
    sg.fillStyle(0xffffff)
    sg.fillCircle(13, 12, 2)
    sg.fillCircle(23, 12, 2)
    // 안개 효과 (반투명 테두리)
    sg.lineStyle(3, 0x8800cc, 0.6)
    sg.strokeCircle(18, 15, 14)
    sg.generateTexture('skin_shadow', 36, 36)
    sg.destroy()

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

    // ── Boss enemy (큰 보스 몬스터) ──
    const bg2 = this.make.graphics({ add: false })
    // 몸체
    bg2.fillStyle(0x660000)
    bg2.fillRoundedRect(4, 14, 72, 58, 8)
    // 머리
    bg2.fillStyle(0x880000)
    bg2.fillCircle(40, 22, 22)
    // 뿔
    bg2.fillStyle(0x440000)
    bg2.fillTriangle(26, 8, 22, -4, 32, 8)
    bg2.fillTriangle(54, 8, 58, -4, 48, 8)
    // 눈 (빛나는 빨간 눈)
    bg2.fillStyle(0xff0000)
    bg2.fillCircle(30, 20, 8)
    bg2.fillCircle(50, 20, 8)
    bg2.fillStyle(0xff6666)
    bg2.fillCircle(30, 18, 4)
    bg2.fillCircle(50, 18, 4)
    // 입
    bg2.fillStyle(0xffcc00)
    bg2.fillRect(28, 32, 24, 4)
    // 발톱
    bg2.fillStyle(0x550000)
    bg2.fillTriangle(8, 72, 14, 60, 20, 72)
    bg2.fillTriangle(24, 72, 30, 62, 36, 72)
    bg2.fillTriangle(44, 72, 50, 62, 56, 72)
    bg2.fillTriangle(60, 72, 66, 60, 72, 72)
    bg2.generateTexture('enemy_boss', 80, 80)
    bg2.destroy()

    // ── Truck (트럭) ──
    const trg = this.make.graphics({ add: false })
    // 트럭 본체
    trg.fillStyle(0xcc4400)
    trg.fillRoundedRect(0, 8, 110, 36, 5)
    // 운전석
    trg.fillStyle(0xff6600)
    trg.fillRoundedRect(82, 2, 36, 42, 5)
    // 창문
    trg.fillStyle(0x88ccff)
    trg.fillRect(88, 6, 26, 16)
    // 바퀴
    trg.fillStyle(0x222222)
    trg.fillCircle(22, 46, 12)
    trg.fillCircle(65, 46, 12)
    trg.fillCircle(100, 46, 12)
    trg.fillStyle(0x666666)
    trg.fillCircle(22, 46, 6)
    trg.fillCircle(65, 46, 6)
    trg.fillCircle(100, 46, 6)
    // 헤드라이트
    trg.fillStyle(0xffff88)
    trg.fillRect(114, 10, 6, 8)
    trg.fillRect(114, 28, 6, 8)
    trg.generateTexture('truck', 122, 58)
    trg.destroy()

    // ── Storm Cloud (먹구름) ──
    const clg = this.make.graphics({ add: false })
    clg.fillStyle(0x1a2a3a, 0.95)
    clg.fillEllipse(36, 22, 52, 30)
    clg.fillEllipse(18, 28, 38, 26)
    clg.fillEllipse(54, 28, 38, 26)
    clg.fillStyle(0x0d1a28, 0.92)
    clg.fillEllipse(36, 34, 64, 20)
    clg.lineStyle(2, 0x3366aa, 0.7)
    clg.strokeEllipse(36, 22, 52, 30)
    clg.fillStyle(0x3a5a7a, 0.5)
    clg.fillEllipse(28, 16, 24, 14)
    clg.generateTexture('cloud_storm', 72, 46)
    clg.destroy()

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
