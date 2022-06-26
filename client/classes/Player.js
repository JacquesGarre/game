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
            doors: CONSTANTS.RESOURCES_PER_PLAYER.doors
        }
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


}