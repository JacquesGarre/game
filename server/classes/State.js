const { CONSTANTS } = require("../constants")
const { SPRITES } = require("../sprites")

class State {

    constructor()
    {
        this.canvas = {
            width: CONSTANTS.CANVAS_WIDTH, // pixels
            height: CONSTANTS.CANVAS_HEIGHT, // pixels
            backgroundColor: CONSTANTS.CANVAS_DEFAULT_BG_COLOR,
            borderColor: CONSTANTS.CANVAS_DEFAULT_BORDER_COLOR,
            xOffset: 300,
            yOffset: 300
        }
        this.map = {
            tilesX: CONSTANTS.MAP_TILES_X,
            tilesY: CONSTANTS.MAP_TILES_Y,
            tilePixelsSize: CONSTANTS.TILE_SIZE
        }
        this.tiles = this.initTiles();
        this.CONSTANTS = CONSTANTS;
        this.SPRITES = SPRITES;
        this.playersLoaded = [];
        this.currentStep = 'zoneDrawing';
        this.players = {};
        this.zones = [];
    }   
    
    initTiles()
    {
        var tiles = [];
        for(var x = 0; x <= this.map.tilesX - 1; x++){
            tiles[x] = [];
            for(var y = 0; y <= this.map.tilesY - 1; y++){
                tiles[x][y] = {
                    x: x,
                    y: y,
                    size: this.map.tilePixelsSize             
                };
            }
        }
        return tiles;
    }

}

module.exports = {
    State: State,
}

