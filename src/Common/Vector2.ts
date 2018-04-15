/*

# Vector2.ts

## 概要

- Unityの真似っこ
- 座標に限らずx,yセットなデータって多い。
	- とりあえず目パチフレームのインデックス表現マスターデータにこれ使う。
- 演算メソッドは必要に応じて追加していくつもり
	- 演算子オーバーロードしたいな……

*/
export default class Vector2 {
	x: number
	y: number

	constructor(props: Partial<Vector2>) {
		Object.assign(this, props);
	}

	static One = new Vector2({ x: 1, y: 1 })
	static Zero = new Vector2({ x: 0, y: 0 })
}