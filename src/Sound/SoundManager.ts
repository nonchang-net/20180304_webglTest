/*

# SoundManager.ts

## 概要

- サウンド再生管理

- 効果音なども任せて、ローディング進捗なども管理させたい
	- 理想的には読み込み完了待機モードと、左下でローディングバーを出しながら非同期に読み込む実装ができるようなものを書きたいかなぁ。
		- 前のシーンで事前読み込みさせておいて、シーン遷移時には残りの読み込み処理の完了を待機するような感じ？

- 再生するか否かなどのフラグ管理はしない想定

- WebAudio APIは思いの外safariとchromeで挙動が違った。(※20180412現在)
	- 具体的にはsafariではasync/awaitで扱えないメソッドがあったりする。
	- iOS Safariで動作しないのは問題ありすぎるので適宜互換性対応を処理しておく。

## TODO

- iOS Safariでは初回読み込み完了直後の再生がうまく言ってない。
- また、iOS Safariでは画面スリープしても音が鳴り続けている。これは不具合として認識されると思うのでなんとかしたい……。


*/
export default class SoundManager {

	context: AudioContext

	bgm1buffer: AudioBuffer
	bgm1source: AudioBufferSourceNode
	bgm1IsPlaying = false

	constructor() {
		try {
			this.context = new AudioContext()
		} catch (e) {
			//note: 20180411現在、safariはmacOSもiOSもAudioContextをnewできない模様
			console.log(e)
			const fallbackScope: any = window
			this.context = new fallbackScope.webkitAudioContext();
		}
	}

	async asyncSetup() {
		const bgm1url = './sounds/bgm/dangeon01_sketch01.mp3'
		const responce = await fetch(bgm1url)
		const buffer = await responce.arrayBuffer()

		//note: safariではawaitでdecodeAudioDataを書けなかった。（Not enough arguments）
		// 以下はchromeでは動く。
		// this.bgm1buffer = await this.context.decodeAudioData(buffer)
		// 仕方ないのでPromiseで包む
		return new Promise((resolve, reject) => {
			this.context.decodeAudioData(buffer, (buffer2) => {
				this.bgm1buffer = buffer2
				resolve()
			}, (error) => {
				console.log('error', error)
				reject()
			})
		})
	}

	startBgm1() {
		// console.log("startBgm1")
		this.bgm1source = this.context.createBufferSource()
		this.bgm1source.buffer = this.bgm1buffer
		this.bgm1source.loop = true
		this.bgm1source.connect(this.context.destination)
		this.bgm1source.start(0)
		this.bgm1IsPlaying = true
	}

	stopBgm1() {
		// console.log("stopBgm1")
		this.bgm1source.stop()
		this.bgm1IsPlaying = false
	}

	toggleBgm1() {
		if (this.bgm1IsPlaying) {
			this.stopBgm1()
		} else {
			this.startBgm1()
		}
	}
}