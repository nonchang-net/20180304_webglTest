/*
# Master/Monster.ts

Copyright(C) nonchang.net All rights reserved.

## 概要

- マスターデータ管理クラスです。

## ここでやること

- モックアップデータ定義
- モックアップJSONと、S3に置いたJSONファイルを切り替えられるように。
	- とりあえずGoogle Spread Sheetから直接読み込むテストを進行中。

*/

import mockup from './Monster_Mockup'
import * as MasterData from '../MasterData'
import Actor from '../Structures/Actor'
import MaxLimitedNumber from '../../Common/MaxLimitedNumber'

// マスターデータメインクラス
// UNDONE: とりあえずmain.tsから切り出しただけでごちゃごちゃしてる。どう整理していこう？
export default class Monster {

	readonly USE_MOCKUP = true

	// private context: GameContext.GameContext 
	defs: Array<Actor>

	//TODO:
	// google spread sheet直接読み込みは、API利用制限があるので内部テストが限界。
	// jsonはS3にデプロイするフローを作る必要がある。
	readonly EnemiesURL = "https://script.googleusercontent.com/macros/echo?user_content_key=yKK-ZUzj02ZwKXWFT39B8QquttV0bC9w57OUmnUBof-pCFXaMcQ-BJdATX6I2Dymszq5_qJOMQhWpcZG1F34RX92QEzmgSyfm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnAJjrIvQ97z0RW-0xPK1w48qcTuPdn844uwwbw2T51YtYioAfvWxA81WU9kqGDrfop0mgLDwm9cO&lib=Mm0OfG4rpMmjOijnmsnJqouS5Zx1wbZ9l"

	async asyncSetup() {

		if (this.USE_MOCKUP) {
			console.log(`MasterData: USE MOCKUP!`);
			this.set(JSON.parse(mockup))
		} else {
			//S3に置いたマスターデータを取得してみる
			await (async () => {
				try {
					//fetch
					let response = await fetch(this.EnemiesURL);
					return response.json();
				} catch (e) {
					console.log("Error!");
				}
			})().then((data) => {
				console.log("MasterData: fetch succeed.", data);
				this.set(JSON.parse(data))
			})
		}
	}

	//jsonでセットアップ
	set(data) {
		// console.log(data)
		this.defs = new Array<Actor>()
		for (const master of data) {
			// console.log(master);
			const actor: Actor = new Actor
			actor.master = master
			actor.name = master.name
			actor.attack = master.attack
			actor.attackVariable = master.attackVariable
			actor.hp = new MaxLimitedNumber(master.hp)
			actor.mp = new MaxLimitedNumber(master.mp)
			this.defs.push(actor)
		}
		// console.log("enemies defs", this.defs)
	}

}