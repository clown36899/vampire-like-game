import Phaser from 'phaser'

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu')
  }

  create() {
    const { width, height } = this.cameras.main

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a1e)

    // Stars
    for (let i = 0; i < 120; i++) {
      const x = Phaser.Math.Between(0, width)
      const y = Phaser.Math.Between(0, height)
      const r = Phaser.Math.FloatBetween(0.5, 2.5)
      const a = Phaser.Math.FloatBetween(0.3, 1)
      this.add.circle(x, y, r, 0xffffff, a)
    }

    // Title
    this.add.text(width / 2, height / 2 - 120, 'VAMPIRE', {
      fontSize: '64px',
      color: '#ff4444',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5)

    this.add.text(width / 2, height / 2 - 45, 'SURVIVORS', {
      fontSize: '40px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5)

    this.add.text(width / 2, height / 2 + 5, 'CLONE', {
      fontSize: '18px',
      color: '#666666'
    }).setOrigin(0.5)

    // Start button
    const btn = this.add.text(width / 2, height / 2 + 80, '[ 게임 시작 ]', {
      fontSize: '32px',
      color: '#ffff00',
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    btn.on('pointerover', () => btn.setStyle({ color: '#ffffff' }))
    btn.on('pointerout', () => btn.setStyle({ color: '#ffff00' }))
    btn.on('pointerdown', () => this.scene.start('Game'))

    this.tweens.add({
      targets: btn,
      alpha: 0.3,
      duration: 700,
      yoyo: true,
      repeat: -1
    })

    // Controls
    this.add.text(width / 2, height - 50, 'WASD / 방향키로 이동  |  10분 생존 목표', {
      fontSize: '14px',
      color: '#555555'
    }).setOrigin(0.5)

    this.add.text(width / 2, height - 28, '레벨업 시 카드 클릭 or 1/2/3 키로 선택', {
      fontSize: '13px',
      color: '#444444'
    }).setOrigin(0.5)

    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('Game'))
    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('Game'))
  }
}
