/*

# GameScene.ts

Copyright(C) nonchang.net All rights reserved.

## 概要

- Three.jsシーン管理をmain.tsからひっぺがす


## 直近ではやらないこと

- `将来的に` Sceneは差し替え可能な設計にしたい。

*/

import * as THREE from 'three';
import {default as MyUIEvents} from '../Event/UIEvent';
import * as Maze from '../Dangeon/Maze';

// シーンラッパー
// シーン管理クラスはこれを実装する
// export interface ISceneWrapper{

// }

// class SceneWrapper implements ISceneWrapper{

// }
// export class SampleScene extends SceneWrapper{

export class GameScene{

	private uiElement: HTMLElement
	private uiEvent: MyUIEvents

	private renderer: THREE.WebGLRenderer
	private camera: THREE.PerspectiveCamera
	private scene: THREE.Scene

	private box: THREE.Mesh
	private mesh: THREE.Mesh
	private floor: THREE.Mesh //TODO

	private dirty: boolean = true

	constructor(canvasElement: HTMLCanvasElement, uiEvent: MyUIEvents, uiElement: HTMLElement){

		this.uiEvent = uiEvent
		this.uiElement = uiElement

		// レンダラーを作成 - dom生成する例
		// const renderer = new THREE.WebGLRenderer()
		// canvasをbodyに追加
		// document.body.appendChild(renderer.domElement)

		// レンダラーを作成 - こっちはcanvasタグ取得。UIレイヤを重ねるのでとりあえずこの仕様で。
		this.renderer = new THREE.WebGLRenderer({canvas: canvasElement})

		// レンダラーのサイズを設定
		this.renderer.setSize(window.innerWidth, window.innerHeight)

		this.InitCamera()

		// イベント

		this.uiElement.addEventListener('window.resize',()=>{ //TODO: イベント名は一箇所にまとめる
			this.UpdateCamera()
		})

		// マウスイベント
		// TODO - カメラの移動に置き換える
		this.uiElement.addEventListener('window.mousemove',(event: CustomEvent)=>{ //TODO: イベント名は一箇所にまとめる

			// console.log(event)

			// 試しにマウスで動かしてみる


			// // メッシュ回転: 横方向
			// this.mesh.rotation.y -= event.detail.delta.x / this.uiEvent.referenceLength * 5.0

			// // メッシュ回転: 縦方向
			// this.mesh.rotation.x -= event.detail.delta.y / this.uiEvent.referenceLength * 5.0

			// カメラ回転: 横方向
			this.camera.rotation.y -= event.detail.delta.x / this.uiEvent.referenceLength * 5.0

			// カメラ回転: 縦方向
			this.camera.rotation.x -= event.detail.delta.y / this.uiEvent.referenceLength * 5.0

			this.dirty = true
		})
	}

	Tick(){
		requestAnimationFrame(()=>{this.Tick()})

		// TODO: 責務を分離したい。Scenesに管理させるべき？

		// DEBUG - aキーでなんか動かす
		// note: 65 = 「a」キー
		if(this.uiEvent.pressed[65]){
			console.log("65 pressed : ")
			this.dirty=true
			// this.box.rotation.x += 0.3
			// this.box.rotation.y += 0.05
			// this.mesh.rotation.x += 0.3
			// this.mesh.rotation.y += 0.05
		}

		// if(Math.abs(this.mesh.rotation.x) != 0){
		// 	this.dirty=true
		// 	console.log(Math.abs(this.mesh.rotation.x))
		// 	this.mesh.rotation.x /= 1.5
		// 	if(Math.abs(this.mesh.rotation.x) < 0.1){
		// 		this.mesh.rotation.x = 0
		// 	}
		// }

		//上下damping - 成功、一時オフ
		// if(Math.abs(this.camera.rotation.x) != 0){
		// 	this.dirty=true
		// 	// console.log(Math.abs(this.camera.rotation.x))
		// 	this.camera.rotation.x /= 1.5
		// 	if(Math.abs(this.camera.rotation.x) < 0.1){
		// 		this.camera.rotation.x = 0
		// 	}
		// }

		// カーソル
		if (this.uiEvent.pressed[39]) {//right
			console.log("pressed 39")
			this.camera.rotateY(-0.05)
			this.dirty=true
		}

		if (this.uiEvent.pressed[37]) {//left
			console.log("pressed 37")
			this.camera.rotateY(0.05)
			this.dirty=true
		}

		if (this.uiEvent.pressed[38]) {//up
			console.log("pressed 38 up")
			this.camera.translateZ(-5)
			this.dirty=true
		}

		if (this.uiEvent.pressed[40]) {//down
			console.log("pressed 40 up")
			this.camera.translateZ(5)
			this.dirty=true
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

		if(!this.dirty){
			return
		}

		// 描画
		this.renderer.render(this.scene, this.camera)
		this.dirty=false
	}




	
	//===================================
	//scene take2: 迷路を受け取ってダンジョン生成
	InitGameScene(maze: Maze.Maze){
		this.scene = new THREE.Scene()

		//壁テクスチャ読み込み
		var texture = THREE.ImageUtils.loadTexture("textures/sample/wall01.jpg");

		// 平行光源を生成
		const light = new THREE.DirectionalLight(0xffffff)
		light.position.set(1, 1, 1)
		this.scene.add(light)

		//壁作成
		const BLOCK_WIDTH=100
		const PADDING = 0

		const geometry = new THREE.Geometry();
		for (let x = 0; x < maze.cells.length; x++) {
			for (let y = 0; y < maze.cells[x].length; y++) {

				if(maze.cells[x][y].kind == Maze.CellKind.Floor){
					continue ;
				}

				// 立方体個別の要素を作成
				const meshTemp = new THREE.Mesh(
					new THREE.BoxGeometry(BLOCK_WIDTH-PADDING, BLOCK_WIDTH-PADDING, BLOCK_WIDTH-PADDING)
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
			map: texture,
			bumpMap: texture,
			bumpScale: 0.2
			// color: Math.random()*0xFFFFFF
		})
		this.mesh = new THREE.Mesh(geometry, material);
		this.scene.add(this.mesh);
		
		//環境光
		const light2 = new THREE.AmbientLight(0xffffff,0.3)
		this.scene.add(light2)

		this.Tick()
	}






	//===================================
	//scene take1: 箱を並べてみる初期サンプル
	InitSampleScene(){
		// シーンを作成
		this.scene = new THREE.Scene()

		// すごく縦長の紫色の箱を作成
		const geometry = new THREE.BoxGeometry(10, 10000, 10)
		const material = new THREE.MeshPhongMaterial({color: 0xff00ff})
		this.box      = new THREE.Mesh(geometry, material)
		this.box.position.z = -5
		this.scene.add(this.box)

		/*
		        // 壁
        var geometry = new THREE.CubeGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        var texture = new THREE.ImageUtils.loadTexture("wall01.jpg");
        var material = new THREE.MeshPhongMaterial({map: texture, bumpMap: texture, bumpScale: 0.2});
        for (i = 0, max = MAP.length; i < max; i = i + 1) {
            for (j = 0, max2 = MAP[i].length; j < max2; j = j + 1) {
                if (MAP[i][j] == 1) {
                    var cube = new THREE.Mesh(geometry, material);
                    cube.position.set(BLOCK_SIZE * j, BLOCK_SIZE / 2, BLOCK_SIZE * i);
                    scene.add(cube);
                }
            }
        }
		
		*/
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

		//アップデート開始
		this.Tick()
	}


	InitCamera(){

		// レンダラー解像度指定
		// this.renderer.setPixelRatio(0.5); //ぼやけ気味。低負荷で確認したいときなどに。
		// this.renderer.setPixelRatio(1); //retina無効状態
		// this.renderer.setPixelRatio(2); //倍解像度(非retinaで綺麗)
		// this.renderer.setPixelRatio(window.devicePixelRatio); //retinaなどではくっきり高画質
		// 以上の結果をもとに、以下の判断。
		// - 非retinaでのPCではアンチエイリアスを期待して倍解像度
		// - retinaではdevice解像度」を適用
		if(window.devicePixelRatio <= 1){
			this.renderer.setPixelRatio(2); //倍解像度(非retinaで綺麗)
		}else{
			this.renderer.setPixelRatio(window.devicePixelRatio); //retinaなどではくっきり高画質
		}

		this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000)
		this.camera.position.set(0, 0, +1000)
		this.dirty = true
	}

	UpdateCamera(){
		// サイズを取得
		const width = window.innerWidth;
		const height = window.innerHeight;

		this.renderer.setSize(width, height);
	  
		// カメラのアスペクト比を正す
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		
		this.dirty = true
	}

}