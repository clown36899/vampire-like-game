import Phaser from 'phaser'

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver')
  }

  init(data) {
    this.win = data.win
    this.surviveTime = data.time
    this.kills = data.kills
    this.level = data.level
  }

  create() {
    const { width, height } = this.cameras.main

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000)

    const title = this.win ? '🏆 생존 성공!' : '💀 사망'
    const titleColor = this.win ? '#ffff00' : '#ff4444'

    this.add.text(width / 2, height / 2 - 140, title, {
      fontSize: '54px', color: titleColor, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 5
    }).setOrigin(0.5)

    const stats = [
      `⏱  생존 시간:  ${this.surviveTime}`,
      `💀  처치 수:    ${this.kills}`,
      `⬆  최종 레벨:  ${this.level}`
    ]

    stats.forEach((s, i) => {
      this.add.text(width / 2, height / 2 - 40 + i * 50, s, {
        fontSize: '22px', color: '#ffffff'
      }).setOrigin(0.5)
    })

    // Retry
    const retry = this.add.text(width / 2, height / 2 + 130, '[ 다시 시작 ]', {
      fontSize: '30px', color: '#00ff88', fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    retry.on('pointerover', () => retry.setStyle({ color: '#ffffff' }))
    retry.on('pointerout', () => retry.setStyle({ color: '#00ff88' }))
    retry.on('pointerdown', () => this.scene.start('Game'))

    this.tweens.add({ targets: retry, alpha: 0.35, duration: 650, yoyo: true, repeat: -1 })

    // Menu
    const menu = this.add.text(width / 2, height / 2 + 185, '[ 메인 메뉴 ]', {
      fontSize: '18px', color: '#666666'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    menu.on('pointerover', () => menu.setStyle({ color: '#aaaaaa' }))
    menu.on('pointerout', () => menu.setStyle({ color: '#666666' }))
    menu.on('pointerdown', () => this.scene.start('Menu'))

    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('Game'))
    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('Game'))
  }
}
