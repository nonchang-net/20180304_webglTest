/*

# GameScene.ts

Copyright(C) nonchang.net All rights reserved.

## 概要

- Three.jsシーン管理をmain.tsからひっぺがす


## 直近ではやらないこと

- `将来的に` Sceneは差し替え可能な設計にしたい。

*/

import * as THREE from 'three';
import { default as MyUIEvents } from '../Event/UIEvent';
import * as Maze from '../Dangeon/Maze';
import { default as GameEvents } from '../Event/GameEvents';
import { default as Tween } from "../Common/Tween"

// シーンラッパー
// シーン管理クラスはこれを実装する
// export interface ISceneWrapper{

// }

// class SceneWrapper implements ISceneWrapper{

// }
// export class SampleScene extends SceneWrapper{

export class GameScene {

	private uiElement: HTMLElement
	private uiEvent: MyUIEvents

	private renderer: THREE.WebGLRenderer
	private camera: THREE.PerspectiveCamera
	private scene: THREE.Scene

	private box: THREE.Mesh
	private mesh: THREE.Mesh
	private floor: THREE.Mesh //TODO

	private dirty: boolean = false

	constructor(events: GameEvents, canvasElement: HTMLCanvasElement, uiEvent: MyUIEvents, uiElement: HTMLElement) {

		this.uiEvent = uiEvent
		this.uiElement = uiElement

		this.uiElement.style.background = "rgba(255,0,0,1)"
		this.uiElement.style.width = "100%"
		this.uiElement.style.height = "100%"

		// レンダラーを作成 - こっちはcanvasタグ取得。UIレイヤを重ねるのでとりあえずこの仕様で。
		this.renderer = new THREE.WebGLRenderer({ canvas: canvasElement })

		// レンダラーのサイズを設定
		this.renderer.setSize(window.innerWidth, window.innerHeight)

		this.InitCamera()
		this.UpdateCamera()

		// イベント登録
		window.addEventListener('resize', () => { //TODO: イベント名は一箇所にまとめる
			this.UpdateCamera()
		})

		// UIEvent経由のカスタムイベントでタッチ操作取得
		// - TODO: 作業中の仮組
		// - 最終的には、スワイプで90度単位の左右回転・タップで前進という挙動にしたい。
		canvasElement.addEventListener('window.mousemove', (event: CustomEvent) => { //TODO: イベント名は一箇所にまとめる
			// TEST: 試しにマウスで動かしてみる

			// カメラ回転: 横方向
			this.camera.rotation.y -= event.detail.delta.x / this.uiEvent.referenceLength * 5.0

			// カメラ回転: 縦方向
			// this.camera.rotation.x -= event.detail.delta.y / this.uiEvent.referenceLength * 5.0
			this.camera.translateZ(event.detail.delta.y / this.uiEvent.referenceLength * -400.0)

			this.dirty = true
		})

		// ゲームイベント
		events.Button.StepToForward.subscribe(this.constructor.name, () => {
			events.UI.Disable.broadcast()
			Tween.To({
				onUpdate: (x) => {
					// console.log(`step to forward ${x}`)
					this.camera.translateZ(-5)
					this.dirty = true
				},
				onComplete: () => {
					events.UI.Enable.broadcast()
				}
			})
		})

		// events.Button.TurnRight.subscribe(this.constructor.name, () => {
		// 	events.UI.Disable.broadcast()
		// 	Tween.To({
		// 		// values: {

		// 		// },
		// 		onUpdate: (x) => {
		// 			this.camera.translateZ(-5)
		// 			this.dirty = true
		// 		},
		// 		onComplete: () => {
		// 			events.UI.Enable.broadcast()
		// 		}
		// 	})
		// })

		//デバッグイベント
		events.Debug.KeyA.subscribe(this.constructor.name, () => {
			console.log("65 pressed : ")
			// this.box.rotation.x += 0.3
			// this.box.rotation.y += 0.05
			// this.mesh.rotation.x += 0.3
			// this.mesh.rotation.y += 0.05
		})
		events.Debug.TestForward.subscribe(this.constructor.name, () => {
			this.camera.translateZ(-5)
			this.dirty = true
		})
		events.Debug.TestLeft.subscribe(this.constructor.name, () => {
			// this.camera.rotateY(0.05)
			console.log(this.camera.rotation.y);
			this.camera.rotation.y += 0.05
			this.dirty = true
		})
		events.Debug.TestRight.subscribe(this.constructor.name, () => {
			// this.camera.rotateY(-0.05)
			console.log(this.camera.rotation.y);
			this.camera.rotation.y -= 0.05
			this.dirty = true
		})
		events.Debug.TestDown.subscribe(this.constructor.name, () => {
			this.camera.translateZ(5)
			this.dirty = true
		})

		// note: ゲーム初期化完了までTick()は回さないこと。InitGameSceneの末尾で呼び出す
		// - 初期化フローがわかりにくいのでシンプルにしたい。

	}//constructor

	Tick() {

		requestAnimationFrame(() => { this.Tick() })
		if (!this.dirty) return

		// console.log(`pos = ${Math.floor(this.camera.position.x)} : ${Math.floor(this.camera.position.z)} : rot = ${Math.floor(this.camera.rotation.y*100)}`);
		this.renderer.render(this.scene, this.camera)
		this.dirty = false
	}



	//===================================
	// 初期化・自動レイアウト追従

	InitCamera() {

		// レンダラー解像度指定
		// this.renderer.setPixelRatio(0.5); //ぼやけ気味。低負荷で確認したいときなどに。
		// this.renderer.setPixelRatio(1); //retina無効状態
		// this.renderer.setPixelRatio(2); //倍解像度(非retinaで綺麗)
		// this.renderer.setPixelRatio(window.devicePixelRatio); //retinaなどではくっきり高画質
		// 以上の結果をもとに、以下の判断。
		// - 非retinaでのPCではアンチエイリアスを期待して倍解像度
		// - retinaではdevice解像度」を適用
		if (window.devicePixelRatio <= 1) {
			this.renderer.setPixelRatio(2); //倍解像度(非retinaで綺麗)
		} else {
			this.renderer.setPixelRatio(window.devicePixelRatio); //retinaなどではくっきり高画質
		}

		this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000)
		this.camera.position.set(0, 0, +1000)
		this.dirty = true

		// this.UpdateCamera()
	}

	UpdateCamera() {
		// サイズを取得
		// console.log(`this.uiElement.clientWidth = ${this.uiElement.clientWidth}`)
		const width = this.uiElement.clientWidth;
		const height = this.uiElement.clientHeight;

		this.renderer.setSize(width, height);

		// カメラのアスペクト比を正す
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();

		this.dirty = true
	}


	wallTexture: THREE.Texture


	//===================================
	//scene take2: 迷路を受け取ってダンジョン生成
	InitGameScene(maze: Maze.Maze) {
		this.scene = new THREE.Scene()

		//壁テクスチャ
		this.wallTexture = THREE.ImageUtils.loadTexture("textures/sample/wall01.jpg", null, () => {
			this.InitGameScene2(maze)
		})
	}

	InitGameScene2(maze: Maze.Maze) {
		//地面
		var landTexture = THREE.ImageUtils.loadTexture("textures/sample/land01.jpg");
		var landMaterial = new THREE.MeshPhongMaterial({ map: landTexture, side: THREE.DoubleSide, bumpMap: landTexture, bumpScale: 0.2 });

		// 平行光源を生成
		const light = new THREE.DirectionalLight(0xffffff)
		light.position.set(1, 1, 1)
		this.scene.add(light)

		//壁作成
		const BLOCK_WIDTH = 100
		const PADDING = 0

		const geometry = new THREE.Geometry();
		for (let x = 0; x < maze.cells.length; x++) {
			for (let y = 0; y < maze.cells[x].length; y++) {

				if (maze.cells[x][y].kind == Maze.CellKind.Floor) {
					continue;
				}

				// 立方体個別の要素を作成
				const meshTemp = new THREE.Mesh(
					new THREE.BoxGeometry(BLOCK_WIDTH - PADDING, BLOCK_WIDTH - PADDING, BLOCK_WIDTH - PADDING)
				);
				// XYZ座標を設定
				meshTemp.position.set(
					BLOCK_WIDTH * x,
					0,
					BLOCK_WIDTH * y
				);
				//メッシュをマージ
				geometry.mergeMesh(meshTemp);
			}
		}

		// const material = new THREE.MeshPhongMaterial({color: 0x99ff33})
		const material = new THREE.MeshPhongMaterial({
			map: this.wallTexture,
			bumpMap: this.wallTexture,
			bumpScale: 0.2
			// color: Math.random()*0xFFFFFF
		})
		this.mesh = new THREE.Mesh(geometry, material);
		this.scene.add(this.mesh);

		//環境光
		const light2 = new THREE.AmbientLight(0xffffff, 0.3)
		this.scene.add(light2)

		//フォグ
		this.scene.fog = new THREE.Fog(0x000000, 10, 500);

		// ゲームループ開始
		this.dirty = true
		this.Tick()
	}






	//===================================
	//scene take1: 箱を並べてみる初期サンプル
	InitSampleScene() {
		// シーンを作成
		this.scene = new THREE.Scene()

		// すごく縦長の紫色の箱を作成
		const geometry = new THREE.BoxGeometry(10, 10000, 10)
		const material = new THREE.MeshPhongMaterial({ color: 0xff00ff })
		this.box = new THREE.Mesh(geometry, material)
		this.box.position.z = -5
		this.scene.add(this.box)

		//壁テクスチャ
		var texture = THREE.ImageUtils.loadTexture("textures/sample/wall01.jpg");


		// 1ジオメトリにメッシュを詰め込む
		// 個別に動かない要素はドローコールをまとめられる
		{
			const CELL_NUM = 5;

			// 空のジオメトリを作成
			const geometry = new THREE.Geometry();

			// Box
			for (let i = 0; i < CELL_NUM; i++) {
				for (let j = 0; j < CELL_NUM; j++) {
					for (let k = 0; k < CELL_NUM; k++) {
						// 立方体個別の要素を作成
						const meshTemp = new THREE.Mesh(
							new THREE.BoxGeometry(30, 30, 30)
						);

						// XYZ座標を設定
						meshTemp.position.set(
							40 * (i - CELL_NUM / 2),
							40 * (j - CELL_NUM / 2),
							40 * (k - CELL_NUM / 2)
						);

						// メッシュをマージ（結合）
						geometry.mergeMesh(meshTemp);
					}
				}
			}
			// const material = new THREE.MeshPhongMaterial({color: 0x99ff33})
			const material = new THREE.MeshPhongMaterial({
				map: texture,
				bumpMap: texture,
				bumpScale: 0.2
				// color: Math.random()*0xFFFFFF
			})
			this.mesh = new THREE.Mesh(geometry, material);
			this.scene.add(this.mesh);
		}

		// 平行光源を生成
		const light = new THREE.DirectionalLight(0xffffff)
		light.position.set(1, 1, 1)
		this.scene.add(light)

		// ゲームループ開始
		this.dirty = true
		this.Tick()
	}


}