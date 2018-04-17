import Styler from "./Styler";
import Vector2 from "../Common/Vector2";
// import { Character as CharacterMaster } from "../Data/Master/Characters"
// import Party from '../Data/User/UserParty'
import Character from '../Data/User/Character'

/*
# CharacterStatus.ts

## 概要

- 顔グラフィックスとHP,MP,ステータスを表示するコンポーネントモックアップ
- ゲーム仕様に合わせて色々演出を検討したい。
	- ダメージ受けたら痛がってる顔に差し替えるなど。
- まずは「三日月アルペジオ」様のフリー素材を利用して仮組みを進める。
	- 4x2で並んでるので、これを仕様としてcssスプライトで表現。
	- 96x96のものと133x133のものが混ざってる。RPGツクールのバージョン違い素材らしいので、ここではサイズを問わず4x2で並んでいれば適切に表示するように実装を検討する。

*/


export enum FaceKind {
	Normal,
	Damaged,
}

export default class CharacterStatus {

	readonly FACE_IMAGE_SIZE = 36
	readonly FONT_SIZE = "9px" //TODO: 最小フォントサイズ制限があるっぽい

	element: HTMLDivElement
	face: HTMLDivElement
	character: Character

	constructor(character: Character) {

		//TODO: マスター定義ではなくユーザーデータそのものを渡してreactive propertyを変更検知したい
		this.character = character

		const elm = new Styler("div").flexHorizontal().getElement()
		this.element = elm
		// elm.style.border = "1px solid gray"
		elm.style.borderRadius = "5px"
		// elm.style.background = "rgba(255,255,255,0.7)"
		// elm.style.background = `radial-gradient(circle, rgba(204,204,204,0.7) 0%, rgba(107,150,149,0.3) 100%)`
		elm.style.background = `linear-gradient(90deg, rgba(204,204,204,0.8) 0%, rgba(174,187,187,0.8) 31%, rgba(133,164,164,0.4) 65%, rgba(107,150,149,0) 86%)`
		elm.style.width = "150px"
		// elm.style.height = "100px"
		// elm.style.padding = "3px"
		elm.style.marginBottom = "2px"

		// 顔アイコン
		const face = new Styler("div").getElement()
		this.face = face
		elm.appendChild(face)
		face.style.height = `${this.FACE_IMAGE_SIZE}px`
		face.style.width = `${this.FACE_IMAGE_SIZE}px`
		face.style.background = `url(${this.character.master.face.tileUrl}) 0 0`
		face.style.flex = `0 1 ${this.FACE_IMAGE_SIZE}px`
		face.style.backgroundSize = `${this.FACE_IMAGE_SIZE * 4}px ${this.FACE_IMAGE_SIZE * 2}px`

		// 顔インデックス初期化
		this.setFaceKind(FaceKind.Normal)

		// 右ペイン
		const right = new Styler("div").flexVertical().appendTo(elm).getElement()
		right.style.paddingLeft = "3px"
		right.style.flex = "1 1 auto"

		// 名前
		const nameParagraph = new Styler("p").text(this.character.master.name).appendTo(right).getElement()
		// nameParagraph.style.borderBottom = "1px solid rgba(0,123,123,0.5)"
		nameParagraph.style.background = "linear-gradient(90deg, rgba(45,69,60,0.3) 0%, rgba(43,59,41,0.6) 8%, rgba(111,111,111,0.4) 20%, rgba(241,244,255,0) 100%)"
		nameParagraph.style.color = "white"
		// nameParagraph.style.borderRadius = "2px"
		// nameParagraph.style.padding = "2px"
		nameParagraph.style.paddingTop = "2px"
		nameParagraph.style.paddingLeft = "4px"
		nameParagraph.style.transform = "translateX(-3px)"
		nameParagraph.style.fontSize = this.FONT_SIZE
		nameParagraph.style.lineHeight = "1"
		// nameParagraph.style.fontWeight = "bold"

		// HPバー
		const hpBar = new BarWithText('HP: ')
		hpBar.value.style.width = "50px"
		hpBar.value.style.fontSize = this.FONT_SIZE
		hpBar.value.style.lineHeight = "1"
		hpBar.set('80/100')
		hpBar.bar.set(0.4)
		right.appendChild(hpBar.element)

		// MPバー
		const mpBar = new BarWithText('MP: ')
		mpBar.value.style.width = "50px"
		mpBar.value.style.fontSize = this.FONT_SIZE
		mpBar.value.style.lineHeight = "1"
		mpBar.set('70/100')
		mpBar.bar.set(0.8)
		right.appendChild(mpBar.element)

		//目パチ開始
		this.startEyeAnimation()

	}


	//RPGツクール素材は4x2で並んでるので、そのうちどの顔グラフィックスを表示するか設定
	private setFaceIndex(index: Vector2) {
		const css = `${-1 * this.FACE_IMAGE_SIZE * index.x}px ${-1 * this.FACE_IMAGE_SIZE * index.y}px`
		// const css = `${-1 * this.FACE_IMAGE_SIZE * index.x}px ${-1 * this.FACE_IMAGE_SIZE * index.y}px`
		this.face.style.backgroundPosition = css
		// console.log(css)
	}

	setFaceKind(kind: FaceKind) {
		switch (kind) {
			case FaceKind.Normal:
				this.setFaceIndex(this.character.master.face.normal)
				break
			case FaceKind.Damaged:
				this.setFaceIndex(this.character.master.face.damaged)
				break
		}
	}

	//目パチアニメーション

	eyeAnimationFrame = 0

	CHARACTER_EYE_ANIMATION_NEXT_WAIT = 1000
	CHARACTER_EYE_ANIMATION_NEXT_RANDOM = 2000
	CHARACTER_EYE_ANIMATION_INTERAVAL = 150

	private startEyeAnimation() {
		// console.log(`eyeAnimation ${this.eyeAnimationFrame}`);

		// 目パチ定義がなければnull return
		if (!this.character.master.face.eyeAnimation) return;
		const eyeDef = this.character.master.face.eyeAnimation

		// console.log(`eye anim ${this.eyeAnimationFrame}`);

		// フレームが残ってる
		if (eyeDef.frames.length > this.eyeAnimationFrame) {
			// console.log(this.eyeAnimationFrame)
			this.setFaceIndex(eyeDef.frames[this.eyeAnimationFrame])
			this.eyeAnimationFrame++
			setTimeout(() => { this.startEyeAnimation() }, this.CHARACTER_EYE_ANIMATION_INTERAVAL)
			return;
		}

		// フレームが残ってない
		this.eyeAnimationFrame = 0
		this.setFaceIndex(this.character.master.face.normal)
		setTimeout(() => { this.startEyeAnimation() },
			Math.random()
			* this.CHARACTER_EYE_ANIMATION_NEXT_RANDOM
			+ this.CHARACTER_EYE_ANIMATION_NEXT_WAIT
		)

	}
}

class BarWithText {
	element: HTMLDivElement
	bar: Bar
	// valuePrefix: string
	value: HTMLParagraphElement
	constructor(header: string) {
		const elm = new Styler("div").flexHorizontal().getElement()
		this.element = elm
		elm.style.alignItems = "center"

		const headerP = new Styler("p").text(header).appendTo(elm).getElement()
		headerP.style.fontSize = '9px'
		headerP.style.fontWeight = 'bold'
		headerP.style.width = '30px'

		this.value = new Styler("p").appendTo(elm).getElement()

		this.bar = new Bar()
		elm.appendChild(this.bar.element)
	}

	set(value: string) {
		this.value.innerText = value
	}

}


class Bar {

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