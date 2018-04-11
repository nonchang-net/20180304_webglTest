/**
 * # Textures.ts
 * ## 概要
 * - テクスチャ周りの処理をasync/awaitで切り出したい
 */

import * as THREE from 'three';

export default class Textures {

	//テクスチャ
	textureLoader = new THREE.TextureLoader()

	wall: THREE.Texture
	land: THREE.Texture

	//Blenderモデルexport JSON
	objectLoader = new THREE.ObjectLoader();

	crystal: THREE.Object3D



	async LoadWall(): Promise<{}> {
		//壁テクスチャ
		return new Promise((resolve, reject) => {
			this.textureLoader.load("textures/sample/wall01.jpg", (texture) => {
				this.wall = texture
				texture.anisotropy = 16
				resolve()
			}, (progress) => {
				// note: onProgress callback currently not supported
				// console.log(progress)
			}, (e) => {
				reject(e)
			})
		})
	}

	async LoadLand(): Promise<{}> {
		//地面テクスチャ
		return new Promise((resolve, reject) => {
			this.textureLoader.load("textures/sample/land01.jpg", (texture) => {
				this.land = texture
				texture.anisotropy = 16
				// 以下はリピート設定のテスト
				// this.land.wrapS = THREE.RepeatWrapping;
				// this.land.wrapT = THREE.RepeatWrapping;
				// this.land.repeat.set(maze.cells.length, maze.cells[0].length);
				resolve()
			}, (progress) => {
				// console.log(progress)
			}, (e) => {
				reject(e)
			})
		})
	}

	async LoadBlenderObject(): Promise<{}> {
		// Blenderで出力したjsonファイルの読み込み
		const jsonPath = './models/20180408_crystal.json';

		return new Promise((resolve, reject) => {
			try {
				this.objectLoader.load(jsonPath, (obj) => {
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