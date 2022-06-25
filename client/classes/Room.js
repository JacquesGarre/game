class Room {

    constructor(Client, roomID)
    {   
        this.Client = client;
        this.id = roomID;
        this.players = [];
    }

    // Adds player
    addPlayer(player)
    {
        this.players.push(player)
    }

    // Enters the rooms (Hide default screen and display room)
    enter()
    {   

        const initialScreen = document.getElementById('menu')
        const gameScreen = document.getElementById('room')
        const roomIDdisplay = document.getElementById('roomCode')

        initialScreen.style.display = "none";
        gameScreen.style.display = "block";
        roomIDdisplay.innerHTML = this.id;

    }

}