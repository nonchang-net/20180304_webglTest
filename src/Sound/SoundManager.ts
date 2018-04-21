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

export enum BGMKind {
	Opening,
	Quest,
	Battle,
}

export default class SoundManager {

	readonly BGM_ENABLED_FLAG_KEY = 'BGM Enabled'

	context: AudioContext

	currentBGMKind: BGMKind = BGMKind.Opening

	titleBGM: AudioBuffer
	questBGM: AudioBuffer
	battleBGM: AudioBuffer
	currentBGMSource: AudioBufferSourceNode
	playing = false

	private readonly titleBgmUrl = './sounds/bgm/likeabirdinacage_short.mp3'
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

		console.log(`bgm enabled: ${bgmEnabled}`);

		// if (bgmEnabled) {
		// 	this.startBGM(BGMKind.Opening)
		// }
		events.Sound.ToggleBgm.subscribe(this.constructor.name, () => {
			this.toggleBgm1()
			localStorage.setItem(this.BGM_ENABLED_FLAG_KEY, `${this.playing}`)
			// console.log(`${this.bgm1IsPlaying} `)
		})

		events.Sound.TurnBgmOn.subscribe(this.constructor.name, () => {
			this.updateSetting({ enabled: true })
			this.startBGM()
			localStorage.setItem(this.BGM_ENABLED_FLAG_KEY, `${this.playing}`)
			console.log(`${this.playing} `)
		})

		events.Sound.TurnBgmOff.subscribe(this.constructor.name, () => {
			this.updateSetting({ enabled: false })
			this.stopBgm()
			localStorage.setItem(this.BGM_ENABLED_FLAG_KEY, `${this.playing}`)
			console.log(`${this.playing} `)
		})

	}

	async asyncSetup() {
		// const responce = await fetch(this.bgm1url)
		// const buffer = await responce.arrayBuffer()

		// const audioBuffer = await this.loadSoundBuffer(buffer)
		// this.questBGM = audioBuffer as AudioBuffer

		// const responce2 = await fetch(this.battleUrl)
		// const buffer2 = await responce2.arrayBuffer()

		// const audioBuffer2 = await this.loadSoundBuffer(buffer2)
		// this.battleBGM = audioBuffer2 as AudioBuffer

		await this.loadAudioBufferByUrl(this.titleBgmUrl, this.titleBGM)
		await this.loadAudioBufferByUrl(this.bgm1url, this.questBGM)
		await this.loadAudioBufferByUrl(this.battleUrl, this.battleBGM)
	}

	async loadAudioBufferByUrl(url: string, targetBuffer: AudioBuffer) {
		const responce = await fetch(url)
		const buffer = await responce.arrayBuffer()

		const audioBuffer = await this.loadSoundBuffer(buffer)
		targetBuffer = audioBuffer as AudioBuffer
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

	private startBGMSource(buffer: AudioBuffer) {
		console.log(`再生開始 ${this.currentBGMKind}`);
		this.currentBGMSource = this.context.createBufferSource()
		this.currentBGMSource.buffer = buffer
		this.currentBGMSource.loop = true
		this.currentBGMSource.connect(this.context.destination)
		this.currentBGMSource.start(0)
		this.playing = true
	}

	startBGM(bgmKind?: BGMKind) {
		if (!bgmKind) {
			//引数なし: 現在再生中のkindを再生
			bgmKind = this.currentBGMKind
		} else {
			//引数があれば、現在再生中kindとして保存
			this.currentBGMKind = bgmKind
		}
		console.log("sound_enabled", localStorage.getItem(this.BGM_ENABLED_FLAG_KEY))
		if (localStorage.getItem(this.BGM_ENABLED_FLAG_KEY) == "false") {
			console.log("notice: サウンド設定がオフです。");
			return
		}
		switch (bgmKind) {
			case BGMKind.Opening:
				this.startBGMSource(this.titleBGM)
				break
			case BGMKind.Quest:
				this.startBGMSource(this.questBGM)
				break
			case BGMKind.Battle:
				this.startBGMSource(this.battleBGM)
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
			this.updateSetting({ enabled: false })
			this.stopBgm()
		} else {

			this.updateSetting({ enabled: true })
			this.startBGM()
		}
	}
}