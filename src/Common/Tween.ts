/*

- シンプルなtweenクラス
	- メモ: tween関数はjquery.easingから拝借。GSGDのBSD Licenseを継承します。
	- Simple Tweenを参考にTypeScriptで実装。
		- https://npm.runkit.com/simple-tween/tween.js?t=1522335794218
	- 当面使う予定のないイージング関数は容量削減目的でコメントアウト中。
		- ease(In|Out|InOut)Quadから試していって、本体の実装要求があれば都度検討します。


## 概要メモ

- Flash時代からよくみたeasing functionが揃ってた。
- 改造してよくわからなくなってきたので、使いそうなtween functionだけ残してあとは自前で設計し直す方向で。
	- とりあえず動いた。

## 利用方法

```javascript
const tween = Tween.To({
	onUpdate: (x) => { console.log(`onUpdate: ${x}`); }
});

const tween2 = Tween.To({
	value: {
		start: 20,
		end: 40
	},
	onUpdate: (x) => { console.log(`onUpdate: ${x}`); },
	onComplete: () => { console.log(`onComplete`); }
});
```


## TODO

- async/await対応させたい
- setIntervalをやめて、requestAnimationFrameと時間処理に置き換えたい。
	- `intervalRestDuration`なるプロパティに依存する実装はよくない。
- easeOutBounceが動いてないような……？

*/

type tweenfunc = (t: number, b: number, c: number, d: number) => number

interface Properties {
	intervalRestDuration?: number
	value?: {
		start?: number
		end?: number
	}
	duration?: number
	shift?: number
	tweeningFunction?: tweenfunc
	onUpdate: (x: number) => void
	onComplete?: () => void
}

export default class Tween {

	//メモ: tween関数はjquery.easingを参考。GSGDのBSD Licenseに準拠します。
	// > http://easings.net/ja
	// > http://gsgd.co.uk/sandbox/jquery/easing/jquery.easing.1.3.js
	// > Open source under the BSD License. 

	static easeInQuad(t, b, c, d): number {
		return c * (t /= d) * t + b;
	}
	static easeOutQuad(t, b, c, d): number {
		return -c * (t /= d) * (t - 2) + b;
	}
	static easeInOutQuad(t, b, c, d): number {
		if ((t /= d / 2) < 1) return c / 2 * t * t + b;
		return -c / 2 * ((--t) * (t - 2) - 1) + b;
	}
	// static easeInCubic(t, b, c, d): number {
	// 	return c * (t /= d) * t * t + b;
	// }
	// static easeOutCubic(t, b, c, d): number {
	// 	return c * ((t = t / d - 1) * t * t + 1) + b;
	// }
	// static easeInOutCubic(t, b, c, d): number {
	// 	if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
	// 	return c / 2 * ((t -= 2) * t * t + 2) + b;
	// }
	// static easeInQuart(t, b, c, d): number {
	// 	return c * (t /= d) * t * t * t + b;
	// }
	// static easeOutQuart(t, b, c, d): number {
	// 	return -c * ((t = t / d - 1) * t * t * t - 1) + b;
	// }
	// static easeInOutQuart(t, b, c, d): number {
	// 	if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
	// 	return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
	// }
	static easeInQuint(t, b, c, d): number {
		return c * (t /= d) * t * t * t * t + b;
	}
	static easeOutQuint(t, b, c, d): number {
		return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
	}
	static easeInOutQuint(t, b, c, d): number {
		if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
		return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
	}
	// static easeInSine(t, b, c, d): number {
	// 	return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
	// }
	// static easeOutSine(t, b, c, d): number {
	// 	return c * Math.sin(t / d * (Math.PI / 2)) + b;
	// }
	// static easeInOutSine(t, b, c, d): number {
	// 	return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
	// }
	// static easeInExpo(t, b, c, d): number {
	// 	return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
	// }
	// static easeOutExpo(t, b, c, d): number {
	// 	return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
	// }
	// static easeInOutExpo(t, b, c, d): number {
	// 	if (t == 0) return b;
	// 	if (t == d) return b + c;
	// 	if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
	// 	return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
	// }
	// static easeInCirc(t, b, c, d): number {
	// 	return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
	// }
	// static easeOutCirc(t, b, c, d): number {
	// 	return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
	// }
	// static easeInOutCirc(t, b, c, d): number {
	// 	if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
	// 	return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
	// }
	// static easeInElastic(t, b, c, d): number {
	// 	var s = 1.70158; var p = 0; var a = c;
	// 	if (t == 0) return b; if ((t /= d) == 1) return b + c; if (!p) p = d * .3;
	// 	if (a < Math.abs(c)) { a = c; var s = p / 4; }
	// 	else var s = p / (2 * Math.PI) * Math.asin(c / a);
	// 	return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
	// }
	// static easeOutElastic(t, b, c, d): number {
	// 	var s = 1.70158; var p = 0; var a = c;
	// 	if (t == 0) return b; if ((t /= d) == 1) return b + c; if (!p) p = d * .3;
	// 	if (a < Math.abs(c)) { a = c; var s = p / 4; }
	// 	else var s = p / (2 * Math.PI) * Math.asin(c / a);
	// 	return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
	// }
	// static easeInOutElastic(t, b, c, d): number {
	// 	var s = 1.70158; var p = 0; var a = c;
	// 	if (t == 0) return b; if ((t /= d / 2) == 2) return b + c; if (!p) p = d * (.3 * 1.5);
	// 	if (a < Math.abs(c)) { a = c; var s = p / 4; }
	// 	else var s = p / (2 * Math.PI) * Math.asin(c / a);
	// 	if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
	// 	return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
	// }
	// static easeInBack(t, b, c, d, s): number {
	// 	if (s == undefined) s = 1.70158;
	// 	return c * (t /= d) * t * ((s + 1) * t - s) + b;
	// }
	// static easeOutBack(t, b, c, d, s): number {
	// 	if (s == undefined) s = 1.70158;
	// 	return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
	// }
	// static easeInOutBack(t, b, c, d, s): number {
	// 	if (s == undefined) s = 1.70158;
	// 	if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
	// 	return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
	// }
	// static easeInBounce(t, b, c, d): number {
	// 	return c - this.easeOutBounce(d - t, 0, c, d) + b;
	// }
	static easeOutBounce(t, b, c, d): number {
		if ((t /= d) < (1 / 2.75)) {
			return c * (7.5625 * t * t) + b;
		} else if (t < (2 / 2.75)) {
			return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
		} else if (t < (2.5 / 2.75)) {
			return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
		} else {
			return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
		}
	}

	static readonly DefaultProperties: Properties = {
		intervalRestDuration: 10, //TODO: これは割愛したい。requestAnimationFrameと経過時間算出で対応したい
		value: {
			start: 0,
			end: 1.0
		},
		duration: 500,
		shift: 0,//TODO: 実行前の待機時間。差分付きでアニメーションを連続させたいときに有益
		tweeningFunction: Tween.easeOutBounce,//easeInQuad, easeInQuint
		onUpdate: (x: number) => { console.log(`please override me! ${x}`) }
	};

	intervalId: number

	constructor(propsPartial: Properties) {

		const properties = Object.assign(Object.create(Tween.DefaultProperties), propsPartial)

		if (properties.shift != 0) {
			// console.log(`shift ${properties.shift}`);
			setTimeout(() => {
				this.start(properties)
			}, properties.shift)
		} else {
			this.start(properties)
		}

	}

	private start(properties: Properties) {

		var currentTime: number = 0
		var currentValue: number = properties.value.start

		//TODO: requestAnimationFrame()に置き換えて、FPSドロップフレームに対応させたいかな
		this.intervalId = setInterval(() => {
			currentTime += properties.intervalRestDuration
			currentValue = (currentTime / properties.duration) * properties.value.end
			const calculatedValue = properties.tweeningFunction(currentTime, properties.value.start, currentValue, properties.duration)

			properties.onUpdate(calculatedValue)

			if (currentTime >= properties.duration) {
				clearInterval(this.intervalId)
				if (properties.onComplete) properties.onComplete();
			}

		}, properties.intervalRestDuration)
	}

	cancel() {
		clearInterval(this.intervalId)
	}

	//static call

	To(propsPartial: Properties): Tween {
		return Tween.To(propsPartial)
	}

	static To(propsPartial: Properties): Tween {
		const properties = Object.assign(Object.create(Tween.DefaultProperties), propsPartial);

		if (propsPartial.tweeningFunction !== undefined)
			properties.tweeningFunction = propsPartial.tweeningFunction;

		if (propsPartial.value !== undefined && propsPartial.value.end !== undefined)
			properties.value = { start: 0, end: propsPartial.value.end };

		if (propsPartial.duration !== undefined)
			properties.duration = propsPartial.duration;

		if (propsPartial.intervalRestDuration !== undefined)
			properties.intervalRestDuration = propsPartial.intervalRestDuration;

		return new Tween(properties);
	};


}// class Tween