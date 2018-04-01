

import { default as Styler } from '../UI/Styler';
import * as Maze from '../Dangeon/Maze';

export default class MapView {
	public element: HTMLCanvasElement
	// private canvasElement: HTMLCanvasElement
	private context: CanvasRenderingContext2D

	private readonly CellDrawSize = 10

	constructor() {
		this.element = new Styler("canvas").abs().t().r().getElement()
		this.context = this.element.getContext('2d');

		this.element.style.opacity = "0.15"

		// this.element.setAttribute("width", this.element.clientWidth.toString());
		// this.element.setAttribute("height", this.element.clientHeight.toString());
	}

	update(maze: Maze.Maze) {
		const ctx = this.context
		// ctx.scale( window.innerHeight, window.innerWidth );

		this.element.style.width = `${this.CellDrawSize * maze.cells.length}px`
		this.element.style.height = `${this.CellDrawSize * maze.cells[0].length}px`
		this.element.setAttribute("width", `${this.CellDrawSize * maze.cells.length + this.CellDrawSize * 2}`);
		this.element.setAttribute("height", `${this.CellDrawSize * maze.cells[0].length + this.CellDrawSize * 2}`);

		// ctx.beginPath();
		const paddingX = this.CellDrawSize
		const paddingY = this.CellDrawSize
		// const maxX = maze.cells.length * this.CellDrawSize + paddingX
		// const maxY = maze.cells[0].length * this.CellDrawSize + paddingY
		// ctx.moveTo(paddingX, paddingY);
		// ctx.lineTo(maxX, paddingY);
		// ctx.lineTo(maxX, maxY);
		// ctx.lineTo(paddingX, maxY);
		// ctx.closePath();
		// ctx.stroke();

		ctx.fillStyle = 'rgb(255, 255, 255)';

		// canvasへ迷路描画
		for (let y = 0; y < maze.cells[0].length; y++) {
			for (let x = 0; x < maze.cells.length; x++) {
				if (maze.cells[x][y].kind == Maze.CellKind.Block) {
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


}