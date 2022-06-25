class Game {

    constructor(room, io, player, state)
    {
        this.state = state;
        this.canvas = document.getElementById('canvas');
        this.canvas.width = state.canvas.width;
        this.canvas.height = state.canvas.height;
        this.ctx = canvas.getContext('2d');
        this.sprites = {};
        this.player = player;
        this.io = io;
        this.room = room;
        var that = this;
        this.steps = {
            'zoneDrawing': function(){ 
                that.zoneDrawing(); // players will draw their zone
            }
        }
    }

    // Preloads images
    load()
    {
        // load tiles images    
        var loaded = 0;
        for (var position in this.state.SPRITES) {
            if (this.state.SPRITES.hasOwnProperty(position)) {
                const image = new Image();
                image.src = this.state.SPRITES[position];
                image.onload = ()=>{ 
                    loaded += 1;
                    if(loaded === Object.keys(this.state.SPRITES).length){ // all loaded ?
                        this.io.emit("gameLoaded", this.room.id, this.player.number);
                    }
                }
                this.sprites[position] = image;
            }
        }
    }

    loop(state)
    {       
        console.log(this.player)

        // Updates state
        this.updateState(state);



        // Game loop animation
        var that = this;
        function animate(){
            // Animate
            window.requestAnimationFrame(animate)
            // Clear screen
            that.clear()
            // Always update mouse position
            //game.updateMousePosition()
            // Update current player
            //state.currentPlayer = state.players[state.currentPlayerID];

            // Draws gray rectangle on back of canvas
            that.drawBackground();
            
            // Draws tiles
            that.drawFloor();

            // Play current step
            that.steps[that.state.currentStep]()

            // Reset global alpha
            that.ctx.globalAlpha = 1; 
        }
        animate();

        
        
    }

    clear() {
        this.ctx.clearRect(            
            this.state.canvas.xOffset, 
            this.state.canvas.yOffset,
            this.state.tiles.length * this.state.CONSTANTS.TILE_SIZE,
            this.state.tiles[0].length * this.state.CONSTANTS.TILE_SIZE
        );
    }

    drawBackground()
    {
        this.ctx.fillStyle = this.state.canvas.backgroundColor;
        this.ctx.strokeStyle = this.state.canvas.borderColor;    
        this.ctx.fillRect(
            this.state.canvas.xOffset, 
            this.state.canvas.yOffset,
            this.state.tiles.length * this.state.CONSTANTS.TILE_SIZE,
            this.state.tiles[0].length * this.state.CONSTANTS.TILE_SIZE
        );
    }

    drawFloor()
    {
        for(var x = 0; x <= this.state.tiles.length - 1; x++){
            for(var y = 0; y <= this.state.tiles[x].length - 1; y++){
                var params = this.state.tiles[x][y];
                var floor = new Floor(this.sprites, this.state, this.ctx, params.x, params.y, params.size);
                floor.draw();
            }
        }
    }

    updateState(state)
    {
        this.state = state;
    }

    zoneDrawing()
    {
        // drawing zone
        console.log(this.player.pseudo + ' has to draw his zone');

        // Draw current player territory
        this.player.setTerritory(this.state);
        this.drawTerritory();

    }

    drawTerritory()
    {
        this.ctx.globalAlpha = 0.5;
        this.ctx.beginPath();
        this.ctx.lineWidth = "4";
        this.ctx.strokeStyle = 'red';
        this.ctx.rect(
            this.player.territory.x * this.state.CONSTANTS.TILE_SIZE + 1 + this.state.canvas.xOffset, // x
            this.player.territory.y + 1 + this.state.canvas.yOffset, // y
            this.player.territory.width * this.state.CONSTANTS.TILE_SIZE - 2, // width
            this.player.territory.height * this.state.CONSTANTS.TILE_SIZE - 2 // height
        ); 
        this.ctx.stroke();
    }

 
    

}