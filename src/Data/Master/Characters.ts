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

import mockup from './Characters_Mockup'
import * as MasterData from '../MasterData'

import Vector2 from '../../Common/Vector2'
// import Actor from '../Structures/Actor'
import MaxLimitedNumber from '../../Common/MaxLimitedNumber'

// マスターデータメインクラス
// UNDONE: とりあえずmain.tsから切り出しただけでごちゃごちゃしてる。どう整理していこう？
export class Characters {

	//TODO: このフラグはmain.ts側で渡せるようにしたい
	readonly USE_MOCKUP = true

	definitions = new Array<Character>()
	dict: { number: Character } //character idで一発取得する用

	async asyncSetup(): Promise<Characters> {
		this.set(JSON.parse(mockup))
		return this
	}

	//jsonでセットアップ
	set(data) {
		console.log(data)

		this.dict = {} as { number: Character }
		for (const datum of data) {
			console.log(datum);
			const def = new Character()
			this.definitions.push(def)
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
			def.messages = {
				hitBlocked: datum.messages.hitBlocked
			} //TODO: 型構造精査。messagesはhitBlockedを持つ。

			//TODO: 経験値系のパース

		}
		console.log("character defs", this.definitions)
	}

}

export class Character {
	id: number
	name: string
	// undefinedName: string //将来的: 他プレイヤーゴースト表示時に使う想定。今は不要
	face: Face = new Face()
	messages: {
		hitBlocked: Array<string>
	}
}

class Face {
	tileUrl: string
	normal: Vector2
	damaged: Vector2
	eyeAnimation: FaceAnimation = new FaceAnimation()
}

class FaceAnimation {
	duration: number
	frames: Array<Vector2>
}