/*
# Encount.ts

## 概要

- エンカウント時のUI表現

## 考えてる仕様

- 敵は同時に3体までしか出ない。
- 
		// 敵エンカウントグラフィックス表示テスト
		// 味方ステータスより後ろ、3Dシーンの上、マップより後ろである必要がある。
		// 背景を暗くして、3体まで表示する

*/

import Styler from './Styler'
import Bar from './Bar'
import GameEvents from '../Event/GameEvents'

export default class Encount {

	private readonly TEST_SHADOW_CSS = '1px 1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000, 1px 0px 0 #000, -1px 0px 0 #000, 0px 1px 0 #000, 0px -1px 0 #000, 2px 2px 1px #000'

	element: HTMLDivElement
	events: GameEvents

	constructor(events: GameEvents) {
		this.events = events
	}

	encount() {

		this.events.UI.AddMessage.broadcast("モンスターが現れた！")

		const TEST_GRAPHICS = "./monsters/mock/slim.png"
		// const TEST_GRAPHICS = "./monsters/mock/kinoko.png"
		// const TEST_GRAPHICS = "./monsters/mock/tokage.png" //note: 縦200px。iPhoneSEでギリ
		// const TEST_GRAPHICS = "./monsters/mock/rei.png"//TODO: 縦250pxはiPhoneSEで溢れる

		const encountView = new Styler("div").abs().t().l().middle().center().fullWindow().getElement()
		this.element = encountView
		encountView.style.background = "rgba(0,0,0,0.7)"
		encountView.style.alignItems = "center"

		//水平ビューはメッセージビューの余白だけ考慮して下位置合わせ
		const encountViewH = new Styler("div").abs().t().flexHorizontal().appendTo(encountView).getElement()
		encountViewH.style.width = "100%"
		encountViewH.style.bottom = "10%"
		// encountViewH.style.border = "1px solid green"
		encountViewH.style.alignItems = "flex-end"
		encountViewH.style.justifyContent = "space-around"


		// - 3体いた時は後ろ二つは後衛。1体残してちょっと後ろに。
		// - 2体の時はここだけの表現になる。
		for (var i = 0; i < 2; i++) {
			const monster = new Styler("div").flexVertical().center().appendTo(encountViewH).getElement()
			// monster.style.border = "1px solid red"
			monster.style.alignItems = "center"
			monster.style.justifyContent = "center"
			if (i == 0) {
				monster.style.marginBottom = "35px" //後衛の時のみ若干位置あげる
				monster.style.transform = "scale(0.8,0.8)" //後衛の時のみ若干縮小
			} else {
				monster.style.marginBottom = "50px" //後衛の時のみ 最後衛はもう少し位置を上げる
				monster.style.transform = "scale(0.7,0.7)" //後衛の時のみ若干縮小
			}

			const name = new Styler("p").text("スライム").appendTo(monster).getElement()
			//上下左右斜めのシャドウ＋右下にブラー付きのドロップシャドウ
			name.style.textShadow = this.TEST_SHADOW_CSS
			name.style.color = "white"

			const bar = new Bar()
			monster.appendChild(bar.element)
			bar.element.style.width = "50%"
			bar.set(0.9)

			const graphic = new Styler("img").appendTo(monster).getElement()
			graphic.src = TEST_GRAPHICS
			// graphic.style.filter = "contrast(0.5) brightness(0.5)"
			graphic.style.filter = "brightness(0.5)"
		}

		//前衛の表現
		{
			const encountViewFront = new Styler("div").abs().t().flexHorizontal().appendTo(encountView).getElement()
			encountViewFront.style.width = "100%"
			encountViewFront.style.bottom = "10%"
			encountViewFront.style.alignItems = "flex-end"
			encountViewFront.style.justifyContent = "center"
			// encountViewH.style.border = "1px solid blue"

			const monster = new Styler("div").flexVertical().center().appendTo(encountViewFront).getElement()
			// monster.style.border = "1px solid red"
			monster.style.alignItems = "center"

			const name = new Styler("p").text("スライム").appendTo(monster).getElement()
			name.style.textShadow = this.TEST_SHADOW_CSS
			name.style.color = "white"

			const bar = new Bar()
			monster.appendChild(bar.element)
			bar.element.style.width = "50%"
			bar.set(0.9)

			const graphic = new Styler("img").appendTo(monster).getElement()
			graphic.src = TEST_GRAPHICS
		}
	}

}