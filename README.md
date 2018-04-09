# TypeScript+three.jsによるゲームプロジェクト

## 概要

20180407 update

- WebGLを使ったゲームテンプレートのつもりが、自作ライブラリも揃ってきたので実際にゲーム制作を検討し始めた段階。
- ゲーム名は仮で「cage」。ストーリーやシステムは別途検討中
- 「Documents/」に検討している項目のメモランダムなどを書き散らしてる最中。


## 古い概要

- WebGLの練習用リポジトリです。
	- TypeScript+Webpack導入と、npm run deployまでのセットアップなど環境整備のサンプルとしても。

- WebGL操作ライブラリにはthree.jsを選択しました。

- webpackでTypeScript導入。
	- npm installのあとは、npm run devでローカルサーバ起動します。

- デプロイは`npm run deploy`、S3へのデプロイに必要な機密情報はリポジトリに含んでいません。

- リポジトリ  
	https://github.com/nonchang-net/20180304_webglTest

- 動作サンプル  
	http://nonchang.net/test/webgl/


## ライセンスとか

個人の練習用リポジトリなのでライセンスは未定とします。転載などはご容赦ください。  
なんか有益なものができたらMIT記載でリポジトリ分けて公開したいなと思います。


## 目標

- 簡単なゲーム作成まではやりたい。
	- 取り急ぎは、過去にUnityで作ってみてた「NRogue」のコードを参考に、ランダムダンジョンの作成を試したい。
	- TypeScriptによるタッチイベント処理の基本や、フロートHTMLでの画面制御などを試していきたい。

- ただ、今時感のある「見栄えのするシンプルなゲーム」はダンジョンゲームではないと思うので、アイデアは随時検討していく。






`EOF`