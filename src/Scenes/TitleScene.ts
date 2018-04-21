
import GameEvents from '../Event/GameEvents'
import Styler from '../UI/Styler';

export default class TitleScene {

	events: GameEvents
	element: HTMLDivElement

	constructor(events: GameEvents) {
		this.events = events
		this.element = new Styler("div").fullWindow().flexVertical().center().middle().getElement()
		// this.element.style.border = "3px solid blue"

		const text1 = new Styler("p").text("Dangeon's").center().middle().appendTo(this.element).getElement()
		this.styling(text1)

		const text2 = new Styler("p").text("and").center().middle().appendTo(this.element).getElement()
		this.styling(text2)

		const text3 = new Styler("p").text("Examples").center().middle().appendTo(this.element).getElement()
		this.styling(text3)

		//TODO: nth-childは擬似クラスなのでDOMに対応するものがないっぽい。
		// - 個別アニメーションさせるには、一つずつspanで包んでTweenにかけるのが良さそう。
		// for (var i = 0; i < text.childNodes.length; i++) {
		// console.log(text.)
		// }
	}

	//とりあえずまとめる
	styling(ele: HTMLParagraphElement) {
		ele.style.fontFamily = "'Niconne', Arial, sans-serif"
		ele.style.fontSize = "60px"
		ele.style.color = "#333"
		ele.style.textShadow = "0px 0px 10px #fff, 1px 1px 4px rgba(255, 255, 255, 0.7)"
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