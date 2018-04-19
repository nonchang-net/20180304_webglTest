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
import GameEvents from '../Event/GameEvents'

enum BGMKind {
	Opening,
	Quest,
	Battle,
}

export default class SoundManager {

	readonly BGM_ENABLED_FLAG_KEY = 'BGM Enabled'

	context: AudioContext

	currentBGMKind: BGMKind = BGMKind.Quest

	questBGM: AudioBuffer
	battleBGM: AudioBuffer
	currentBGMSource: AudioBufferSourceNode
	playing = false

	private readonly bgm1url = './sounds/bgm/dangeon01_sketch01.mp3'
	private readonly battleUrl = './sounds/bgm/battle01_sketch01.mp3'

	constructor(events: GameEvents) {
		try {
			this.context = new AudioContext()
		} catch (e) {
			//note: 20180411現在、safariはmacOSもiOSもAudioContextをnewできない模様
			console.log(e)
			const fallbackScope: any = window
			this.context = new fallbackScope.webkitAudioContext();
		}

		const bgmEnabledLocalStorageValue = localStorage.getItem(this.BGM_ENABLED_FLAG_KEY)
		// console.log(bgmEnabledLocalStorageValue)
		const bgmEnabled = !bgmEnabledLocalStorageValue ? false : bgmEnabledLocalStorageValue == "true"

		if (bgmEnabled) {
			this.startBgm1()
		}
		events.Sound.ToggleBgm.subscribe(this.constructor.name, () => {
			this.toggleBgm1()
			localStorage.setItem(this.BGM_ENABLED_FLAG_KEY, `${this.playing}`)
			// console.log(`${this.bgm1IsPlaying} `)
		})

	}

	async asyncSetup() {
		const responce = await fetch(this.bgm1url)
		const buffer = await responce.arrayBuffer()

		const audioBuffer = await this.loadSoundBuffer(buffer)
		this.questBGM = audioBuffer as AudioBuffer

		const responce2 = await fetch(this.battleUrl)
		const buffer2 = await responce2.arrayBuffer()

		const audioBuffer2 = await this.loadSoundBuffer(buffer2)
		this.battleBGM = audioBuffer2 as AudioBuffer
	}

	//note: safariではawaitでdecodeAudioDataを書けなかった。（Not enough arguments）
	// 以下はchromeでは動く。
	// this.questBGM = await this.context.decodeAudioData(buffer)
	// 仕方ないのでPromiseで包む
	private async loadSoundBuffer(buffer): Promise<{}> {
		return new Promise((resolve, reject) => {
			this.context.decodeAudioData(buffer, (buffer2) => {
				// this.questBGM = buffer2
				resolve(buffer2)
			}, (error) => {
				console.log('sound buffer load error', error)
				reject(null)
			})
		})
	}

	startBgm1() {
		// console.log("startBgm1")
		console.log("sound_enabled", localStorage.getItem(this.BGM_ENABLED_FLAG_KEY))
		if (localStorage.getItem(this.BGM_ENABLED_FLAG_KEY) == "false") {
			return
		}
		this.stopBgm()
		this.currentBGMKind = BGMKind.Quest
		this.currentBGMSource = this.context.createBufferSource()
		this.currentBGMSource.buffer = this.questBGM
		this.currentBGMSource.loop = true
		this.currentBGMSource.connect(this.context.destination)
		this.currentBGMSource.start(0)
		this.playing = true
	}

	startButtleBgm() {
		console.log("sound_enabled", localStorage.getItem(this.BGM_ENABLED_FLAG_KEY))
		if (localStorage.getItem(this.BGM_ENABLED_FLAG_KEY) == "false") {
			return
		}
		this.stopBgm()
		this.currentBGMKind = BGMKind.Battle
		this.currentBGMSource = this.context.createBufferSource()
		this.currentBGMSource.buffer = this.battleBGM
		this.currentBGMSource.loop = true
		this.currentBGMSource.connect(this.context.destination)
		this.currentBGMSource.start(0)
		this.playing = true
	}

	startBGM() {
		switch (this.currentBGMKind) {
			case BGMKind.Quest:
				this.startBgm1()
				break
			case BGMKind.Battle:
				this.startButtleBgm()
				break
		}
	}

	stopBgm() {
		// console.log("stopBgm1")
		if (this.currentBGMSource != null) {
			try {
				this.currentBGMSource.stop()
			} catch (e) {
				//TODO: safariでは、「InvalidStateError: The object is in an invalid state.」となる。よく調べてないけど、ログ出して例外を握りつぶしておく
				console.error(e)
			}
		}
		this.playing = false
	}

	updateSetting(settings: { enabled: boolean }) {
		localStorage.setItem(this.BGM_ENABLED_FLAG_KEY, settings.enabled.toString());
	}

	toggleBgm1() {
		if (this.playing) {
			this.stopBgm()
		} else {
			this.startBGM()
		}
	}
}