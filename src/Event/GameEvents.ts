/*

# GameEvents.ts

Copyright(C) xxx. All rights reserved.

## 概要

シンプルなイベント表現

*/

import { default as Event } from './Event';
// import * as GameContext from './GameContext';


export default class Events {
	UndefinedError = new Event()
	Common = new CommonEvents()
	UI = new UIEvents()
	Button = new ButtonEvents()
	Sound = new SoundEvents()
	Keyboard = new KeyboardEvents()
	// Battle = new BattleEvents()
	// FloorEffect = new FloorEffectEvents()
	Debug = new DebugEvents()
}

class CommonEvents {
	StateChanged = new Event()

	// ToFullScreen = new Event()
	// CancelFullScreen = new Event()
	ToggleFullScreen = new Event()

	BackToTitle = new Event()

	PlayerMove = new Event<{ x: number, y: number }>()
	PlayerRotate = new Event<number>()

	PlayerStepToForwardSuccess = new Event()
	PlayerStepToForwardSucceed = new Event()
	PlayerStepToForwardAndHitBlock = new Event()
}

class UIEvents {
	//ゲーム中、様々な「処理中」にはUI操作停止を通知する必要がある
	Disable = new Event()
	Enable = new Event()

	TitleTap = new Event()

	TouchAndKeyboardSwitch = new Event<boolean>()
	BottomButtonSwitch = new Event<boolean>()

	AddMessage = new Event<string>()
	ClearMessage = new Event()

	//ゲーム中、いつでも呼び出せるポップアップメニュー
	OpenPopupMenu = new Event()
}

class ButtonEvents {
	TurnRight = new Event()
	TurnLeft = new Event()
	StepToForward = new Event()
	StepToBack = new Event()
}

class SoundEvents {
	TurnBgmOn = new Event()
	TurnBgmOff = new Event()
	ToggleBgm = new Event()
}

class KeyboardEvents {
	Z = new Event()
	X = new Event()
}

class DebugEvents {
	KeyA = new Event()
	TestForward = new Event()
	TestLeft = new Event()
	TestRight = new Event()
	TestDown = new Event()
}
