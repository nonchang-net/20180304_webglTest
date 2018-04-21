/*
# Encount.ts

## 概要

- エンカウント時のUI表現

## 考えてる仕様

- 敵は同時に3体までしか出ない。
- 後ろのは若干暗く表示。
	- 通路にいい感じに乗ってるように見えると理想。
- 壁際でヘンな表示になるのは妥協。

## 実装状況と現状


## 明らかなTODO

- ゲームとしてエンカウントしたり倒したりという画面遷移がまだできてない。順次整理

- ある程度はレスポンシブにしたい
	- そのためには3D表示自体のレスポンシブをもうちょい考えないと行けなさそう。。

- ターゲット選択時は下部ボタンからでも、画面上の敵グラフィックスからでも行けるようにしたい。

- 敵個別のエフェクト
	- 攻撃してきたエフェクト
		- 赤点滅で考えて見たい。でもCSS Filterでは色乗せがないな……
			https://www.nishishi.com/css/colorfilter-over-image.html
			- boxカラーと半透明での表現。そうじゃないんだよなぁ……。
			https://www.web-myoko.net/blog/web-production/css-background-blend-mode/
			- background-blend-mode。そんなのがあるのか。
			- じゃあ、filterで白飛ばししてからredで乗算かければ行けるかも……？
	- 

*/

import Styler from './Styler'
import Bar from './Bar'
import GameEvents from '../Event/GameEvents'
import Tween from '../Common/Tween'
import UI from './UI'
import Popup from './Popup'

export default class Encount {

	private readonly TEST_GRAPHICS = "./monsters/mock/slim.png"
	// rivate readonly TEST_GRAPHICS = "./monsters/mock/kinoko.png"
	// rivate readonly TEST_GRAPHICS = "./monsters/mock/tokage.png" //note: 縦200px。iPhoneSEでギリ
	// rivate readonly TEST_GRAPHICS = "./monsters/mock/rei.png"//TODO: 縦250pxはiPhoneSEで溢れる

	private readonly TEST_SHADOW_CSS = '1px 1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000, 1px 0px 0 #000, -1px 0px 0 #000, 0px 1px 0 #000, 0px -1px 0 #000, 2px 2px 1px #000'

	element: HTMLDivElement
	contents: HTMLDivElement
	events: GameEvents
	ui: UI

	constructor(events: GameEvents, ui: UI) {
		this.events = events
		this.ui = ui
		this.element = new Styler("div").abs().t().l().middle().center().fullWindow().getElement()
		this.element.style.alignItems = "center"
		this.element.style.display = "none"
	}

	// async encount(monsters: Array<Monster>) {
	async encount(monsters: any): Promise<{}> {

		// エンカウント中はキーボードとスワイプ操作禁止
		this.events.UI.TouchAndKeyboardSwitch.broadcast(false)

		// 演出完了までボタンも一切禁止
		this.events.UI.BottomButtonSwitch.broadcast(false)

		// DOMクリア対象
		this.contents = new Styler("div").abs().fullWindow().flexHorizontal().appendTo(this.element).getElement()
		this.contents.style.alignItems = "flex-end"
		this.contents.style.justifyContent = "space-around"

		// 背景黒塗り
		this.element.style.background = `rgba(0,0,0,0.7)`

		// フラッシュ開始準備
		// this.contents.style.background = `rgba(255,255,255,0.6)`

		// 白フラッシュフェード開始
		this.element.style.display = "block"
		await this.encountFade()


		//水平ビューはメッセージビューの余白だけ考慮して下位置合わせ
		const encountViewH = new Styler("div").abs().t().flexHorizontal().appendTo(this.contents).getElement()
		encountViewH.style.alignItems = "flex-end"
		encountViewH.style.justifyContent = "space-around"
		encountViewH.style.bottom = "10%"
		// encountViewH.style.border = "1px solid green"


		// - 3体いた時は後ろ二つは後衛。1体残してちょっと後ろに。
		// - 2体の時はここだけの表現になる。
		for (var i = 0; i < 2; i++) {
			const monster = new Styler("div").flexVertical().center().appendTo(encountViewH).getElement()
			monster.style.marginBottom = "35px" //後衛の時のみ若干位置あげる
			monster.style.alignItems = "center"
			monster.style.justifyContent = "center"
			// monster.style.border = "1px solid red"

			const name = new Styler("p").text("スライム").appendTo(monster).getElement()
			//上下左右斜めのシャドウ＋右下にブラー付きのドロップシャドウ
			name.style.textShadow = this.TEST_SHADOW_CSS
			name.style.color = "white"

			const bar = new Bar()
			monster.appendChild(bar.element)
			bar.element.style.width = "50%"
			bar.set(0.9)

			const graphic = new Styler("img").appendTo(monster).getElement()
			graphic.src = this.TEST_GRAPHICS
			if (i == 0) {
				monster.style.marginBottom = "35px" //後衛の時のみ若干位置あげる
				monster.style.transform = "scale(0.8,0.8)" //後衛の時のみ若干縮小
				// graphic.style.filter = "contrast(0.5) brightness(0.5)"
				graphic.style.filter = "brightness(0.5)"
			} else {
				monster.style.marginBottom = "50px" //後衛の時のみ 最後衛はもう少し位置を上げる
				monster.style.transform = "scale(0.7,0.7)" //後衛の時のみ若干縮小
				graphic.style.filter = "brightness(0.3)"
			}
		}

		//前衛の表現
		{
			const encountViewFront = new Styler("div").abs().t().flexHorizontal().appendTo(encountViewH).getElement()
			encountViewFront.style.width = "100%"
			encountViewFront.style.bottom = "0"
			encountViewFront.style.alignItems = "flex-end"
			encountViewFront.style.justifyContent = "center"
			// this.contents.style.border = "1px solid blue"

			const monster = new Styler("div").flexVertical().center().appendTo(encountViewFront).getElement()
			monster.style.alignItems = "center"
			// monster.style.border = "1px solid red"

			const name = new Styler("p").text("スライム").appendTo(monster).getElement()
			name.style.textShadow = this.TEST_SHADOW_CSS
			name.style.color = "white"

			const bar = new Bar()
			monster.appendChild(bar.element)
			bar.element.style.width = "50%"
			bar.set(0.9)

			const graphic = new Styler("img").appendTo(monster).getElement()
			graphic.src = this.TEST_GRAPHICS
		}

		this.events.UI.AddMessage.broadcast("モンスターが現れた！")
		this.events.UI.AddMessage.broadcast("[ステラのターンです。コマンドを入力してください]")

		//下部ボタン隠す
		await this.ui.buttons.hide()

		// 下部ボタンだけ入力制限解除
		this.events.UI.BottomButtonSwitch.broadcast(true)

		return new Promise((resolve) => {
			this.ui.buttons.update({
				rows: [
					{ //row 1
						buttons: [
							{
								text: "防御",
								onclick: () => {
									this.events.UI.AddMessage.broadcast("[未実装です。]")
								}
							},
							{
								text: "戦う",
								onclick: async () => {
									this.events.UI.AddMessage.broadcast("DEBUG: 敵を強制的に倒した。")
									this.ui.buttons.interactable = false
									await this.ui.buttons.hide()
									this.ui.setMainMenu()
									await this.ui.buttons.show()
									this.ui.buttons.interactable = true

									//戦闘終了
									resolve()
									this.events.UI.TouchAndKeyboardSwitch.broadcast(true)
								}
							},
							{
								text: "menu",
								onclick: () => {
									this.events.UI.OpenPopupMenu.broadcast()
								}
							},
						]
					},
					{ //row 2
						buttons: [
							{
								text: "魔法",
								onclick: () => {
									this.events.UI.AddMessage.broadcast("[未実装です。]")
								}
							},
							{
								text: "アイテム",
								onclick: () => {
									this.events.UI.AddMessage.broadcast("[未実装です。]")
								}
							},
							{
								text: "ヘルプ",
								onclick: () => {
									this.openHelp()
								}
							},
						]
					},
				]
			});
			this.ui.buttons.show()
		})
	}

	async clear() {
		this.element.removeChild(this.contents)
		return new Promise((resolve) => {
			Tween.To({
				duration: 200,
				onUpdate: (progress) => {
					this.element.style.background = `rgba(0,0,0,${0.7 - progress * 0.7})`
				},
				onComplete: () => {
					this.element.style.background = ""
					resolve()
				}
			})
		})
	}

	private async encountFade(): Promise<{}> {
		return new Promise((resolve) => {
			Tween.To({
				duration: 200,
				onUpdate: (progress) => {
					// 真っ白からのフラッシュだと眩しくてポケフラ害悪が怖い。少しアルファ落とす。
					this.contents.style.background = `rgba(255,255,255,${0.6 - progress * 0.6})`
				},
				onComplete: () => {
					this.contents.style.background = ""
					resolve()
				}
			})
		})
	}


	private async openHelp() {
		const contents = new Styler("div").flexVertical().middle().center().getElement()
		new Styler("h2").text("ヘルプ").appendTo(contents)
		new Styler("p").text("============ 戦闘について ============").appendTo(contents)
		new Styler("p").html(`マイクロターン方式です。スピードの早いキャラクターから順にコマンド入力になります。`).appendTo(contents)
		new Styler("p").html(`「防御」では、次に誰かが行動を終えるまでダメージを1/2にします。行動順番を制御したい場合にも有効です。`).appendTo(contents)

		Popup.Open(contents)

	}
}