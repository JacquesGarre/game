class Soldier {

    constructor(sprites, state, ctx, x, y, size, playerNumber, health, energy)
    {
        this.x = x;
        this.y = y;
        this.size = size;
        this.ctx = ctx;
        this.state = state;
        this.sprites = sprites;
        this.owner = playerNumber;
        this.sprite = this.sprites['soldier_idle_down_0'];
        this.health = health;
        this.energy = energy;
        const index = this.state.soldiers.findIndex(char => {
            return char.x == this.x && char.y == this.y && char.owner == this.owner;
        });
        this.selected = this.state.soldiers[index].selected !== undefined ? this.state.soldiers[index].selected : false;
    }

    draw()
    {
        // Draw borders
        if(this.state.CONSTANTS.DEBUG){
            this.drawBorders();
        }

        // Draw sprite
        this.ctx.drawImage(
            this.sprite, 
            this.x * this.size + this.state.canvas.xOffset,
            this.y * this.size + this.state.canvas.yOffset,
        )

        // If selected, draw hover effect constantly
        if(this.selected){
            this.drawSquareAround();
            this.drawBars();
        }
        
    }

    drawBorders()
    {
        this.ctx.beginPath();
        this.ctx.rect(
            this.x * this.size + this.state.canvas.xOffset,
            this.y * this.size + this.state.canvas.yOffset,
            this.size,
            this.size
        )
        this.ctx.strokeStyle = this.state.CONSTANTS.TILE_BORDER_COLOR;
        this.ctx.stroke();
    }

    drawHoverEffect()
    {   
        this.drawSquareAround();
        this.drawBars();
    }

    drawSquareAround()
    {
        this.ctx.beginPath();
        this.ctx.rect(
            this.x * this.size + this.state.canvas.xOffset,
            this.y * this.size + this.state.canvas.yOffset,
            this.size,
            this.size
        )
        this.ctx.strokeStyle = this.state.CONSTANTS.HOVER_BORDER_COLOR;
        this.ctx.stroke();
    }

    drawBars()
    {   

        this.drawHealthBar();
        this.drawEnergyBar();

    }

    drawHealthBar()
    {

        // Health bar
        this.ctx.globalAlpha = 1;
        this.ctx.beginPath();
        this.ctx.lineWidth = '1';
        this.ctx.strokeStyle = 'black'
        this.ctx.rect(
            this.x * this.size + this.state.canvas.xOffset, // x
            this.y * this.size - 10 + this.state.canvas.yOffset, // y
            this.size, // width
            5 // height
        ); 
        this.ctx.stroke();

        // FILL HEALTH BAR
        var healthBar = this.health/this.state.CONSTANTS.SOLDIER_HEALTH*this.size;
        this.ctx.fillStyle = 'green';
        this.ctx.fillRect(
            this.x * this.size + this.state.canvas.xOffset, // x
            this.y * this.size - 10 + this.state.canvas.yOffset, // y
            healthBar, // width
            5 // height
        )


    }

    drawEnergyBar()
    {
        // Energy bar
        this.ctx.globalAlpha = 1;
        this.ctx.beginPath();
        this.ctx.lineWidth = '1';
        this.ctx.strokeStyle = 'black'
        this.ctx.rect(
            this.x * this.size + this.state.canvas.xOffset, // x
            this.y * this.size - 18 + this.state.canvas.yOffset, // y
            this.size, // width
            5 // height
        ); 
        this.ctx.stroke();

        // FILL Energy bar 
        var energyBar = this.energy/this.state.CONSTANTS.SOLDIER_ENERGY*this.size;
        this.ctx.fillStyle = 'blue';
        this.ctx.fillRect(
            this.x * this.size + this.state.canvas.xOffset, // x
            this.y * this.size - 18 + this.state.canvas.yOffset, // y
            energyBar, // width
            5 // height
        )
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

}