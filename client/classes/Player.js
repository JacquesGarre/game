class Player {

    constructor(io, args)
    {   
        this.io = io;
        this.number = args.number;
        this.pseudo = args.pseudo;
    }

    setTerritory(state)
    {
        this.territory = {
            x: this.number % 2 * (state.CONSTANTS.MAP_TILES_X / 2),
            y: 0 * (state.CONSTANTS.MAP_TILES_Y / 2), // To change for 4 players
            width: state.CONSTANTS.MAP_TILES_X / 2,
            height: state.CONSTANTS.MAP_TILES_Y // To change for 4 players
        }
    }


}