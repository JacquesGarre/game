class Player {

    constructor(io, args, CONSTANTS)
    {   
        this.io = io;
        this.number = args.number;
        this.pseudo = args.pseudo;
        this.mousePosition = {
            x: false,
            y: false
        }
        this.mouseClicked = false
        this.resources = {
            zones: CONSTANTS.RESOURCES_PER_PLAYER.zones,
            doors: CONSTANTS.RESOURCES_PER_PLAYER.doors,
            kings: CONSTANTS.RESOURCES_PER_PLAYER.kings,
            soldiers: CONSTANTS.RESOURCES_PER_PLAYER.soldiers
        }
        this.finishedMoves = false
        this.keydown = false
    }

    setTerritory(state)
    {
        this.territory = {
            x: this.number % 2 * (state.CONSTANTS.MAP_TILES_X / 2) * state.CONSTANTS.TILE_SIZE + state.canvas.xOffset + this.number*state.CONSTANTS.TILE_SIZE,
            y: 0 * (state.CONSTANTS.MAP_TILES_Y / 2) * state.CONSTANTS.TILE_SIZE + state.canvas.yOffset, // To change for 4 players
            width: state.CONSTANTS.MAP_TILES_X / 2 * state.CONSTANTS.TILE_SIZE - state.CONSTANTS.TILE_SIZE,
            height: state.CONSTANTS.MAP_TILES_Y * state.CONSTANTS.TILE_SIZE  // To change for 4 players
        }
    }

    isHoveringHisTerritory()
    {
        return this.mousePosition.x > this.territory.x && this.mousePosition.x < (this.territory.x+this.territory.width)
            && this.mousePosition.y > this.territory.y && this.mousePosition.y < (this.territory.y+this.territory.height);
    }

    isHoveringOneOfHisWalls(hoveredTile)
    {   
        var wallsAllowedToDrawDoor = ['wall_top', 'wall_right', 'wall_left', 'wall_bottom'];
        return hoveredTile.type == 'wall' && hoveredTile.owner == this.number && wallsAllowedToDrawDoor.includes(hoveredTile.sprite);
    }

    isHoveringOneOfHisZones(hoveredTile)
    {
        return hoveredTile.owner == this.number && hoveredTile.type == 'zone';
    }

    isHoveringMovableTile(hoveredTile)
    {
        return (hoveredTile.type == 'zone' || hoveredTile.type == 'door' || hoveredTile.type == 'floor') // Can move on everything but a wall
    }

    isHoveringOneOfHisSoldiers(hoveredTile, state)
    {
        for(var soldier of state.soldiers){
            if(soldier.x == hoveredTile.x && soldier.y == hoveredTile.y && soldier.owner == this.number){
                return true;
            }
        }
        return false;
    }

    getSoldier(hoveredTile, state)
    {
        for(var soldier of state.soldiers){
            if(soldier.x == hoveredTile.x && soldier.y == hoveredTile.y && soldier.owner == this.number){
                return soldier;
            }
        }
        return false;
    }

    getPaths(state)
    {
        let paths = [];
        for(var soldier of state.soldiers){
            if(soldier.owner == this.number && soldier.path.length > 0){
                for(const tile of soldier.path){
                    paths.push(tile);
                }
            }
        }
        return paths;
    }

}