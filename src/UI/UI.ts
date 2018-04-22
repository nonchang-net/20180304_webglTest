/*

# UI.ts

Copyright(C) xxx. All rights reserved.

## 概要

- UIをざっくりまとめる場所
- クラス分割できないUI系の雑用担当という様相に。整理できないものか？


## メモ: createElementによる実装は無理があったかも

- 生成一つ取ってもCSS設定にしても正直手間。
- react/vue/web component使うか？


*/

import { default as GameEvents } from '../Event/GameEvents';
import { default as Tween } from "../Common/Tween"
import Utils from "../Common/Utils"
import Styler from "./Styler"
import * as ButtonClasses from "./Buttons"

import Popup from "./Popup"
import SoundManager from '../Sound/SoundManager';

export default class UI {

	uiElement: HTMLElement
	main: HTMLElement
	tapToStart: HTMLElement
	buttons: ButtonClasses.Buttons
	events: GameEvents

	constructor(events: GameEvents, body: HTMLBodyElement) {
		this.events = events
		// console.log("UI constructor")
		// uiElement = uiElement

		// 全体レイアウト
		this.uiElement = new Styler("div")
			.fullWindow()
			.flexVertical()
			.getElement()
			;
		body.appendChild(this.uiElement)
		// this.uiElement.style.zIndex = "1"

		this.uiElement.style.overflow = `hidden`
		this.uiElement.style.width = "100%";


		// 下部ボタン以外「全て」
		const mainContent = new Styler("div")
			.appendTo(this.uiElement)
			.getElement()
			;
		this.main = mainContent
		mainContent.style.display = "flex";
		mainContent.style.flex = "1";

		//ヘッダーテスト
		// const h1 = new Styler("h1").abs().getElement()
		// h1.style.fontSize = "12px"
		// h1.innerText = "test 20180401 18:32"
		// h1.style.color = "white"
		// mainContent.appendChild(h1)

		// main枠テスト
		// mainContent.style.border = "solid 5px red"
		// mainContent.style.border = "solid"
		// mainContent.style.borderWidth = "40px 40px 40px 40px"
		// mainContent.style.borderImage = "url(UI/borderimage_sample.png) 40 40 40 40 fill repeat"

		mainContent.style.position = "relative"

		// 下部ボタンUI injection
		const buttons = new ButtonClasses.Buttons((elm: HTMLElement) => {
			//ボタンスタイル設定
			elm.style.borderStyle = "solid"
			elm.style.borderWidth = "16px 16px 16px 16px"
			elm.style.borderImage = "url(UI/borderimage_20180331_2.png) 16 16 16 16 repeat"
			elm.style.background = "none"
			elm.style.color = "#999"
			elm.style.alignItems = "center"
		})
		this.buttons = buttons

		this.uiElement.appendChild(buttons.cover)
		// this.uiElement.appendChild(buttons.element)

		buttons.element.style.background = "url(UI/texturemate_metal10_small.jpg)"
		buttons.element.style.zIndex = "1"
		buttons.element.style.backgroundSize = "cover"
		// this.uiElement.style.backgroundColor = "rgba(1,1,1,0.5)"

		// buttons.element.style.display = "none"
		buttons.hideImmidiate()


		// UIイベントsubscribe
		events.UI.Enable.subscribe(this.constructor.name, () => {
			buttons.interactable = true
		})
		events.UI.Disable.subscribe(this.constructor.name, () => {
			buttons.interactable = false
		})
		events.UI.BottomButtonSwitch.subscribe(this.constructor.name, x => {
			buttons.interactable = x
		})

		// TODO: テスト用。asd/qweキーに表示されてるボタンに対応させたい。
		// events.Keyboard.Z.subscribe(this.constructor.name, () => { this.openCommands() })
		// events.Keyboard.X.subscribe(this.constructor.name, () => { this.openPopupMenu() })

		// タイトルに戻るイベント
		events.Common.BackToTitle.subscribe(this.constructor.name, () => {
			this.buttons.element.style.display = "none"
			this.initTitleButton()
		})


		events.UI.OpenPopupMenu.subscribe(this.constructor.name, () => {
			// async _ => await this.openPopupMenu()
			this.openPopupMenu()
		})

		this.initTitleButton()
	}

	public initTitleButton() {

		// タイトル画面用表示初期化
		// Tap to start表示を開始オプション作成

		const tapToStart = new Styler("div").fullWindow().flexVertical().center().middle().getElement()
		this.tapToStart = tapToStart
		tapToStart.style.transform = "translateY(-100%)" //TODO: これがないと画面外に出てしまう。flexで押し出されてる？ よくわからないので別途検証しておきたい……。
		// tapToStart.style.opacity = "0.3"

		// tapToStart.style.background = "red"

		const text = new Styler("p").text("Tap to Start").appendTo(tapToStart).getElement()
		text.style.color = "#333"
		text.style.textShadow = "0px 0px 10px #fff, 1px 1px 4px rgba(0, 0, 0, 0.7)"
		text.style.fontFamily = "'Niconne', Arial, sans-serif"
		text.style.fontSize = "30px"
		text.style.letterSpacing = "3px"

		this.buttons.cover.appendChild(tapToStart);

		const soundCheckRow = new Styler("div").flexHorizontal().appendTo(tapToStart).getElement()
		soundCheckRow.style.marginTop = "10px"
		const soundCheck = new Styler("input").appendTo(soundCheckRow).getElement()
		soundCheck.setAttribute("type", "checkbox")
		soundCheck.checked = localStorage.getItem(SoundManager.BGM_ENABLED_FLAG_KEY) == "true"
		soundCheck.style.width = "30px"
		soundCheck.style.height = "30px"
		const soundCheckText = new Styler("p").text("音楽を再生する").appendTo(soundCheckRow).getElement()
		soundCheckText.style.color = "white"

		// TODO: リソース削除
		// const resourceDeleteRow = new Styler("div").flexHorizontal().appendTo(tapToStart).getElement()
		// resourceDeleteRow.style.marginTop = "10px"
		// const resourceDeleteButton = new Styler("button").text("リソース削除").appendTo(resourceDeleteRow).getElement()
		// resourceDeleteButton.style.border = "1px solid gray"
		// resourceDeleteButton.style.background = "white"
		// resourceDeleteButton.style.padding = "5px"
		// resourceDeleteButton.style.borderRadius = "5px"

		//タップイベント設定

		tapToStart.onclick = e => {
			console.log(e);
			// とりあえず一瞬で消す
			this.buttons.cover.removeChild(tapToStart);
			this.events.UI.TitleTap.broadcast()
		}

		soundCheck.onclick = e => {
			e.stopPropagation()
			console.log(soundCheck.checked);
			if (soundCheck.checked) {
				this.events.Sound.TurnBgmOn.broadcast()
			} else {
				this.events.Sound.TurnBgmOff.broadcast()
			}
		}

		// resourceDeleteButton.onclick = e => {
		// 	e.stopPropagation()
		// 	console.log(e);
		// }
	}


	async initGameButton() {

		this.buttons.element.style.display = "block"

		this.setMainMenu();

		(async () => {
			// console.log("all show")
			await this.buttons.show()
		})()
	}




	private async openCommands() {
		this.events.UI.AddMessage.broadcast("[コマンドメニューを開きます]")
		this.events.UI.Disable.broadcast()
		await this.buttons.hide()
		this.buttons.update(this.getCommandMenu())
		await this.buttons.show()
		this.events.UI.Enable.broadcast()
	}

	private async openPopupMenu() {
		const contents = new Styler("div").flexVertical().middle().center().getElement()
		new Styler("h2").text("ポップアップメニュー").appendTo(contents)
		new Styler("p").text(" ").appendTo(contents)
		new Styler("p").text("============ BGM設定 ============").appendTo(contents)
		const bgmToggleButton = new Styler('button').text('BGM再生トグル').appendTo(contents).getElement()
		bgmToggleButton.style.padding = "1em"
		bgmToggleButton.style.margin = "1em"
		bgmToggleButton.style.marginBottom = "0"
		bgmToggleButton.style.borderRadius = "1.1em"
		bgmToggleButton.onclick = () => {
			this.events.Sound.ToggleBgm.broadcast()
		}
		new Styler("p").text("============ 権利表記 ============").appendTo(contents)
		new Styler("p").html(`顔グラフィックスは <a href="http://roughsketch.en-grey.com/%E7%B4%A0%E6%9D%90%E3%82%A4%E3%83%B3%E3%83%87%E3%83%83%E3%82%AF%E3%82%B9" target="_blank">三日月アルペジオ</a>様の無料素材を利用しています。`).appendTo(contents)
		new Styler("p").html(`モンスターグラフィックスは <a href="http://raineru03.web.fc2.com/" target="_blank">HI-TIME様</a>様の無料素材を利用しています。`).appendTo(contents)
		new Styler("p").html(`BGMはnonchang.netの著作物です。ライセンスはCC BYです（半端な作りかけの曲で恐縮ですが一応）`).appendTo(contents)

		Popup.Open(contents)

	}

	private getCommandMenu(): ButtonClasses.IUpdateData {
		return {
			rows: [
				{ //row 1
					buttons: [
						{
							text: "back",
							onclick: async () => {
								this.events.UI.AddMessage.broadcast("[コマンドメニュー終了]")
								this.buttons.interactable = false
								await this.buttons.hide()
								this.buttons.update(this.getMainMenu())
								await this.buttons.show()
								this.buttons.interactable = true
							}
						},
						{
							text: "アイテム",
							onclick: () => {
								this.events.UI.AddMessage.broadcast("[未実装です。]")
							}
						},
						{
							text: "魔法",
							onclick: () => {
								this.events.UI.AddMessage.broadcast("[未実装です。]")
							}
						},
					]
				},
				{ //row 2
					buttons: [
						{
							text: "ステータス",
							onclick: () => {
								this.events.UI.AddMessage.broadcast("[未実装です。]")
							}
						},
						{
							text: "オプション",
							onclick: () => {
								this.events.UI.AddMessage.broadcast("[未実装です。]")
							}
						},
						{
							text: "タイトルに戻る",
							onclick: () => {
								this.events.UI.AddMessage.broadcast("[タイトルに戻ります。]")
								setTimeout(() => {
									this.events.UI.ClearMessage.broadcast()
									this.events.Common.BackToTitle.broadcast()
								}, 500)
							}
						},
					]
				},
			]
		}
	}

	private getMainMenu(): ButtonClasses.IUpdateData {
		return {
			rows: [
				{ //row 1
					buttons: [
						{
							text: "command",
							onclick: () => {
								this.openCommands()
							}
						},
						{
							text: "↑",
							onclick: () => {
								// console.log("up")
								this.events.Button.StepToForward.broadcast()
							}
						},
						{
							text: "menu",
							onclick: () => { this.openPopupMenu() }
						},
					]
				},
				{ //row 2
					buttons: [
						{
							text: "←",
							onclick: () => {
								// console.log("left")
								this.events.Button.TurnLeft.broadcast()
							}
						},
						{
							text: "↓",
							onclick: () => {
								// console.log("down")
								this.events.Button.StepToBack.broadcast()
							}
						},
						{
							text: "→",
							onclick: () => {
								// console.log("right")
								this.events.Button.TurnRight.broadcast()
							}
						},
					]
				},
			]
		}
	}

	setMainMenu() {
		this.buttons.update(this.getMainMenu());
	}
}