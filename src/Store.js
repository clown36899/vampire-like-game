// 영속 데이터 관리 (localStorage)
export const Store = {
  getCoins:        ()    => parseInt(localStorage.getItem('vs_coins') || '0'),
  setCoins:        (v)   => localStorage.setItem('vs_coins', String(v)),
  addCoins:        (v)   => Store.setCoins(Store.getCoins() + v),
  getOwnedSkins:   ()    => JSON.parse(localStorage.getItem('vs_owned_skins') || '["default","war_default","mag_default","rog_default","pri_default"]'),
  addSkin:         (id)  => { const s = Store.getOwnedSkins(); if (!s.includes(id)) { s.push(id); localStorage.setItem('vs_owned_skins', JSON.stringify(s)) } },
  ownsSkin:        (id)  => Store.getOwnedSkins().includes(id),
  getEquippedSkin: (charId = 'default') => {
    const fallback = SKINS.find(s => s.charId === charId && s.price === 0)?.id || 'default'
    return localStorage.getItem(`vs_equipped_skin_${charId}`) || fallback
  },
  setEquippedSkin: (charId, skinId) => localStorage.setItem(`vs_equipped_skin_${charId}`, skinId),
  getOwnedCards:   ()    => JSON.parse(localStorage.getItem('vs_owned_cards') || '[]'),
  addCard:         (id)  => { const c = Store.getOwnedCards(); if (!c.includes(id)) { c.push(id); localStorage.setItem('vs_owned_cards', JSON.stringify(c)) } },
  ownsCard:        (id)  => Store.getOwnedCards().includes(id),
  getDailyDate:    ()    => localStorage.getItem('vs_daily_date') || '',
  setDailyDate:    (d)   => localStorage.setItem('vs_daily_date', d),
  getDailyQuests:  ()    => JSON.parse(localStorage.getItem('vs_daily_quests') || '[]'),
  setDailyQuests:  (q)   => localStorage.setItem('vs_daily_quests', JSON.stringify(q)),
  // 캐릭터
  getOwnedChars:   ()    => JSON.parse(localStorage.getItem('vs_owned_chars') || '["default"]'),
  addChar:         (id)  => { const c = Store.getOwnedChars(); if (!c.includes(id)) { c.push(id); localStorage.setItem('vs_owned_chars', JSON.stringify(c)) } },
  ownsChar:        (id)  => Store.getOwnedChars().includes(id),
  getEquippedChar: ()    => localStorage.getItem('vs_equipped_char') || 'default',
  setEquippedChar: (id)  => localStorage.setItem('vs_equipped_char', id),
}

export const SKINS = [
  // ── 기본 캐릭터 전용 ──
  { id: 'default',     charId: 'default', name: '기본',      emoji: '😐', desc: '기본 외형',            price: 0,   preview: 0x4fc3f7, tex: 'player'           },
  { id: 'vampire',     charId: 'default', name: '뱀파이어',  emoji: '🧛', desc: '붉은 망토와\n송곳니',  price: 200, preview: 0xcc0000, tex: 'skin_vampire'     },
  { id: 'ghost',       charId: 'default', name: '유령',      emoji: '👻', desc: '반투명\n유령 형체',    price: 300, preview: 0xaaddff, tex: 'skin_ghost'       },
  { id: 'gold',        charId: 'default', name: '골드',      emoji: '✨', desc: '황금 갑옷\n기사',      price: 500, preview: 0xffcc00, tex: 'skin_gold'        },
  { id: 'shadow',      charId: 'default', name: '그림자',    emoji: '🌑', desc: '어둠의\n그림자 존재',  price: 800, preview: 0x8800cc, tex: 'skin_shadow'      },
  // ── 전사 전용 ──
  { id: 'war_default', charId: 'warrior', name: '붉은 전사', emoji: '⚔️',  desc: '기본 붉은\n강철 갑옷', price: 0,   preview: 0xcc3300, tex: 'char_warrior'     },
  { id: 'war_dark',    charId: 'warrior', name: '암흑 전사', emoji: '🖤',  desc: '어두운\n강철 갑옷',   price: 250, preview: 0x222233, tex: 'char_warrior_dark' },
  { id: 'war_gold',    charId: 'warrior', name: '황금 전사', emoji: '👑',  desc: '황금\n갑옷 전사',     price: 400, preview: 0xffaa00, tex: 'char_warrior_gold' },
  // ── 마법사 전용 ──
  { id: 'mag_default', charId: 'mage',    name: '보라 마법사', emoji: '🧙', desc: '기본 보라\n마법 로브', price: 0,   preview: 0x9944ff, tex: 'char_mage'        },
  { id: 'mag_fire',    charId: 'mage',    name: '화염 마법사', emoji: '🔥', desc: '불꽃\n마법 로브',     price: 250, preview: 0xff4400, tex: 'char_mage_fire'   },
  { id: 'mag_ice',     charId: 'mage',    name: '빙결 마법사', emoji: '❄️', desc: '얼음\n마법 로브',     price: 400, preview: 0x44aaff, tex: 'char_mage_ice'    },
  // ── 도적 전용 ──
  { id: 'rog_default', charId: 'rogue',   name: '초록 도적',   emoji: '🗡️', desc: '기본 어두운\n초록 후드', price: 0,   preview: 0x1a4422, tex: 'char_rogue'      },
  { id: 'rog_shadow',  charId: 'rogue',   name: '그림자 도적', emoji: '🌑', desc: '어두운\n그림자 후드',   price: 250, preview: 0x330033, tex: 'char_rogue_shadow'},
  { id: 'rog_poison',  charId: 'rogue',   name: '독 도적',     emoji: '☠️', desc: '독\n후드',             price: 400, preview: 0x88ff00, tex: 'char_rogue_poison'},
  // ── 성직자 전용 ──
  { id: 'pri_default', charId: 'priest',  name: '빛의 성직자', emoji: '✝️', desc: '기본 흰\n성직자 로브',  price: 0,   preview: 0xeeeeff, tex: 'char_priest'      },
  { id: 'pri_dark',    charId: 'priest',  name: '암흑 성직자', emoji: '⚫', desc: '어두운\n성직자 로브',   price: 250, preview: 0x220044, tex: 'char_priest_dark' },
  { id: 'pri_fire',    charId: 'priest',  name: '불꽃 성직자', emoji: '🔥', desc: '불꽃\n성직자 로브',     price: 400, preview: 0xff4400, tex: 'char_priest_fire' },
]

export const CARDS = [
  { id: 'speed_up',    name: '스피드 카드',  emoji: '💨', desc: '시작시 이동속도 +20%',  price: 150, color: 0x00ccff },
  { id: 'hp_boost',    name: '체력 카드',    emoji: '💪', desc: '시작시 최대 HP +50',    price: 200, color: 0xff4444 },
  { id: 'lucky_start', name: '럭키 스타트',  emoji: '🎰', desc: '시작시 랜덤 무기 Lv1',  price: 350, color: 0xffaa00 },
]

export const CHARACTERS = [
  { id: 'default', name: '기본',   emoji: '😐', desc: '기본 캐릭터\n특수 능력 없음',                                         price: 0,   color: 0x4fc3f7, skin: 'player',
    stats: {} },
  { id: 'warrior', name: '전사',   emoji: '⚔️',  desc: '최대 HP +100  데미지 +20%\n이동속도 -10%',                           price: 300, color: 0xff6644, skin: 'char_warrior',
    stats: { maxHpBonus: 100, damageMult: 1.2, speedMult: 0.9 } },
  { id: 'mage',    name: '마법사', emoji: '🧙',  desc: '시작시 구슬 Lv1  데미지 +30%\n최대 HP -50',                          price: 300, color: 0x9944ff, skin: 'char_mage',
    stats: { maxHpBonus: -50, damageMult: 1.3, startWeapon: 'orb' } },
  { id: 'rogue',   name: '도적',   emoji: '🗡️',  desc: '시작시 단검 Lv1  이동속도 +25%\n최대 HP -30',                        price: 300, color: 0x44ff88, skin: 'char_rogue',
    stats: { maxHpBonus: -30, speedMult: 1.25, startWeapon: 'dagger' } },
  { id: 'priest',  name: '성직자', emoji: '✝️',  desc: '시작시 마늘 Lv1  레벨업시 HP +20\n데미지 -10%',                      price: 300, color: 0xffffaa, skin: 'char_priest',
    stats: { damageMult: 0.9, startWeapon: 'garlic', healOnLevelUp: 20 } },
]
