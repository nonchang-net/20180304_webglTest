// 最大値で制限されるパラメータ

import { ReactiveProperty } from '../Event/Event'

export default class MaxLimitedNumber {
	private _current = new ReactiveProperty(0)
	get current() {
		return this._current.value
	}
	set current(value: number) {
		this._current.value = value
		this.limit()
	}
	max = new ReactiveProperty(0)
	constructor(max: number) {
		this._current.value = this.max.value = max
	}
	private limit() {
		if (this._current.value > this.max.value) this._current.value = this.max.value
	}
}