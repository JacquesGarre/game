class Soldier {

    constructor(sprites, state, ctx, x, y, size, playerNumber, health, energy, currentPlayerNumber)
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
        this.currentPlayerNumber = currentPlayerNumber;
        const index = this.state.soldiers.findIndex(char => {
            return char.x == this.x && char.y == this.y && char.owner == this.owner;
        });
        this.selected = index >= 0 && this.state.soldiers[index].selected !== undefined ? this.state.soldiers[index].selected : false;
        this.path = index >= 0 ? this.state.soldiers[index].path : [];
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
        if(this.selected && this.owner == this.currentPlayerNumber){
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

    getTilesAround(x, y){
        return {
            topLeft: this.state.tiles[x-1] !== undefined && this.state.tiles[x-1][y-1] !== undefined ? this.state.tiles[x-1][y-1] : false,     // top-left
            top: this.state.tiles[x] !== undefined && this.state.tiles[x][y-1] !== undefined ? this.state.tiles[x][y-1] : false,             // top
            topRight: this.state.tiles[x+1] !== undefined && this.state.tiles[x+1][y-1] !== undefined ? this.state.tiles[x+1][y-1] : false,    // top-right
            right: this.state.tiles[x+1] !== undefined && this.state.tiles[x+1][y] !== undefined ? this.state.tiles[x+1][y] : false,           // right
            bottomRight: this.state.tiles[x+1] !== undefined && this.state.tiles[x+1][y+1] !== undefined ? this.state.tiles[x+1][y+1] : false, // bottom-right
            bottom: this.state.tiles[x] !== undefined && this.state.tiles[x] [y+1] !== undefined ? this.state.tiles[x][y+1] : false,          // bottom
            bottomLeft: this.state.tiles[x-1] !== undefined && this.state.tiles[x-1][y+1] !== undefined ? this.state.tiles[x-1][y+1] : false,  // bottom-left
            left: this.state.tiles[x-1] !== undefined && this.state.tiles[x-1][y] !== undefined ? this.state.tiles[x-1][y] : false,            // left
        }
    }

    getMovesAround(){

        // Tiles around player itself
        if(this.path.length == 0){
            
            return this.getTilesAround(this.x, this.y);

        // Tiles around last tile selected
        } else {

            let lastPath = this.path[this.path.length - 1];
            return this.getTilesAround(lastPath.x, lastPath.y);
        }

    }

    drawPath()
    {
        for(const tile of this.path){

            // Draw line around
            this.ctx.globalAlpha = 0.4;
            this.ctx.beginPath();
            this.ctx.lineWidth = "1";
            this.ctx.strokeStyle = this.state.CONSTANTS.PATH_COLOR;
            this.ctx.rect(
                tile.x * tile.size + this.state.canvas.xOffset, // x
                tile.y * tile.size + this.state.canvas.yOffset, // y
                tile.size, // width
                tile.size // height
            ); 
            this.ctx.stroke();
            
            // Fill rectangle
            this.ctx.fillStyle = this.state.CONSTANTS.PATH_COLOR;
            this.ctx.fillRect(
                tile.x * tile.size + this.state.canvas.xOffset, // x
                tile.y * tile.size + this.state.canvas.yOffset, // y
                tile.size, // width
                tile.size // height
            )

            this.ctx.globalAlpha = 1;

        }
    }

}