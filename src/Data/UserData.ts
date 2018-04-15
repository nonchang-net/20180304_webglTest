/**
 * # UserData.ts
 * 
 * ## 概要
 * - ゲーム中に可変するユーザのデータ定義
 * - APIゲームにする場合はサーバデータの受け皿
 * - クライアント完結の場合はserialize save/load対象のクラスとなる
 */

import GameStateKind from './GameStateKind'
import { ReactiveProperty } from '../Event/Event'
import MasterData from './MasterData';
import Party from './User/Party'

export default class UserData {

	gameState = new ReactiveProperty(GameStateKind.Opening)

	// TODO: ゲーム内通貨
	// public coin = new ReactiveProperty(0)
	// public freeGem = new ReactiveProperty(0)
	// public paidGem = new ReactiveProperty(0)

	party: Party

	constructor(master: MasterData) {
		this.party = new Party(master.characters)
	}

	Save() {

	}

	Load() {

	}

}