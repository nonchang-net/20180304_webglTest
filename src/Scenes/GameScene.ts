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
import { default as MapView } from "./MapView"

// シーンラッパー
// シーン管理クラスはこれを実装する
// export interface ISceneWrapper{

// }

// class SceneWrapper implements ISceneWrapper{

// }
// export class SampleScene extends SceneWrapper{

export class GameScene {

	public uiElement: HTMLElement
	private canvasElement: HTMLCanvasElement
	private uiEvent: MyUIEvents

	// maze
	private maze: Maze.Maze

	// 3d
	private renderer: THREE.WebGLRenderer
	private camera: THREE.PerspectiveCamera
	private scene: THREE.Scene

	private box: THREE.Mesh //unuse?
	private mesh: THREE.Mesh //unuse?
	private floor: THREE.Mesh //unuse?

	private dirty = false
	private interactable = true
	private dragging = false

	private readonly BLOCK_WIDTH = 100
	private readonly FOV = 40

	private ambientLight: THREE.AmbientLight

	constructor(
		events: GameEvents,
		canvasElement: HTMLCanvasElement,
		mapView: MapView,
		uiEvent: MyUIEvents,
		uiElement: HTMLElement
	) {

		this.uiEvent = uiEvent
		this.uiElement = uiElement
		this.canvasElement = canvasElement

		this.uiElement.style.background = "rgba(255,0,0,1)"
		this.uiElement.style.width = "100%"
		this.uiElement.style.height = "100%"

		// レンダラーを作成 - こっちはcanvasタグ取得。UIレイヤを重ねるのでとりあえずこの仕様で。
		this.renderer = new THREE.WebGLRenderer({ canvas: canvasElement })
		this.InitCamera()
		this.UpdateCamera()

		// イベント登録
		window.addEventListener('resize', () => { //TODO: イベント名は一箇所にまとめる
			this.UpdateCamera()
		})

		events.UI.Enable.subscribe(this.constructor.name, () => {
			this.interactable = true
		})
		events.UI.Disable.subscribe(this.constructor.name, () => {
			this.interactable = false
		})


		const broadcastPlayerMove = () => {
			events.Common.PlayerMove.broadcast({ x: this.camera.position.x, y: this.camera.position.z })
		}
		const broadcastPlayerRotate = () => {
			events.Common.PlayerRotate.broadcast(this.camera.rotation.y)
		}

		broadcastPlayerMove()


		// UIEvent経由のカスタムイベントでタッチ操作取得
		// - TODO: 作業中の仮組
		// - 最終的には、スワイプで90度単位の左右回転・タップで前進という挙動にしたい。

		canvasElement.addEventListener('window.mousedown', () => {
			if (!this.interactable) return
			events.UI.Disable.broadcast()
			this.dragging = true

		})

		canvasElement.addEventListener('window.mousemove', (event: CustomEvent) => { //TODO: イベント名は一箇所にまとめる
			// TEST: 試しにマウスで動かしてみる

			// 入力制御
			if (!this.dragging) return

			// カメラ回転: 横方向
			this.camera.rotation.y -= event.detail.delta.x / this.uiEvent.referenceLength * 5.0

			if (this.camera.rotation.y > Math.PI * 2) this.camera.rotation.y -= Math.PI * 2
			if (this.camera.rotation.y < 0) this.camera.rotation.y += Math.PI * 2

			// console.log("mouse y : " + this.camera.rotation.y)

			// カメラ回転: 縦方向移動 - 一旦オフ
			// this.camera.translateZ(event.detail.delta.y / this.uiEvent.referenceLength * -400.0)

			this.dirty = true
		})
		canvasElement.addEventListener('window.mouseup', () => {

			//一番近い「上下左右どこか」に向かってTweenする
			//onUpdateで、数字は 0〜(Math.PI * 2)の間に収まっている状態。
			// 検討: 以下の計算は場当たりすぎる……もっと頭いい書き方があると思う。まあ、動くのでとりあえずはこれで。

			let start = this.camera.rotation.y
			let target: number
			if (start < Math.PI / 4 * 1) {
				target = 0
			} else if (start < Math.PI / 4 * 3) {
				target = Math.PI / 4 * 2
			} else if (start < Math.PI / 4 * 5) {
				target = Math.PI / 4 * 4
			} else if (start < Math.PI / 4 * 7) {
				target = Math.PI / 4 * 6
			} else {
				target = Math.PI / 4 * 8
			}


			Tween.To({
				duration: 100,
				onUpdate: (progress) => {
					this.camera.rotation.y = start + (target - start) * progress
					broadcastPlayerRotate()
					this.dirty = true
				},
				onComplete: () => {
					this.camera.rotation.y = target
					broadcastPlayerRotate()
					this.dirty = true
					this.dragging = false
					events.UI.Enable.broadcast()
				}

			})

		})

		// ゲームイベント
		events.Button.StepToForward.subscribe(this.constructor.name, () => {

			// note: translateで前進するのではなく、tweenさせたいので悩ましい。
			// 3Dの数学には詳しくないので、ここでは雑にTHREE.jsでtranslateさせた結果を計算させることに。
			// - translateして前進した座標を保存
			// - 元の位置に戻す
			// - その差分をtweenする
			// もっといいやり方があれば差し替えたい。
			const startZ = this.camera.position.z
			const startX = this.camera.position.x
			this.camera.translateZ(-this.BLOCK_WIDTH)
			const deltaZ = this.camera.position.z - startZ
			const deltaX = this.camera.position.x - startX
			this.camera.translateZ(this.BLOCK_WIDTH)

			// 壁にぶつかるかチェック
			// FIXME: カメラ座標は1ブロック100。ただfloorすると浮動小数点演算誤差で99.99...とかになったりするので、+1してから100で割るという愚行。。MAPはインデックス管理したほうが良いかも？
			const xIndex = Math.floor((startX + deltaX + 1) / 100);
			const zIndex = Math.floor((startZ + deltaZ + 1) / 100);
			if (this.maze.getCellKind(xIndex, zIndex) == Maze.CellKind.Block) {
				// console.log(`HIT: Block`, startX, startZ, xIndex, zIndex)
				events.UI.AddMessage.broadcast("いてっ！")
				return;
			}
			// console.log(`HIT: floor`, startX, startZ, xIndex, zIndex)

			events.UI.Disable.broadcast()

			Tween.To({
				duration: 100,
				onUpdate: (progress) => {
					// console.log(`step to forward ${x}`)
					// this.camera.translateZ(-5)
					this.camera.position.z = startZ + deltaZ * progress
					this.camera.position.x = startX + deltaX * progress
					broadcastPlayerMove()
					this.dirty = true
				},
				onComplete: () => {
					this.camera.position.z = startZ + deltaZ
					this.camera.position.x = startX + deltaX
					broadcastPlayerMove()
					// console.log(`camera pos : `, this.camera.position)
					this.dirty = true
					events.UI.Enable.broadcast()
				}
			})
		})

		events.Button.StepToBack.subscribe(this.constructor.name, () => {
			events.UI.Disable.broadcast()

			const startZ = this.camera.position.z
			const startX = this.camera.position.x
			this.camera.translateZ(this.BLOCK_WIDTH)
			const deltaZ = this.camera.position.z - startZ
			const deltaX = this.camera.position.x - startX
			this.camera.translateZ(-this.BLOCK_WIDTH)

			Tween.To({
				duration: 100,
				onUpdate: (progress) => {
					// console.log(`step to forward ${x}`)
					// this.camera.translateZ(-5)
					this.camera.position.z = startZ + deltaZ * progress
					this.camera.position.x = startX + deltaX * progress
					broadcastPlayerMove()
					this.dirty = true
				},
				onComplete: () => {
					this.camera.position.z = startZ + deltaZ
					this.camera.position.x = startX + deltaX
					broadcastPlayerMove()
					this.dirty = true
					events.UI.Enable.broadcast()
				}
			})
		})

		events.Button.TurnRight.subscribe(this.constructor.name, () => {
			events.UI.Disable.broadcast()
			const start = this.camera.rotation.y
			Tween.To({
				duration: 300,
				onUpdate: (progress) => {
					this.camera.rotation.y = start - (Math.PI / 2 * progress)
					broadcastPlayerRotate()
					this.dirty = true
				},
				onComplete: () => {
					this.camera.rotation.y = start - (Math.PI / 2)
					broadcastPlayerRotate()
					this.dirty = true
					events.UI.Enable.broadcast()
				}
			})
		})

		events.Button.TurnLeft.subscribe(this.constructor.name, () => {
			events.UI.Disable.broadcast()
			const start = this.camera.rotation.y
			Tween.To({
				duration: 300,
				onUpdate: (progress) => {
					this.camera.rotation.y = start + (Math.PI / 2 * progress)
					broadcastPlayerRotate()
					this.dirty = true
				},
				onComplete: () => {
					this.camera.rotation.y = start + (Math.PI / 2)
					broadcastPlayerRotate()
					this.dirty = true
					events.UI.Enable.broadcast()
				}
			})
		})

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
			console.log(this.camera.position.z);
			this.dirty = true
		})
		events.Debug.TestLeft.subscribe(this.constructor.name, () => {
			// this.camera.rotateY(0.05)
			this.camera.rotation.y += 0.05
			console.log(this.camera.rotation.y);
			this.dirty = true
		})
		events.Debug.TestRight.subscribe(this.constructor.name, () => {
			// this.camera.rotateY(-0.05)
			this.camera.rotation.y -= 0.05
			console.log(this.camera.rotation.y);
			this.dirty = true
		})
		events.Debug.TestDown.subscribe(this.constructor.name, () => {
			this.camera.translateZ(5)
			console.log(this.camera.position.z);
			this.dirty = true
		})

		// note: ゲーム初期化完了までTick()は回さないこと。InitGameSceneの末尾で呼び出す
		// - 初期化フローがわかりにくいのでシンプルにしたい。

	}//constructor


	Tick() {

		requestAnimationFrame(() => { this.Tick() })

		// ランプを揺らす効果テスト
		// note: そこそこ良さそうだけど、チラつくので常時オンはきついかな……？
		// if (Math.random() < 0.03) {
		// 	// たまに弾ける
		// 	const newIntensity = 0.5 + (Math.random() * 1)
		// 	// this.ambientLight.intensity = (this.ambientLight.intensity + newIntensity) / 2
		// 	this.ambientLight.intensity = newIntensity
		// 	this.dirty = true
		// } else {
		// 	if (this.ambientLight.intensity < 0.8) {
		// 		// 弱くなりすぎると息を吹き返したりする
		// 		this.ambientLight.intensity += -0.2 + Math.random() * 0.5
		// 		if (this.ambientLight.intensity > 1) this.ambientLight.intensity = 1
		// 		this.dirty = true
		// 	} else {
		// 		// だんだん弱まる
		// 		this.ambientLight.intensity -= Math.random() * 0.01
		// 		this.dirty = true
		// 	}
		// }

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

		this.camera = new THREE.PerspectiveCamera(
			this.FOV * (this.canvasElement.clientHeight / this.canvasElement.clientWidth),
			this.canvasElement.clientWidth / this.canvasElement.clientHeight,
			1,
			10000
		)
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
		this.camera.aspect = width / height

		// note: 逆アスペクトをfovに乗算することで、画面横幅サイズを維持した画角になる
		this.camera.fov = this.FOV * (height / width)

		this.camera.updateProjectionMatrix();

		//ログ出しして算出した初期位置
		// this.camera.position = new THREE.Vector3(100, 0, 700)
		this.camera.position.x = 100
		this.camera.position.z = 700

		this.dirty = true
	}


	wallTexture: THREE.Texture
	landTexture: THREE.Texture


	//===================================
	//scene take2: 迷路を受け取ってダンジョン生成
	InitGameScene(maze: Maze.Maze) {

		this.maze = maze
		this.scene = new THREE.Scene()

		//壁テクスチャ
		//TODO: 警告出てる。`Use THREE.TextureLoader() instead`
		this.wallTexture = THREE.ImageUtils.loadTexture("textures/sample/wall01.jpg", null, () => {
			this.LoadLandTexture(maze)
		})
		this.wallTexture.anisotropy = 16
	}

	LoadLandTexture(maze: Maze.Maze) {
		//地面テクスチャ
		//TODO: 警告出てる。`Use THREE.TextureLoader() instead`
		this.landTexture = THREE.ImageUtils.loadTexture("textures/sample/land01.jpg", null, () => {
			this.InitGameScene2(maze)
		})
		this.landTexture.anisotropy = 16
		// this.landTexture.wrapS = THREE.RepeatWrapping;
		// this.landTexture.wrapT = THREE.RepeatWrapping;
		// this.landTexture.repeat.set(maze.cells.length, maze.cells[0].length);
	}

	InitGameScene2(maze: Maze.Maze) {

		const PADDING = 0

		//==================
		//床作成
		const landMaterial = new THREE.MeshPhongMaterial({
			map: this.landTexture,
			side: THREE.DoubleSide,
			bumpMap: this.landTexture,
			bumpScale: 0.2,
		});

		// take1 - ワンメッシュを引き伸ばしたい
		// const landGeometry = new THREE.PlaneGeometry(
		// 	this.BLOCK_WIDTH * maze.cells.length * 2,
		// 	this.BLOCK_WIDTH * maze.cells[0].length * 2,
		// 	maze.cells.length,
		// 	maze.cells[0].length
		// )
		// const landMesh = new THREE.Mesh(landGeometry, landMaterial);
		// landMesh.position.set(
		// 	0,
		// 	-this.BLOCK_WIDTH /2 * -1,
		// 	0
		// );
		// // landMesh.rotation.x = 90 * Math.PI / 180;
		// landMesh.rotation.x = Math.PI / 2;

		// take0.5 - セルごとにジオメトリ生成。効率悪いので避けたい
		const landGeometry = new THREE.Geometry();
		for (let x = 0; x < maze.cells.length; x++) {
			for (let y = 0; y < maze.cells[x].length; y++) {

				// 立方体個別の要素を作成
				const meshTemp = new THREE.Mesh(
					new THREE.PlaneGeometry(this.BLOCK_WIDTH, this.BLOCK_WIDTH)
				);
				// XYZ座標を設定
				meshTemp.position.set(
					this.BLOCK_WIDTH * x,
					this.BLOCK_WIDTH / 2 * -1,
					this.BLOCK_WIDTH * y
				);
				meshTemp.rotation.x = Math.PI / 2 * -1;
				//メッシュをマージ
				landGeometry.mergeMesh(meshTemp);
			}
		}
		const landMesh = new THREE.Mesh(landGeometry, landMaterial);

		this.scene.add(landMesh);


		//==================
		//壁作成

		const geometry = new THREE.Geometry();
		for (let x = 0; x < maze.cells.length; x++) {
			for (let y = 0; y < maze.cells[x].length; y++) {

				if (maze.cells[x][y].kind == Maze.CellKind.Floor) {
					continue;
				}

				// 立方体個別の要素を作成
				const meshTemp = new THREE.Mesh(
					new THREE.BoxGeometry(this.BLOCK_WIDTH - PADDING, this.BLOCK_WIDTH - PADDING, this.BLOCK_WIDTH - PADDING)
				);
				// XYZ座標を設定
				meshTemp.position.set(
					this.BLOCK_WIDTH * x,
					0,
					this.BLOCK_WIDTH * y
				);
				//メッシュをマージ
				geometry.mergeMesh(meshTemp);
			}
		}

		// const blockMaterial = new THREE.MeshPhongMaterial({color: 0x99ff33})
		const blockMaterial = new THREE.MeshPhongMaterial({
			map: this.wallTexture,
			bumpMap: this.wallTexture,
			bumpScale: 0.2
			// color: Math.random()*0xFFFFFF
		})
		this.mesh = new THREE.Mesh(geometry, blockMaterial);
		this.scene.add(this.mesh);

		//壁作成ここまで
		//==================

		//==================
		//天井作成

		// take1 - ワンメッシュを引き伸ばしたい
		// const ceilGeometry = new THREE.PlaneGeometry(
		// 	this.BLOCK_WIDTH * maze.cells.length,
		// 	this.BLOCK_WIDTH * maze.cells[0].length,
		// 	maze.cells.length,
		// 	maze.cells[0].length
		// )
		// const ceilMesh = new THREE.Mesh(landGeometry, blockMaterial); //壁マテリアル流用
		// ceilMesh.position.set(
		// 	0,
		// 	+this.BLOCK_WIDTH / 2,
		// 	0
		// );
		// // landMesh.rotation.x = 90 * Math.PI / 180;
		// ceilMesh.rotation.x = Math.PI / 2;

		// take0.5 - セルごとにジオメトリ生成。効率悪いので避けたい
		const ceilGeometry = new THREE.Geometry();
		for (let x = 0; x < maze.cells.length; x++) {
			for (let y = 0; y < maze.cells[x].length; y++) {

				// 立方体個別の要素を作成
				const meshTemp = new THREE.Mesh(
					new THREE.PlaneGeometry(this.BLOCK_WIDTH, this.BLOCK_WIDTH)
				);
				// XYZ座標を設定
				meshTemp.position.set(
					this.BLOCK_WIDTH * x,
					this.BLOCK_WIDTH / 2,
					this.BLOCK_WIDTH * y
				);
				meshTemp.rotation.x = Math.PI / 2;
				//メッシュをマージ
				ceilGeometry.mergeMesh(meshTemp);
			}
		}

		const ceilMesh = new THREE.Mesh(ceilGeometry, blockMaterial);
		this.scene.add(ceilMesh);
		//==================


		//==================
		// ライト、環境

		// 平行光源を生成
		// const light = new THREE.DirectionalLight(0xffffff)
		// light.position.set(1, 1, 1)
		// this.scene.add(light)

		// 環境光
		this.ambientLight = new THREE.AmbientLight(0xffffff, 1)
		this.scene.add(this.ambientLight)

		//ポイントライト
		// const pointLight = new THREE.PointLight(0xffffff, 1000, 0)
		// this.camera.add(pointLight)

		// const spotLight = new THREE.SpotLight(0xffffff, 1, 0, 0, 1)
		// this.camera.add(spotLight)

		//フォグ
		this.scene.fog = new THREE.Fog(0x000000, 0, 350);

		// ゲームループ開始
		this.dirty = true
		this.Tick()
	}






	// //===================================
	// //scene take1: 箱を並べてみる初期サンプル
	// InitSampleScene() {
	// 	// シーンを作成
	// 	this.scene = new THREE.Scene()

	// 	// すごく縦長の紫色の箱を作成
	// 	const geometry = new THREE.BoxGeometry(10, 10000, 10)
	// 	const material = new THREE.MeshPhongMaterial({ color: 0xff00ff })
	// 	this.box = new THREE.Mesh(geometry, material)
	// 	this.box.position.z = -5
	// 	this.scene.add(this.box)

	// 	//壁テクスチャ
	// 	var texture = THREE.ImageUtils.loadTexture("textures/sample/wall01.jpg");


	// 	// 1ジオメトリにメッシュを詰め込む
	// 	// 個別に動かない要素はドローコールをまとめられる
	// 	{
	// 		const CELL_NUM = 5;

	// 		// 空のジオメトリを作成
	// 		const geometry = new THREE.Geometry();

	// 		// Box
	// 		for (let i = 0; i < CELL_NUM; i++) {
	// 			for (let j = 0; j < CELL_NUM; j++) {
	// 				for (let k = 0; k < CELL_NUM; k++) {
	// 					// 立方体個別の要素を作成
	// 					const meshTemp = new THREE.Mesh(
	// 						new THREE.BoxGeometry(30, 30, 30)
	// 					);

	// 					// XYZ座標を設定
	// 					meshTemp.position.set(
	// 						40 * (i - CELL_NUM / 2),
	// 						40 * (j - CELL_NUM / 2),
	// 						40 * (k - CELL_NUM / 2)
	// 					);

	// 					// メッシュをマージ（結合）
	// 					geometry.mergeMesh(meshTemp);
	// 				}
	// 			}
	// 		}
	// 		// const material = new THREE.MeshPhongMaterial({color: 0x99ff33})
	// 		const material = new THREE.MeshPhongMaterial({
	// 			map: texture,
	// 			bumpMap: texture,
	// 			bumpScale: 0.2
	// 			// color: Math.random()*0xFFFFFF
	// 		})
	// 		this.mesh = new THREE.Mesh(geometry, material);
	// 		this.scene.add(this.mesh);
	// 	}

	// 	// 平行光源を生成
	// 	const light = new THREE.DirectionalLight(0xffffff)
	// 	light.position.set(1, 1, 1)
	// 	this.scene.add(light)

	// 	// ゲームループ開始
	// 	this.dirty = true
	// 	this.Tick()
	// }


}