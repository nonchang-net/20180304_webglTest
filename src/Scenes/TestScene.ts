


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
