/*

# Event.ts

Copyright(C) xxx. All rights reserved.

## 概要

- 検討中。main.tsからイベント制御分けたい。
- UIとmainがバラバラにこいつにaddEventListenerするのかなぁ。
- addEventListenerできるオブジェクトの最小単位って何だっけ。

*/
export default class UIEvent{

	uiElement: HTMLElement

	// updateRequired = false

	pressed = {}
	isTouched = false
	lastTouchPos = {x: -1, y: -1}



	constructor(uiElement:HTMLElement){

		this.uiElement = uiElement //とりあえずevent受けるために置いてみたやつ。。

		window.addEventListener('resize',()=>{
			uiElement.dispatchEvent(new Event("window.resize")) //TODO: イベント名は一箇所にまとめる
			// console.log("window resize.");
		})

		window.addEventListener('keydown',(event)=>{
			// console.log(event.keyCode+" down")
			this.pressed[event.keyCode]=true

		})
		window.addEventListener('keyup',(event)=>{
			// console.log(event.keyCode+" up")
			this.pressed[event.keyCode]=false
		})

		window.addEventListener('mousedown',(event)=>{
			this.isTouched = true;
			this.lastTouchPos = {
				x: event.clientX,
				y: event.clientY
			}
		})

		window.addEventListener('mouseup',(event)=>{
			this.isTouched = false;
		})

		window.addEventListener('mousemove',(event)=>{
			if(!this.isTouched) return;
			
			const delta={
				x: this.lastTouchPos.x - event.clientX,
				y: this.lastTouchPos.y - event.clientY
			}
			this.lastTouchPos = {
				x: event.clientX,
				y: event.clientY
			}
			// console.log("dragged.", delta, event.clientX, event.clientY);
			
			let eventDetail:any = {detail: { delta: delta }}
			uiElement.dispatchEvent(new CustomEvent("window.mousemove",eventDetail));
		})
	}
}