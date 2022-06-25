class Floor {

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
        if (this.isTopTile() && this.isLeftTile()) {
            return 'floor_topLeft';
        } 
        if (this.isTopTile() && this.isRightTile()) {
            return 'floor_topRight';
        } 
        if (this.isBottomTile() && this.isRightTile()) {
            return 'floor_bottomRight';
        } 
        if (this.isBottomTile() && this.isLeftTile()) {
            return 'floor_bottomLeft';
        } 
        if (this.isLeftTile()) {
            return this.y % 2 == 0 ? 'floor_leftEven' : 'floor_leftOdd';
        } 
        if (this.isTopTile()) {
            return this.x % 2 == 0 ? 'floor_topEven' : 'floor_topOdd';
        } 
        if (this.isRightTile()) {
            return this.y % 2 == 0 ? 'floor_rightEven' : 'floor_rightOdd';
        } 
        if (this.isBottomTile()) {
            return this.x % 2 == 0 ? 'floor_bottomEven' : 'floor_bottomOdd';
        } 
        return this.y % 2 == 0 ? 'floor_middleEven' : 'floor_middleOdd';
    }

    isTopTile() {
        return this.y == 0;
    }

    isBottomTile() {
        return this.y == this.state.CONSTANTS.MAP_TILES_Y-1;
    }

    isLeftTile() {
        return this.x == 0;
    }

    isRightTile() {
        return this.x == this.state.CONSTANTS.MAP_TILES_X-1;
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