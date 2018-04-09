// 最大値で制限されるパラメータ
// TODO: setterで代入監視したい
export default class MaxLimitedNumber {
	current: number
	max: number
	constructor(max: number) {
		this.current = this.max = max
	}
	limit() {
		if (this.current > this.max) this.current = this.max
	}
}