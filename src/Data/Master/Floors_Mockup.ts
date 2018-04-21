export default `[
	{`+/*フロア1定義*/`
		"encountStep":{
			"min":3, `+/*登場までの最小歩数*/`
			"max":15, `+/*登場までの最大歩数*/`
		}
		"encounters":[ `+/*フロアに登場するモンスターの一覧*/`
			{
				"monsterIds":[1]
			},
			{
				"monsterIds":[1,1]
			},
			{
				"monsterIds":[1,1,1]
			},
			{
				"monsterIds":[2,1]
			},
			{
				"monsterIds":[2,1,1]
			},
		]
	}
]`


//やりたいことを退避

// {
// 	"monsterKeys":["slime","slime"]`+/*モンスター定義はid配列の他にキーでも定義可能にしておく（元マスターデータの設計次第。グースプ上で混乱がないならデータはidに寄せたい）*/`
// },
// {
// 	"monsterDefs":[`+/*モンスター定義はレベルなど詳細定義も可能にしたい*/`
// 		{
// 			"key":"slime",
// 			"level":3
// 		},
// 		{
// 			"id":1,
// 			"level":1
// 		},
// 		{
// 			"key":"slime",
// 			"level":1
// 		}
// 	]
// },
// {
// 	"monsterIds":[1,2]
// },