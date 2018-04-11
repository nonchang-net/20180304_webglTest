/**
 * # Textures.ts
 * ## 概要
 * - テクスチャ周りの処理をasync/awaitで切り出したい
 */

import * as THREE from 'three';

export default class Textures {


	wall: THREE.Texture
	land: THREE.Texture

	crystal: THREE.Object3D

	async LoadWall() {
		//壁テクスチャ
		//TODO: 警告出てる。`Use THREE.TextureLoader() instead`
		this.wall = await THREE.ImageUtils.loadTexture("textures/sample/wall01.jpg", null)
		this.wall.anisotropy = 16
	}

	async LoadLand() {
		//地面テクスチャ
		//TODO: 警告出てる。`Use THREE.TextureLoader() instead`
		this.land = await THREE.ImageUtils.loadTexture("textures/sample/land01.jpg", null)
		this.land.anisotropy = 16

		// 以下はリピート設定のテスト
		// this.land.wrapS = THREE.RepeatWrapping;
		// this.land.wrapT = THREE.RepeatWrapping;
		// this.land.repeat.set(maze.cells.length, maze.cells[0].length);
	}

	async LoadBlenderObject(): Promise<{}> {
		// Blenderで出力したjsonファイルの読み込み
		const jsonPath = './models/20180408_crystal.json';

		const loader = new THREE.ObjectLoader();

		// take1: loadler.loadはawaitできてないようでエラー
		// await loader.load(jsonPath, (obj) => {
		// 	obj.position.set(200, 0, 100)
		// 	obj.scale.set(10, 10, 10);
		// 	this.crystal = obj
		// });

		// Promiseで包んだら治った
		return new Promise((resolve, reject) => {
			try {
				loader.load(jsonPath, (obj) => {
					obj.position.set(200, 0, 100)
					obj.scale.set(10, 10, 10);
					this.crystal = obj
					resolve()
				});
			} catch (e) {
				reject(e)
			}
		})
	}


}




	// //===================================
	// //scene take2: 迷路を受け取ってダンジョン生成
	// async InitGameScene() {


	// 	//壁テクスチャ
	// 	//TODO: 警告出てる。`Use THREE.TextureLoader() instead`
	// 	this.wallTexture = await THREE.ImageUtils.loadTexture("textures/sample/wall01.jpg", null, () => {
	// 		this.LoadLandTexture(maze)
	// 	})
	// 	this.wallTexture.anisotropy = 16
	// }

	// async LoadLandTexture() {
	// 	//地面テクスチャ
	// 	//TODO: 警告出てる。`Use THREE.TextureLoader() instead`
	// 	this.landTexture = await THREE.ImageUtils.loadTexture("textures/sample/land01.jpg", null, () => {
	// 		this.InitGameScene2(maze)
	// 	})
	// 	this.landTexture.anisotropy = 16
	// 	// this.landTexture.wrapS = THREE.RepeatWrapping;
	// 	// this.landTexture.wrapT = THREE.RepeatWrapping;
	// 	// this.landTexture.repeat.set(maze.cells.length, maze.cells[0].length);
	// }


	// LoadBlenderObject() {
	// 	// Blenderで出力したjsonファイルの読み込み
	// 	const json = './models/20180408_crystal.json';

	// 	const loader = new THREE.ObjectLoader();
	// 	loader.load(json, (obj) => {
	// 		obj.position.set(200, 0, 100)
	// 		obj.scale.set(10, 10, 10);
	// 		setInterval(() => {
	// 			obj.rotateOnAxis(new THREE.Vector3(0, 1, 0), 0.05)
	// 			this.dirty = true
	// 		}, 33.3)
	// 		this.scene.add(obj);
	// 	});
	// }