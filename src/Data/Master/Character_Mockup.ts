/*

# Character_Mockup.ts

## 概要

- キャラクターマスタモックアップ
	- とりあえずjson文字列で定義。
	- 通信でjson経由で受け取る。
		- 型は受け取り側が検証する。
		- 検証ロジックのテストのためにも、ここはjsonモックアップで定義する必要がある。

- 企画検討中。プリコネRみたいにキャラを入手していくゲームにするかなぁ。
	- キャラの強さ定義はゲームを通して固定。
	- とりあえずlv1の時のステータスとlv10の時のステータスを書いて、間を線形で定義する仕様を検討。
		- 複数定義できるようになると理想。
			- これなら「序盤は成長が遅いキャラ」を表現できる。
		- 将来的にlv100のステータスを定義することになるだろう。
		- マスターデータ入力の手間を最小化したい。

	- スペル修得はキャラごとかなぁ。
		- 別途スペルマスターが必要になる。
		- とりあえず「修得最低レベル・修得最大遅延レベル」を定義する。

*/
export default `

[
	{
		"id": 1,
		"name": "ステラ",
		"undefinedName": "可愛らしい女性",
		"faceGraphicUrl": "characters/mock/f-stella01_mv.png",
		"faceIndices": {
			"normal" : {"x": 0, "y": 0},
			"damaged": {"x": 3, "y": 0}
		},
		"eyeAnimation":{
			"duration" : -1,
			"frames": [
				{ "x": 2, "y": 0 },
				{ "x": 2, "y": 1 },
				{ "x": 2, "y": 0 }
			]
		},
		"poseGrahipcUrl": "characters/mock/f-stella01_p.png",

		"levels":[
			{
				"level":1,
				"hp":10,
				"mp":3,
				"attack":6,
				"magic":3,
				"speed":1,
				"spellSpeed":1
			},
			{
				"level":10,
				"hp":100,
				"mp":30,
				"attack":60,
				"magic":30,
				"speed":10,
				"spellSpeed":3
			}
		],

		"spells":[
			{
				"id":"PHA-LM",
				"spellLevel":1,
				"learnLevel":{
					"min":4,
					"max":7
				}
			},
			{
				"id":"PHA-LM",
				"spellLevel":2,
				"learnLevel":{
					"min":13,
					"max":15
				}
			}
		]
	},
	{
		"id": 2,
		"name": "ロッティ",
		"undefinedName": "可愛らしい女性",
		"faceGraphicUrl": "characters/mock/f-Lotti_mv.png",
		"faceIndices": {
			"normal" : {"x": 0, "y": 0},
			"damaged": {"x": 2, "y": 0}
		},
		"eyeAnimation":{
			"duration" : -1,
			"frames": [
				{ "x": 1, "y": 1 },
				{ "x": 3, "y": 0 }
			]
		},
		"poseGrahipcUrl": "characters/mock/f-Lotti_p.png",

		"levels":[
			{
				"level":1,
				"hp":10,
				"mp":3,
				"attack":6,
				"magic":3,
				"speed":1,
				"spellSpeed":1
			},
			{
				"level":10,
				"hp":100,
				"mp":30,
				"attack":60,
				"magic":30,
				"speed":10,
				"spellSpeed":3
			}
		],

		"spells":[
			{
				"id":"PHALM",
				"spellLevel":1,
				"learnLevel":{
					"min":1,
					"max":1
				}
			},
			{
				"id":"VA-PHALM",
				"spellLevel":2,
				"learnLevel":{
					"min":2,
					"max":5
				}
			},
			{
				"id":"LILU",
				"spellLevel":1,
				"learnLevel":{
					"min":2,
					"max":4
				}
			},
			{
				"id":"VA-LILU",
				"spellLevel":1,
				"learnLevel":{
					"min":3,
					"max":5
				}
			},
			{
				"id":"PHALM",
				"spellLevel":2,
				"learnLevel":{
					"min":3,
					"max":6
				}
			}
		]
	},
	{
		"id": 3,
		"name": "メイ",
		"undefinedName": "中二病の女性",
		"faceGraphicUrl": "characters/mock/f-may01.png",
		"faceIndices": {
			"normal" : {"x": 0, "y": 0},
			"damaged": {"x": 3, "y": 0}
		},
		"eyeAnimation":{
			"duration" : -1,
			"frames": [
				{ "x": 2, "y": 0 },
				{ "x": 2, "y": 1 },
				{ "x": 2, "y": 0 }
			],
			"frames_unused1": [
				{ "x": 2, "y": 1 }
			]
		},
		"poseGrahipcUrl": "characters/mock/f-may01_p.png",

		"levels":[
			{
				"level":1,
				"hp":10,
				"mp":3,
				"attack":6,
				"magic":3,
				"speed":1,
				"spellSpeed":1
			},
			{
				"level":10,
				"hp":100,
				"mp":30,
				"attack":60,
				"magic":30,
				"speed":10,
				"spellSpeed":3
			}
		],

		"spells":[
			{
				"id":"PHALL-BHA",
				"spellLevel":1,
				"learnLevel":{
					"min":1,
					"max":1
				}
			},
			{
				"id":"SEERE-BHA",
				"spellLevel":1,
				"learnLevel":{
					"min":2,
					"max":5
				}
			},
			{
				"id":"SEERE-ZILL",
				"spellLevel":1,
				"learnLevel":{
					"min":2,
					"max":5
				}
			},
			{
				"id":"ZII-BHA",
				"spellLevel":1,
				"learnLevel":{
					"min":2,
					"max":5
				}
			}
		]
	}
]
`