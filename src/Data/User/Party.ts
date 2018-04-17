/*

# UserData/Party.ts


## パーティー情報

- サンプルゲームでは3キャラ分の情報を単に持つ。
- プレイヤー情報の基礎。

*/

// import GameStateKind from './GameStateKind'
// import { ReactiveProperty } from '../Event/Event'

import MasterData from '../MasterData'
import { Characters } from '../Master/Characters'
import UserCharacter from './Character'
import { ReactiveProperty } from '../../Event/Event'

export default class Party {

	characters: Array<UserCharacter>
	charactersMaster: Characters

	constructor(masterData: Characters) {
		this.charactersMaster = masterData

		// 初期メンバー登録
		// TODO: ロード・セーブ・メンバー編集etc
		this.characters = new Array<UserCharacter>()
		this.characters.push(new UserCharacter(masterData.dict[1]))
		this.characters.push(new UserCharacter(masterData.dict[2]))
		this.characters.push(new UserCharacter(masterData.dict[3]))
	}

	getRandomOne(): UserCharacter {
		return this.characters[Math.floor(Math.random() * this.characters.length)];
	}

}


