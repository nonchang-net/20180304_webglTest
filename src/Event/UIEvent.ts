/*

# Event.ts

Copyright(C) nonchang.net All rights reserved.

## 概要

- 検討中。main.tsからイベント制御分けた。
- タッチ操作はボタンUI上では影響させたくないので、3D CanvasへのDOMイベントにしたい。
- UIとmainがバラバラにこいつにaddEventListenerするのかなぁ。
- addEventListenerできるオブジェクトの最小単位って何だっけ。

*/
export default class UIEvent {

	uiElement: HTMLElement

	// updateRequired = false

	// pressed = {}
	isTouched = false
	lastTouchPos = { x: -1, y: -1 }

	referenceLength: number



	constructor(uiElement: HTMLElement) {

		this.uiElement = uiElement //とりあえずevent受けるために置いてみたやつ。。

		this.referenceLength = window.innerHeight

		window.addEventListener('resize', () => {
			this.uiElement.dispatchEvent(new Event("window.resize")) //TODO: イベント名は一箇所にまとめる
			// console.log("window resize.");
			this.referenceLength = window.innerHeight
		})

		// window.addEventListener('keydown', (event) => {
		// 	console.log(event.keyCode + " down")
		// 	this.pressed[event.keyCode] = true

		// })
		// window.addEventListener('keyup', (event) => {
		// 	// console.log(event.keyCode+" up")
		// 	this.pressed[event.keyCode] = false
		// })

		//タッチイベント
		uiElement.addEventListener("touchstart", (event) => { this.TouchStart(event) }, { passive: false });
		uiElement.addEventListener("touchend", (event) => { this.TouchEnd() }, { passive: false });
		uiElement.addEventListener("touchcancel", (event) => { this.TouchEnd() }, { passive: false });
		uiElement.addEventListener("touchmove", (event) => { this.TouchMove(event) }, { passive: false });

		//マウスイベント
		uiElement.addEventListener('mousedown', (event) => { this.TouchStart(event), { passive: false } })
		uiElement.addEventListener('mouseup', (event) => { this.TouchEnd() }, { passive: false })
		uiElement.addEventListener('mousemove', (event) => { this.TouchMove(event) }, { passive: false })
	}

	TouchStart(event: MouseEvent | TouchEvent) {
		// console.log("touch start");
		this.isTouched = true;
		this.lastTouchPos = this.GetClientEventPoints(event)
	}

	TouchEnd() {
		// console.log("touch end");
		this.isTouched = false;
	}

	TouchMove(event: MouseEvent | TouchEvent) {
		// console.log("touch move");
		event.preventDefault();
		if (!this.isTouched) return;

		var clientPoints = this.GetClientEventPoints(event)

		const delta = {
			x: this.lastTouchPos.x - clientPoints.x,
			y: this.lastTouchPos.y - clientPoints.y
		}
		this.lastTouchPos = clientPoints

		// console.log("dragged.", delta, clientPoints);

		let eventDetail: any = { detail: { delta: delta } }
		this.uiElement.dispatchEvent(new CustomEvent("window.mousemove", eventDetail));
	}

	private GetClientEventPoints(event: MouseEvent | TouchEvent): { x: number, y: number } {
		if ((<TouchEvent>event).touches) {
			return {
				x: (<TouchEvent>event).touches[0].clientX,
				y: (<TouchEvent>event).touches[0].clientY
			}
		}
		return {
			x: (<MouseEvent>event).clientX,
			y: (<MouseEvent>event).clientY
		}

	}
}