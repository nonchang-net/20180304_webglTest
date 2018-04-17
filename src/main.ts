/*
# main.ts

Copyright(C) nonchang.net All rights reserved.

## 概要

- webpackビルドのエントリポイントです。
- `検討中` 極力、アプリ一般的に最低限必要な処理だけを記載しようと検討中。


## ここでやること

- アプリ動作に必要な各モジュールの初期化のみとしたい。
- 初期化順番の依存や、非同期初期化などの待機はここで全て吸収し、他で意識させないようにしたい。

*/

import Vector2 from './Common/Vector2'

import * as Sub from './sub'
import UI from './UI/UI'
import Keyboard from './UI/Keyboard'
import Styler from './UI/Styler'
import MyUIEvents from './Event/UIEvent'
import GameEvents from './Event/GameEvents'

import ThreeDScene from './Scenes/ThreeDScene'

import SoundManager from './Sound/SoundManager'
import SampleSound from './Sound/Synthesize/SampleSound'

import * as Maze from './Dangeon/Maze'
import MapView from './Scenes/MapView'
import Messages from './UI/Messages'

import MasterData from './Data/MasterData'
import UserData from './Data/UserData'
import GameStateKind from './Data/GameStateKind'

import Tween from './Common/Tween'
import Popup from './UI/Popup'
import { default as CharacterStatus, FaceKind } from './UI/CharacterStatus';

// Windowスコープを拡張: コンソールからMainのpublic要素にアクセスできるように
// 例: console.log("test",window.Main.dirty) //note: 実行時はjavascriptなので、privateプロパティも参照できる点に注意
declare global {
	interface Window {
		Main?
	}
}

// bootstrap
window.addEventListener('DOMContentLoaded', () => {
	window.Main = new Main(
		document.querySelector('body')
	);
});

class Main {

	private ui: UI
	private gameScene: ThreeDScene
	private dirty: boolean = true

	constructor(body: HTMLBodyElement) {
		this.initAsync(body)
	}

	private async initAsync(body: HTMLBodyElement) {

		body.style.overflow = "hidden"

		// イベント初期化
		// - 初期化時にイベント登録を行うモジュールが多いため、最初に実行する必要がある
		const events = new GameEvents()

		// マスターデータ初期化
		// TODO: マスターデータ更新通信はService Worker？ この辺知識が足りてないので要調査。
		const master = new MasterData()
		let lastUpdate = 0 //TODO: 現状、比較対象が-1なので必ず更新になってる
		await master.asyncSetup(lastUpdate)

		// console.log("master dump", master.monsters.defs)

		const user = new UserData(master)


		// 初回アクセスポップアップ実装テスト
		// - 初期化タイミングは実際にはどこになるだろう？
		// - セーブデータを自動読み込みするのであれば、UserData初期化のあとになるだろうか。

		// const contents = new Styler("div").flexVertical().middle().center().getElement()

		// new Styler("p").text(" - [ゲームタイトル] - ").appendTo(contents)
		// new Styler("h2").text("音楽を再生しますか？").appendTo(contents)
		// // new Styler("hr").appendTo(contents)
		// new Styler("p").text("再生する場合、10.2MBの事前ダウンロードが始まります。").appendTo(contents)
		// new Styler("p").text("音楽データのダウンロードはメニューからいつでもできます。").appendTo(contents)
		// new Styler("p").text("ダウンロード済みのローカルストレージ中の音楽データは後から削除できます。").appendTo(contents)

		// const cancelled = await Popup.OpenConfirmPopup(contents)
		// console.log(`popup closed. ${cancelled}`)




		// TEST: Reactive Property検討。とりあえず少ない記述で目標は達成？

		// user.gameState.subscribe(this.constructor.name, (state) => {
		// 	console.log(`state changed. ${state}`)
		// })
		// user.gameState.value = GameStateKind.InGame


		// 迷路情報初期化
		// var maze = new Maze.Factory().Create(9, 9)
		var maze = new Maze.Factory().Create(23, 23)
		// console.log(maze);


		// キーボードイベント監視クラス初期化
		new Keyboard(events)


		// UI初期化
		const ui = new UI(events, body)


		// メッセージシステム初期化
		// - UI初期化後
		const messages = new Messages(events, 5, 100)
		ui.main.appendChild(messages.element)


		// THREE.js用の3d canvas作成
		const canvas = new Styler("canvas").appendTo(ui.main).getElement()
		ui.main.appendChild(canvas)


		// 3d canvas用のマウス・タッチイベント登録
		// - 3D Canvas初期化後
		const uiEvent = new MyUIEvents(canvas)


		// マップUI初期化
		// - events, maze初期化後
		const map = new MapView(events, maze)
		ui.main.appendChild(map.element)
		ui.main.appendChild(map.playerMarkCanvas)
		map.update()


		// サウンド初期化
		// TODO: マスター読ませてロード管理させたい
		const soundManager = new SoundManager()
		// console.log('soundManager setup start')
		await soundManager.asyncSetup()
		// console.log('soundManager setup finished')

		const BGM_ENABLED_FLAG_KEY = 'BGM Enabled'
		const bgmEnabledLocalStorageValue = localStorage.getItem(BGM_ENABLED_FLAG_KEY)
		// console.log(bgmEnabledLocalStorageValue)
		const bgmEnabled = !bgmEnabledLocalStorageValue ? false : bgmEnabledLocalStorageValue == "true"

		if (bgmEnabled) {
			soundManager.startBgm1()
		}
		events.Sound.ToggleBgm.subscribe(this.constructor.name, () => {
			soundManager.toggleBgm1()
			localStorage.setItem(BGM_ENABLED_FLAG_KEY, `${soundManager.bgm1IsPlaying}`)
			// console.log(`${soundManager.bgm1IsPlaying} `)
		})


		// ゲームシーン初期化
		const game = new ThreeDScene(events, canvas, map, uiEvent, ui.main)
		await game.InitGameScene(maze)


		// welcomeメッセージとバージョン情報
		events.UI.AddMessage.broadcast("welcome to cage [ver 20180415 1828]")

		// 移動イベントでメッセージを出すテスト
		// TODO: どこにおくべきだろう？ 少なくとも、main.tsからは外したい。
		events.Common.PlayerStepToForwardSuccess.subscribe(this.constructor.name, () => {
			events.UI.AddMessage.broadcast("あなたたちは前に進んだ。")
			if (Math.random() * 3 > 1) {

				// 試しにエンカウントデバッグ
				// TODO: モンスターマスターの直接参照は是か非か。ちょっと考えたい。。
				const monsterIndex = Math.floor(Math.random() * master.monsters.definitions.length)
				// console.log(`test : ${master.monsters.defs[monsterIndex].name}`);
			}
		})
		events.Common.PlayerStepToForwardAndHitBlock.subscribe(this.constructor.name, () => {
			events.UI.Disable.broadcast()

			// 壁に当たった時のメッセージ
			// events.UI.AddMessage.broadcast("いてっ！")
			// "messages":{
			// 	"hitBlocked":[
			events.UI.AddMessage.broadcast(user.party.getRandomOne().getWallMessage())

			for (let st of statuses) st.setFaceKind(FaceKind.Damaged)
			// console.log("testtest")

			Tween.To({
				duration: 300,
				onUpdate: (x) => {
					// ここで画面揺らす
					canvas.style.transform = `scale(1.05, 1.05) translate(${Math.random() * (1 - x) * 10 - 5}px, ${Math.random() * (1 - x) * 10 - 5}px)`
					// canvas.style.zIndex = ""
				},
				onComplete: () => {
					canvas.style.transform = ``
					for (let st of statuses) st.setFaceKind(FaceKind.Normal)
					// console.log("testtest2")
					events.UI.Enable.broadcast()
				}
			})
		})
		events.Button.TurnLeft.subscribe(this.constructor.name, () => {
			events.UI.AddMessage.broadcast("あなたたちは左に回った。")
		})
		events.Button.TurnRight.subscribe(this.constructor.name, () => {
			events.UI.AddMessage.broadcast("あなたたちは右に回った。")
		})

		// ステータス表示テスト

		const statusDiv = new Styler("div").abs().t(5).l(5).appendTo(ui.main).getElement()

		const statuses = new Array<CharacterStatus>()

		for (const userCharacterData of user.party.characters) {
			const status = new CharacterStatus(userCharacterData)
			statusDiv.appendChild(status.element)
			statuses.push(status)
		}



	}// constructor

}//class Main