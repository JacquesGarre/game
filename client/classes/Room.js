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
        // const canvas = document.getElementById('canvas');
        // const ctx = canvas.getContext('2d');

        initialScreen.style.display = "none";
        gameScreen.style.display = "block";
        roomIDdisplay.innerHTML = this.id;
       
        // canvas.width = canvas.height = 600;
        // ctx.fillStyle = 'black';
        // ctx.fillRect(0, 0, canvas.width, canvas.height);

    }

}