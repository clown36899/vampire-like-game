// 영속 데이터 관리 (localStorage)
export const Store = {
  getCoins:        ()    => parseInt(localStorage.getItem('vs_coins') || '0'),
  setCoins:        (v)   => localStorage.setItem('vs_coins', String(v)),
  addCoins:        (v)   => Store.setCoins(Store.getCoins() + v),
  getOwnedSkins:   ()    => JSON.parse(localStorage.getItem('vs_owned_skins') || '["default"]'),
  addSkin:         (id)  => { const s = Store.getOwnedSkins(); if (!s.includes(id)) { s.push(id); localStorage.setItem('vs_owned_skins', JSON.stringify(s)) } },
  ownsSkin:        (id)  => Store.getOwnedSkins().includes(id),
  getEquippedSkin: ()    => localStorage.getItem('vs_equipped_skin') || 'default',
  setEquippedSkin: (id)  => localStorage.setItem('vs_equipped_skin', id),
  getOwnedCards:   ()    => JSON.parse(localStorage.getItem('vs_owned_cards') || '[]'),
  addCard:         (id)  => { const c = Store.getOwnedCards(); if (!c.includes(id)) { c.push(id); localStorage.setItem('vs_owned_cards', JSON.stringify(c)) } },
  ownsCard:        (id)  => Store.getOwnedCards().includes(id),
  getDailyDate:    ()    => localStorage.getItem('vs_daily_date') || '',
  setDailyDate:    (d)   => localStorage.setItem('vs_daily_date', d),
  getDailyQuests:  ()    => JSON.parse(localStorage.getItem('vs_daily_quests') || '[]'),
  setDailyQuests:  (q)   => localStorage.setItem('vs_daily_quests', JSON.stringify(q)),
}

export const SKINS = [
  { id: 'default', name: '기본',     emoji: '😐', desc: '기본 캐릭터',          price: 0,   preview: 0x4fc3f7 },
  { id: 'vampire', name: '뱀파이어', emoji: '🧛', desc: '붉은 망토와\n송곳니',   price: 200, preview: 0xcc0000 },
  { id: 'ghost',   name: '유령',     emoji: '👻', desc: '반투명\n유령 형체',     price: 300, preview: 0xaaddff },
  { id: 'gold',    name: '골드',     emoji: '✨', desc: '황금 갑옷\n기사',        price: 500, preview: 0xffcc00 },
  { id: 'shadow',  name: '그림자',   emoji: '🌑', desc: '어둠의\n그림자 존재',   price: 800, preview: 0x8800cc },
]

export const CARDS = [
  { id: 'speed_up',    name: '스피드 카드',  emoji: '💨', desc: '시작시 이동속도 +20%',  price: 150, color: 0x00ccff },
  { id: 'hp_boost',    name: '체력 카드',    emoji: '💪', desc: '시작시 최대 HP +50',    price: 200, color: 0xff4444 },
  { id: 'lucky_start', name: '럭키 스타트',  emoji: '🎰', desc: '시작시 랜덤 무기 Lv1',  price: 350, color: 0xffaa00 },
]
