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
	// Battle = new BattleEvents()
	// FloorEffect = new FloorEffectEvents()

	Debug = new DebugEvents()
}

class CommonEvents {
	StateChanged = new Event()

	// ToFullScreen = new Event()
	// CancelFullScreen = new Event()
	ToggleFullScreen = new Event()

	PlayerMove = new Event<{ x: number, y: number }>()
	PlayerRotate = new Event<number>()
}

class UIEvents {
	//ゲーム中、様々な「処理中」にはUI操作停止を通知する必要がある
	Disable = new Event()
	Enable = new Event()
}

class ButtonEvents {
	TurnRight = new Event()
	TurnLeft = new Event()
	StepToForward = new Event()
	StepToBack = new Event()
}

class DebugEvents {
	KeyA = new Event()
	TestForward = new Event()
	TestLeft = new Event()
	TestRight = new Event()
	TestDown = new Event()
}