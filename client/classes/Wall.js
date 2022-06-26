class Wall {

    constructor(sprites, state, ctx, x, y, size)
    {
        this.x = x;
        this.y = y;
        this.size = size;
        this.ctx = ctx;
        this.state = state;
        this.sprites = sprites;
        this.sprite = this.sprites[this.getSprite()];
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


    getSprite() {
        var tilesAround = this.getTilesAround();

        // top-right-inner corner (has a zone to the left, has a zone to the bottomleft, has a zone to the bottom)
        if(
            tilesAround.left && tilesAround.left.type == 'zone' && 
            tilesAround.bottomLeft && tilesAround.bottomLeft.type == 'zone' &&
            tilesAround.bottom && tilesAround.bottom.type == 'zone'
        ){
            return 'wall_topRightInner';
        }

        // top-left-inner corner (has a zone to the right, has a zone to the bottomright, has a zone to the bottom)
        if(
            tilesAround.right && tilesAround.right.type == 'zone' && 
            tilesAround.bottomRight && tilesAround.bottomRight.type == 'zone' &&
            tilesAround.bottom && tilesAround.bottom.type == 'zone'
        ){
            return 'wall_topLeftInner';
        }

        // bottom-left-inner corner (has a zone to the top, has a zone to the topright, has a zone to the right)
        if(
            tilesAround.top && tilesAround.top.type == 'zone' && 
            tilesAround.topRight && tilesAround.topRight.type == 'zone' &&
            tilesAround.right && tilesAround.right.type == 'zone'
        ){
            return 'wall_bottomLeftInner';
        }

        // bottom-right-inner corner (has a zone to the top, has a zone to the topleft, has a zone to the left)
        if(
            tilesAround.top && tilesAround.top.type == 'zone' && 
            tilesAround.topLeft && tilesAround.topLeft.type == 'zone' &&
            tilesAround.left && tilesAround.left.type == 'zone'
        ){
            return 'wall_bottomRightInner';
        }

        // wall-top-left : tile to the right is floor or wall, tile to the bottom is floor or wall, 
        // tile to the bottomright must be zone
        if(
            tilesAround.right && (tilesAround.right.type == 'floor' || tilesAround.right.type == 'wall') && 
            tilesAround.bottom && (tilesAround.bottom.type == 'floor' || tilesAround.bottom.type == 'wall') && 
            tilesAround.bottomRight && tilesAround.bottomRight.type == 'zone'
        ){
            return 'wall_topLeft';
        }

        // wall-top-right : tile to the left is floor or wall, tile to the bottom is floor or wall, 
        // tile to the bottomleft must be zone
        if(
            tilesAround.left && (tilesAround.left.type == 'floor' || tilesAround.left.type == 'wall') && 
            tilesAround.bottom && (tilesAround.bottom.type == 'floor' || tilesAround.bottom.type == 'wall') && 
            tilesAround.bottomLeft && tilesAround.bottomLeft.type == 'zone'
        ){
            return 'wall_topRight';
        }

        // wall-bottom-right : tile to the top is floor or wall, tile to the left is floor or wall, 
        // tile to the topleft must be zone
        if(
            tilesAround.top && (tilesAround.top.type == 'floor' || tilesAround.top.type == 'wall') && 
            tilesAround.left && (tilesAround.left.type == 'floor' || tilesAround.left.type == 'wall') && 
            tilesAround.topLeft && tilesAround.topLeft.type == 'zone'
        ){
            return 'wall_bottomRight';
        }

        // wall-bottom-left : tile to the top is floor or wall, tile to the right is floor or wall, 
        // tile to the topright  must be zone
        if(
            tilesAround.top && (tilesAround.top.type == 'floor' || tilesAround.top.type == 'wall') && 
            tilesAround.right && (tilesAround.right.type == 'floor' || tilesAround.right.type == 'wall') && 
            tilesAround.topRight && tilesAround.topRight.type == 'zone'
        ){
            return 'wall_bottomLeft';
        }

        // wall-right : tile to the left must be zone.
        if(tilesAround.left && tilesAround.left.type == 'zone'){
            return 'wall_right';
        }

        // wall-left : tile to the right must be zone.
        if(tilesAround.right && tilesAround.right.type == 'zone'){
            return  'wall_left';
        }

        // wall-top : tile to the bottom must be zone.
        if(tilesAround.top && tilesAround.top.type == 'zone'){
            return 'wall_top';
        }

        // wall-bottom : tile to the right must be zone.
        if(tilesAround.bottom && tilesAround.bottom.type == 'zone'){
            return 'wall_bottom';
        }
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