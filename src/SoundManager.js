/**
 * Web Audio API 기반 절차적 사운드 생성기
 * 오디오 파일 없이 코드로 효과음 생성
 */
export default class SoundManager {
  constructor() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)()
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.value = 0.6
      this.masterGain.connect(this.ctx.destination)
    } catch (e) {
      this.ctx = null
    }
  }

  // 브라우저 정책: 첫 유저 상호작용 후 오디오 활성화
  resume() {
    if (this.ctx?.state === 'suspended') this.ctx.resume()
  }

  _out() { return this.masterGain }

  _play(fn) {
    if (!this.ctx) return
    try { fn() } catch (e) {}
  }

  // ── 볼트 발사 ──
  shoot() {
    this._play(() => {
      const t = this.ctx.currentTime
      const o = this.ctx.createOscillator()
      const g = this.ctx.createGain()
      o.type = 'square'
      o.frequency.setValueAtTime(900, t)
      o.frequency.exponentialRampToValueAtTime(200, t + 0.09)
      g.gain.setValueAtTime(0.12, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.1)
      o.connect(g); g.connect(this._out())
      o.start(t); o.stop(t + 0.1)
    })
  }

  // ── 적 피격 ──
  hit() {
    this._play(() => {
      const t = this.ctx.currentTime
      const o = this.ctx.createOscillator()
      const g = this.ctx.createGain()
      o.type = 'sawtooth'
      o.frequency.setValueAtTime(180, t)
      o.frequency.exponentialRampToValueAtTime(60, t + 0.07)
      g.gain.setValueAtTime(0.08, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.07)
      o.connect(g); g.connect(this._out())
      o.start(t); o.stop(t + 0.07)
    })
  }

  // ── 적 처치 ──
  kill() {
    this._play(() => {
      const t = this.ctx.currentTime
      // 짧은 상승 음
      const o = this.ctx.createOscillator()
      const g = this.ctx.createGain()
      o.type = 'sine'
      o.frequency.setValueAtTime(300, t)
      o.frequency.exponentialRampToValueAtTime(700, t + 0.08)
      g.gain.setValueAtTime(0.18, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.14)
      o.connect(g); g.connect(this._out())
      o.start(t); o.stop(t + 0.14)
    })
  }

  // ── XP 젬 수집 ──
  gem() {
    this._play(() => {
      const t = this.ctx.currentTime
      const o = this.ctx.createOscillator()
      const g = this.ctx.createGain()
      o.type = 'sine'
      o.frequency.setValueAtTime(1400, t)
      o.frequency.exponentialRampToValueAtTime(2800, t + 0.04)
      g.gain.setValueAtTime(0.07, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.06)
      o.connect(g); g.connect(this._out())
      o.start(t); o.stop(t + 0.06)
    })
  }

  // ── 레벨업 팡파레 ──
  levelUp() {
    this._play(() => {
      const notes = [523, 659, 784, 1047]  // C4 E4 G4 C5
      notes.forEach((freq, i) => {
        const t = this.ctx.currentTime + i * 0.11
        const o = this.ctx.createOscillator()
        const g = this.ctx.createGain()
        o.type = 'sine'
        o.frequency.setValueAtTime(freq, t)
        g.gain.setValueAtTime(0, t)
        g.gain.linearRampToValueAtTime(0.25, t + 0.02)
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.22)
        o.connect(g); g.connect(this._out())
        o.start(t); o.stop(t + 0.22)
      })
    })
  }

  // ── 플레이어 피격 ──
  playerHit() {
    this._play(() => {
      const t = this.ctx.currentTime
      // 화이트 노이즈 버스트
      const size = Math.floor(this.ctx.sampleRate * 0.09)
      const buf  = this.ctx.createBuffer(1, size, this.ctx.sampleRate)
      const data = buf.getChannelData(0)
      for (let i = 0; i < size; i++) data[i] = (Math.random() * 2 - 1)
      const src = this.ctx.createBufferSource()
      src.buffer = buf
      const g = this.ctx.createGain()
      g.gain.setValueAtTime(0.35, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.09)
      src.connect(g); g.connect(this._out())
      src.start(t); src.stop(t + 0.09)
    })
  }

  // ── 게임 오버 ──
  gameOver() {
    this._play(() => {
      const notes = [400, 300, 200, 100]
      notes.forEach((freq, i) => {
        const t = this.ctx.currentTime + i * 0.18
        const o = this.ctx.createOscillator()
        const g = this.ctx.createGain()
        o.type = 'sawtooth'
        o.frequency.setValueAtTime(freq, t)
        g.gain.setValueAtTime(0.2, t)
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.25)
        o.connect(g); g.connect(this._out())
        o.start(t); o.stop(t + 0.25)
      })
    })
  }

  // ── 승리 ──
  victory() {
    this._play(() => {
      const melody = [523, 659, 784, 659, 784, 1047]
      melody.forEach((freq, i) => {
        const t = this.ctx.currentTime + i * 0.13
        const o = this.ctx.createOscillator()
        const g = this.ctx.createGain()
        o.type = 'sine'
        o.frequency.setValueAtTime(freq, t)
        g.gain.setValueAtTime(0.22, t)
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
        o.connect(g); g.connect(this._out())
        o.start(t); o.stop(t + 0.2)
      })
    })
  }
}
