import Phaser from 'phaser'

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot')
  }

  preload() {
    this.load.image('enemy_normal', 'assets/enemy_normal.png')
    this.load.image('enemy_fast',   'assets/enemy_fast.png')
    this.load.image('enemy_tank',   'assets/enemy_tank.png')
    this.load.image('enemy_boss',   'assets/enemy_boss.png')
    this.load.image('gem',          'assets/gem.png')
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

    // enemy_normal, enemy_fast, enemy_tank, gem, enemy_boss → preload()에서 이미지 로드

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

    // enemy_boss → preload()에서 이미지 로드

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

    // ── 캐릭터 스킨: warrior (붉은 전사) ──
    const warg = this.make.graphics({ add: false })
    // 몸 (붉은 갑옷)
    warg.fillStyle(0xcc3300)
    warg.fillRoundedRect(7, 16, 22, 18, 3)
    // 어깨 패드
    warg.fillStyle(0xff4400)
    warg.fillRoundedRect(3, 14, 8, 8, 2)
    warg.fillRoundedRect(25, 14, 8, 8, 2)
    // 투구
    warg.fillStyle(0xaa2200)
    warg.fillCircle(18, 13, 12)
    warg.fillStyle(0xff5500)
    warg.fillRect(7, 10, 22, 5)
    // 눈 (노란 눈)
    warg.fillStyle(0xffcc00)
    warg.fillCircle(13, 12, 3)
    warg.fillCircle(23, 12, 3)
    warg.fillStyle(0x993300)
    warg.fillCircle(13, 12, 1)
    warg.fillCircle(23, 12, 1)
    warg.generateTexture('char_warrior', 36, 36)
    warg.destroy()

    // ── 캐릭터 스킨: mage (보라 마법사) ──
    const magg = this.make.graphics({ add: false })
    // 뾰족 모자
    magg.fillStyle(0x6600cc)
    magg.fillTriangle(18, 0, 8, 14, 28, 14)
    magg.fillStyle(0x9922ff)
    magg.fillRect(8, 12, 20, 3)
    // 몸 (로브)
    magg.fillStyle(0x440099)
    magg.fillRoundedRect(8, 17, 20, 18, 4)
    // 얼굴
    magg.fillStyle(0xddbbff)
    magg.fillCircle(18, 17, 9)
    // 빛나는 마법 눈
    magg.fillStyle(0xcc44ff)
    magg.fillCircle(13, 15, 3)
    magg.fillCircle(23, 15, 3)
    magg.fillStyle(0xffffff)
    magg.fillCircle(13, 14, 1)
    magg.fillCircle(23, 14, 1)
    // 마법 룬 (별)
    magg.fillStyle(0xffcc00)
    magg.fillCircle(18, 30, 3)
    magg.generateTexture('char_mage', 36, 36)
    magg.destroy()

    // ── 캐릭터 스킨: rogue (초록 도적) ──
    const rogg = this.make.graphics({ add: false })
    // 후드
    rogg.fillStyle(0x1a4422)
    rogg.fillCircle(18, 14, 13)
    rogg.fillTriangle(8, 14, 28, 14, 18, 2)
    // 몸 (어두운 녹색)
    rogg.fillStyle(0x224433)
    rogg.fillRoundedRect(9, 18, 18, 17, 3)
    // 얼굴 (어두움)
    rogg.fillStyle(0x1a3322)
    rogg.fillCircle(18, 15, 8)
    // 빛나는 초록 눈
    rogg.fillStyle(0x00ff88)
    rogg.fillCircle(13, 14, 3)
    rogg.fillCircle(23, 14, 3)
    rogg.fillStyle(0xaaffcc)
    rogg.fillCircle(13, 13, 1)
    rogg.fillCircle(23, 13, 1)
    // 단검 흔적 (옆에 칼 표시)
    rogg.fillStyle(0x88aaee)
    rogg.fillRect(4, 20, 5, 1)
    rogg.fillRect(27, 20, 5, 1)
    rogg.generateTexture('char_rogue', 36, 36)
    rogg.destroy()

    // ── 캐릭터 스킨: priest (흰 성직자) ──
    const prig = this.make.graphics({ add: false })
    // 후광 (헤일로)
    prig.lineStyle(3, 0xffee44, 0.9)
    prig.strokeEllipse(18, 8, 28, 10)
    prig.fillStyle(0xffee44, 0.25)
    prig.fillEllipse(18, 8, 28, 10)
    // 로브 몸
    prig.fillStyle(0xeeeeff)
    prig.fillRoundedRect(8, 17, 20, 18, 4)
    // 얼굴
    prig.fillStyle(0xfff5ee)
    prig.fillCircle(18, 16, 10)
    // 온화한 파란 눈
    prig.fillStyle(0x6688ff)
    prig.fillCircle(13, 14, 3)
    prig.fillCircle(23, 14, 3)
    prig.fillStyle(0xffffff)
    prig.fillCircle(13, 13, 1)
    prig.fillCircle(23, 13, 1)
    // 가슴 십자가
    prig.fillStyle(0xffcc44)
    prig.fillRect(17, 21, 3, 9)
    prig.fillRect(13, 24, 11, 3)
    prig.generateTexture('char_priest', 36, 36)
    prig.destroy()

    // ── 전사 스킨: dark (암흑 강철 갑옷) ──
    const wardg = this.make.graphics({ add: false })
    wardg.fillStyle(0x1a1a2a); wardg.fillRoundedRect(7, 16, 22, 18, 3)
    wardg.fillStyle(0x111122); wardg.fillRoundedRect(3, 14, 8, 8, 2); wardg.fillRoundedRect(25, 14, 8, 8, 2)
    wardg.fillStyle(0x0d0d1a); wardg.fillCircle(18, 13, 12)
    wardg.fillStyle(0x222233); wardg.fillRect(7, 10, 22, 5)
    wardg.fillStyle(0x9900ff); wardg.fillCircle(13, 12, 3); wardg.fillCircle(23, 12, 3)
    wardg.fillStyle(0xffffff); wardg.fillCircle(13, 12, 1); wardg.fillCircle(23, 12, 1)
    wardg.generateTexture('char_warrior_dark', 36, 36); wardg.destroy()

    // ── 전사 스킨: gold (황금 갑옷) ──
    const wargg = this.make.graphics({ add: false })
    wargg.fillStyle(0xaa7700); wargg.fillRoundedRect(7, 16, 22, 18, 3)
    wargg.fillStyle(0xffcc00); wargg.fillRoundedRect(3, 14, 8, 8, 2); wargg.fillRoundedRect(25, 14, 8, 8, 2)
    wargg.fillStyle(0x886600); wargg.fillCircle(18, 13, 12)
    wargg.fillStyle(0xffdd44); wargg.fillRect(7, 10, 22, 5)
    wargg.fillStyle(0xff2200); wargg.fillCircle(13, 12, 3); wargg.fillCircle(23, 12, 3)
    wargg.fillStyle(0xffaaaa); wargg.fillCircle(13, 12, 1); wargg.fillCircle(23, 12, 1)
    wargg.generateTexture('char_warrior_gold', 36, 36); wargg.destroy()

    // ── 마법사 스킨: fire (화염 마법사) ──
    const magfg = this.make.graphics({ add: false })
    magfg.fillStyle(0x660000); magfg.fillTriangle(18, 0, 8, 14, 28, 14)
    magfg.fillStyle(0xff4400); magfg.fillRect(8, 12, 20, 3)
    magfg.fillStyle(0x330000); magfg.fillRoundedRect(8, 17, 20, 18, 4)
    magfg.fillStyle(0xffddaa); magfg.fillCircle(18, 17, 9)
    magfg.fillStyle(0xff6600); magfg.fillCircle(13, 15, 3); magfg.fillCircle(23, 15, 3)
    magfg.fillStyle(0xffff88); magfg.fillCircle(13, 14, 1); magfg.fillCircle(23, 14, 1)
    magfg.fillStyle(0xff2200); magfg.fillCircle(18, 30, 3)
    magfg.generateTexture('char_mage_fire', 36, 36); magfg.destroy()

    // ── 마법사 스킨: ice (빙결 마법사) ──
    const magig = this.make.graphics({ add: false })
    magig.fillStyle(0x001166); magig.fillTriangle(18, 0, 8, 14, 28, 14)
    magig.fillStyle(0x3388ff); magig.fillRect(8, 12, 20, 3)
    magig.fillStyle(0x001144); magig.fillRoundedRect(8, 17, 20, 18, 4)
    magig.fillStyle(0xccddff); magig.fillCircle(18, 17, 9)
    magig.fillStyle(0x44aaff); magig.fillCircle(13, 15, 3); magig.fillCircle(23, 15, 3)
    magig.fillStyle(0xffffff); magig.fillCircle(13, 14, 1); magig.fillCircle(23, 14, 1)
    magig.fillStyle(0xaaeeff); magig.fillCircle(18, 30, 3)
    magig.generateTexture('char_mage_ice', 36, 36); magig.destroy()

    // ── 도적 스킨: shadow (그림자 도적) ──
    const rogsg = this.make.graphics({ add: false })
    rogsg.fillStyle(0x110022); rogsg.fillCircle(18, 14, 13); rogsg.fillTriangle(8, 14, 28, 14, 18, 2)
    rogsg.fillStyle(0x1a0033); rogsg.fillRoundedRect(9, 18, 18, 17, 3)
    rogsg.fillStyle(0x080011); rogsg.fillCircle(18, 15, 8)
    rogsg.fillStyle(0x9900ff); rogsg.fillCircle(13, 14, 3); rogsg.fillCircle(23, 14, 3)
    rogsg.fillStyle(0xdd88ff); rogsg.fillCircle(13, 13, 1); rogsg.fillCircle(23, 13, 1)
    rogsg.generateTexture('char_rogue_shadow', 36, 36); rogsg.destroy()

    // ── 도적 스킨: poison (독 도적) ──
    const rogpg = this.make.graphics({ add: false })
    rogpg.fillStyle(0x334400); rogpg.fillCircle(18, 14, 13); rogpg.fillTriangle(8, 14, 28, 14, 18, 2)
    rogpg.fillStyle(0x2a3300); rogpg.fillRoundedRect(9, 18, 18, 17, 3)
    rogpg.fillStyle(0x1a2200); rogpg.fillCircle(18, 15, 8)
    rogpg.fillStyle(0xaaff00); rogpg.fillCircle(13, 14, 3); rogpg.fillCircle(23, 14, 3)
    rogpg.fillStyle(0xeeffaa); rogpg.fillCircle(13, 13, 1); rogpg.fillCircle(23, 13, 1)
    rogpg.generateTexture('char_rogue_poison', 36, 36); rogpg.destroy()

    // ── 성직자 스킨: dark (암흑 성직자) ──
    const pridg = this.make.graphics({ add: false })
    pridg.lineStyle(3, 0x444444, 0.6); pridg.strokeEllipse(18, 8, 28, 10)
    pridg.fillStyle(0x444444, 0.2); pridg.fillEllipse(18, 8, 28, 10)
    pridg.fillStyle(0x1a001a); pridg.fillRoundedRect(8, 17, 20, 18, 4)
    pridg.fillStyle(0xccaacc); pridg.fillCircle(18, 16, 10)
    pridg.fillStyle(0x8800cc); pridg.fillCircle(13, 14, 3); pridg.fillCircle(23, 14, 3)
    pridg.fillStyle(0xffaaff); pridg.fillCircle(13, 13, 1); pridg.fillCircle(23, 13, 1)
    pridg.fillStyle(0x880000); pridg.fillRect(17, 21, 3, 9); pridg.fillRect(13, 24, 11, 3)
    pridg.generateTexture('char_priest_dark', 36, 36); pridg.destroy()

    // ── 성직자 스킨: fire (불꽃 성직자) ──
    const prifg = this.make.graphics({ add: false })
    prifg.lineStyle(3, 0xff6600, 0.9); prifg.strokeEllipse(18, 8, 28, 10)
    prifg.fillStyle(0xff6600, 0.25); prifg.fillEllipse(18, 8, 28, 10)
    prifg.fillStyle(0x441100); prifg.fillRoundedRect(8, 17, 20, 18, 4)
    prifg.fillStyle(0xffddaa); prifg.fillCircle(18, 16, 10)
    prifg.fillStyle(0xff4400); prifg.fillCircle(13, 14, 3); prifg.fillCircle(23, 14, 3)
    prifg.fillStyle(0xffff88); prifg.fillCircle(13, 13, 1); prifg.fillCircle(23, 13, 1)
    prifg.fillStyle(0xffaa00); prifg.fillRect(17, 21, 3, 9); prifg.fillRect(13, 24, 11, 3)
    prifg.generateTexture('char_priest_fire', 36, 36); prifg.destroy()

    // ── Dagger (단검 - 얇고 날카로운 은빛 단검) ──
    const dg = this.make.graphics({ add: false })
    dg.fillStyle(0xccddff)
    dg.fillRect(0, 4, 26, 4)          // 칼날
    dg.fillStyle(0xffffff)
    dg.fillRect(2, 5, 16, 2)          // 하이라이트
    dg.fillStyle(0x88aaee)
    dg.fillTriangle(26, 2, 26, 10, 36, 6)  // 날카로운 끝
    dg.fillStyle(0x886644)
    dg.fillRect(0, 3, 5, 6)           // 손잡이
    dg.generateTexture('dagger', 38, 12)
    dg.destroy()

    // ── Ice Lance (빙창 - 파란 얼음 창) ──
    const ilg = this.make.graphics({ add: false })
    ilg.fillStyle(0x44aaff, 0.85)
    ilg.fillRect(0, 3, 32, 6)         // 창대
    ilg.fillStyle(0xaaddff)
    ilg.fillRect(2, 4, 20, 4)         // 하이라이트
    ilg.fillStyle(0x88eeff)
    ilg.fillTriangle(32, 0, 32, 12, 44, 6)  // 창끝
    ilg.fillStyle(0xffffff, 0.6)
    ilg.fillTriangle(34, 3, 34, 9, 40, 6)   // 얼음 광택
    ilg.generateTexture('ice_lance', 46, 12)
    ilg.destroy()

    // ── Plasma Orb (플라즈마 구슬 - 마젠타/청록 에너지 구체) ──
    const pog = this.make.graphics({ add: false })
    // 외곽 에너지 링
    pog.lineStyle(3, 0x00ffff, 0.7)
    pog.strokeCircle(16, 16, 14)
    // 핵심 에너지 구체
    pog.fillStyle(0xff00ff, 0.9)
    pog.fillCircle(16, 16, 10)
    pog.fillStyle(0xff88ff)
    pog.fillCircle(16, 16, 6)
    // 중심 백색 코어
    pog.fillStyle(0xffffff)
    pog.fillCircle(16, 16, 3)
    // 전기 스파크 (십자)
    pog.lineStyle(1, 0x00ffff, 0.9)
    pog.lineBetween(16, 2, 16, 30)
    pog.lineBetween(2, 16, 30, 16)
    pog.generateTexture('plasma_orb', 32, 32)
    pog.destroy()

    // ── Plasma Bolt (플라즈마 볼트 - 길쭉한 에너지 발사체) ──
    const pbg = this.make.graphics({ add: false })
    // 외곽 에너지 궤적
    pbg.fillStyle(0x440066)
    pbg.fillEllipse(20, 6, 40, 12)
    // 중간 층
    pbg.fillStyle(0xff00ff)
    pbg.fillEllipse(20, 6, 32, 8)
    // 밝은 코어
    pbg.fillStyle(0xffffff)
    pbg.fillEllipse(20, 6, 20, 5)
    // 앞쪽 끝 (화살촉)
    pbg.fillStyle(0x00ffff)
    pbg.fillTriangle(38, 2, 38, 10, 46, 6)
    pbg.generateTexture('plasma_bolt', 48, 12)
    pbg.destroy()

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
