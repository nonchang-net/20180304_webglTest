/*
# Maze.ts

Copyright(C) nonchang.net All rights reserved.

## 概要

- 2次元迷路の生成クラス


## ここでやること

- 迷路生成
- デバッグや可視化はmain.ts側に押し込んで、このコードは汎用でコピペできる状態を保つ

*/

// 迷路ファクトリのinterface
// MazeFactory系は全てこのinterfaceを持つものにする
// export interface IMazeFactory{
// 	Create(): Maze
// }

// 迷路データ
export class Maze{
	cells: Cell[][]
}

export enum CellKind{
	Floor,
	Block,
}

export class Cell{
	kind: CellKind
}

export class Factory{
	Create(x: number, y: number): Maze{
		// return this.DEBUG_GetRandomBlockFloor(x, y)
		return this.GetBoutaoshiMaze(x, y)
	}

	//take3: roguelike
	// - 「領域が被らない部屋を道で繋ぐ」

	//take2: 棒倒し法によるmaze
	GetBoutaoshiMaze(xLength: number, yLength: number): Maze{
		var maze = new Maze()
		maze.cells = new Array<Array<Cell>>()
		//まず壁だけ生成
		for(let x=0 ; x<xLength ; x++){
			maze.cells[x] = new Array<Cell>()
			for(let y=0 ; y<yLength ; y++){
				maze.cells[x][y] = new Cell()
				if(x==0 || y==0 || x==xLength - 1 || y==yLength - 1){
					maze.cells[x][y].kind = CellKind.Block
				}else{
					maze.cells[x][y].kind = CellKind.Floor
				}
			}
		}
		// 棒倒し開始
		// ロジックのメモ: 柱から上下左右に一つブロックを生やすとそれなりの迷路になる
		for(let x=2 ; x<xLength - 1 ; x+=2){
			for(let y=2 ; y<yLength - 1 ; y+=2){
				//柱
				maze.cells[x][y].kind = CellKind.Block
				//棒倒し
				let xx = 0
				let yy = 0
				if(Math.random() > 0.5){
					//x方向に変位
					xx = (Math.random()>0.5 ? 1 : -1)
				}else{
					//y方向に変位
					yy = (Math.random()>0.5 ? 1 : -1)
				}
				maze.cells[x+xx][y+yy].kind = CellKind.Block
			}
		}
		return maze
	}

	//take1: ランダムに置くだけ……こんなものは迷路ではない。ゲームにも使えない。
	DEBUG_GetRandomBlockFloor(xLength: number, yLength: number): Maze{
		var maze = new Maze()
		maze.cells = new Array<Array<Cell>>()
		for(let x=0 ; x<xLength ; x++){
			maze.cells[x] = new Array<Cell>()
			for(let y=0 ; y<yLength ; y++){
				maze.cells[x][y] = new Cell()
				if(Math.random()*2 > 1){
					maze.cells[x][y].kind = CellKind.Floor
				}else{
					maze.cells[x][y].kind = CellKind.Block
				}
			}
		}
		return maze
	}
}


