/*

# UserData/Party.ts


## パーティー情報

- サンプルゲームでは3キャラ分の情報を単に持つ。
- プレイヤー情報の基礎。

*/

// import GameStateKind from './GameStateKind'
// import { ReactiveProperty } from '../Event/Event'

import MasterData from '../MasterData'
import { Character as CharacterMaster, Definition as CharacterDefinition } from '../Master/Character'
import MaxLimitedNumber from '../../Common/MaxLimitedNumber'
import { ReactiveProperty } from '../../Event/Event'

export default class Party {

	characters: Array<Character>
	masterData: CharacterMaster

	constructor(masterData: CharacterMaster) {
		this.masterData = masterData

		// 初期メンバー登録
		// TODO: ロード・セーブ

		this.characters = new Array<Character>()
		this.characters.push(new Character(masterData, 1))
		this.characters.push(new Character(masterData, 2))
		this.characters.push(new Character(masterData, 3))
	}

}


// ユーザデータとしてのキャラクター情報
export class Character {

	characterMasterData: CharacterMaster

	get definition(): CharacterDefinition {
		return this.characterMasterData.dict[this.masterDataId];
	}

	masterDataId: number

	level = new ReactiveProperty(0)
	hp: MaxLimitedNumber
	mp: MaxLimitedNumber

	constructor(characterMasterData: CharacterMaster, masterDataId: number) {
		this.characterMasterData = characterMasterData
		this.masterDataId = masterDataId
		this.level.value = 1
	}


}