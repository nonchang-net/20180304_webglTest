/*

# Popup.ts

## 概要

- ポップアップウィンドウ表現
- typescriptを生かしてawaitで終了を待てる設計

*/

import Styler from '../UI/Styler';
import Tween from '../Common/Tween';

export default class Popup {

	private cancelled = false

	static async OpenOkCancel(content: HTMLElement) {
		const popup = new Popup()
		return popup.open(content)
	}

	private async open(content: HTMLElement): Promise<boolean> {
		const body = document.querySelector('body')
		const popup = new Styler("div").appendTo(body).abs().fullWindow().flexVertical().middle().getElement()
		popup.style.opacity = "0"
		popup.style.padding = "10px"
		popup.style.background = "rgba(0,0,0,0.7)"
		// popup.style.border = "1px solid green"

		// コンテンツの枠TODO
		const contents = new Styler("div").appendTo(popup).getElement()
		// contents.style.width = "100%"
		// contents.style.height = "100%"
		contents.style.padding = "1em"
		contents.style.background = "rgba(255,255,255,0.7)"
		contents.style.borderRadius = "1.1em"
		contents.style.boxShadow = "2px 2px 10px rgba(0,0,0,0.5)"

		contents.appendChild(content)

		// TODO: OK/Cancelボタンのレイアウトまともにしたい
		const bottomButtons = new Styler("div").flexHorizontal().appendTo(contents).getElement()
		bottomButtons.style.justifyContent = "center"
		const yes = new Styler("button").text("OK").appendTo(bottomButtons).getElement()
		yes.style.padding = "1em"
		yes.style.margin = "1em"
		yes.style.width = "100px"
		yes.style.borderRadius = "1.1em"
		const no = new Styler("button").text("CANCEL").appendTo(bottomButtons).getElement()
		no.style.padding = "1em"
		no.style.margin = "1em"
		no.style.width = "100px"
		no.style.borderRadius = "1.1em"

		Tween.To({
			duration: 200,
			onUpdate: v => {
				popup.style.opacity = `${v}`
			},
			onComplete: () => {
				popup.style.opacity = "1"
			}
		})

		return new Promise<boolean>((resolve) => {
			const fadeout = () => {
				yes.disabled = true
				no.disabled = true
				Tween.To({
					duration: 200,
					onUpdate: (v) => {
						popup.style.opacity = `${1 - v}`
					},
					onComplete: () => {
						popup.style.display = "none"
						resolve(this.cancelled)
					}
				})
			}
			yes.onclick = () => {
				fadeout()
			}
			no.onclick = () => {
				this.cancelled = true
				fadeout()
			}
		})
	}

}