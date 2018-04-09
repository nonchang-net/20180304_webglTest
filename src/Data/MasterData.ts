/**
 * # MasterData.ts
 * 
 * ## 概要
 * - ゲーム中に可変しないゲームデータ定義
 * - クライアントは起動時にサーバのversion.jsonを受け取り、ローカル保存バージョンより新しいデータがあれば差分取得に進むようにしたい。
 * - 開発中はモックアップjsonデータでそのままローカル起動する方針で進める。
 */
import Monster from './Master/Monster'

export default class MasterData {

	lastUpdate: number = -1

	monsters: Monster = new Monster()

	async asyncSetup(lastUpdate: number) {
		//TODO: S3からローカルストレージにlastUpdateを保存・読み込み
		// - また、マスターデータクラス系の更新処理は共通処理なので継承関係にしていいと思う
		if (this.lastUpdate < lastUpdate) {
			await this.monsters.asyncSetup()
			this.lastUpdate = lastUpdate
			this.Save()
		}
	}

	// TODO: ローカルにバージョン保存
	Save() {

	}
}