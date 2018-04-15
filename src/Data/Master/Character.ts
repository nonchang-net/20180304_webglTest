/*
# Master/Character.ts

Copyright(C) nonchang.net All rights reserved.

## 概要

- マスターデータ管理クラスです。

## ここでやること

- モックアップデータ定義
- モックアップJSONと、S3に置いたJSONファイルを切り替えられるように。
	- とりあえずGoogle Spread Sheetから直接読み込むテストを進行中。

*/

import mockup from './Character_Mockup'
import * as MasterData from '../MasterData'

import Vector2 from '../../Common/Vector2'
// import Actor from '../Structures/Actor'
import MaxLimitedNumber from '../../Common/MaxLimitedNumber'

// マスターデータメインクラス
// UNDONE: とりあえずmain.tsから切り出しただけでごちゃごちゃしてる。どう整理していこう？
export class Character {

	//TODO: このフラグはmain.ts側で渡せるようにしたい
	readonly USE_MOCKUP = true

	defs = new Array<Definition>()
	dict: { number: Definition } //character idで一発取得する用

	async asyncSetup() {
		this.set(JSON.parse(mockup))
	}

	//jsonでセットアップ
	set(data) {
		console.log(data)

		this.dict = {} as { number: Definition }
		for (const datum of data) {
			console.log(datum);
			const def = new Definition()
			this.defs.push(def)
			this.dict[datum.id] = def

			def.id = datum.id
			def.name = datum.name
			def.face = {
				tileUrl: datum.faceGraphicUrl,
				normal: datum.faceIndices.normal,
				damaged: datum.faceIndices.damaged,
				eyeAnimation: {
					duration: datum.eyeAnimation.duration,
					frames: datum.eyeAnimation.frames
				}
			}

			//TODO: 経験値系のパース

		}
		console.log("character defs", this.defs)
	}

}

export class Definition {
	id: number
	name: string
	// undefinedName: string //将来的: 他プレイヤーゴースト表示時に使う想定。今は不要
	face: FaceDefinition = new FaceDefinition()
}

class FaceDefinition {
	tileUrl: string
	normal: Vector2
	damaged: Vector2
	eyeAnimation: AnimationDefinition = new AnimationDefinition()
}

class AnimationDefinition {
	duration: number
	frames: Array<Vector2>
}