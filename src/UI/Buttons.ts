/*
# Buttons.ts

Copyright(C) nonchang.net All rights reserved.

## 概要

- スマートフォン向けのゲームUIとして検討中の、画面下部に6つのボタンを配置する基本UIの検討実装です。

- 6つのボタンの内容はコンテキストに応じて切り替わります。
	- ダンジョン探索中は上下左右カーソルと、右上にメニュー、左上にコマンドボタンを配置。
	- RPGのコマンドメニュー体系をスマートフォンに

- flexboxレイアウト前提です。古いブラウザは無視。

- APIとしては表示更新だけ、GameEventを送出するのみで検討中

*/


import Styler from "./Styler"
import Tween from "../Common/Tween"
import Utils from "../Common/Utils"


/**
 * 情報更新用インターフェース群
 */
export interface IUpdateData {
	rows: IUpdateDataRow[]
}
export interface IUpdateDataRow {
	buttons: IUpdateDataButton[]
}
export interface IUpdateDataButton {
	text: string
	onclick: () => any
}


/**
 * メインクラス
 */
export class Buttons {

	element: HTMLDivElement
	rows = new Array<ButtonRow>()
	buttons = new Array<Button>()

	/**
	 * コンストラクタ
	 */
	constructor(styler: (elm) => any) {
		this.element = new Styler("div")
			.getElement()
			;
		const row1 = new ButtonRow(styler)
		this.element.appendChild(row1.element)
		// row1.element.style.margin = "5px 0"
		this.rows.push(row1)
		this.buttons = this.buttons.concat(row1.buttons)

		const row2 = new ButtonRow(styler)
		this.element.appendChild(row2.element)
		// row2.element.style.margin = "5px 0"
		this.rows.push(row2)
		this.buttons = this.buttons.concat(row2.buttons)
		// console.log(`constructor`, this.buttons, row2.buttons);
	}//constructor

	/**
	 * 情報更新
	 */
	update(updateData: IUpdateData) {
		this.rows[0].update(updateData.rows[0])
		this.rows[1].update(updateData.rows[1])
	}

	set interactable(interactable: boolean) {
		// console.log(`set buttons interactable`, this.buttons);
		this.buttons.forEach(e => {
			// console.log(`set buttons interactable`, e, interactable);
			e.interactable = interactable
		});
	}

	/**
	 * 表示・非表示
	 */
	private shift = 0
	private readonly span = 20

	async show() {
		this.shift = 0
		for (var button of this.buttons) {
			button.show(this.shift)
			this.shift += this.span
		}
		await Utils.waitUntil(() => { return this.isAnimation() })
	}

	async hide() {
		this.shift = 0
		for (var buttons of this.buttons) {
			buttons.hide(this.shift)
			this.shift += this.span
		}
		await Utils.waitUntil(() => { return this.isAnimation() })
	}

	private isAnimation(): boolean {
		let finished = true
		for (var button of this.buttons) {
			if (button.isAnimation) {
				finished = false
				break
			}
		}
		return finished
	}

}

/**
 * 一列分レイアウト
 */
class ButtonRow {

	element: HTMLDivElement
	buttons = new Array<Button>()

	private _shift = 0
	get shift() { return this._shift }

	constructor(styler: (elm) => any) {
		this.element = new Styler("div")
			.height(80)
			.flexHorizontal()
			.getElement()
			;
		this.element.style.width = "100%";

		for (var i = 0; i < 3; i++) {
			var button = new Button(styler)
			button.text = i
			this.element.appendChild(button.element)
			this.buttons.push(button)
		}
	}

	/**
	 * 情報更新
	 */
	update(updateData: IUpdateDataRow) {
		this.buttons[0].update(updateData.buttons[0])
		this.buttons[1].update(updateData.buttons[1])
		this.buttons[2].update(updateData.buttons[2])
	}
}


/**
 * ボタンクラス
 * TODO: ダブルバッファモードを検討 - やらないかも？
 */
class Button {

	element: HTMLElement
	front: HTMLButtonElement
	back: HTMLButtonElement
	onclick: () => any

	isFrontPlane = true

	_interactable = true

	set text(str: string | number) {
		// this.element.innerText = str.toString()
		this.front.innerText = str.toString()
	}

	set interactable(interactable: boolean) {
		// console.log(`set button interactable ${this._interactable}`);
		this._interactable = interactable
	}

	/**
	 * コンストラクタ
	 */
	constructor(styler: (elm: HTMLElement) => any) {

		var cover = new Styler("div")
			.size(100, 80)
			.padding(5)
			.glow()
			.getElement()

		var elm = new Styler("button")
			.size("100%", "100%")
			.appendTo(cover)
			.getElement()

		// var elm2 = new Styler("button")
		// 	.size("100%", "100%")
		// 	.appendTo(cover)
		// 	.getElement()


		// ボタンスタイル設定injection
		styler(elm)
		// styler(elm2)

		this.element = cover
		this.front = elm
		// this.back = elm2

		// TODO: これらもinjectionにしたい

		const hover = () => {
			elm.style.color = "#fff"
			elm.style.filter = ``
		}

		const push = () => {
			elm.style.color = "#666"
			elm.style.filter = `blur(1px) brightness(1000%)`
			setTimeout(() => {
				this.resetStyle()
			}, 100)
		}

		const cancel = () => {
			elm.style.color = "#ccc"
			elm.style.filter = ``
		}

		const tap = (e) => {
			e.preventDefault()
			if (!this._interactable) return;
			this.onclick()
		}

		// マウスイベント設定
		elm.onmouseover = hover
		elm.onmousedown = push
		elm.onmouseup = cancel
		elm.onmouseout = cancel
		// elm.onmouseup = this.resetStyle
		// elm.onmouseout = this.resetStyle

		if (window.ontouchstart === undefined) {
			// console.log(`window.ontouchstart ? ${window.ontouchstart === undefined}`)
			// onclickはPCのみ
			elm.onclick = tap
		} else {
			// スマホはtouchstartで反応させる
			// ついでにhoverも。
			elm.ontouchstart = (e) => {
				e.preventDefault()
				push()
				tap(e)
			}
		}


	}

	resetStyle() {
		this.front.style.color = "#ccc"
		this.front.style.filter = ``
	}

	/**
	 * 情報更新
	 */

	private readonly animPx = 300
	private readonly duration = 150 //150くらいがちょうど良さそう。

	update(updateData: IUpdateDataButton) {
		this.text = updateData.text
		this.onclick = updateData.onclick
	}

	isAnimation = false

	async show(shift: number = 0) {
		this.isAnimation = true
		if (shift != 0) await Utils.sleep(shift)
		this.element.style.transform = `translateX(${this.animPx}px)`
		this.element.style.opacity = `0`
		Tween.To({
			tweeningFunction: Tween.easeInQuint,
			duration: this.duration,
			onUpdate: (x) => {
				this.element.style.transform = `translateX(${this.animPx - x * this.animPx}px)`
				this.element.style.opacity = `${x}`
			},
			onComplete: () => {
				this.element.style.transform = `translateX(0px)`
				this.isAnimation = false
				this.resetStyle()
			}
		})
	}

	async hide(shift: number = 0) {
		this.isAnimation = true
		if (shift != 0) await Utils.sleep(shift)
		Tween.To({
			tweeningFunction: Tween.easeInQuint,
			duration: this.duration,
			onUpdate: (x) => {
				this.element.style.transform = `translateX(${x * this.animPx}px)`
				this.element.style.opacity = `${1 - x}`
			},
			onComplete: () => {
				this.element.style.transform = `translateX(${this.animPx}px)`
				this.isAnimation = false
				this.resetStyle()
			}
		})
	}

	// async anim(shift: number = 0, show: boolean, progress: boolean = true) {
	// 	//TODO: 上のをまとめたい……。
	// 	this.isAnimation = true
	// 	if (shift != 0) await Utils.sleep(shift)
	// 	Tween.To({
	// 		tweeningFunction: Tween.easeInQuint,
	// 		duration: this.duration,
	// 		onUpdate: (x) => {
	// 			if (show) {
	// 				if (progress) {
	// 					//progress: 左に消える
	// 					this.element.style.transform = `translateX(${this.animPx + x * this.animPx}px)`
	// 				} else {
	// 					//back: 右に消える（最初の実装）
	// 					this.element.style.transform = `translateX(${this.animPx - x * this.animPx}px)`
	// 				}
	// 				this.element.style.opacity = `${x}`
	// 			} else { 
	// 				this.element.style.transform = `translateX(${x * this.animPx}px)`
	// 				this.element.style.opacity = `${1 - x}`
	// 			}
	// 		},
	// 		onComplete: () => {
	// 			if (show) {
	// 				this.element.style.transform = `translateX(0px)`
	// 			} else {
	// 				this.element.style.transform = `translateX(${this.animPx}px)`
	// 			}
	// 			this.isAnimation = false
	// 			this.resetStyle()
	// 		}
	// 	})
	// }


	// 前のが消える前に新しいのが出てくるように、ダブルバッファ付きボタン表現を行いたい。どう実装するのが手軽だろう？
	// →速度次第では不要かも。一旦実装保留中。
	// async transition(shift: number = 0, updateData: IUpdateDataButton) {
	// 	this.isFrontPlane = !this.isFrontPlane
	// 	//多分ここで上記のTween.Toを二回呼ぶ必要がある。さてどうしよう。
	// }

}