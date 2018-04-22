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

- iOS Safariでは初回読み込み完了直後の再生がうまくいってない。
- また、iOS Safariでは画面スリープしても音が鳴り続けている。これは不具合として認識されると思うのでなんとかしたい……。


*/
import GameEvents from '../Event/GameEvents'

export enum BGMKind {
	Opening,
	Quest,
	Battle,
	BossBattle,
}

export default class SoundManager {

	static readonly BGM_ENABLED_FLAG_KEY = 'BGM Enabled'

	context: AudioContext

	buffers: {}

	currentBGMKind: BGMKind = BGMKind.Opening

	//TODO: kind enumにまとめたい。また、マスターデータ化したい。。
	titleBGMBuffer: AudioBuffer
	questBGMBuffer: AudioBuffer
	battleBGMBuffer: AudioBuffer
	bossBattleBGMBuffer: AudioBuffer

	currentBGMSource: AudioBufferSourceNode
	playing = false

	//TODO: kind enumにまとめたい。また、マスターデータ化したい。。
	private readonly titleBgmUrl = './sounds/bgm/likeabirdinacage_short.mp3'
	private readonly questBgmUrl = './sounds/bgm/dangeon01_sketch01.mp3'
	private readonly battleBgmUrl = './sounds/bgm/battle01_sketch01.mp3'
	private readonly bossBattleBgmUrl = './sounds/bgm/rasinban_battle_mix1.mp3'

	// private readonly urls = {
	// 	[BGMKind.Opening]: './sounds/bgm/likeabirdinacage_short.mp3',
	// 	[BGMKind.Quest]: './sounds/bgm/dangeon01_sketch01.mp3',
	// 	[BGMKind.Battle]: './sounds/bgm/battle01_sketch01.mp3',
	// 	[BGMKind.BossBattle]: './sounds/bgm/rasinban_battle_mix1.mp3',
	// }

	private readonly bufferStartPos = {
		[BGMKind.Opening]: 1.8,
	}

	constructor(events: GameEvents) {
		try {
			this.context = new AudioContext()
		} catch (e) {
			//note: 20180411現在、safariはmacOSもiOSもAudioContextをnewできない模様
			console.log(e)
			const fallbackScope: any = window
			this.context = new fallbackScope.webkitAudioContext();
		}

		const bgmEnabledLocalStorageValue = localStorage.getItem(SoundManager.BGM_ENABLED_FLAG_KEY)
		// console.log(bgmEnabledLocalStorageValue)
		const bgmEnabled = !bgmEnabledLocalStorageValue ? false : bgmEnabledLocalStorageValue == "true"

		// console.log(`bgm enabled: ${bgmEnabled}`);

		// if (bgmEnabled) {
		// 	this.startBGM(BGMKind.Opening)
		// }
		events.Sound.ToggleBgm.subscribe(this.constructor.name, () => {
			this.toggleBgm1()
			localStorage.setItem(SoundManager.BGM_ENABLED_FLAG_KEY, `${this.playing}`)
			// console.log(`${this.bgm1IsPlaying} `)
		})

		events.Sound.TurnBgmOn.subscribe(this.constructor.name, () => {
			this.updateSetting({ enabled: true })
			this.startBGM()
			localStorage.setItem(SoundManager.BGM_ENABLED_FLAG_KEY, `${this.playing}`)
			// console.log(`${this.playing} `)
		})

		events.Sound.TurnBgmOff.subscribe(this.constructor.name, () => {
			this.updateSetting({ enabled: false })
			this.stopBgm()
			localStorage.setItem(SoundManager.BGM_ENABLED_FLAG_KEY, `${this.playing}`)
			// console.log(`${this.playing} `)
		})

		// =====================
		// TET: 初回アクセスポップアップ実装テスト
		// - 初期化タイミングは実際にはどこになるだろう？
		// - セーブデータを自動読み込みするのであれば、UserData初期化のあとになるだろうか。

		// const contents = new Styler("div").flexVertical().middle().center().getElement()

		// new Styler("p").text(" - [ゲームタイトル] - ").appendTo(contents)
		// new Styler("h2").text("音楽を再生しますか？").appendTo(contents)
		// // new Styler("hr").appendTo(contents)
		// new Styler("p").text("再生する場合、10.2MBの事前ダウンロードが始まります。").appendTo(contents)
		// new Styler("p").text("音楽データのダウンロードはメニューからいつでもできます。").appendTo(contents)
		// new Styler("p").text("ダウンロード済みのローカルストレージ中の音楽データは後から削除できます。").appendTo(contents)

		// const cancelled = await Popup.OpenConfirmPopup(contents)
		// console.log(`popup closed. ${cancelled}`)

	}

	async asyncSetup() {
		// 	this.buffers[BGMKind.Opening] = await this.loadAudioBufferByUrl(this.urls[BGMKind.Opening])
		// 	this.buffers[BGMKind.Quest] = await this.loadAudioBufferByUrl(this.urls[BGMKind.Opening])
		// 	this.buffers[BGMKind.Battle] = await this.loadAudioBufferByUrl(this.urls[BGMKind.Battle])
		// 	this.buffers[BGMKind.BossBattle] = await this.loadAudioBufferByUrl(this.urls[BGMKind.BossBattle])
		this.titleBGMBuffer = await this.loadAudioBufferByUrl(this.titleBgmUrl)
		this.questBGMBuffer = await this.loadAudioBufferByUrl(this.questBgmUrl)
		this.battleBGMBuffer = await this.loadAudioBufferByUrl(this.battleBgmUrl)
		this.bossBattleBGMBuffer = await this.loadAudioBufferByUrl(this.bossBattleBgmUrl)
	}

	async loadAudioBufferByUrl(url: string): Promise<AudioBuffer> {
		const responce = await fetch(url)
		const buffer = await responce.arrayBuffer()

		const audioBuffer = await this.loadSoundBuffer(buffer)
		return audioBuffer as AudioBuffer
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
				console.error('sound buffer load error', error)
				reject(null)
			})
		})
	}

	private startBGMSource(buffer: AudioBuffer, startPosition: number = 0) {
		console.log(`再生開始 ${this.currentBGMKind}`);
		this.currentBGMSource = this.context.createBufferSource()
		this.currentBGMSource.buffer = buffer
		this.currentBGMSource.loop = true
		this.currentBGMSource.connect(this.context.destination)
		this.currentBGMSource.start(0, startPosition)
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
		// console.log("sound_enabled", localStorage.getItem(SoundManager.BGM_ENABLED_FLAG_KEY))
		if (localStorage.getItem(SoundManager.BGM_ENABLED_FLAG_KEY) == "false") {
			console.log("notice: サウンド設定がオフです。");
			return
		}

		//指定された曲を再生
		this.stopBgm()
		// if (this.bufferStartPos[bgmKind]) {
		// 	this.startBGMSource(this.buffers[bgmKind], this.bufferStartPos[bgmKind])
		// } else {
		// 	this.startBGMSource(this.buffers[bgmKind])
		// }


		switch (bgmKind) {
			case BGMKind.Opening:
				this.startBGMSource(this.titleBGMBuffer, 3.1)
				break
			case BGMKind.Quest:
				this.startBGMSource(this.questBGMBuffer)
				break
			case BGMKind.Battle:
				this.startBGMSource(this.battleBGMBuffer)
				break
			case BGMKind.BossBattle:
				this.startBGMSource(this.bossBattleBGMBuffer)
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
		localStorage.setItem(SoundManager.BGM_ENABLED_FLAG_KEY, settings.enabled.toString());
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