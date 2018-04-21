/**
 * # MasterData.ts
 * 
 * ## 概要
 * - ゲーム中に可変しないゲームデータ定義
 * - クライアントは起動時にサーバのversion.jsonを受け取り、ローカル保存バージョンより新しいデータがあれば差分取得に進むようにしたい。
 * - 開発中はモックアップjsonデータでそのままローカル起動する方針で進める。
 */
import Monsters from './Master/Monsters'
import Actor from './Structures/Actor'
import { Characters, Character as CharacterDefinition } from './Master/Characters'

export default class MasterData {

	lastUpdate: number = -1

	monsters: Monsters
	characters: Characters

	async asyncSetup(lastUpdate: number) {
		//TODO: S3からローカルストレージにlastUpdateを保存・読み込み・差分確認
		// - また、マスターデータクラス系の更新処理は共通処理なので継承関係にしていいと思う
		if (this.lastUpdate < lastUpdate) {
			this.monsters = await new Monsters().asyncSetup()
			this.characters = await new Characters().asyncSetup()
			// console.log("check:", this.monsters, this.characters)
			this.lastUpdate = lastUpdate
			this.Save()
		}
	}

	// TODO: ローカルにバージョン保存
	Save() {

	}
}