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
        this.health = health;
        this.currentPlayerNumber = currentPlayerNumber;
        const index = this.state.soldiers.findIndex(char => {
            return char.x == this.x && char.y == this.y && char.owner == this.owner;
        });
        this.selected = index >= 0 && this.state.soldiers[index].selected !== undefined ? this.state.soldiers[index].selected : false;
        this.path = index >= 0 ? this.state.soldiers[index].path : [];
        this.animation = index >= 0 && this.state.soldiers[index].animation !== undefined ? this.state.soldiers[index].animation : 'idle';
        this.direction = index >= 0 && this.state.soldiers[index].direction !== undefined ? this.state.soldiers[index].direction : 'down';
        this.animationStep = index >= 0 && this.state.soldiers[index].animationStep ? this.state.soldiers[index].animationStep : 0;
        this.energy = index >= 0 && this.state.soldiers[index].energy !== undefined ? this.state.soldiers[index].energy : energy;
        this.sprite = this.sprites['soldier_'+this.animation+'_'+this.direction+'_'+this.animationStep];

        this.nextPath = false;
        this.combo = index >= 0 && this.state.soldiers[index].combo !== undefined ? this.state.soldiers[index].combo : [];
    }

    draw()
    {
        // Draw borders
        if(this.state.CONSTANTS.DEBUG){
            this.drawBorders();
        }

        // Draw sprite
        this.sprite = this.sprites['soldier_'+this.animation+'_'+this.direction+'_'+ Math.floor(this.animationStep)];

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

    walkPath(key)
    {
        [this.animation, this.direction] = this.getNextPathDirection(key);
        if(this.animation == 'walk'){
            switch(this.direction){
                case 'right':
                    this.x += this.state.CONSTANTS.WALKING_SPEED;
                break;
                case 'left':
                    this.x -= this.state.CONSTANTS.WALKING_SPEED;
                break;
                case 'up':
                    this.y -= this.state.CONSTANTS.WALKING_SPEED;
                break;
                case 'down':
                    this.y += this.state.CONSTANTS.WALKING_SPEED;
                break;
            }
            if(this.animationStep < (4 - this.state.CONSTANTS.FRAME_RATE)){
                this.animationStep += this.state.CONSTANTS.FRAME_RATE;
            } else {
                this.animationStep = 0;
            }
            
            this.energy -= this.state.CONSTANTS.WALKING_SPEED;
            this.energy = this.energy.toFixed(2)
        } else if (this.animation == 'idle') {
            this.animationStep = 0;
        }

        this.state.soldiers[key].animation = this.animation;
        this.state.soldiers[key].animationStep = this.animationStep;
        this.state.soldiers[key].direction = this.direction;
        this.state.soldiers[key].energy = this.energy;
        this.state.soldiers[key].x = this.x;
        this.state.soldiers[key].y = this.y;

        this.draw();
        if(this.owner == this.currentPlayerNumber){
            this.drawBars();
        }
    }
    
    getNextPathDirection(key)
    {

        if(this.path[0] !== undefined){
            this.nextPath = this.path[0];         

            // right
            if(this.x.toFixed(2) < (this.nextPath.x - this.state.CONSTANTS.WALKING_SPEED) && this.y.toFixed(2) == this.nextPath.y){
                return [
                    'walk',
                    'right'
                ]

            // left
            } else if(this.x.toFixed(2) > (this.nextPath.x + this.state.CONSTANTS.WALKING_SPEED) &&  this.y.toFixed(2) == this.nextPath.y){
                return [
                    'walk',
                    'left'
                ]
            
            // up
            } else if(this.x.toFixed(2) == this.nextPath.x && this.y.toFixed(2) > (this.nextPath.y + this.state.CONSTANTS.WALKING_SPEED)){
                return [
                    'walk',
                    'up'
                ]

            // down
            } else if(this.x.toFixed(2) == this.nextPath.x && this.y.toFixed(2) < (this.nextPath.y - this.state.CONSTANTS.WALKING_SPEED)){
                return [
                    'walk',
                    'down'
                ];
            } else {
                this.path.shift();
                this.state.soldiers[key].path = this.path;
                return [
                    this.animation, 
                    this.direction
                ] 
            }           
            

        } 

        return [
            'idle',
            'down'
        ];
        
    }

}