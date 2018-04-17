
import { Characters, Character as CharacterMaster } from '../Master/Characters'
import { ReactiveProperty } from '../../Event/Event'

import MaxLimitedNumber from '../../Common/MaxLimitedNumber'

// ユーザデータとしてのキャラクター情報
export default class Character {

	master: CharacterMaster

	name: string
	level = new ReactiveProperty(0)
	hp: MaxLimitedNumber
	mp: MaxLimitedNumber

	constructor(master: CharacterMaster) {
		this.master = master

		//初期化
		this.name = master.name
		this.level.value = 1
	}

	// 壁に当たった時のメッセージ出力
	getWallMessage(): string {
		var messages = this.master.messages.hitBlocked
		return this.name + "「" + messages[Math.floor(Math.random() * messages.length)] + "」"
	}


}