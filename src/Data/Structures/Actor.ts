import MaxLimitedNumber from "../../Common/MaxLimitedNumber"

// Actorのステータス種別
export enum StatusKind {
	Poison,
	Sleep,
	DeepSleep,
	AutoHeal,
}

// Actor種別
export enum ActorKind {
	Player,
	Enemy
}

/// プレイヤー・敵の情報クラス
export default class Actor {

	master: any

	kind: ActorKind

	name: string
	hp: MaxLimitedNumber = new MaxLimitedNumber(0) //HP
	attack: number //基礎攻撃力
	attackVariable: number //追加ランダム攻撃力(仮)
	deffence: number //基礎防御力
	satiety: number //満腹度 0.0-1.0

	mp: MaxLimitedNumber = new MaxLimitedNumber(0) //HP

	// currentButtleActionKind: ButtleActionKind

	// 保留中: このActorに関するstate change eventを個別に登録できないか検討した跡。
	// deflatedEvent,
	// damagedEvent,

	// 要検討: ステータスフラグは単一クラスにすべきか？
	isSleep: boolean = false


	//TODO: deep clone問題でトラブったので、マスターを代入しておいて、そこから再度初期化するように変更。。
	initByThisMaster() {
		this.name = this.master.name
		this.attack = this.master.attack
		this.attackVariable = this.master.attackVariable
		this.hp = new MaxLimitedNumber(this.master.hp)
		this.mp = new MaxLimitedNumber(this.master.mp)
	}

}