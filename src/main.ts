/*
# main.ts

Copyright(C) xxx. All rights reserved.

## 概要

- webpackビルドのエントリポイントです。
- `検討中` 極力、アプリ一般的に最低限必要な処理だけを記載しようと検討中。

## ここでやること

- アプリ初期化
- 実行に必要なcanvasタグの取得。
	- （ここ以外で直接index.htmlのdomを取ることは避ける）

*/
import * as THREE from 'three';
import * as Sub from './sub';
import {default as UI} from './UI/UI';
import {default as UIEvent} from './Event/UIEvent';
import {ISceneWrapper,SampleScene} from './Scenes/SampleScene/SampleScene';

import * as Tone from 'tone';

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

	private UI: UI
	private UIEvent: UIEvent

	private dirty: boolean = true
	private renderer: THREE.WebGLRenderer
	private camera: THREE.PerspectiveCamera
	private scene: THREE.Scene
	private canvas: HTMLCanvasElement

	private box: THREE.Mesh
	private mesh: THREE.Mesh

	constructor(canvasElement: HTMLCanvasElement, uiElement: HTMLElement){

		// Tone.jsテスト: 鳴った！
		// - これはシンセ制御からしてみたい欲求にすごく貢献しそうなアレ。
		// - d.tsはまだimportしてない。 : https://github.com/Tonejs/TypeScript
		// var synth = new Tone.Synth().toMaster();
		// synth.triggerAttackRelease("C4", "8n");

		// UI初期化（こちらはただのdivタグのdom）
		this.UI = new UI(uiElement)
		this.UIEvent = new UIEvent(uiElement)

		// レンダラーを作成 - dom生成する例
		// const renderer = new THREE.WebGLRenderer()
		// canvasをbodyに追加
		// document.body.appendChild(renderer.domElement)

		// レンダラーを作成 - こっちはcanvasタグ取得。UIレイヤを重ねるのでとりあえずこの仕様で。
		this.renderer = new THREE.WebGLRenderer({canvas: canvasElement})

		// レンダラーのサイズを設定
		this.renderer.setSize(window.innerWidth, window.innerHeight)

		this.InitCamera()
		this.InitScenes();
		
		// イベント

		this.UIEvent.uiElement.addEventListener('window.resize',()=>{ //TODO: イベント名は一箇所にまとめる
			this.UpdateCamera()
		})
		this.UIEvent.uiElement.addEventListener('window.mousemove',(event: CustomEvent)=>{ //TODO: イベント名は一箇所にまとめる

			// console.log(event)

			// 試しにマウスで動かしてみる
			// - 軸がさっぱりで何のことやら。。
			this.mesh.rotation.y -= event.detail.delta.x * 0.05
			this.mesh.rotation.x -= event.detail.delta.y * 0.05
			this.dirty = true
		})


		this.Tick()
	}

	InitScenes(){
		// シーンを作成
		this.scene = new THREE.Scene()

		// 箱を作成
		const geometry = new THREE.BoxGeometry(10, 10000, 10)
		const material = new THREE.MeshPhongMaterial({color: 0xff33ff})
		this.box      = new THREE.Mesh(geometry, material)
		this.box.position.z = -5
		this.scene.add(this.box)

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
			const material = new THREE.MeshPhongMaterial({color: Math.random()*0xFFFFFF})
			this.mesh = new THREE.Mesh(geometry, material);
			this.scene.add(this.mesh);
		}

		// 平行光源を生成
		const light = new THREE.DirectionalLight(0xffffff)
		light.position.set(1, 1, 1)
		this.scene.add(light)

	}

	Tick(){
		requestAnimationFrame(()=>{this.Tick()})

		// TODO: 責務を分離したい。Scenesに管理させるべき？

		// console.log("65 pressed : "+this.pressed[65])
		if(this.UIEvent.pressed[65]){
			this.dirty=true
			this.box.rotation.x += 0.05
			this.box.rotation.y += 0.05
			this.mesh.rotation.x += 0.05
			this.mesh.rotation.y += 0.05
		}
		if(!this.dirty) return

		// 描画
		this.renderer.render(this.scene, this.camera)
		this.dirty=false
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