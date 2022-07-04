// Start server
const { Server } = require("socket.io");
const { generateID } = require('./utils');
const { CONSTANTS } = require('./constants');
const { State } = require('./classes/State.js');
const server = new Server({ 
    cors: {
        origin: "http://127.0.0.1:8080"
    }
});

// Game vars
const clientRooms = {};
const state = {};

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

        /* DEBUG! A REMETTRE 
        state[roomID].players[playerID] = {
            number: playerID,
            pseudo: pseudo,
            resources: {}
        };
        */

        /* DEBUG! A RETIRER */
        state[roomID] = debug();
        
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

        /* DEBUG! A REMETTRE
        state[roomID].players[playerID] = {
            number: playerID,
            pseudo: pseudo,
            resources: {}
        };
        */

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
        if(!player.finishedMoves){
            newState.currentStep = 'soldiersMoves';
            return newState;
        }
    }

    
    //console.log(JSON.stringify(newState));
    

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
                    "sprite": "wall_left"
                },
                {
                    "x": 0,
                    "y": 2,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 0,
                    "sprite": "wall_bottomLeft"
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
                    "type": "floor"
                },
                {
                    "x": 0,
                    "y": 5,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 0,
                    "y": 6,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 0,
                    "y": 7,
                    "size": 32,
                    "type": "floor"
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
                    "sprite": "wall_bottom"
                },
                {
                    "x": 1,
                    "y": 1,
                    "size": 32,
                    "type": "zone",
                    "owner": 0
                },
                {
                    "x": 1,
                    "y": 2,
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
                    "type": "floor"
                },
                {
                    "x": 1,
                    "y": 4,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 1,
                    "y": 5,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 1,
                    "y": 6,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 1,
                    "y": 7,
                    "size": 32,
                    "type": "floor"
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
                    "sprite": "wall_topRight"
                },
                {
                    "x": 2,
                    "y": 1,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 0,
                    "sprite": "wall_right"
                },
                {
                    "x": 2,
                    "y": 2,
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
                    "type": "floor"
                },
                {
                    "x": 2,
                    "y": 4,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 0,
                    "sprite": "wall_topLeft"
                },
                {
                    "x": 2,
                    "y": 5,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 0,
                    "sprite": "wall_left"
                },
                {
                    "x": 2,
                    "y": 6,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 0,
                    "sprite": "wall_bottomLeft"
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
                    "type": "floor"
                },
                {
                    "x": 3,
                    "y": 1,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 3,
                    "y": 2,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 3,
                    "y": 3,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 3,
                    "y": 4,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 0,
                    "sprite": "wall_bottom"
                },
                {
                    "x": 3,
                    "y": 5,
                    "size": 32,
                    "type": "zone",
                    "owner": 0
                },
                {
                    "x": 3,
                    "y": 6,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 0,
                    "sprite": "wall_top"
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
                    "type": "floor"
                },
                {
                    "x": 4,
                    "y": 1,
                    "size": 32,
                    "type": "floor"
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
                    "type": "wall",
                    "health": 3,
                    "owner": 0,
                    "sprite": "wall_topRight"
                },
                {
                    "x": 4,
                    "y": 5,
                    "size": 32,
                    "type": "door",
                    "health": 3,
                    "owner": 0,
                    "sprite": "wall_right"
                },
                {
                    "x": 4,
                    "y": 6,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 0,
                    "sprite": "wall_bottomRight"
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
                    "type": "floor"
                },
                {
                    "x": 7,
                    "y": 1,
                    "size": 32,
                    "type": "floor"
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
                    "type": "wall",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_topLeft"
                },
                {
                    "x": 8,
                    "y": 1,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_left"
                },
                {
                    "x": 8,
                    "y": 2,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_bottomLeft"
                },
                {
                    "x": 8,
                    "y": 3,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_topLeft"
                },
                {
                    "x": 8,
                    "y": 4,
                    "size": 32,
                    "type": "door",
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
                    "sprite": "wall_bottomLeft"
                },
                {
                    "x": 8,
                    "y": 6,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 8,
                    "y": 7,
                    "size": 32,
                    "type": "floor"
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
                    "sprite": "wall_bottom"
                },
                {
                    "x": 9,
                    "y": 1,
                    "size": 32,
                    "type": "zone",
                    "owner": 1
                },
                {
                    "x": 9,
                    "y": 2,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_top"
                },
                {
                    "x": 9,
                    "y": 3,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_bottom"
                },
                {
                    "x": 9,
                    "y": 4,
                    "size": 32,
                    "type": "zone",
                    "owner": 1
                },
                {
                    "x": 9,
                    "y": 5,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_top"
                },
                {
                    "x": 9,
                    "y": 6,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 9,
                    "y": 7,
                    "size": 32,
                    "type": "floor"
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
                    "sprite": "wall_topRight"
                },
                {
                    "x": 10,
                    "y": 1,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_right"
                },
                {
                    "x": 10,
                    "y": 2,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_bottomRight"
                },
                {
                    "x": 10,
                    "y": 3,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_topRight"
                },
                {
                    "x": 10,
                    "y": 4,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_right"
                },
                {
                    "x": 10,
                    "y": 5,
                    "size": 32,
                    "type": "wall",
                    "health": 3,
                    "owner": 1,
                    "sprite": "wall_bottomRight"
                },
                {
                    "x": 10,
                    "y": 6,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 10,
                    "y": 7,
                    "size": 32,
                    "type": "floor"
                }
            ],
            [
                {
                    "x": 11,
                    "y": 0,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 11,
                    "y": 1,
                    "size": 32,
                    "type": "floor"
                },
                {
                    "x": 11,
                    "y": 2,
                    "size": 32,
                    "type": "floor"
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
                    "type": "floor"
                },
                {
                    "x": 11,
                    "y": 7,
                    "size": 32,
                    "type": "floor"
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
                "zones": 2,
                "doors": 1,
                "kings": 1,
                "soldiers": 1
            },
            "WALL_HEALTH": 3,
            "DOOR_HEALTH": 2,
            "KING_HEALTH": 30,
            "SOLDIER_HEALTH": 10,
            "SOLDIER_ENERGY": 5,
            "HOVER_BORDER_COLOR": "purple"
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
            "king": "assets/map/characters/king/king.png"
        },
        "playersLoaded": [],
        "currentStep": "soldiersMoves",
        "players": {
            "0": {
                "number": 0,
                "pseudo": "csacascsac",
                "resources": {
                    "zones": 0,
                    "doors": 0,
                    "kings": 0,
                    "soldiers": 0
                },
                "finishedMoves": false
            },
            "1": {
                "number": 1,
                "pseudo": "sacsaccasc",
                "resources": {
                    "zones": 0,
                    "doors": 0,
                    "kings": 0,
                    "soldiers": 0
                },
                "finishedMoves": false
            }
        },
        "zones": [
            {
                "x": 9,
                "y": 1,
                "size": 32,
                "owner": 1
            },
            {
                "x": 9,
                "y": 4,
                "size": 32,
                "owner": 1
            },
            {
                "x": 1,
                "y": 1,
                "size": 32,
                "owner": 0
            },
            {
                "x": 3,
                "y": 5,
                "size": 32,
                "owner": 0
            }
        ],
        "walls": [
            {
                "x": 8,
                "y": 0,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 1,
                "sprite": "wall_topLeft"
            },
            {
                "x": 9,
                "y": 0,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 1,
                "sprite": "wall_bottom"
            },
            {
                "x": 10,
                "y": 0,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 1,
                "sprite": "wall_topRight"
            },
            {
                "x": 10,
                "y": 1,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 1,
                "sprite": "wall_right"
            },
            {
                "x": 10,
                "y": 2,
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
                "sprite": "wall_top"
            },
            {
                "x": 8,
                "y": 2,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 1,
                "sprite": "wall_bottomLeft"
            },
            {
                "x": 8,
                "y": 1,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 1,
                "sprite": "wall_left"
            },
            {
                "x": 8,
                "y": 3,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 1,
                "sprite": "wall_topLeft"
            },
            {
                "x": 9,
                "y": 3,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 1,
                "sprite": "wall_bottom"
            },
            {
                "x": 10,
                "y": 3,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 1,
                "sprite": "wall_topRight"
            },
            {
                "x": 10,
                "y": 4,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 1,
                "sprite": "wall_right"
            },
            {
                "x": 10,
                "y": 5,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 1,
                "sprite": "wall_bottomRight"
            },
            {
                "x": 9,
                "y": 5,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 1,
                "sprite": "wall_top"
            },
            {
                "x": 8,
                "y": 5,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 1,
                "sprite": "wall_bottomLeft"
            },
            {
                "x": 0,
                "y": 0,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 0,
                "sprite": "wall_topLeft"
            },
            {
                "x": 1,
                "y": 0,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 0,
                "sprite": "wall_bottom"
            },
            {
                "x": 2,
                "y": 0,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 0,
                "sprite": "wall_topRight"
            },
            {
                "x": 2,
                "y": 1,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 0,
                "sprite": "wall_right"
            },
            {
                "x": 2,
                "y": 2,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 0,
                "sprite": "wall_bottomRight"
            },
            {
                "x": 1,
                "y": 2,
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
                "type": "wall",
                "health": 3,
                "owner": 0,
                "sprite": "wall_bottomLeft"
            },
            {
                "x": 0,
                "y": 1,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 0,
                "sprite": "wall_left"
            },
            {
                "x": 2,
                "y": 4,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 0,
                "sprite": "wall_topLeft"
            },
            {
                "x": 3,
                "y": 4,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 0,
                "sprite": "wall_bottom"
            },
            {
                "x": 4,
                "y": 4,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 0,
                "sprite": "wall_topRight"
            },
            {
                "x": 4,
                "y": 6,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 0,
                "sprite": "wall_bottomRight"
            },
            {
                "x": 3,
                "y": 6,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 0,
                "sprite": "wall_top"
            },
            {
                "x": 2,
                "y": 6,
                "size": 32,
                "type": "wall",
                "health": 3,
                "owner": 0,
                "sprite": "wall_bottomLeft"
            },
            {
                "x": 2,
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
                "x": 8,
                "y": 4,
                "size": 32,
                "owner": 1,
                "sprite": "door_left",
                "health": 2
            },
            {
                "x": 4,
                "y": 5,
                "size": 32,
                "owner": 0,
                "sprite": "door_right",
                "health": 2
            }
        ],
        "kings": [
            {
                "x": 1,
                "y": 1,
                "size": 32,
                "owner": 0,
                "health": 30
            },
            {
                "x": 9,
                "y": 1,
                "size": 32,
                "owner": 1,
                "health": 30
            }
        ],
        "soldiers": [
            {
                "x": 3,
                "y": 5,
                "size": 32,
                "owner": 0,
                "health": 10,
                "energy": 5,
                "selected": false
            },
            {
                "x": 5,
                "y": 7,
                "size": 32,
                "owner": 0,
                "health": 10,
                "energy": 5,
                "selected": false
            },
            {
                "x": 9,
                "y": 4,
                "size": 32,
                "owner": 1,
                "health": 10,
                "energy": 5,
                "selected": false
            },
            {
                "x": 4,
                "y": 4,
                "size": 32,
                "owner": 1,
                "health": 10,
                "energy": 5,
                "selected": false
            }
        ]
    }
}