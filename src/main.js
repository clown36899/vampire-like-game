import Phaser from 'phaser'
import BootScene from './scenes/BootScene.js'
import MenuScene from './scenes/MenuScene.js'
import GameScene from './scenes/GameScene.js'
import LevelUpScene from './scenes/LevelUpScene.js'
import GameOverScene from './scenes/GameOverScene.js'

// Retina/HiDPI 대응: 물리 픽셀 해상도로 렌더링
const dpr = window.devicePixelRatio || 1
const BASE_W = 960
const BASE_H = 540

const config = {
  type: Phaser.AUTO,
  backgroundColor: '#1a1a2e',
  antialias: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width:  BASE_W * dpr,
    height: BASE_H * dpr,
    zoom: 1 / dpr          // CSS 표시 크기는 BASE_W x BASE_H 유지
  },
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: [BootScene, MenuScene, GameScene, LevelUpScene, GameOverScene]
}

export default new Phaser.Game(config)
