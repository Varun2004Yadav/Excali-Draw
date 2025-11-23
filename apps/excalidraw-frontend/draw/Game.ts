import { Tool } from "@/app/components/Canvas";
import { getExistingShapes } from "./http";

type Shape =
    {
        type: "rect";
        x: number;
        y: number;
        width: number;
        height: number;
    }
    | {
        type: "circle";
        centerX: number;
        centerY: number;
        radius: number;
    } | {
        type: "pencil",
        startX: number;
        startY: number;
        endX: number;
        endY: number;
    }


export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[];
    private roomSlug: string;
    private clicked: boolean;
    private startX = 0;
    private startY = 0;
    private selectedTool: Tool = "circle";


    socket: WebSocket;


    constructor(canvas: HTMLCanvasElement, roomSlug: string, socket: WebSocket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.existingShapes = [];
        this.roomSlug = roomSlug;
        this.socket = socket;
        this.clicked = false;
        this.init();
        this.initHandlers();
        this.initMouseHandlers();
    }

    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler);

        this.canvas.removeEventListener("mouseup", this.mouseUpHandler);

        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    }

    setTool(tool: "circle" | "pencil" | "rect") {
        this.selectedTool = tool;
    }

    async init() {

        this.existingShapes = await getExistingShapes(this.roomSlug);
        this.clearCanvas();

    }

    initHandlers() {
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type == "chat") {
                const parsedShape = JSON.parse(message.message)
                this.existingShapes.push(parsedShape.shape)
                this.clearCanvas();
            }
        }
    }

    clearCanvas() {

        // Clear and reset black background
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Redraw saved shapes
        this.existingShapes.forEach((shape) => {
            if (shape.type === "rect") {
                this.ctx.strokeStyle = "white";
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            } else if (shape.type === "circle") {
                this.ctx.beginPath();
                this.ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();
            }
        });
    }

    mouseDownHandler = (e : MouseEvent) => {
        this.clicked = true;
        this.startX = e.offsetX; // ✅ use offsetX / offsetY
        this.startY = e.offsetY;
    }

    mouseUpHandler = (e : MouseEvent) => {
        this.clicked = false;
        const width = e.offsetX - this.startX;
        const height = e.offsetY - this.startY;
        //@ts-ignore
        const selectedTool = this.selectedTool;
        let shape: Shape | null = null;

        if (selectedTool === "rect") {
            shape = {
                type: "rect",
                x: this.startX,
                y: this.startY,
                width,
                height,
            }

        } else if (selectedTool === "circle") {

            const radius = Math.max(width, height) / 2;
            shape = {
                type: "circle",
                radius: radius,
                centerX: this.startX + radius,
                centerY: this.startY + radius,
            }
        }

        if (!shape) {
            return
        }
        this.existingShapes.push(shape);

        this.socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify({
                shape
            }),
            roomSlug: this.roomSlug
        }))
    }

    mouseMoveHandler = (e : MouseEvent) => {
        if (this.clicked) {
            const width = e.offsetX - this.startX;
            const height = e.offsetY - this.startY;

            this.clearCanvas();

            this.ctx.strokeStyle = "white";
            //@ts-ignore
            const selectedTool = this.selectedTool;

            if (selectedTool === "rect") {
                this.ctx.strokeRect(this.startX, this.startY, width, height);
            }
            else if (selectedTool === "circle") {
                const centerX = this.startX + width / 2;
                const centerY = this.startY + height / 2;
                const radius = Math.max(width, height) / 2;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();
            }

        }

    }


    initMouseHandlers() {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler);

        this.canvas.addEventListener("mouseup", this.mouseUpHandler);

        this.canvas.addEventListener("mousemove", this.mouseMoveHandler);

    }
}