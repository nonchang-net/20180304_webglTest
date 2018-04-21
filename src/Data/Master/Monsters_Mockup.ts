/**
 * Monster_Mockup.ts
 * 
 * ## 概要
 * 
 * Monster.tsのモックアップデータ
 * 
 * - ただのjsonファイルにするかも。でもコメントかけないんだよな……。ローカル実行では埋め込みたい。
 * - 本番ビルド時にはimportしないことで含まれなくなるように検討中
 */
export default `[
	{
		"id": 1,
		"kind": "Enemy",
		"name": "スライム",
		"key": "slime",
		"undefinedName": "粘液状の生き物",
		"attack": 1,
		"attackVariable": 3,
		"hp": 8,
		"mp": 0,
		"_AI種別": "【単一】攻撃",
		"aiKind": "#VALUE!",
		"dropKind": "TODO - aikind設定後。これも種別選択で選べるようにしたい"
	},
	{
		"id": 2,
		"kind": "Enemy",
		"key": "killerBee",
		"name": "キラービー",
		"undefinedName": "飛び回る生き物",
		"attack": 3,
		"attackVariable": 6,
		"hp": 4,
		"mp": 0,
		"_AI種別": "【単一】攻撃",
		"aiKind": "",
		"dropKind": ""
	},
	{
		"id": 10,
		"kind": "Enemy_BigBoss",
		"name": "ドラゴン",
		"key": "dragon",
		"undefinedName": "大型の化け物",
		"attack": 6,
		"attackVariable": 10,
		"hp": 120,
		"mp": 30,
		"_AI種別": "【複合】攻撃3 : sleep magic1",
		"aiKind": "",
		"dropKind": ""
	}
]`