class Client {

    constructor(io)
    {
        this.io = io;
        this.room;
        this.player;
    }

    // Binds events to server-emitted events through websockets
    addServerEventsListeners()
    {
        // When client receive count of online players, display it
        const onlinePlayersCounter = document.getElementById('onlinePlayersCount')
        this.io.on("onlinePlayersCount", (count) => {
            onlinePlayersCounter.innerHTML = count;
        });

        // When client receive count of players in a room, display it
        const roomPlayersCounter = document.getElementById('roomPlayersCount')
        this.io.on("roomPlayersCount", (count) => {
            roomPlayersCounter.innerHTML = count;
        });

        // When client receive a new room
        this.io.on("newRoom", (params) => {
            this.room = new Room(this, params.roomID);
        });

        // When client has to init player
        this.io.on("initPlayer", (playerParams, CONSTANTS) => {
            this.player = new Player(this, playerParams, CONSTANTS);
            this.room.addPlayer(this.player)
            this.room.enter();
        });

        // When client has to load game
        this.io.on("loadGame", (state) => {
            this.game = new Game(this.room, this.io, this.player, state);
            this.game.load();
        });

        // When client has to start game / update state
        this.io.on("updateState", (state) => {
            this.game.loop(state);
        });

    }

    // Binds events to dom events
    addDomEventsListeners()
    {
        const createGameButton = document.getElementById('createGame')
        const joinGameButton = document.getElementById('joinGame')
        const roomIdInput = document.getElementById('roomID')
        var that = this;

        // Binds on "Create a new game" btn
        createGameButton.addEventListener('click', function(){
            that.createGameButtonHandler(that);
        })

        // Binds on "Join game" btn
        joinGameButton.addEventListener('click', function(){
            const roomID = roomIdInput.value;
            that.joinGameButtonHandler(that, roomID);
        })
    }

    // Handles click on "Create a new game" btn
    createGameButtonHandler(that)
    {   
        const pseudoInput = document.getElementById('pseudo');
        const pseudo = pseudoInput.value;
        that.io.emit("newGame", pseudo);
    }

    // Handles click on "Join game" btn
    joinGameButtonHandler(that, roomID)
    {   
        this.room = new Room(this, roomID);
        const pseudoInput = document.getElementById('pseudo2');
        const pseudo = pseudoInput.value;
        that.io.emit("joinGame", pseudo, roomID);
    }


}