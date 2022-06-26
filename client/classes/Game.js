
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
            },
            'doorsDrawing': function(){ 
                that.doorsDrawing(); // players will draw their doors
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

        // Set current player territory
        this.player.setTerritory(this.state);

    }

    loop(state)
    {       
        var that = this;  

        // Updates state
        this.updateState(state);

        // Binds click on canvas
        this.canvas.onmousedown = function(e){
            const rect = that.canvas.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top
            that.player.mouseClicked = {
                x: x,
                y: y
            }
        }
        canvas.onmouseup = function(e){
            that.player.mouseClicked = false
        }

        // Binds keypress
        window.addEventListener("keydown", function(){
            that.player.keydown = true
        }, false);
        window.addEventListener("keyup", function(){
            that.player.keydown = false
        }, false);

        // Game loop animation
        function animate(){
            // Animate
            window.requestAnimationFrame(animate)
            // Clear screen
            that.clear()
            // Always update mouse position
            that.updateMousePosition()
            // Draws grey rectangle on back of canvas
            that.drawBackground();            
            // Draws tiles
            that.drawFloor();
            // Draws zones
            that.drawZones();
            // Draws walls
            that.drawWalls();
            // Draws doors
            that.drawDoors();
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

    drawWalls()
    {
        for(const params of this.state.walls){
            var wall = new Wall(this.sprites, this.state, this.ctx, params.x, params.y, params.size, params.sprite);
            wall.draw();       
        }
    }

    drawDoors()
    {
        for(const params of this.state.doors){
            var door = new Door(this.sprites, this.state, this.ctx, params.x, params.y, params.size, params.owner, params.sprite);
            door.draw();       
        }
    }

    drawZones()
    {
        for(const params of this.state.zones){
            var zone = new Zone(this.sprites, this.state, this.ctx, params.x, params.y, params.size, params.owner);
            zone.draw();
        }
    }

    updateState(state)
    {
        this.state = state;
        this.state.players[this.player.number] = {
            number: this.player.number, 
            pseudo: this.player.pseudo,
            resources: {
                zones: this.player.resources.zones,
                doors: this.player.resources.doors
            }
        }
    }

    doorsDrawing()
    {   
        // Init walls if they are not inited
        if(!this.state.walls.length){
            this.initWalls();
            this.updateState(this.state);
            this.io.emit("stateUpdated", this.room.id, this.state);
        }

        // Draw hover effect only if mouseposition is over a wall
        var [tileX, tileY] = this.getHoveredTile();
        if(this.state.tiles[tileX] !== undefined && this.state.tiles[tileX][tileY] !== undefined){

            const hoveredTile = this.state.tiles[tileX][tileY];
            if(this.player.isHoveringOneOfHisWalls(hoveredTile)){

                var sprite = 'door_' + hoveredTile.sprite.split('_')[1];
                var door = new Door(this.sprites, this.state, this.ctx, tileX, tileY, this.state.CONSTANTS.TILE_SIZE, this.player.number, sprite);
                if(this.player.resources.doors > 0){
                    // Draw door on hover
                    door.draw();
                }

                // If player clicks
                if(this.player.mouseClicked !== false){

                    // Only 1 click;
                    this.player.mouseClicked = false;

                    var existingDoor = false;
                    for(var door of this.state.doors){
                        if(door.x == tileX && door.y == tileY && door.owner == this.player.number){
                            existingDoor = door;
                            break;
                        }
                    }

                    // if it's a zone already
                    if(existingDoor){

                        // remove zone from state
                        const index = this.state.doors.findIndex(door => {
                            return door.x == existingDoor.x && door.y == existingDoor.y && door.owner == existingDoor.owner;
                        });
                        this.state.doors.splice(index, 1);

                        this.state.tiles[tileX][tileY].type = 'wall';

                        // push zone to state
                        this.state.walls.push(this.state.tiles[tileX][tileY]);

                        // increments player resources
                        this.player.resources.doors++;

                    // else push zone
                    } else if(this.player.resources.doors > 0) {

                        // remove door from walls
                        const index = this.state.walls.findIndex(wall => {
                            return wall.x == tileX && wall.y == tileY && wall.owner == this.player.number;
                        });
                        this.state.walls.splice(index, 1);

                        // push zone to state
                        this.state.doors.push({
                            x: tileX,
                            y: tileY,
                            size: this.state.CONSTANTS.TILE_SIZE,
                            owner: this.player.number, 
                            sprite: sprite
                        });

                        this.state.tiles[tileX][tileY].type = 'door';

                        // decrements player resources
                        this.player.resources.doors--;
                    }

                    // Tells server to update state for everybody
                    this.updateState(this.state);
                    this.io.emit("stateUpdated", this.room.id, this.state);

                }

            }

        }
        

    }

    initWalls()
    {
        for(const params of this.state.zones){
            const zone = new Zone(this.sprites, this.state, this.ctx, params.x, params.y, params.size, params.owner);
            zone.setWalls();
        }
    }

    zoneDrawing()
    {
        this.drawTerritory();

        // Draw hover effect only if mouseposition is in territory
        if(this.player.isHoveringHisTerritory()){

            const [tileX, tileY] = this.getHoveredTile();

            if(this.player.resources.zones > 0){
                // Draw zone as hover
                this.ctx.drawImage(
                    this.sprites['zone'], 
                    tileX * this.state.CONSTANTS.TILE_SIZE + this.state.canvas.xOffset,
                    tileY * this.state.CONSTANTS.TILE_SIZE + this.state.canvas.yOffset
                )
            }

            // If player clicks
            if(this.player.mouseClicked !== false){

                // Only 1 click;
                this.player.mouseClicked = false;

                var existingZone = false;
                for(var zone of this.state.zones){
                    if(zone.x == tileX && zone.y == tileY && zone.owner == this.player.number){
                        existingZone = zone;
                        break;
                    }
                }

                // if it's a zone already
                if(existingZone){

                    // remove zone from state
                    const index = this.state.zones.findIndex(zone => {
                        return zone.x == existingZone.x && zone.y == existingZone.y && zone.owner == existingZone.owner;
                    });
                    this.state.zones.splice(index, 1);

                    this.state.tiles[tileX][tileY].type = 'floor';

                    // increments player resources
                    this.player.resources.zones++;

                // else push zone
                } else if(this.player.resources.zones > 0) {

                    // push zone to state
                    this.state.zones.push({
                        x: tileX,
                        y: tileY,
                        size: this.state.CONSTANTS.TILE_SIZE,
                        owner: this.player.number       
                    });

                    this.state.tiles[tileX][tileY].type = 'zone';

                    // decrements player resources
                    this.player.resources.zones--;
                }

                // Tells server to update state for everybody
                this.updateState(this.state);
                this.io.emit("stateUpdated", this.room.id, this.state);

            }
        }
    }

    getHoveredTile()
    {
        var hoverPixelX = this.player.mousePosition.x - this.state.canvas.xOffset;
        var hoverPixelY = this.player.mousePosition.y - this.state.canvas.yOffset;
        var hoverTileX = ~~(hoverPixelX/this.state.CONSTANTS.TILE_SIZE);
        var hoverTileY = ~~(hoverPixelY/this.state.CONSTANTS.TILE_SIZE);
        return [hoverTileX, hoverTileY]; 
    }

    drawTerritory()
    {
        this.ctx.globalAlpha = 1;
        this.ctx.beginPath();
        this.ctx.lineWidth = "1";
        this.ctx.strokeStyle = 'red';
        this.ctx.rect(
            this.player.territory.x, // x
            this.player.territory.y, // y
            this.player.territory.width, // width
            this.player.territory.height // height
        ); 
        this.ctx.stroke();
    }

    // Update mouse coordinates
    updateMousePosition()
    {   
        var x = 0;
        var y = 0;

        // Get mouse position
        var that = this;
        this.canvas.onmousemove = function(e) {

            // Correct mouse position
            var rect = this.getBoundingClientRect();
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;

            // Update state
            that.player.mousePosition.x = x;
            that.player.mousePosition.y = y;
        
        };
    }

 
    

}