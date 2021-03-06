
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
            'kingsDrawing': function(){ 
                that.kingsDrawing(); // players will draw their kings
            },
            'soldiersDrawing': function(){ 
                that.soldiersDrawing(); // players will draw their soldiers
            },
            'doorsDrawing': function(){ 
                that.doorsDrawing(); // players will draw their doors
            },
            'soldiersMoves': function(){ 
                that.soldiersMoves(); // players will draw their soldiers paths
            },
            'soldiersAnimation': function(){
                that.soldiersAnimation(); // soldiers will be animated
            },
            'fight': function(){
                that.fight(); // a fight is happening
            },
            'fightAnimation': function(){
                that.fightAnimation(); // fight combos are done
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
        window.addEventListener("keydown", function(e){
            that.player.keydown = e.code
        }, false);
        window.addEventListener("keyup", function(){
            that.player.keydown = false
        }, false);

        // Game loop animation
        var loop = setInterval(function(){
            // Clear screen
            that.clear()
            // Always update mouse position
            that.updateMousePosition()
            // Draws grey rectangle on back of canvas
            if(!['fightAnimation', 'fight'].includes(that.state.currentStep)){
                that.drawBackground();            
                // Draws tiles
                that.drawFloor();
                // Draws zones
                that.drawZones();
                // Draws walls
                that.drawWalls();
                // Draws doors
                that.drawDoors();
                // Draws kings
                that.drawKings();
                // Draws soldiers
                that.drawSoldiers();
                // Draw possible moves if a soldier is selected
                that.drawPossibleMoves();
            }

            // Play current step
            that.steps[that.state.currentStep]()
            // Reset global alpha
            that.ctx.globalAlpha = 1; 
        }, 1000 / this.state.CONSTANTS.FPS)
    }

    clear() {
        this.ctx.clearRect(            
            0, 
            0,
            this.canvas.width,
            this.canvas.height
        );
    }

    drawBackground()
    {
        this.ctx.fillStyle = this.state.CONSTANTS.CANVAS_DEFAULT_BG_COLOR;
        this.ctx.strokeStyle = this.state.CONSTANTS.CANVAS_DEFAULT_BORDER_COLOR;    
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

    drawKings()
    {
        for(const params of this.state.kings){
            var king = new King(this.sprites, this.state, this.ctx, params.x, params.y, params.size, params.owner);
            king.draw();
        }
    }

    drawSoldiers()
    {
        for(const params of this.state.soldiers){
            if(params == null){
                continue;
            }
            var soldier = new Soldier(this.sprites, this.state, this.ctx, params.x, params.y, params.size, params.owner, params.health, params.energy, this.player.number);
            soldier.draw();
            if(this.state.currentStep == 'soldiersMoves' && soldier.owner == this.player.number){
                soldier.drawPath();
            }
        }
    }


    updateState(state)
    {
        this.state = state;
        this.state.players[this.player.number] = {
            number: this.player.number, 
            pseudo: this.player.pseudo,
            resources: this.player.resources,
            finishedMoves: this.player.finishedMoves
        }
    }

    fight()
    {   

        var fight = new Fight(this.ctx, this.state, this.sprites, this.player, this.io, this.room.id)
        fight.start();
        fight.recordCombo();
    }

    fightAnimation()
    {   

        if(this.state.soldiers[this.state.fight.who[0]] == undefined || this.state.soldiers[this.state.fight.who[0]].health == 0){
            this.io.emit("stateUpdated", this.room.id, this.state);
            return;
        } 
        if(this.state.soldiers[this.state.fight.who[1]] == undefined || this.state.soldiers[this.state.fight.who[1]].health == 0){
            this.io.emit("stateUpdated", this.room.id, this.state);
            return;
        } 
        
        if(this.state.fight.combos[0].length == 0 && this.state.fight.combos[1].length == 0){
            this.io.emit("stateUpdated", this.room.id, this.state);
            return;
        }

        var fight = new Fight(this.ctx, this.state, this.sprites, this.player, this.io, this.room.id)
        fight.animate();
        

    }

    soldiersAnimation()
    {
        for(const key in this.state.soldiers){
            const params = this.state.soldiers[key]
            this.state.soldiers[key].selected = false;
            var soldier = new Soldier(this.sprites, this.state, this.ctx, params.x, params.y, params.size, params.owner, params.health, params.energy, this.player.number);
            if(soldier.path.length){
                soldier.walkPath(key) 
            }
            // Is there another character on same tile?
            for(const k in this.state.soldiers){
                if(k == key || this.state.soldiers[k].owner == soldier.owner){
                    continue;
                }
                var otherSoldier = this.state.soldiers[k]
                if(Math.floor(otherSoldier.x) == Math.floor(soldier.x) && Math.floor(otherSoldier.y) == Math.floor(soldier.y)){
                    alert(k + ' WILL FIGHT ' + key);
                    this.state.currentStep = 'fight';
                    this.state.fight = {
                        type: 'soldier_vs_soldier',
                        who: [k, key],
                        combos: {
                            0: [],
                            1: []
                        }
                    }
                    this.updateState(this.state);
                    this.io.emit("stateUpdated", this.room.id, this.state);
                }

            }
        }
    }

    soldiersMoves()
    {   
        if(this.state.players[this.player.number].finishedMoves){
            return;
        }

        // If players presse a key, he finished his turn
        if(this.player.keydown){
            this.player.keydown = false;
            this.player.finishedMoves = true;
            this.updateState(this.state);
            this.io.emit("stateUpdated", this.room.id, this.state);
            return;
        }

        var [tileX, tileY] = this.getHoveredTile();

        if(this.state.tiles[tileX] !== undefined && this.state.tiles[tileX][tileY] !== undefined){
            const hoveredTile = this.state.tiles[tileX][tileY];

            if(this.player.isHoveringOneOfHisSoldiers(hoveredTile, this.state)){

                var params = this.player.getSoldier(hoveredTile, this.state);

                // Display hover effect over soldier
                var soldier = new Soldier(this.sprites, this.state, this.ctx, tileX, tileY, this.state.CONSTANTS.TILE_SIZE, this.player.number, params.health, params.energy, this.player.number);
                soldier.drawHoverEffect();

                // If player clicks on hovered soldier, draw the character as selected
                if(this.player.mouseClicked !== false){

                    // reset click
                    this.player.mouseClicked = false;

                    // Select or unselect player
                    const index = this.state.soldiers.findIndex(char => {
                        return char.x == soldier.x && char.y == soldier.y && char.owner == soldier.owner;
                    });
                    this.state.soldiers[index].selected = this.state.soldiers[index].selected !== undefined ? !this.state.soldiers[index].selected : true;

                    // unselect all other characters
                    for(const id of Object.keys(this.state.soldiers)){
                        if(this.state.soldiers[id].owner == this.player.number && id != index){
                            this.state.soldiers[id].selected = false;
                        }
                    }

                    this.updateState(this.state);
                    this.io.emit("stateUpdated", this.room.id, this.state);

                }

            // Unselecting last path
            } else if(this.player.mouseClicked !== false){
                this.player.mouseClicked = false;
                const playerSoldiers = this.state.soldiers.filter(soldier => {
                    return soldier.owner == this.player.number;
                });
                for(soldier of playerSoldiers){
                    if(soldier.path.length){
                        var lastPath = soldier.path[soldier.path.length - 1];
                        if(lastPath.x == tileX && lastPath.y == tileY){
                            soldier.path.pop();
                            soldier.energy++;
                        }
                    }
                }
                this.updateState(this.state);
                this.io.emit("stateUpdated", this.room.id, this.state);

            }

            

        }



    }

    drawPossibleMoves()
    {
        let playerPaths = this.player.getPaths(this.state);
        for(const index in this.state.soldiers){
            var params = this.state.soldiers[index];
            var soldier = new Soldier(this.sprites, this.state, this.ctx, params.x, params.y, params.size, params.owner, params.health, params.energy, this.player.number);
            if(soldier.owner == this.player.number && soldier.selected && soldier.energy > 0){
                
                let tilesAround = soldier.getMovesAround()

                for (var tileKey of Object.keys(tilesAround)) {
                    var tile = tilesAround[tileKey];
                    if(soldier.x == tile.x && soldier.y == tile.y){
                        continue;
                    }
                    let tileObj = new Tile(tile.x, tile.y, this.state, this.ctx, tile.size, this.player)
                    if(
                        ['top','right', 'bottom', 'left'].includes(tileKey) 
                        && tile 
                        && (tile.type == 'zone' || tile.type == 'door' || tile.type == 'floor')
                        && !this.state.soldiers[index].path.includes(tile)
                        && !playerPaths.includes(tile)
                    ){
                        tileObj.drawAsPossibleMove();                        
                        if(tileObj.isClicked()){
                            this.player.mouseClicked = false;
                            this.state.soldiers[index].energy--;
                            this.state.soldiers[index].path.push(tile);
                            this.updateState(this.state);
                            this.io.emit("stateUpdated", this.room.id, this.state);
                        }

                    }
                }
            }

        }


    }


    doorsDrawing()
    {   

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
                            sprite: sprite,
                            health: this.state.CONSTANTS.DOOR_HEALTH
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

    soldiersDrawing()
    {       

        // Draw hover effect only if mouseposition is over a wall
        var [tileX, tileY] = this.getHoveredTile();
        if(this.state.tiles[tileX] !== undefined && this.state.tiles[tileX][tileY] !== undefined){

            const hoveredTile = this.state.tiles[tileX][tileY];

            var existingKing = false;
            for(var king of this.state.kings){
                if(king.x == tileX && king.y == tileY && king.owner == this.player.number){
                    existingKing = king;
                    break;
                }
            }

            if(this.player.isHoveringOneOfHisZones(hoveredTile) && !existingKing){

                var soldier = new Soldier(this.sprites, this.state, this.ctx, tileX, tileY, this.state.CONSTANTS.TILE_SIZE, this.player.number, this.state.CONSTANTS.SOLDIER_HEALTH, this.state.CONSTANTS.SOLDIER_ENERGY, this.player.number);
                if(this.player.resources.soldiers > 0){
                    // Draw door on hover
                    soldier.draw();
                }

                // If player clicks
                if(this.player.mouseClicked !== false){

                    // Only 1 click;
                    this.player.mouseClicked = false;

                    var existingSoldier = false;
                    for(var soldier of this.state.soldiers){
                        if(soldier.x == tileX && soldier.y == tileY && soldier.owner == this.player.number){
                            existingSoldier = soldier;
                            break;
                        }
                    }

                    // if it's a zone already
                    if(existingSoldier){

                        // remove zone from state
                        const index = this.state.soldiers.findIndex(soldier => {
                            return soldier.x == existingSoldier.x && soldier.y == existingSoldier.y && soldier.owner == existingSoldier.owner;
                        });
                        this.state.soldiers.splice(index, 1);

                        // increments player resources
                        this.player.resources.soldiers++;

                    // else push zone
                    } else if(this.player.resources.soldiers > 0) {

                        // push zone to state
                        this.state.soldiers.push({
                            x: tileX,
                            y: tileY,
                            size: this.state.CONSTANTS.TILE_SIZE,
                            owner: this.player.number,
                            health: this.state.CONSTANTS.SOLDIER_HEALTH,
                            energy: this.state.CONSTANTS.SOLDIER_ENERGY,
                            selected: false,
                            path: [],
                            combo: []
                        });

                        // decrements player resources
                        this.player.resources.soldiers--;
                    }

                    // Tells server to update state for everybody
                    this.updateState(this.state);
                    this.io.emit("stateUpdated", this.room.id, this.state);

                }

            }

        }
        

    }

    kingsDrawing()
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
            if(this.player.isHoveringOneOfHisZones(hoveredTile)){

                var king = new King(this.sprites, this.state, this.ctx, tileX, tileY, this.state.CONSTANTS.TILE_SIZE, this.player.number);
                if(this.player.resources.kings > 0){
                    // Draw door on hover
                    king.draw();
                }

                // If player clicks
                if(this.player.mouseClicked !== false){

                    // Only 1 click;
                    this.player.mouseClicked = false;

                    var existingKing = false;
                    for(var king of this.state.kings){
                        if(king.x == tileX && king.y == tileY && king.owner == this.player.number){
                            existingKing = king;
                            break;
                        }
                    }

                    // if it's a zone already
                    if(existingKing){

                        // remove zone from state
                        const index = this.state.kings.findIndex(king => {
                            return king.x == existingKing.x && king.y == existingKing.y && king.owner == existingKing.owner;
                        });
                        this.state.kings.splice(index, 1);

                        // increments player resources
                        this.player.resources.kings++;

                    // else push zone
                    } else if(this.player.resources.kings > 0) {

                        // push zone to state
                        this.state.kings.push({
                            x: tileX,
                            y: tileY,
                            size: this.state.CONSTANTS.TILE_SIZE,
                            owner: this.player.number,
                            health: this.state.CONSTANTS.KING_HEALTH
                        });

                        // decrements player resources
                        this.player.resources.kings--;
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
                    this.state.tiles[tileX][tileY].owner = this.player.number;

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