/*

# Message.ts

Copyright(C) nonchang.net All rights reserved.

## 概要

- 文字送り・行送りするメッセージ表示システム

*/

import { default as GameEvents } from '../Event/GameEvents';
import { default as Styler } from '../UI/Styler';
import Utils from '../Common/Utils';


export default class Messages {

	element: HTMLElement

	events: GameEvents

	lines: Array<Line>

	constructor(events: GameEvents, maxLine: number = 5, messageSpeed = 50) {

		this.events = events

		const element = new Styler("div").abs().b().l().getElement()
		this.element = element
		element.style.color = "#fff"
		element.style.margin = "1em"
		// element.style.fontWeight = "bold"

		//上下左右斜めのシャドウ＋右下にブラー付きのドロップシャドウ
		element.style.textShadow = "1px 1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000, 1px 0px 0 #000, -1px 0px 0 #000, 0px 1px 0 #000, 0px -1px 0 #000, 2px 2px 1px #000"

		// 行追加
		this.lines = new Array<Line>()
		for (let i = 0; i < maxLine; i++) {
			const line = new Line()
			this.lines.push(line)
			element.appendChild(line.element)
			const opacity = (1 - ((maxLine - 1 - i) / maxLine))
			// console.log(i, opacity);
			line.element.style.opacity = opacity.toString()
			// line.setImmidiate("test: " +i)
			// line.set("test: " + i) //初期に埋めるテスト
		}

		events.UI.AddMessage.subscribe(this.constructor.name, (str) => {
			for (let i = 0; i < maxLine - 1; i++) {
				// console.log(maxLine, i, this.lines[i + 1].current)
				this.lines[i].setImmidiate(this.lines[i + 1].current)
			}
			this.lines[maxLine - 1].set(str, messageSpeed)
		})
	}

	// add(str: string) {
	// 	this.lines[0].set(str)
	// }


}

//一行分の処理クラス
class Line {
	element: HTMLElement

	current: string = ""
	index: number

	constructor() {
		const element = new Styler("div").getElement()
		this.element = element
	}

	clear() {
		this.index = 0
		this.element.innerText = "";
	}

	set(str: string, speed: number = 30) {
		this.current = str
		this.clear();

		(async () => {
			const length = this.current.length
			while (this.index < length) {
				this.index++
				this.element.innerText = this.current.substring(0, this.index)
				await Utils.sleep(speed)
			}
		})()
	}

	setImmidiate(str: string) {
		this.current = str
		this.element.innerText = str
	}
}