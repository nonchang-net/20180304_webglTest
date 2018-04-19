/*

# UI/Keyboard.ts

Copyright(C) nonchang.net All rights reserved.

## 概要

- PC操作用、キーボード入力イベント管理
	- スマートフォンファーストなのでこのクラスは開発時のデバッグ操作用の意味合いが強い
- ここでやることはキー入力の監視と、対応するGameEventsを発行することだけ。

*/

import { default as GameEvents } from '../Event/GameEvents';

export default class Keyboard {

	private pressed = {}
	private dirty = false
	private events: GameEvents

	private interactable = true

	constructor(events: GameEvents) {

		this.events = events

		window.addEventListener('keydown', (event) => {
			// console.log(event.keyCode + " down")
			this.pressed[event.keyCode] = true
			this.dirty = true
		})
		window.addEventListener('keyup', (event) => {
			// console.log(event.keyCode+" up")
			this.pressed[event.keyCode] = false
			this.dirty = true
		})
		// UIイベントsubscribe
		events.UI.Enable.subscribe(this.constructor.name, () => {
			this.interactable = true
		})
		events.UI.Disable.subscribe(this.constructor.name, () => {
			this.interactable = false
		})
		events.UI.TouchAndKeyboardSwitch.subscribe(this.constructor.name, x => {
			this.interactable = x
		})

		this.Tick()
	}

	Tick() {
		requestAnimationFrame(() => { this.Tick() })
		if (!this.interactable) return
		if (!this.dirty) return
		this.dirty = false

		// DEBUG - aキーでなんか動かす
		// note: 65 = 「a」キー
		if (this.pressed[65]) {
			this.events.Debug.KeyA.broadcast()
			this.dirty = true //連続受付
		}

		// note: 90 = 「z」キー
		if (this.pressed[90]) {
			this.events.Keyboard.Z.broadcast()
		}

		// note: 88 = 「x」キー
		if (this.pressed[88]) {
			this.events.Keyboard.X.broadcast()
		}

		// カーソル
		if (this.pressed[39]) {//right
			// this.events.Debug.TestRight.broadcast()
			// this.dirty = true //連続受付
			this.events.Button.TurnRight.broadcast()
		}

		if (this.pressed[37]) {//left
			// this.events.Debug.TestLeft.broadcast()
			// this.dirty = true //連続受付
			this.events.Button.TurnLeft.broadcast()
		}

		if (this.pressed[38]) {//up
			// this.events.Debug.TestForward.broadcast()
			// this.dirty = true //連続受付
			this.events.Button.StepToForward.broadcast()
		}

		if (this.pressed[40]) {//down
			// this.events.Debug.TestDown.broadcast()
			// this.dirty = true //連続受付
			this.events.Button.StepToBack.broadcast()
		}

		//wsdaはデバッグ。
		// if (this.uiEvent.pressed[87]) {//w
		// 	console.log("pressed w")
		// 	this.camera.rotateX(0.05)
		// 	this.dirty=true
		// }

		// if (this.uiEvent.pressed[83]) {//s
		// 	console.log("pressed s")
		// 	this.camera.rotateX(-0.05)
		// 	this.dirty=true
		// }

		// if (this.uiEvent.pressed[65]) {//a
		// 	console.log("pressed a up")
		// 	this.camera.translateX(-5)
		// 	this.dirty=true
		// }

		// if (this.uiEvent.pressed[68]) {//d
		// 	console.log("pressed d up")
		// 	this.camera.translateX(5)
		// 	this.dirty=true
		// }

	}
}