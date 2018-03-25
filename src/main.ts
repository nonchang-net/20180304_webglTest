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
import {default as UI} from './UI/UI';
import {default as MyUIEvents} from './Event/UIEvent';
import * as GameScene from './Scenes/GameScene';
import {default as SampleSound} from './Sound/Synthesize/SampleSound';
import * as Maze from './Dangeon/Maze';


// Windowスコープを拡張: コンソールからMainのpublic要素にアクセスできるように
// 例: console.log("test",window.Main.dirty) //note: 実行時はjavascriptなので、privateプロパティも参照できる点に注意
declare global{
	interface Window{
		Main?
	}
}

// bootstrap
window.addEventListener('DOMContentLoaded', () => {
	window.Main = new Main(
		document.querySelector('canvas'),
		document.querySelector('div#ui')
	);
});

class Main{

	private ui: UI
	private gameScene: GameScene.GameScene //TODO: 名前重複修正
	private dirty: boolean = true


	constructor(canvasElement: HTMLCanvasElement, uiElement: HTMLElement){

		console.log(`ver 20180325 1929`)

		// UI初期化（こちらはただのdivタグのdom）
		const ui = new UI(uiElement)
		const uiEvent = new MyUIEvents(uiElement)
		const game = new GameScene.GameScene(canvasElement, uiEvent, uiElement)


		var maze = new Maze.Factory().Create(9, 9)
		console.log(maze);

		// game.InitSampleScene()
		game.InitGameScene(maze)
		

		// サンプルサウンド初期化: 成功、実装は保留で。
		// new SampleSound();
	}

}