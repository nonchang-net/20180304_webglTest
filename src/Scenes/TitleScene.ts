
import GameEvents from '../Event/GameEvents'
import Styler from '../UI/Styler'
import Tween from '../Common/Tween'
import Main from '../main'

export default class TitleScene {

	events: GameEvents
	element: HTMLDivElement

	intervalId = 0

	constructor(events: GameEvents) {
		this.events = events
		this.element = new Styler("div").fullWindow().flexVertical().center().middle().getElement()
		// this.element.style.border = "3px solid blue"

		const spans: Array<HTMLSpanElement> = new Array<HTMLSpanElement>()

		const text1 = new Styler("div").center().middle().appendTo(this.element).getElement()
		this.styling(text1)
		for (let char of "Dangeon's") {
			const span = new Styler("span").text(char).getElement()
			this.styling(span)
			text1.appendChild(span)
			spans.push(span)
		}

		const text2 = new Styler("div").center().middle().appendTo(this.element).getElement()
		this.styling(text2)
		for (let char of "and") {
			const span = new Styler("span").text(char).getElement()
			this.styling(span)
			text2.appendChild(span)
			spans.push(span)
		}

		const text3 = new Styler("div").center().middle().appendTo(this.element).getElement()
		this.styling(text3)
		for (let char of "Examples") {
			const span = new Styler("span").text(char).getElement()
			this.styling(span)
			text3.appendChild(span)
			spans.push(span)
		}

		const version = new Styler("div").text(`ver ${Main.version}`).abs().b().appendTo(this.element).getElement()
		version.style.fontSize = "9px"
		version.style.color = "black"
		version.style.marginBottom = "10px"


		// 初回要素別アニメーション

		const baseDuration = 1800
		const allSpanDuration = 200

		const updateSpan = (span: HTMLSpanElement, progress: number) => {
			span.style.opacity = `${progress}`
			span.style.textShadow = `0px 0px ${(120 * (1 - progress)) + 10}px #fff`
			// span.style.color = progress > 0.9 ? '#333' : 'transparent'
			span.style.color = `rgba(23,23,23,${progress})`
		}

		Tween.To({
			duration: baseDuration + allSpanDuration,
			onUpdate: progress => {
				let count = -1;
				let deltaDuration = baseDuration - allSpanDuration
				for (let span of spans) {
					count++;
					const offset = count / spans.length
					// memo: let spanProgress = 0.3 * (400/500) + 0.25 * (100/500)
					let spanProgress = progress * (deltaDuration / baseDuration) + offset * (allSpanDuration / baseDuration)
					if (spanProgress > 1) spanProgress = 1
					updateSpan(span, spanProgress)
				}
			},
			onComplete: () => {
				spans.forEach(span => updateSpan(span, 1))
			}
		})

		// 正弦で点滅 - 没
		// this.intervalId = setInterval(() => {
		// 	const opacity = (Math.sin((new Date().getMilliseconds() - 500) / 500)) + 1 / 2
		// 	// const opacity = (Math.sin((new Date().getMilliseconds() - 500) / 500)) + 1 / 2
		// 	// console.log(new Date().getMilliseconds())
		// 	console.log(opacity)
		// 	spans.forEach(span => {
		// 		span.style.opacity = `${opacity}`
		// 	})
		// }, 10)

	}

	//とりあえずまとめる
	styling(ele: HTMLParagraphElement | HTMLDivElement | HTMLSpanElement) {
		ele.style.fontFamily = "'Niconne', Arial, sans-serif"
		ele.style.fontSize = "60px"
		ele.style.color = "rgba(0,0,0,0)"
		// ele.style.textShadow = "0px 0px 10px #fff, 1px 1px 4px rgba(255, 255, 255, 0.7)"
	}

	async start(): Promise<{}> {
		// console.log("title")

		return new Promise((resolve) => {
			// UI.ts側のイベントを待機
			this.events.UI.TitleTap.subscribe(this.constructor.name, () => {
				this.element.style.display = "none" //とりあえず単に非表示
				resolve()
			})
		})
	}
}