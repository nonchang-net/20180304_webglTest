/*

# Popup.ts

## 概要

- ポップアップウィンドウ表現
- confirmの方は、typescriptを生かしてawaitで終了を待てる設計

*/

import Styler from '../UI/Styler';
import Tween from '../Common/Tween';

export default class Popup {

	private cancelled = false
	private body: HTMLBodyElement
	private popup: HTMLDivElement
	private contents: HTMLDivElement

	static async OpenConfirm(content: HTMLElement) {
		const popup = new Popup()
		return popup.openConfirmPopup(content)
	}

	static async Open(content: HTMLElement) {
		const popup = new Popup()
		return popup.openPopup(content)
	}

	private makeBase(content: HTMLElement) {

		this.body = document.querySelector('body')
		this.popup = new Styler("div").appendTo(this.body).abs().fullWindow().flexVertical().middle().getElement()
		this.popup.style.opacity = "0"
		this.popup.style.padding = "10px"
		this.popup.style.background = "rgba(0,0,0,0.7)"
		this.popup.style.zIndex = "10"

		// コンテンツの枠
		this.contents = new Styler("div").appendTo(this.popup).getElement()
		// this.contents.style.width = "100%"
		// this.contents.style.height = "100%"
		this.contents.style.padding = "1em"
		this.contents.style.background = "rgba(255,255,255,0.7)"
		this.contents.style.borderRadius = "1.1em"
		this.contents.style.boxShadow = "2px 2px 10px rgba(0,0,0,0.5)"

		this.contents.appendChild(content)
	}

	private async openPopup(content: HTMLElement): Promise<{}> {
		this.makeBase(content)
		const bottomButtons = new Styler("div").flexHorizontal().appendTo(this.contents).getElement()
		bottomButtons.style.justifyContent = "center"
		const closeButton = new Styler("button").text("CLOSE").appendTo(bottomButtons).getElement()
		closeButton.style.padding = "1em"
		closeButton.style.margin = "1em"
		closeButton.style.marginBottom = "0"
		closeButton.style.width = "100px"
		closeButton.style.borderRadius = "1.1em"

		this.playOpenTween()

		return new Promise<boolean>((resolve) => {
			closeButton.onclick = () => {
				closeButton.disabled = true
				this.playCloseTween(resolve)
			}
		})
	}

	private async openConfirmPopup(content: HTMLElement): Promise<boolean> {
		this.makeBase(content)

		// OK/Cancelボタンのレイアウト
		const bottomButtons = new Styler("div").flexHorizontal().appendTo(this.contents).getElement()
		bottomButtons.style.justifyContent = "center"
		const yes = new Styler("button").text("OK").appendTo(bottomButtons).getElement()
		yes.style.padding = "1em"
		yes.style.margin = "1em"
		yes.style.marginBottom = "0"
		yes.style.width = "100px"
		yes.style.borderRadius = "1.1em"
		const no = new Styler("button").text("CANCEL").appendTo(bottomButtons).getElement()
		no.style.padding = "1em"
		no.style.margin = "1em"
		no.style.marginBottom = "0"
		no.style.width = "100px"
		no.style.borderRadius = "1.1em"

		this.playOpenTween()

		return new Promise<boolean>((resolve) => {
			const fadeout = () => {
				yes.disabled = true
				no.disabled = true
				this.playCloseTween(resolve)
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

	private playOpenTween() {

		Tween.To({
			duration: 200,
			onUpdate: v => {
				this.contents.style.transform = `translateY(${100 * (1 - v)}px)`
				this.popup.style.opacity = `${v}`
			},
			onComplete: () => {
				this.popup.style.opacity = "1"
			}
		})
	}

	private playCloseTween(resolve) {
		Tween.To({
			duration: 200,
			onUpdate: (v) => {
				this.contents.style.transform = `translateY(${100 * v}px)`
				this.popup.style.opacity = `${1 - v}`
			},
			onComplete: () => {
				// popup.style.display = "none"
				this.body.removeChild(this.popup)
				resolve(this.cancelled)
			}
		})
	}

}