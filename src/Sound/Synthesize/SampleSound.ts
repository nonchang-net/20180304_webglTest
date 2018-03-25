/*
# SampleSound.ts

Copyright(C) nonchang.net All rights reserved.

## 概要

- 音関係

*/
import * as Tone from 'tone';

export default class SampleSound{
	constructor(){
		// Tone.jsテスト: 鳴った。
		// - これはシンセ制御からしてみたい欲求にすごく貢献しそうなアレ。
		// - d.tsはまだimportしてない。 : https://github.com/Tonejs/TypeScript
		var synth = new Tone.Synth().toMaster();
		synth.triggerAttackRelease("C4", "8n");
	}
}