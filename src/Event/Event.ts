/*

# Event.ts

Copyright(C) nonchang.net All rights reserved.

## 概要

- DOMを使わないシンプルなイベント
- 発行はbroadcastのみ
- 購読・購読解除のsubscribe、unsubscribe

## TODO

- ユニットテスト書かなきゃ

*/



//boilerplate
export default class SimpleEvent<T>{

	private _handlers

	subscribe(subscriberName: string, func: (arg:T)=>any){
		if(!this._handlers){
			this._handlers = {}
		}
		if(!this._handlers[subscriberName]){
			this.init(subscriberName)
		}
		this._handlers[subscriberName].push(func);
	}

	unsubscribe(subscriberName: string){
		this.init(subscriberName)
	}

	private init(subscriberName: string){
		this._handlers[subscriberName] = []
	}

	broadcast(arg?:T) {
		for (const subscriberName in this._handlers){
			for (const handler of this._handlers[subscriberName]) {
				handler.apply(this, arguments)
			}
		}
	}
}