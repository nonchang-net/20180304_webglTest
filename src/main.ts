/*
# main.ts

Copyright(C) nonchang.net All rights reserved.

## 概要

- webpackビルドのエントリポイントです。
- `検討中` 極力、アプリ一般的に最低限必要な処理だけを記載しようと検討中。

## ここでやること

- アプリ初期化
- 実行に必要なcanvasタグの取得。
	- （ここ以外で直接index.htmlのdomを取ることは避ける）

*/
import * as Sub from './sub';
import { default as UI } from './UI/UI';
import { default as Keyboard } from './UI/Keyboard';
import { default as Styler } from './UI/Styler';
import { default as MyUIEvents } from './Event/UIEvent';
import { default as GameEvents } from './Event/GameEvents';

import * as GameScene from './Scenes/GameScene';
import { default as SampleSound } from './Sound/Synthesize/SampleSound';
import * as Maze from './Dangeon/Maze';
import { default as MapView } from './Scenes/MapView';
import Messages from './UI/Messages';


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
		// document.querySelector('canvas'),
		// document.querySelector('div#ui')
		document.querySelector('body')
	);
});

class Main {

	private ui: UI
	private gameScene: GameScene.GameScene //TODO: 名前重複修正
	private dirty: boolean = true

	constructor(body: HTMLBodyElement) {

		//基本セット初期化
		const events = new GameEvents()

		// UI初期化（こちらはただのdivタグのdom）
		const ui = new UI(events, body)

		// キーボードイベント監視クラス初期化
		new Keyboard(events)

		// THREE.js用の3d canvas作成
		const canvas = new Styler("canvas").appendTo(ui.main).getElement()
		ui.main.appendChild(canvas)

		// 3d canvasにマウス・タッチイベント登録
		const uiEvent = new MyUIEvents(canvas)

		// 迷路情報初期化
		// var maze = new Maze.Factory().Create(9, 9)
		var maze = new Maze.Factory().Create(23, 23)

		// マップUI初期化
		const map = new MapView(events, maze)

		// ゲームシーン初期化
		const game = new GameScene.GameScene(events, canvas, map, uiEvent, ui.main)

		// メッセージ
		const messages = new Messages(events, 5, 100)
		ui.main.appendChild(messages.element)

		// messages.add("welcome to cage ver20180407 1524")
		events.UI.AddMessage.broadcast("welcome to cage ver20180407 16:08")

		// 移動イベントでメッセージを出すテスト
		// events.Button.StepToForward.subscribe(this.constructor.name, () => {
		// 	events.UI.AddMessage.broadcast("あなたは前に進んだ。")
		// })
		// events.Button.TurnLeft.subscribe(this.constructor.name, () => {
		// 	events.UI.AddMessage.broadcast("あなたは左に回った。")
		// })
		// events.Button.TurnRight.subscribe(this.constructor.name, () => {
		// 	events.UI.AddMessage.broadcast("あなたは右に回った。")
		// })



		// マップUI更新
		ui.main.appendChild(map.element)
		ui.main.appendChild(map.playerMarkCanvas)
		map.update()
		// map.updatePlayerMark(1, 1)


		// console.log(maze);

		game.InitGameScene(maze)



		// サンプルサウンド初期化: 成功、実装は保留で。
		// new SampleSound();

	}// constructor

}//class Main