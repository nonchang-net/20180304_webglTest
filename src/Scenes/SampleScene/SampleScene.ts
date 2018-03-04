/*

# SampleScene.ts

Copyright(C) nonchang.net All rights reserved.

## 概要

- main.tsからシーン生成をひっぺがした。
- Sceneは差し替え可能な設計にしたい。
- さて、どうするか。
	- DI的な設計を先に学ぶべきか？

*/

// シーンラッパー
// シーン管理クラスはこれを実装する
export interface ISceneWrapper{

}

class SceneWrapper implements ISceneWrapper{

}

export class SampleScene extends SceneWrapper{

}