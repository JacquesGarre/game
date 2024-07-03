// Start server
const { Server } = require("socket.io");
const { generateID } = require('./utils');
const { CONSTANTS } = require('./constants');
const { State } = require('./classes/State.js');
const server = new Server({ 
    cors: {
        origin: "http://localhost:8080"
    }
});

// Game vars
const clientRooms = {};
const state = {};

const debugging = false;

// On connection
server.on("connection", (client) => {

    // Sends online players count to client
    server.emit("onlinePlayersCount", server.engine.clientsCount);

    // On disconnect, sends online players count to client
    client.on("disconnect", (client) => {
        server.emit("onlinePlayersCount", server.engine.clientsCount);
    });

    // On new game
    client.on("newGame", (pseudo) => {
        // Generate a new id for the room
        let roomID = generateID(CONSTANTS.ROOM_ID_LENGTH);
        clientRooms[client.id] = roomID;
        client.emit('newRoom', {
            roomID: roomID,
            pseudo: pseudo
        });

        // Inits game state of the room
        state[roomID] = new State();

        // Make the client joining the room
        client.join(roomID);

        var playerID = 0

        // Sets first player
        client.number = playerID;
        client.pseudo = pseudo;
        client.emit('initPlayer', {
            number: playerID,
            pseudo: pseudo
        }, CONSTANTS);

        if(!debugging){
            state[roomID].players[playerID] = {
                number: playerID,
                pseudo: pseudo,
                resources: {}
            };
        }

        if(debugging){
            state[roomID] = debug();
        }

        // Sends room players count to client
        const clients = server.sockets.adapter.rooms.get(roomID);
        const numClients = clients ? clients.size : 0;
        server.to(roomID).emit("roomPlayersCount", numClients);

    });

    // On join game
    client.on("joinGame", (pseudo, roomID) => {
        clientRooms[client.id] = roomID;
        client.join(roomID);

        var playerID = 1

        client.number = playerID;
        client.emit('initPlayer', {
            number: playerID,
            pseudo: pseudo
        }, CONSTANTS);

        // Sends room players count to client
        const clients = server.sockets.adapter.rooms.get(roomID);
        const numClients = clients ? clients.size : 0;
        server.to(roomID).emit("roomPlayersCount", numClients);

        if(!debugging){
            state[roomID].players[playerID] = {
                number: playerID,
                pseudo: pseudo,
                resources: {}
            };
        }

        // Load game with initialized state
        server.to(roomID).emit("loadGame", state[roomID]);
        
    });

    // On game loaded
    client.on("gameLoaded", (roomID, playerNumber) => {
        state[roomID].playersLoaded.push(playerNumber);
        if(state[roomID].playersLoaded.length == CONSTANTS.PLAYERS_COUNT){
            server.to(roomID).emit("updateState", state[roomID]);
        }
    })

    // On state updated
    client.on("stateUpdated", (roomID, newState) => {
        newState = checkForNextGameStep(newState);
        state[roomID] = newState;
        server.to(roomID).emit("updateState", state[roomID]);
    })
    
});

function checkForNextGameStep(newState)
{   

    // Combos are animated
    if(newState.currentStep == 'fightAnimation'){

        if(newState.fight == {}){
            newState.currentStep = 'soldiersAnimation';
            return newState;
        }

        // Check if one of the fighters is dead, if so delete him and go back to animation stage
        // Else keep fighting
        for(const id of Object.keys(newState.fight.who)){
            if(newState.soldiers[id].health == 0 || newState.soldiers[id] == undefined){
                delete newState.soldiers[id];
                newState.fight = {}
                newState.currentStep = 'soldiersAnimation';
                console.log(newState.fight.who[id] + ' DIED! BACK TO ANIMATION!')
                break;
            }
        } 
        newState.currentStep = 'fight';
        return newState;
    }

    // When a fight happens
    if(newState.currentStep == 'fight'){
        newState.currentStep = 'fightAnimation';
        for(const id of Object.keys(newState.fight.combos)){
            if(newState.fight.combos[id].length < newState.CONSTANTS.FIGHT_COMBO_LENGTH){
                newState.currentStep = 'fight';
                break;
            }
        } 
        if(newState.currentStep == 'fightAnimation'){
            newState.fight.animationStep = 0;
        }  
        return newState;
    }

    // test zoneDrawing
    for(const playerID of Object.keys(newState.players)){
        const player = newState.players[playerID];
        if(player.resources.zones == undefined || player.resources.zones > 0){
            newState.currentStep = 'zoneDrawing';
            return newState;
        }
    }   

    // test kingDrawing
    for(const playerID of Object.keys(newState.players)){
        const player = newState.players[playerID];
        if(player.resources.kings == undefined || player.resources.kings > 0){
            newState.currentStep = 'kingsDrawing';
            return newState;
        }
    }

    // test soldiersDrawing
    for(const playerID of Object.keys(newState.players)){
        const player = newState.players[playerID];
        if(player.resources.soldiers == undefined || player.resources.soldiers > 0){
            newState.currentStep = 'soldiersDrawing';
            return newState;
        }
    }

    // test doorsDrawing
    for(const playerID of Object.keys(newState.players)){
        const player = newState.players[playerID];
        if(player.resources.doors == undefined || player.resources.doors > 0){
            newState.currentStep = 'doorsDrawing';
            return newState;
        }
    }

    // test soldiersMoves
    for(const playerID of Object.keys(newState.players)){
        const player = newState.players[playerID];
        if(player.finishedMoves !== true){
            newState.currentStep = 'soldiersMoves';
            return newState;
        }
    }

    // Reset soldiers energy
    for(const soldierID of Object.keys(newState.soldiers)){
        newState.soldiers[soldierID].energy = newState.CONSTANTS.SOLDIER_ENERGY
    }

    newState.currentStep = 'soldiersAnimation';

    return newState;

}

// Listen on port 3000
server.listen(3000);



function debug(){
    return {
        "canvas": {
            "width": 1024,
            "height": 768,
            "backgroundColor": "darkgray",
            "borderColor": "red",
            "xOffset": 300,
            "yOffset": 300
        },
        "map": {
            "tilesX": 12,
            "tilesY": 8,
            "tilePixelsSize": 32
        },
        "tiles": [
            [
                {
                    "x": 0,
                    "y": 0,
                    "size": 32,
                    "type": "zone",
                    "owner": 0
                },
                {
                    "x": 0,
                    "y": 1,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 0,
                    "sprite": "wall_top"
                },
                {
                    "x": 0,
                    "y": 2,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 0,
                    "y": 3,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 0,
                    "y": 4,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 0,
                    "sprite": "wall_topLeft"
                },
                {
                    "x": 0,
                    "y": 5,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 0,
                    "sprite": "wall_left"
                },
                {
                    "x": 0,
                    "y": 6,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 0,
                    "sprite": "wall_bottomLeft"
                },
                {
                    "x": 0,
                    "y": 7,
                    "size": 32,
                    "type": "zone",
                    "owner": 0
                }
            ],
            [
                {
                    "x": 1,
                    "y": 0,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 0,
                    "sprite": "wall_right"
                },
                {
                    "x": 1,
                    "y": 1,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 0,
                    "sprite": "wall_topLeft"
                },
                {
                    "x": 1,
                    "y": 2,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 0,
                    "sprite": "wall_left"
                },
                {
                    "x": 1,
                    "y": 3,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 0,
                    "sprite": "wall_bottomLeft"
                },
                {
                    "x": 1,
                    "y": 4,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 0,
                    "sprite": "wall_bottom"
                },
                {
                    "x": 1,
                    "y": 5,
                    "size": 32,
                    "type": "zone",
                    "owner": 0
                },
                {
                    "x": 1,
                    "y": 6,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 0,
                    "sprite": "wall_topRight"
                },
                {
                    "x": 1,
                    "y": 7,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 0,
                    "sprite": "wall_right"
                }
            ],
            [
                {
                    "x": 2,
                    "y": 0,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 0,
                    "sprite": "wall_left"
                },
                {
                    "x": 2,
                    "y": 1,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 0,
                    "sprite": "wall_bottomLeft"
                },
                {
                    "x": 2,
                    "y": 2,
                    "size": 32,
                    "type": "zone",
                    "owner": 0
                },
                {
                    "x": 2,
                    "y": 3,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 0,
                    "sprite": "wall_top"
                },
                {
                    "x": 2,
                    "y": 4,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 0,
                    "sprite": "wall_topRight"
                },
                {
                    "x": 2,
                    "y": 5,
                    "size": 32,
                    "type": "door",
                    "health": 3,
                    "owner": 0,
                    "sprite": "wall_right"
                },
                {
                    "x": 2,
                    "y": 6,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 0,
                    "sprite": "wall_bottomRight"
                },
                {
                    "x": 2,
                    "y": 7,
                    "size": 32,
                    "type": "floor"
                }
            ],
            [
                {
                    "x": 3,
                    "y": 0,
                    "size": 32,
                    "type": "zone",
                    "owner": 0
                },
                {
                    "x": 3,
                    "y": 1,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 0,
                    "sprite": "wall_topRight"
                },
                {
                    "x": 3,
                    "y": 2,
                    "size": 32,
                    "type": "door",
                    "health": 3,
                    "owner": 0,
                    "sprite": "wall_right"
                },
                {
                    "x": 3,
                    "y": 3,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 0,
                    "sprite": "wall_bottomRight"
                },
                {
                    "x": 3,
                    "y": 4,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 3,
                    "y": 5,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 3,
                    "y": 6,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 3,
                    "y": 7,
                    "size": 32,
                    "type": "floor"
                }
            ],
            [
                {
                    "x": 4,
                    "y": 0,
                    "size": 32,
                    "type": "door",
                    "health": 3,
                    "owner": 0,
                    "sprite": "wall_right"
                },
                {
                    "x": 4,
                    "y": 1,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 0,
                    "sprite": "wall_bottomRight"
                },
                {
                    "x": 4,
                    "y": 2,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 4,
                    "y": 3,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 4,
                    "y": 4,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 4,
                    "y": 5,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 4,
                    "y": 6,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 4,
                    "y": 7,
                    "size": 32,
                    "type": "floor"
                }
            ],
            [
                {
                    "x": 5,
                    "y": 0,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 5,
                    "y": 1,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 5,
                    "y": 2,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 5,
                    "y": 3,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 5,
                    "y": 4,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 5,
                    "y": 5,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 5,
                    "y": 6,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 5,
                    "y": 7,
                    "size": 32,
                    "type": "floor"
                }
            ],
            [
                {
                    "x": 6,
                    "y": 0,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 6,
                    "y": 1,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 6,
                    "y": 2,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 6,
                    "y": 3,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 6,
                    "y": 4,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 6,
                    "y": 5,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 6,
                    "y": 6,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 6,
                    "y": 7,
                    "size": 32,
                    "type": "floor"
                }
            ],
            [
                {
                    "x": 7,
                    "y": 0,
                    "size": 32,
                    "type": "door",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_left"
                },
                {
                    "x": 7,
                    "y": 1,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_bottomLeft"
                },
                {
                    "x": 7,
                    "y": 2,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 7,
                    "y": 3,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 7,
                    "y": 4,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 7,
                    "y": 5,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 7,
                    "y": 6,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 7,
                    "y": 7,
                    "size": 32,
                    "type": "floor"
                }
            ],
            [
                {
                    "x": 8,
                    "y": 0,
                    "size": 32,
                    "type": "zone",
                    "owner": 1
                },
                {
                    "x": 8,
                    "y": 1,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_top"
                },
                {
                    "x": 8,
                    "y": 2,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_topLeft"
                },
                {
                    "x": 8,
                    "y": 3,
                    "size": 32,
                    "type": "door",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_left"
                },
                {
                    "x": 8,
                    "y": 4,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_bottomLeft"
                },
                {
                    "x": 8,
                    "y": 5,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_topLeft"
                },
                {
                    "x": 8,
                    "y": 6,
                    "size": 32,
                    "type": "door",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_left"
                },
                {
                    "x": 8,
                    "y": 7,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_bottomLeft"
                }
            ],
            [
                {
                    "x": 9,
                    "y": 0,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_right"
                },
                {
                    "x": 9,
                    "y": 1,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_bottomRight"
                },
                {
                    "x": 9,
                    "y": 2,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_bottom"
                },
                {
                    "x": 9,
                    "y": 3,
                    "size": 32,
                    "type": "zone",
                    "owner": 1
                },
                {
                    "x": 9,
                    "y": 4,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_top"
                },
                {
                    "x": 9,
                    "y": 5,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_bottom"
                },
                {
                    "x": 9,
                    "y": 6,
                    "size": 32,
                    "type": "zone",
                    "owner": 1
                },
                {
                    "x": 9,
                    "y": 7,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_top"
                }
            ],
            [
                {
                    "x": 10,
                    "y": 0,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_topLeft"
                },
                {
                    "x": 10,
                    "y": 1,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_left"
                },
                {
                    "x": 10,
                    "y": 2,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_topRight"
                },
                {
                    "x": 10,
                    "y": 3,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_right"
                },
                {
                    "x": 10,
                    "y": 4,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_bottomRight"
                },
                {
                    "x": 10,
                    "y": 5,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_topRight"
                },
                {
                    "x": 10,
                    "y": 6,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_topLeft"
                },
                {
                    "x": 10,
                    "y": 7,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_bottomRight"
                }
            ],
            [
                {
                    "x": 11,
                    "y": 0,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_bottom"
                },
                {
                    "x": 11,
                    "y": 1,
                    "size": 32,
                    "type": "zone",
                    "owner": 1
                },
                {
                    "x": 11,
                    "y": 2,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_top"
                },
                {
                    "x": 11,
                    "y": 3,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 11,
                    "y": 4,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 11,
                    "y": 5,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 11,
                    "y": 6,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_bottom"
                },
                {
                    "x": 11,
                    "y": 7,
                    "size": 32,
                    "type": "zone",
                    "owner": 1
                }
            ]
        ],
        "CONSTANTS": {
            "DEBUG": false,
            "ROOM_ID_LENGTH": 8,
            "CANVAS_WIDTH": 1024,
            "CANVAS_HEIGHT": 768,
            "CANVAS_DEFAULT_BG_COLOR": "darkgray",
            "CANVAS_DEFAULT_BORDER_COLOR": "red",
            "MAP_TILES_X": 12,
            "MAP_TILES_Y": 8,
            "TILE_SIZE": 32,
            "TILE_BORDER_COLOR": "red",
            "PLAYERS_COUNT": 2,
            "RESOURCES_PER_PLAYER": {
                "zones": 5,
                "doors": 3,
                "kings": 1,
                "soldiers": 3
            },
            "WALL_HEALTH": 3,
            "DOOR_HEALTH": 2,
            "KING_HEALTH": 30,
            "SOLDIER_HEALTH": 10,
            "SOLDIER_ENERGY": 5,
            "HOVER_BORDER_COLOR": "purple",
            "POSSIBLE_MOVES_COLOR": "purple",
            "PATH_COLOR": "red",
            "WALKING_SPEED": 0.0001,
            "FRAME_RATE": 0.0005,
            "FIGHT_COMBO_LENGTH": 10,
            "FIGHT_BAR_WIDTH": 400,
            "FONT": "Arial"
        },
        "SPRITES": {
            "floor_topLeft": "assets/map/floor/top-left.png",
            "floor_topOdd": "assets/map/floor/top-odd.png",
            "floor_topEven": "assets/map/floor/top-even.png",
            "floor_topRight": "assets/map/floor/top-right.png",
            "floor_rightOdd": "assets/map/floor/right-odd.png",
            "floor_rightEven": "assets/map/floor/right-even.png",
            "floor_bottomRight": "assets/map/floor/bottom-right.png",
            "floor_leftOdd": "assets/map/floor/left-odd.png",
            "floor_leftEven": "assets/map/floor/left-even.png",
            "floor_bottomLeft": "assets/map/floor/bottom-left.png",
            "floor_bottomOdd": "assets/map/floor/bottom-odd.png",
            "floor_bottomEven": "assets/map/floor/bottom-even.png",
            "floor_middleOdd": "assets/map/floor/middle-odd.png",
            "floor_middleEven": "assets/map/floor/middle-even.png",
            "zone": "assets/map/zone/zone.png",
            "wall_topLeft": "assets/map/walls/top-left.png",
            "wall_top": "assets/map/walls/top.png",
            "wall_topRight": "assets/map/walls/top-right.png",
            "wall_right": "assets/map/walls/right.png",
            "wall_bottomRight": "assets/map/walls/bottom-right.png",
            "wall_bottom": "assets/map/walls/bottom.png",
            "wall_bottomLeft": "assets/map/walls/bottom-left.png",
            "wall_left": "assets/map/walls/left.png",
            "wall_topLeftInner": "assets/map/walls/top-left-inner.png",
            "wall_topRightInner": "assets/map/walls/top-right-inner.png",
            "wall_bottomRightInner": "assets/map/walls/bottom-right-inner.png",
            "wall_bottomLeftInner": "assets/map/walls/bottom-left-inner.png",
            "door_top": "assets/map/doors/bottom.png",
            "door_bottom": "assets/map/doors/top.png",
            "door_right": "assets/map/doors/right.png",
            "door_left": "assets/map/doors/left.png",
            "soldier_walk_down_0": "assets/map/characters/soldier/walk_down_0.png",
            "soldier_walk_down_1": "assets/map/characters/soldier/walk_down_1.png",
            "soldier_walk_down_2": "assets/map/characters/soldier/walk_down_2.png",
            "soldier_walk_down_3": "assets/map/characters/soldier/walk_down_3.png",
            "soldier_walk_up_0": "assets/map/characters/soldier/walk_up_0.png",
            "soldier_walk_up_1": "assets/map/characters/soldier/walk_up_1.png",
            "soldier_walk_up_2": "assets/map/characters/soldier/walk_up_2.png",
            "soldier_walk_up_3": "assets/map/characters/soldier/walk_up_3.png",
            "soldier_walk_right_0": "assets/map/characters/soldier/walk_right_0.png",
            "soldier_walk_right_1": "assets/map/characters/soldier/walk_right_1.png",
            "soldier_walk_right_2": "assets/map/characters/soldier/walk_right_2.png",
            "soldier_walk_right_3": "assets/map/characters/soldier/walk_right_3.png",
            "soldier_walk_left_0": "assets/map/characters/soldier/walk_left_0.png",
            "soldier_walk_left_1": "assets/map/characters/soldier/walk_left_1.png",
            "soldier_walk_left_2": "assets/map/characters/soldier/walk_left_2.png",
            "soldier_walk_left_3": "assets/map/characters/soldier/walk_left_3.png",
            "soldier_idle_down_0": "assets/map/characters/soldier/idle_down_0.png",
            "soldier_idle_down_1": "assets/map/characters/soldier/idle_down_1.png",
            "soldier_idle_down_2": "assets/map/characters/soldier/idle_down_2.png",
            "soldier_idle_down_3": "assets/map/characters/soldier/idle_down_3.png",
            "king": "assets/map/characters/king/king.png",
            "soldier_vs_soldier_background": "assets/map/fight/fight_background.png",
            "soldier_left_idle_0": "assets/map/fight/soldier_left/idle_0.png",
            "soldier_left_idle_1": "assets/map/fight/soldier_left/idle_1.png",
            "soldier_left_idle_2": "assets/map/fight/soldier_left/idle_2.png",
            "soldier_left_idle_3": "assets/map/fight/soldier_left/idle_3.png",
            "soldier_left_attack_high_0": "assets/map/fight/soldier_left/attack_0.png",
            "soldier_left_attack_high_1": "assets/map/fight/soldier_left/attack_1.png",
            "soldier_left_attack_high_2": "assets/map/fight/soldier_left/attack_high_2.png",
            "soldier_left_attack_high_3": "assets/map/fight/soldier_left/attack_3.png",
            "soldier_left_attack_low_0": "assets/map/fight/soldier_left/attack_0.png",
            "soldier_left_attack_low_1": "assets/map/fight/soldier_left/attack_1.png",
            "soldier_left_attack_low_2": "assets/map/fight/soldier_left/attack_low_2.png",
            "soldier_left_attack_low_3": "assets/map/fight/soldier_left/attack_3.png",
            "soldier_left_attack_medium_0": "assets/map/fight/soldier_left/attack_0.png",
            "soldier_left_attack_medium_1": "assets/map/fight/soldier_left/attack_1.png",
            "soldier_left_attack_medium_2": "assets/map/fight/soldier_left/attack_medium_2.png",
            "soldier_left_attack_medium_3": "assets/map/fight/soldier_left/attack_3.png",
            "soldier_left_defend_high_0": "assets/map/fight/soldier_left/defend_0.png",
            "soldier_left_defend_high_1": "assets/map/fight/soldier_left/defend_1.png",
            "soldier_left_defend_high_2": "assets/map/fight/soldier_left/defend_high_2.png",
            "soldier_left_defend_high_3": "assets/map/fight/soldier_left/defend_3.png",
            "soldier_left_defend_medium_0": "assets/map/fight/soldier_left/defend_0.png",
            "soldier_left_defend_medium_1": "assets/map/fight/soldier_left/defend_1.png",
            "soldier_left_defend_medium_2": "assets/map/fight/soldier_left/defend_medium_2.png",
            "soldier_left_defend_medium_3": "assets/map/fight/soldier_left/defend_3.png",
            "soldier_left_defend_low_0": "assets/map/fight/soldier_left/defend_0.png",
            "soldier_left_defend_low_1": "assets/map/fight/soldier_left/defend_1.png",
            "soldier_left_defend_low_2": "assets/map/fight/soldier_left/defend_low_2.png",
            "soldier_left_defend_low_3": "assets/map/fight/soldier_left/defend_3.png",
            "soldier_right_idle_0": "assets/map/fight/soldier_right/idle_0.png",
            "soldier_right_idle_1": "assets/map/fight/soldier_right/idle_1.png",
            "soldier_right_idle_2": "assets/map/fight/soldier_right/idle_2.png",
            "soldier_right_idle_3": "assets/map/fight/soldier_right/idle_3.png",
            "soldier_right_attack_high_0": "assets/map/fight/soldier_right/attack_0.png",
            "soldier_right_attack_high_1": "assets/map/fight/soldier_right/attack_1.png",
            "soldier_right_attack_high_2": "assets/map/fight/soldier_right/attack_high_2.png",
            "soldier_right_attack_high_3": "assets/map/fight/soldier_right/attack_3.png",
            "soldier_right_attack_low_0": "assets/map/fight/soldier_right/attack_0.png",
            "soldier_right_attack_low_1": "assets/map/fight/soldier_right/attack_1.png",
            "soldier_right_attack_low_2": "assets/map/fight/soldier_right/attack_low_2.png",
            "soldier_right_attack_low_3": "assets/map/fight/soldier_right/attack_3.png",
            "soldier_right_attack_medium_0": "assets/map/fight/soldier_right/attack_0.png",
            "soldier_right_attack_medium_1": "assets/map/fight/soldier_right/attack_1.png",
            "soldier_right_attack_medium_2": "assets/map/fight/soldier_right/attack_medium_2.png",
            "soldier_right_attack_medium_3": "assets/map/fight/soldier_right/attack_3.png",
            "soldier_right_defend_high_0": "assets/map/fight/soldier_right/defend_0.png",
            "soldier_right_defend_high_1": "assets/map/fight/soldier_right/defend_1.png",
            "soldier_right_defend_high_2": "assets/map/fight/soldier_right/defend_high_2.png",
            "soldier_right_defend_high_3": "assets/map/fight/soldier_right/defend_3.png",
            "soldier_right_defend_medium_0": "assets/map/fight/soldier_right/defend_0.png",
            "soldier_right_defend_medium_1": "assets/map/fight/soldier_right/defend_1.png",
            "soldier_right_defend_medium_2": "assets/map/fight/soldier_right/defend_medium_2.png",
            "soldier_right_defend_medium_3": "assets/map/fight/soldier_right/defend_3.png",
            "soldier_right_defend_low_0": "assets/map/fight/soldier_right/defend_0.png",
            "soldier_right_defend_low_1": "assets/map/fight/soldier_right/defend_1.png",
            "soldier_right_defend_low_2": "assets/map/fight/soldier_right/defend_low_2.png",
            "soldier_right_defend_low_3": "assets/map/fight/soldier_right/defend_3.png",
            "combo_attack":"assets/map/fight/attack.png",
            "combo_defend":"assets/map/fight/defend.png",
        },
        "playersLoaded": [],
        "currentStep": "fight",
        "players": {
            "0": {
                "number": 0,
                "pseudo": "Jacques",
                "resources": {
                    "zones": 0,
                    "doors": 0,
                    "kings": 0,
                    "soldiers": 0
                },
                "finishedMoves": true
            },
            "1": {
                "number": 1,
                "pseudo": "Mika",
                "resources": {
                    "zones": 0,
                    "doors": 0,
                    "kings": 0,
                    "soldiers": 0
                },
                "finishedMoves": true
            }
        },
        "zones": [
            {
                "x": 8,
                "y": 0,
                "size": 32,
                "owner": 1
            },
            {
                "x": 9,
                "y": 3,
                "size": 32,
                "owner": 1
            },
            {
                "x": 11,
                "y": 1,
                "size": 32,
                "owner": 1
            },
            {
                "x": 9,
                "y": 6,
                "size": 32,
                "owner": 1
            },
            {
                "x": 11,
                "y": 7,
                "size": 32,
                "owner": 1
            },
            {
                "x": 0,
                "y": 0,
                "size": 32,
                "owner": 0
            },
            {
                "x": 2,
                "y": 2,
                "size": 32,
                "owner": 0
            },
            {
                "x": 3,
                "y": 0,
                "size": 32,
                "owner": 0
            },
            {
                "x": 0,
                "y": 7,
                "size": 32,
                "owner": 0
            },
            {
                "x": 1,
                "y": 5,
                "size": 32,
                "owner": 0
            }
        ],
        "walls": [
            {
                "x": 9,
                "y": 0,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 1,
                "sprite": "wall_right"
            },
            {
                "x": 9,
                "y": 1,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 1,
                "sprite": "wall_bottomRight"
            },
            {
                "x": 8,
                "y": 1,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 1,
                "sprite": "wall_top"
            },
            {
                "x": 7,
                "y": 1,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 1,
                "sprite": "wall_bottomLeft"
            },
            {
                "x": 8,
                "y": 2,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 1,
                "sprite": "wall_topLeft"
            },
            {
                "x": 9,
                "y": 2,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 1,
                "sprite": "wall_bottom"
            },
            {
                "x": 10,
                "y": 2,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 1,
                "sprite": "wall_topRight"
            },
            {
                "x": 10,
                "y": 3,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 1,
                "sprite": "wall_right"
            },
            {
                "x": 10,
                "y": 4,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 1,
                "sprite": "wall_bottomRight"
            },
            {
                "x": 9,
                "y": 4,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 1,
                "sprite": "wall_top"
            },
            {
                "x": 8,
                "y": 4,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 1,
                "sprite": "wall_bottomLeft"
            },
            {
                "x": 10,
                "y": 0,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 1,
                "sprite": "wall_topLeft"
            },
            {
                "x": 11,
                "y": 0,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 1,
                "sprite": "wall_bottom"
            },
            {
                "x": 11,
                "y": 2,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 1,
                "sprite": "wall_top"
            },
            {
                "x": 10,
                "y": 1,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 1,
                "sprite": "wall_left"
            },
            {
                "x": 8,
                "y": 5,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 1,
                "sprite": "wall_topLeft"
            },
            {
                "x": 9,
                "y": 5,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 1,
                "sprite": "wall_bottom"
            },
            {
                "x": 10,
                "y": 5,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 1,
                "sprite": "wall_topRight"
            },
            {
                "x": 10,
                "y": 6,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 1,
                "sprite": "wall_topLeft"
            },
            {
                "x": 10,
                "y": 7,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 1,
                "sprite": "wall_bottomRight"
            },
            {
                "x": 9,
                "y": 7,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 1,
                "sprite": "wall_top"
            },
            {
                "x": 8,
                "y": 7,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 1,
                "sprite": "wall_bottomLeft"
            },
            {
                "x": 11,
                "y": 6,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 1,
                "sprite": "wall_bottom"
            },
            {
                "x": 1,
                "y": 0,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 0,
                "sprite": "wall_right"
            },
            {
                "x": 1,
                "y": 1,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 0,
                "sprite": "wall_topLeft"
            },
            {
                "x": 0,
                "y": 1,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 0,
                "sprite": "wall_top"
            },
            {
                "x": 2,
                "y": 1,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 0,
                "sprite": "wall_bottomLeft"
            },
            {
                "x": 3,
                "y": 1,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 0,
                "sprite": "wall_topRight"
            },
            {
                "x": 3,
                "y": 3,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 0,
                "sprite": "wall_bottomRight"
            },
            {
                "x": 2,
                "y": 3,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 0,
                "sprite": "wall_top"
            },
            {
                "x": 1,
                "y": 3,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 0,
                "sprite": "wall_bottomLeft"
            },
            {
                "x": 1,
                "y": 2,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 0,
                "sprite": "wall_left"
            },
            {
                "x": 4,
                "y": 1,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 0,
                "sprite": "wall_bottomRight"
            },
            {
                "x": 2,
                "y": 0,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 0,
                "sprite": "wall_left"
            },
            {
                "x": 0,
                "y": 6,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 0,
                "sprite": "wall_bottomLeft"
            },
            {
                "x": 1,
                "y": 6,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 0,
                "sprite": "wall_topRight"
            },
            {
                "x": 1,
                "y": 7,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 0,
                "sprite": "wall_right"
            },
            {
                "x": 0,
                "y": 4,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 0,
                "sprite": "wall_topLeft"
            },
            {
                "x": 1,
                "y": 4,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 0,
                "sprite": "wall_bottom"
            },
            {
                "x": 2,
                "y": 4,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 0,
                "sprite": "wall_topRight"
            },
            {
                "x": 2,
                "y": 6,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 0,
                "sprite": "wall_bottomRight"
            },
            {
                "x": 0,
                "y": 5,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 0,
                "sprite": "wall_left"
            }
        ],
        "doors": [
            {
                "x": 4,
                "y": 0,
                "size": 32,
                "owner": 0,
                "sprite": "door_right",
                "health": 2
            },
            {
                "x": 3,
                "y": 2,
                "size": 32,
                "owner": 0,
                "sprite": "door_right",
                "health": 2
            },
            {
                "x": 2,
                "y": 5,
                "size": 32,
                "owner": 0,
                "sprite": "door_right",
                "health": 2
            },
            {
                "x": 7,
                "y": 0,
                "size": 32,
                "owner": 1,
                "sprite": "door_left",
                "health": 2
            },
            {
                "x": 8,
                "y": 3,
                "size": 32,
                "owner": 1,
                "sprite": "door_left",
                "health": 2
            },
            {
                "x": 8,
                "y": 6,
                "size": 32,
                "owner": 1,
                "sprite": "door_left",
                "health": 2
            }
        ],
        "kings": [
            {
                "x": 0,
                "y": 7,
                "size": 32,
                "owner": 0,
                "health": 30
            },
            {
                "x": 11,
                "y": 1,
                "size": 32,
                "owner": 1,
                "health": 30
            }
        ],
        "soldiers": [
            {
                "x": 5.999900000004661,
                "y": 0,
                "size": 32,
                "owner": 1,
                "health": 10,
                "energy": 0,
                "selected": false,
                "path": [
                    {
                        "x": 5,
                        "y": 0,
                        "size": 32,
                        "type": "floor"
                    },
                    {
                        "x": 4,
                        "y": 0,
                        "size": 32,
                        "type": "door",
                        "health": 3,
                        "owner": 0,
                        "sprite": "wall_right"
                    },
                    {
                        "x": 3,
                        "y": 0,
                        "size": 32,
                        "type": "zone",
                        "owner": 0
                    }
                ],
                "combo": [],
                "animation": "walk",
                "animationStep": 1.972499999999969,
                "direction": "left"
            },
            {
                "x": 6.999900000004661,
                "y": 3,
                "size": 32,
                "owner": 1,
                "health": 10,
                "energy": 0,
                "selected": false,
                "path": [
                    {
                        "x": 6,
                        "y": 3,
                        "size": 32,
                        "type": "floor"
                    },
                    {
                        "x": 5,
                        "y": 3,
                        "size": 32,
                        "type": "floor"
                    },
                    {
                        "x": 4,
                        "y": 3,
                        "size": 32,
                        "type": "floor"
                    }
                ],
                "combo": [],
                "animation": "walk",
                "animationStep": 1.972499999999969,
                "direction": "left"
            },
            {
                "x": 6.999900000004661,
                "y": 6,
                "size": 32,
                "owner": 1,
                "health": 10,
                "energy": 0,
                "selected": false,
                "path": [
                    {
                        "x": 6,
                        "y": 6,
                        "size": 32,
                        "type": "floor"
                    },
                    {
                        "x": 5,
                        "y": 6,
                        "size": 32,
                        "type": "floor"
                    },
                    {
                        "x": 4,
                        "y": 6,
                        "size": 32,
                        "type": "floor"
                    }
                ],
                "combo": [],
                "animation": "walk",
                "animationStep": 1.972499999999969,
                "direction": "left"
            },
            {
                "x": 5.0000999999997795,
                "y": 0,
                "size": 32,
                "owner": 0,
                "health": 10,
                "energy": 0,
                "selected": false,
                "path": [
                    {
                        "x": 6,
                        "y": 0,
                        "size": 32,
                        "type": "floor"
                    },
                    {
                        "x": 7,
                        "y": 0,
                        "size": 32,
                        "type": "door",
                        "health": 3,
                        "owner": 1,
                        "sprite": "wall_left"
                    },
                    {
                        "x": 8,
                        "y": 0,
                        "size": 32,
                        "type": "zone",
                        "owner": 1
                    }
                ],
                "combo": [],
                "animation": "walk",
                "animationStep": 1.972499999999969,
                "direction": "right"
            },
            {
                "x": 3.9951000000042103,
                "y": 2.0049000000000103,
                "size": 32,
                "owner": 0,
                "health": 10,
                "energy": 0,
                "selected": false,
                "path": [
                    {
                        "x": 4,
                        "y": 3,
                        "size": 32,
                        "type": "floor"
                    },
                    {
                        "x": 5,
                        "y": 3,
                        "size": 32,
                        "type": "floor"
                    },
                    {
                        "x": 6,
                        "y": 3,
                        "size": 32,
                        "type": "floor"
                    }
                ],
                "combo": [],
                "animation": "walk",
                "animationStep": 1.969999999999969,
                "direction": "down"
            },
            {
                "x": 3.000000000002,
                "y": 5,
                "size": 32,
                "owner": 0,
                "health": 10,
                "energy": 0,
                "selected": false,
                "path": [
                    {
                        "x": 4,
                        "y": 5,
                        "size": 32,
                        "type": "floor"
                    },
                    {
                        "x": 5,
                        "y": 5,
                        "size": 32,
                        "type": "floor"
                    },
                    {
                        "x": 6,
                        "y": 5,
                        "size": 32,
                        "type": "floor"
                    }
                ],
                "combo": [],
                "animation": "walk",
                "animationStep": 1.969999999999969,
                "direction": "right"
            }
        ],
        "fight": {
            "type": "soldier_vs_soldier",
            "who": [
                "0",
                "3"
            ],
            "combos": {
                "0": [],
                "1": []
            }
        }
    }
}