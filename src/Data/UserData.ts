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

export default class UserData {

	public gameState = new ReactiveProperty(GameStateKind.Opening)

	Save() {

	}

	Load() {

	}

}