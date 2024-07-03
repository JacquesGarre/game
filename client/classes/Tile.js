class Tile {

    constructor(x, y, state, ctx, size, player)
    {   
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.size = size;
        this.state = state;
        this.selected = false;
        this.player = player;

    }

    getTilesAround(){
        return {
            topLeft: this.state.tiles[this.x-1] !== undefined && this.state.tiles[this.x-1][this.y-1] !== undefined ? this.state.tiles[this.x-1][this.y-1] : false,     // top-left
            top: this.state.tiles[this.x] !== undefined && this.state.tiles[this.x][this.y-1] !== undefined ? this.state.tiles[this.x][this.y-1] : false,             // top
            topRight: this.state.tiles[this.x+1] !== undefined && this.state.tiles[this.x+1][this.y-1] !== undefined ? this.state.tiles[this.x+1][this.y-1] : false,    // top-right
            right: this.state.tiles[this.x+1] !== undefined && this.state.tiles[this.x+1][this.y] !== undefined ? this.state.tiles[this.x+1][this.y] : false,           // right
            bottomRight: this.state.tiles[this.x+1] !== undefined && this.state.tiles[this.x+1][this.y+1] !== undefined ? this.state.tiles[this.x+1][this.y+1] : false, // bottom-right
            bottom: this.state.tiles[this.x] !== undefined && this.state.tiles[this.x] [this.y+1] !== undefined ? this.state.tiles[this.x][this.y+1] : false,          // bottom
            bottomLeft: this.state.tiles[this.x-1] !== undefined && this.state.tiles[this.x-1][this.y+1] !== undefined ? this.state.tiles[this.x-1][this.y+1] : false,  // bottom-left
            left: this.state.tiles[this.x-1] !== undefined && this.state.tiles[this.x-1][this.y] !== undefined ? this.state.tiles[this.x-1][this.y] : false,            // left
        }
    }

    drawAsPossibleMove()
    {
        // Draw line around
        this.ctx.globalAlpha = 0.4;
        this.ctx.beginPath();
        this.ctx.lineWidth = "1";
        this.ctx.strokeStyle = this.state.CONSTANTS.POSSIBLE_MOVES_COLOR;
        this.ctx.rect(
            this.x * this.size + this.state.canvas.xOffset, // x
            this.y * this.size + this.state.canvas.yOffset, // y
            this.size, // width
            this.size // height
        ); 
        this.ctx.stroke();
        
        // Fill rectangle
        this.ctx.fillStyle = this.state.CONSTANTS.POSSIBLE_MOVES_COLOR;
        this.ctx.fillRect(
            this.x * this.size + this.state.canvas.xOffset, // x
            this.y * this.size + this.state.canvas.yOffset, // y
            this.size, // width
            this.size // height
        )

        this.ctx.globalAlpha = 1;
    }

    isClicked()
    {
        return this.player.mouseClicked !== false && (this.x * this.size + this.state.canvas.xOffset) < this.player.mouseClicked.x &&
                        (this.x * this.size + this.state.canvas.xOffset + this.size) >= this.player.mouseClicked.x &&
                        (this.y * this.size + this.state.canvas.yOffset) < this.player.mouseClicked.y &&
                        (this.y * this.size + this.state.canvas.yOffset + this.size) >= this.player.mouseClicked.y
    }

}