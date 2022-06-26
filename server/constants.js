const CONSTANTS = {
    DEBUG: false,
    ROOM_ID_LENGTH: 8, 
    CANVAS_WIDTH: 1024, 
    CANVAS_HEIGHT: 768,
    CANVAS_DEFAULT_BG_COLOR: 'darkgray',
    CANVAS_DEFAULT_BORDER_COLOR: 'red',
    MAP_TILES_X: 12, // Number of tiles horizontally
    MAP_TILES_Y: 8, // Number of tiles vertically
    TILE_SIZE: 32, // Number of pixels 
    TILE_BORDER_COLOR: 'red',
    PLAYERS_COUNT: 2,
    RESOURCES_PER_PLAYER: {
        zones: 4,
        doors: 2
    }
}

module.exports = {
    CONSTANTS,
}

