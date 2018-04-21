import mockup from './Floors_Mockup'
import Actor from '../Structures/Actor'

export default class Floors {

	//TODO: このフラグはmain.ts側で渡せるようにしたい
	readonly USE_MOCKUP = true

	// readonly DataURL = "https://xxx"

	definitions: Array<Floor>

	async asyncSetup(): Promise<Floors> {
		//TODO: モックアップと本番jsonkりいかえ
		this.set(JSON.parse(mockup))
		console.log("フロア定義dump", this.definitions)
		return this
	}

	//jsonでセットアップ
	set(data) {
		// console.log(data)
		this.definitions = new Array<Floor>()
		for (const master of data) {
			// console.log(master);
			const floor: Floor = new Floor
			this.definitions.push(floor)
			floor.monsters = new Array<Actor>()
			for (const encounter of data.encounters) {
				floor.addEncounter(encounter)
			}

			// actor.master = master
			// actor.name = master.name
			// actor.attack = master.attack
			// actor.attackVariable = master.attackVariable
			// actor.hp = new MaxLimitedNumber(master.hp)
			// actor.mp = new MaxLimitedNumber(master.mp)
			// this.definitions.push(actor)
		}
		// console.log("enemies defs", this.defs)
	}

}


class Floor {
	monsters = new Array<Actor>()
	addEncounter(encounter: number | string | object) {
		const actor = new Actor()
		if (encounter instanceof Number) {

		} else if (encounter instanceof String) {

		} else {
			//monsterDefsのarray。master参照はkeyかid。
		}
		this.monsters.push(actor)
	}
}