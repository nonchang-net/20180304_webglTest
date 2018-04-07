

import { default as Styler } from '../UI/Styler';
import * as Maze from '../Dangeon/Maze';
import { default as GameEvents } from '../Event/GameEvents';

export default class MapView {
	public element: HTMLCanvasElement
	// private canvasElement: HTMLCanvasElement
	private context: CanvasRenderingContext2D

	private readonly CellDrawSize = 6

	private maze: Maze.Maze

	private events: GameEvents

	public playerMarkCanvas: HTMLCanvasElement
	private playerMarkCtx: CanvasRenderingContext2D

	constructor(events: GameEvents, maze: Maze.Maze) {
		this.events = events
		this.maze = maze

		this.element = new Styler("canvas").abs().t().r().getElement()
		this.context = this.element.getContext('2d');

		// this.element.style.opacity = "0.15"
		this.element.style.opacity = "0.3"

		// this.element.setAttribute("width", this.element.clientWidth.toString());
		// this.element.setAttribute("height", this.element.clientHeight.toString());


		//プレイヤー位置表示canvas
		this.playerMarkCanvas = new Styler("canvas").abs().t().r().getElement()
		this.playerMarkCtx = this.playerMarkCanvas.getContext('2d');

		events.Common.PlayerMove.subscribe(this.constructor.name, (pos: { x: number, y: number }) => {
			// console.log(`pos : x=${pos.x} , y=${pos.y}`)
			this.updatePlayerMark(pos.x / 100, pos.y / 100, -1)
		})
		events.Common.PlayerRotate.subscribe(this.constructor.name, (rotate: number) => {
			// console.log(`rotate = ${rotate}`)
			// this.updatePlayerMark(-1, -1, rotate)
		})

		//サイズ初期化

		this.element.style.width = `${this.CellDrawSize * this.maze.cells.length}px`
		this.element.style.height = `${this.CellDrawSize * this.maze.cells[0].length}px`
		this.element.setAttribute("width", `${this.CellDrawSize * this.maze.cells.length + this.CellDrawSize * 2}`);
		this.element.setAttribute("height", `${this.CellDrawSize * this.maze.cells[0].length + this.CellDrawSize * 2}`);

		this.playerMarkCanvas.style.width = `${this.CellDrawSize * this.maze.cells.length}px`
		this.playerMarkCanvas.style.height = `${this.CellDrawSize * this.maze.cells[0].length}px`
		this.playerMarkCanvas.setAttribute("width", `${this.CellDrawSize * this.maze.cells.length + this.CellDrawSize * 2}`);
		this.playerMarkCanvas.setAttribute("height", `${this.CellDrawSize * this.maze.cells[0].length + this.CellDrawSize * 2}`);
	}

	update() {
		const ctx = this.context
		// ctx.scale( window.innerHeight, window.innerWidth );


		// ctx.beginPath();
		const paddingX = this.CellDrawSize
		const paddingY = this.CellDrawSize

		ctx.fillStyle = 'rgb(255, 255, 255)';

		// canvasへ迷路描画
		for (let y = 0; y < this.maze.cells[0].length; y++) {
			for (let x = 0; x < this.maze.cells.length; x++) {
				if (this.maze.cells[x][y].kind == Maze.CellKind.Block) {
					ctx.fillRect(
						paddingX + x * this.CellDrawSize,
						paddingY + y * this.CellDrawSize,
						this.CellDrawSize,
						this.CellDrawSize
					)
				}
			}
		}
	}

	updatePlayerMark(x: number, y: number, rot: number = -1) {
		// console.log(`pos : x=${x} , y=${y}`)

		const ctx = this.playerMarkCtx
		ctx.clearRect(
			0, 0,
			this.maze.cells.length * this.CellDrawSize,
			this.maze.cells[0].length * this.CellDrawSize
		)
		ctx.fillStyle = 'rgb(255,0,0)';
		const paddingX = this.CellDrawSize
		const paddingY = this.CellDrawSize

		ctx.fillRect(
			paddingX + x * this.CellDrawSize,
			paddingY + y * this.CellDrawSize,
			this.CellDrawSize,
			this.CellDrawSize
		)

	}


}