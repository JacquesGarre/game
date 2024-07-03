class Zone {

    constructor(sprites, state, ctx, x, y, size, owner)
    {
        this.x = x;
        this.y = y;
        this.size = size;
        this.ctx = ctx;
        this.state = state;
        this.sprites = sprites;
        this.sprite = this.sprites[this.getSprite()];
        this.owner = owner;
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

    setWalls(){
        var tilesAround = this.getTilesAround();
        for(const key of Object.keys(tilesAround)){
            var params = tilesAround[key];
            // is wall if is floor and not undefined
            if(params && params.type == 'floor'){
                var wall = new Wall(this.sprites, this.state, this.ctx, params.x, params.y, this.size)
                this.state.tiles[params.x][params.y].type = 'wall';
                this.state.tiles[params.x][params.y].health = this.state.CONSTANTS.WALL_HEALTH;
                this.state.tiles[params.x][params.y].owner = this.owner;
                this.state.tiles[params.x][params.y].sprite = wall.getSprite();
                this.state.walls.push(this.state.tiles[params.x][params.y]);
            }   
        }
    }

    getSprite() {
        return 'zone';
    }

    drawBorders()
    {
        this.ctx.rect(
            this.x * this.size + this.state.canvas.xOffset,
            this.y * this.size + this.state.canvas.yOffset,
            this.size,
            this.size
        )
        this.ctx.strokeStyle = this.state.CONSTANTS.TILE_BORDER_COLOR;
        this.ctx.stroke();
    }

}