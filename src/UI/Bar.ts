import Styler from "./Styler";

export default class Bar {

	element: HTMLDivElement
	private inner: HTMLDivElement

	constructor() {
		const elm = new Styler("div").getElement()
		this.element = elm
		elm.style.background = `rgba(0,0,0,0.3)`
		elm.style.height = `8px`
		elm.style.width = `100%`
		elm.style.flex = `0 2 auto`
		elm.style.position = `relative`
		// elm.style.padding = `1px`
		elm.style.marginBottom = `1px`
		elm.style.borderRadius = `3px`

		const inner = new Styler("div").appendTo(elm).getElement()
		this.inner = inner
		// inner.style.background = `rgba(0,255,0,1)`
		inner.style.background = `linear-gradient(180deg, rgba(0,255,14,0.2) 0%, rgba(42,121,9,1) 30%, rgba(42,255,9,1) 40%, rgba(31,255,0,0.1) 100%)`
		// inner.style.background = `linear-gradient(180deg, rgba(0,255,14,1) 0%, rgba(217,255,71,1) 38%, rgba(31,255,0,1) 100%)`
		inner.style.height = `80%`
		inner.style.margin = `1px`
		// inner.style.borderRadius = `3px`

		const border = new Styler("div").abs().l().t().fullWindow().appendTo(elm).getElement()
		border.style.border = `1px solid gray`
		border.style.borderRadius = `3px`

	}

	set(ratio: number) {
		this.inner.style.width = `${Math.floor(ratio * 100)}%`
	}
}