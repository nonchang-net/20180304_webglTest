

//==================================================
// Styler
// 検討中: 
// - jQueryのようにメソッドチェーンするCSS設定ユーティリティにできると嬉しい。
//	- 面白がってjQueryの再発明をし続けないように注意。目的はHTML5ゲーム設計時のDOM生成とCSS周りの補佐。
// - せっかくのTypeScriptなので、document.createElementの返す型を維持するように設計。
// - CSSは「目的」に対して「決まった記述のセット」が多いように感じたため作成。
// - flexboxによるUI検討のヘルパーにしていきたい。

// 利用例:
// - `const canvas = new Styler("canvas").fullWindow().appendTo(body).getElement()` //→HTMLCanvasElement型

export default class Styler<T extends keyof HTMLElementTagNameMap>{

	private elm: HTMLElementTagNameMap[T]

	constructor(tagName: T) {
		this.elm = document.createElement(tagName)
		return this
	}

	// set style shorthand

	fullWindow(): Styler<T> {
		// this.marginWindow(100);
		this.abs()
		this.elm.style.width = `100%`
		this.elm.style.height = `100%`
		return this
	}

	// marginWindow(percent: number): Styler<T> {
	// 	this.abs()
	// 	this.elm.style.width = `{percent}%`
	// 	this.elm.style.height = `{percent}%`
	// 	return this
	// }

	bg(r: number | string, g?: number, b?: number, a?: number): Styler<T> {
		if (typeof r === "string") {
			this.elm.style.background = r
			return this
		}
		this.elm.style.background = `rgba(${r},${g},${b},${a})`
		return this
	}

	// height(num: number): Styler<T>{
	// 	this.elm.style.height = "1px solid gray;"
	// 	return this
	// }

	//UNDONE: 検討中
	bordered1(): Styler<T> {
		this.elm.style.border = "1px solid gray;"
		return this
	}

	margin(num: number = 1): Styler<T> {
		this.elm.style.margin = `${num}px`
		return this
	}

	padding(num: number = 1): Styler<T> {
		this.elm.style.padding = `${num}px`
		return this
	}

	round(radius: number): Styler<T> {
		this.elm.style.borderRadius = `${radius}px`
		return this
	}

	text(text: string): Styler<T> {
		this.elm.innerText = text
		return this
	}

	abs(): Styler<T> {
		this.elm.style.position = "absolute"
		return this
	}

	size(width: number | string, height: number | string): Styler<T> {
		if (typeof width === "string") {
			this.elm.style.width = width
		} else {
			this.elm.style.width = `${width}px`
		}
		if (typeof height === "string") {
			this.elm.style.height = height
		} else {
			this.elm.style.height = `${height}px`
		}
		return this
	}
	height(height: number): Styler<T> {
		this.elm.style.height = `${height}px`
		return this
	}
	width(width: number): Styler<T> {
		this.elm.style.width = `${width}px`
		return this
	}

	//right, left, top, bottom

	r(num: number = 0): Styler<T> {
		this.elm.style.right = `${num}px`
		return this
	}

	l(num: number = 0): Styler<T> {
		this.elm.style.left = `${num}px`
		return this
	}

	t(num: number = 0): Styler<T> {
		this.elm.style.top = `${num}px`
		return this
	}

	b(num: number = 0): Styler<T> {
		this.elm.style.bottom = `${num}px`
		return this
	}

	//flexbox

	flexHorizontal(): Styler<T> {
		this.elm.style.display = "flex"
		this.elm.style.flexDirection = "row"
		return this
	}
	flexVertical(): Styler<T> {
		this.elm.style.display = "flex"
		this.elm.style.flexDirection = "column"
		return this
	}
	glow(num: number = 1): Styler<T> {
		this.elm.style.flexGrow = `${num}`
		return this
	}

	// // framed image
	// framed(): Styler<T> {
	// 	this.elm.style.borderStyle = "solid"
	// 	this.elm.style.borderWidth = "16px 16px 16px 16px"
	// 	this.elm.style.borderImage = "url(frame-small.png) 16 16 16 16 fill repeat"
	// 	return this
	// }

	// output utils

	appendTo(dom: HTMLElement): Styler<T> {
		dom.appendChild(this.elm)
		return this
	}

	getElement(): HTMLElementTagNameMap[T] {
		return this.elm
	}

}
