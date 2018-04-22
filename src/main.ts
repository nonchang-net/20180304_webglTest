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
import GameEvents from './Event/GameEvents'
import UI from './UI/UI'
import Keyboard from './UI/Keyboard'
import Styler from './UI/Styler'
import MyUIEvents from './Event/UIEvent'

import ThreeDScene from './Scenes/ThreeDScene'

import { default as SoundManager, BGMKind } from './Sound/SoundManager'
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
import Bar from './UI/Bar';
import Encount from './UI/Encount';
import TitleScene from './Scenes/TitleScene';

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

export default class Main {

	static readonly version = "20180421.1802.00"

	private ui: UI
	private gameScene: ThreeDScene
	private dirty: boolean = true
	private maze: Maze.Maze
	private minimap: MapView

	constructor(body: HTMLBodyElement) {
		this.initAsync(body)
	}

	private async initAsync(body: HTMLBodyElement) {

		body.style.overflow = "hidden"

		// =====================
		// ゲームイベント初期化
		// - 初期化時にイベント登録を行うモジュールが多いため、最初に実行する必要がある
		const events = new GameEvents()

		// =====================
		// マスターデータ初期化
		// TODO: マスターデータ更新通信はService Worker？ この辺知識が足りてないので要調査。
		const master = new MasterData()
		let lastUpdate = 0 //TODO: 現状、比較対象が-1なので必ず更新になってる
		await master.asyncSetup(lastUpdate)

		// console.log("master dump", master.monsters.defs)
		const user = new UserData(master)


		// =====================
		// TEST: Reactive Property検討。とりあえず少ない記述で目標は達成？
		// ただ、gameState enumの出番はないかも。async/awaitとイベントでシーン遷移は十分管理できる認識
		// ステータスのHPバーなどのUI更新で使いたいかも。TODO。
		// user.gameState.subscribe(this.constructor.name, (state) => {
		// 	console.log(`state changed. ${state}`)
		// })
		// user.gameState.value = GameStateKind.InGame


		// =====================
		// UI初期化
		// タイトル用ボタン領域表示
		const ui = new UI(events, body)
		this.ui = ui

		// =====================
		// サウンド初期化
		// TODO: マスター読ませてロードファイル名を管理させたい
		const soundManager = new SoundManager(events)
		await soundManager.asyncSetup()
		soundManager.startBGM(BGMKind.Opening)

		// =====================
		// タイトルシーン初期化・入力待機
		const titleScene = new TitleScene(events)
		ui.main.appendChild(titleScene.element)
		await titleScene.start()
		soundManager.startBGM(BGMKind.Quest)

		// =====================
		// ゲームシーン用下部ボタン初期化
		await ui.initGameButton()

		// =====================
		// キーボードイベント監視クラス初期化
		new Keyboard(events)

		// =====================
		// メッセージシステム初期化
		// - UI初期化後
		const messages = new Messages(events, 5, 100)
		ui.main.appendChild(messages.element)

		// =====================
		// THREE.js用の3d canvas作成
		const canvas = new Styler("canvas").appendTo(ui.main).getElement()
		ui.main.appendChild(canvas)

		// =====================
		// 3d canvas用のマウス・タッチイベント登録
		// - 3D Canvas初期化後
		const uiEvent = new MyUIEvents(canvas)

		// =====================
		// 迷路情報初期化
		this.initMaze()

		// =====================
		// マップUI初期化
		// - events, maze初期化後
		const map = new MapView(events, this.maze)
		this.minimap = map
		ui.main.appendChild(map.element)
		ui.main.appendChild(map.playerMarkCanvas)
		map.update()

		// =====================
		// ゲームシーン初期化
		const game = new ThreeDScene(events, canvas, map, uiEvent, ui.main)
		await game.InitGameScene(this.maze)

		// =====================
		// welcomeメッセージとバージョン情報
		events.UI.AddMessage.broadcast(`welcome to cage [ver ${Main.version}]`)

		// =====================
		// 敵エンカウントグラフィックス表示UI

		const encountUI = new Encount(events, ui)
		ui.main.appendChild(encountUI.element)
		// await encountUI.encount(0)



		// =====================
		// 移動イベントでメッセージを出すテスト
		// TODO: これらのロジックはどこにおくべきだろう？ 少なくとも、main.tsからは外したい。
		events.Common.PlayerStepToForwardSuccess.subscribe(this.constructor.name, () => {
			events.UI.AddMessage.broadcast("あなたたちは前に進んだ。")
		})

		//歩行完了イベント
		events.Common.PlayerStepToForwardSucceed.subscribe(this.constructor.name, () => {
			if (Math.random() > 0.8) {
				// エンカウント
				// TODO: エンカウントは「歩き始める前」の方がよくないか？ 壁際エンカウントを防げる。
				// TODO: モンスターマスターの直接参照は是か非か。ちょっと考えたい。。
				const monsterIndex = Math.floor(Math.random() * master.monsters.definitions.length)
				console.log(`test : ${master.monsters.definitions[monsterIndex].name}`);
				(async () => {
					if (Math.random() > 0.5) {
						soundManager.startBGM(BGMKind.Battle)
					} else {
						soundManager.startBGM(BGMKind.BossBattle)
					}
					await encountUI.encount(monsterIndex)
					await encountUI.clear()
					soundManager.startBGM(BGMKind.Quest)
				})()
			}
		})

		events.Common.PlayerStepToForwardAndHitBlock.subscribe(this.constructor.name, () => {
			events.UI.Disable.broadcast()

			// 壁に当たった時のメッセージ
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

		//タイトルに戻すイベント

		events.Common.BackToTitle.subscribe(this.constructor.name, () => {
			this.backToTitle()
		})

		// =====================
		// 味方ステータス表示テスト

		const statusDiv = new Styler("div").abs().t(5).l(5).appendTo(ui.main).getElement()

		const statuses = new Array<CharacterStatus>()

		for (const userCharacterData of user.party.characters) {
			const status = new CharacterStatus(userCharacterData)
			statusDiv.appendChild(status.element)
			statuses.push(status)
		}

	}// constructor


	// =====================
	// タイトルに戻る
	// - ここでは迷路の再初期化

	private backToTitle() {
		this.initMaze()
		this.minimap.maze = this.maze
		this.minimap.update()
	}


	// =====================
	// 迷路情報初期化
	// TODO: マスターからフロア定義を読ませたい
	private initMaze() {
		// var maze = new Maze.Factory().Create(9, 9)
		var maze = new Maze.Factory().Create(23, 23)
		this.maze = maze
		// console.log(maze);


	}


}//class Main