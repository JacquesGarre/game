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
        zones: 5,
        doors: 3,
        kings: 1,
        soldiers: 3
    },
    WALL_HEALTH: 3,
    DOOR_HEALTH: 2,
    KING_HEALTH: 30,
    SOLDIER_HEALTH: 10,
    SOLDIER_ENERGY: 5,
    HOVER_BORDER_COLOR: 'purple',
    POSSIBLE_MOVES_COLOR: 'purple',
    PATH_COLOR: 'red',
    WALKING_SPEED: 0.0001,
    FRAME_RATE: 0.0025,
    FIGHT_COMBO_LENGTH: 10
}

module.exports = {
    CONSTANTS,
}

