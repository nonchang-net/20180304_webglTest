/*

# UI.ts

Copyright(C) xxx. All rights reserved.

## 概要

- 未検討。とりあえずdomのdiv#uiの参照をこちらに任せてみる。
- どう実装するか考える。
- ゲームの体裁を整える方策を検討


## 仮でcreateElement()で制御

- 生成一つ取ってもCSS設定にしても正直手間。
- react/vue/web component使うか？


## どんな機能が必要か

- 汎用ポップアップ
- イージング: 「tap to start」点滅処理など

*/
export default class UI{

    uiElement: HTMLElement

    constructor(uiElement:HTMLElement){
        // console.log("UI constructor")
        uiElement = uiElement
        const h1 = document.createElement("h1")
        h1.style.fontSize = "12px"
        h1.innerText="test"
        uiElement.appendChild(h1)
    }
}