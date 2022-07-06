const CONSTANTS = {
    DEBUG: false,
    ROOM_ID_LENGTH: 8, 
    CANVAS_WIDTH: 1024, 
    CANVAS_HEIGHT: 768,
    CANVAS_DEFAULT_BG_COLOR: 'darkgray',
    CANVAS_DEFAULT_BORDER_COLOR: 'red',
    MAP_TILES_X: 16, // Number of tiles horizontally 32 MAX
    MAP_TILES_Y: 12, // Number of tiles vertically 24 MAX
    TILE_SIZE: 32, // Number of pixels 
    TILE_BORDER_COLOR: 'red',
    PLAYERS_COUNT: 2,
    RESOURCES_PER_PLAYER: {
        zones: 10,
        doors: 5,
        kings: 1,
        soldiers: 5
    },
    WALL_HEALTH: 3,
    DOOR_HEALTH: 2,
    KING_HEALTH: 30,
    SOLDIER_HEALTH: 5,
    SOLDIER_ENERGY: 5,
    HOVER_BORDER_COLOR: 'purple',
    POSSIBLE_MOVES_COLOR: 'purple',
    PATH_COLOR: 'red',
    WALKING_SPEED: 0.0005,
    FRAME_RATE: 0.005,
    FIGHT_FRAME_RATE: 0.0035,
    FIGHT_COMBO_LENGTH: 10,
    FIGHT_BAR_WIDTH: 400,
    FONT: "Arial"
}

module.exports = {
    CONSTANTS,
}

