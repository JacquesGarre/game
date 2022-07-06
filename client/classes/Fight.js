class Fight {

    constructor(ctx, state, sprites, player, io, roomID)
    {
        this.ctx = ctx
        this.state = state;
        this.player = player;
        this.sprites = sprites;
        this.animationStep = this.state.fight.animationStep == undefined ? 0 : this.state.fight.animationStep;
        this.firstFighter = this.state.soldiers[this.state.fight.who[0]]
        this.secondFighter = this.state.soldiers[this.state.fight.who[1]]
        this.firstFighter.fightAnimation = this.firstFighter.fightAnimation || 'idle';
        this.firstFighter.hitHeight = this.firstFighter.hitHeight || '';
        this.firstFighter.defendHeight = this.firstFighter.defendHeight || '';
        this.secondFighter.fightAnimation = this.secondFighter.fightAnimation || 'idle';
        this.secondFighter.hitHeight = this.secondFighter.hitHeight || '';
        this.secondFighter.defendHeight = this.secondFighter.defendHeight || '';
        this.io = io;
        this.roomID = roomID
    }

    start()
    {
        switch(this.state.fight.type)
        {
            case 'soldier_vs_soldier':
                this.startSoldiersFight();
            break;
        }
    }


    startSoldiersFight()
    {
  

        // Draw background
        this.sprite = this.sprites['soldier_vs_soldier_background'];
        this.ctx.beginPath();
        this.ctx.drawImage(
            this.sprite, 
            0,
            0,
        )

        // Animate fighters
        if(this.animationStep < (4 - this.state.CONSTANTS.FRAME_RATE)){
            this.animationStep += this.state.CONSTANTS.FRAME_RATE;
            this.state.fight.animationStep = this.animationStep;
        } else {
            this.animationStep = 0;
            this.state.fight.animationStep = this.animationStep;
        }

        var myFighter = this.firstFighter.owner == this.player.number ? this.firstFighter : this.secondFighter;
        var hisFighter = myFighter == this.firstFighter ? this.secondFighter : this.firstFighter;

        // Get sprites
        var leftFighterSprite = this.sprites['soldier_left_'+this.firstFighter.fightAnimation+this.firstFighter.hitHeight+this.firstFighter.defendHeight+'_'+Math.floor(this.animationStep)]
        // CHANGE SOLDIER LEFT HERE
        var rightFighterSprite = this.sprites['soldier_right_'+this.secondFighter.fightAnimation+this.secondFighter.hitHeight+this.secondFighter.defendHeight+'_'+Math.floor(this.animationStep)]

        // Draw fighters
        this.ctx.beginPath();
        this.ctx.drawImage(
            leftFighterSprite, 
            300,
            200,
        )

        this.ctx.beginPath();
        this.ctx.drawImage(
            rightFighterSprite, 
            500,
            200,
        )

    }

    recordCombo()
    {
        if(this.player.keydown){

            let keyPressed = this.player.keydown;
            let soldierID = false;
            let priority = false;
            this.player.keydown = false;

            // Case I have the firstFighter
            if(this.firstFighter.owner == this.player.number){
                soldierID = this.state.fight.who[0];
            // Case I have the secondFighter
            } else if (this.secondFighter.owner == this.player.number) {
                soldierID = this.state.fight.who[1];
            }

            if(!soldierID || !['ArrowUp','ArrowDown', 'ArrowRight', 'ArrowLeft'].includes(keyPressed)){
                return;
            }

            // I have the priority if my soldier has more energy, or if we have the same energy, if I am who0
            priority = this.firstFighter.energy > this.secondFighter.energy || (this.firstFighter.energy == this.secondFighter.energy && soldierID == this.state.fight.who[0]);


            // If i have the priority, my combo will be combo 0
            if(priority){

                // If i finished my combo
                if(this.state.fight.combos[0].length == this.state.CONSTANTS.FIGHT_COMBO_LENGTH){
                    return;
                }

                // If I attack
                if(this.state.fight.combos[0].length % 2 == 0){
                    this.state.fight.combos[0].push({
                        fightAnimation: 'attack',
                        hitHeight: this.getHeight(keyPressed),
                        defendHeight: ''
                    })
                    this.io.emit("stateUpdated", this.roomID, this.state);
                
                // If I defend
                } else {
                    this.state.fight.combos[0].push({
                        fightAnimation: 'defend',
                        hitHeight: '',
                        defendHeight: this.getHeight(keyPressed)
                    })
                    this.io.emit("stateUpdated", this.roomID, this.state);
                }

            // else my combo will be combo 1
            } else {

                // If i finished my combo
                if(this.state.fight.combos[1].length == this.state.CONSTANTS.FIGHT_COMBO_LENGTH){
                    return;
                }

                // If I attack
                if(this.state.fight.combos[1].length % 2 == 1){
                    this.state.fight.combos[1].push({
                        fightAnimation: 'attack',
                        hitHeight: this.getHeight(keyPressed),
                        defendHeight: ''
                    })
                    this.io.emit("stateUpdated", this.roomID, this.state);
                
                // If I defend
                } else {
                    this.state.fight.combos[1].push({
                        fightAnimation: 'defend',
                        hitHeight: '',
                        defendHeight: this.getHeight(keyPressed)
                    })
                    this.io.emit("stateUpdated", this.roomID, this.state);
                }

            }

            console.log(this.state.fight.combos);
            
        }
    }

    getHeight(key)
    {
        switch(key){
            case 'ArrowUp':
                return '_high';
            break;
            case 'ArrowDown':
                return '_low';
            break;
            case 'ArrowLeft':
            case 'ArrowRight':
                return '_medium';
            break;
        }
    }

    animate()
    {
        
    }

}