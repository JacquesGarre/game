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

        state[roomID].players[playerID] = {
            number: playerID,
            pseudo: pseudo,
            resources: {}
        };
        
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

        state[roomID].players[playerID] = {
            number: playerID,
            pseudo: pseudo,
            resources: {}
        };

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

    // test doorsDrawing
    for(const playerID of Object.keys(newState.players)){
        const player = newState.players[playerID];
        if(player.resources.doors == undefined || player.resources.doors > 0){
            newState.currentStep = 'doorsDrawing';
            return newState;
        }
    }

    return newState;

}

// Listen on port 3000
server.listen(3000);
