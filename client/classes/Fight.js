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
        if(this.animationStep < (4 - this.state.CONSTANTS.FIGHT_FRAME_RATE)){
            this.animationStep += this.state.CONSTANTS.FIGHT_FRAME_RATE;
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
            100,
            350,
        )

        this.ctx.beginPath();
        this.ctx.drawImage(
            rightFighterSprite, 
            this.state.CONSTANTS.CANVAS_WIDTH - 100 - 250,
            350,
        )

        this.drawHud()
        this.drawCombo()

    }

    drawCurrentCombo(leftFighterMove, rightFighterMove)
    {
        // Draw left fighter combo
        this.drawMove(
            375, 
            300, 
            leftFighterMove
        )

        // Draw result
        if(Math.floor(this.animationStep) == 2){
            this.drawResult(leftFighterMove, rightFighterMove);
        }

        // Draw lright fighter combo
        this.drawMove(
            this.state.CONSTANTS.CANVAS_WIDTH - 425, 
            300, 
            rightFighterMove
        )
    }

    drawResult(leftFighterMove, rightFighterMove)
    {

        let resultY = 300

        // LEFT FIGHTER IS CURRENT PLAYER
        if(this.firstFighter.owner == this.player.number){

            
            if(
                leftFighterMove.fightAnimation == 'attack' && leftFighterMove.hitHeight !== rightFighterMove.defendHeight
                ||
                leftFighterMove.fightAnimation == 'defend' && leftFighterMove.defendHeight == rightFighterMove.hitHeight
            ){
                // win
                if(leftFighterMove.fightAnimation == 'attack'){
                    this.ctx.beginPath();
                    this.ctx.textAlign = "center";
                    this.ctx.fillStyle = 'green';
                    this.ctx.font = "20px "+this.state.CONSTANTS.FONT;
                    this.ctx.fillText('HIT!', this.state.CONSTANTS.CANVAS_WIDTH / 2, resultY);
                }
                if(leftFighterMove.fightAnimation == 'defend'){
                    this.ctx.beginPath();
                    this.ctx.textAlign = "center";
                    this.ctx.fillStyle = 'green';
                    this.ctx.font = "20px "+this.state.CONSTANTS.FONT;
                    this.ctx.fillText('BLOCKED!', this.state.CONSTANTS.CANVAS_WIDTH / 2, resultY);
                }
                
            } else {
                // lose
                if(leftFighterMove.fightAnimation == 'attack'){
                    this.ctx.beginPath();
                    this.ctx.textAlign = "center";
                    this.ctx.fillStyle = 'red';
                    this.ctx.font = "20px "+this.state.CONSTANTS.FONT;
                    this.ctx.fillText('BLOCKED!', this.state.CONSTANTS.CANVAS_WIDTH / 2, resultY);
                }
                if(leftFighterMove.fightAnimation == 'defend'){
                    this.ctx.beginPath();
                    this.ctx.textAlign = "center";
                    this.ctx.fillStyle = 'red';
                    this.ctx.font = "20px "+this.state.CONSTANTS.FONT;
                    this.ctx.fillText('HIT!', this.state.CONSTANTS.CANVAS_WIDTH / 2, resultY);
                }
            }

        // RIGHT FIGHTER IS CURRENT PLAYER
        } else {

            if(
                rightFighterMove.fightAnimation == 'attack' && rightFighterMove.hitHeight !== leftFighterMove.defendHeight
                ||
                rightFighterMove.fightAnimation == 'defend' && rightFighterMove.defendHeight == leftFighterMove.hitHeight
            ){

                // win
                if(rightFighterMove.fightAnimation == 'attack'){
                    this.ctx.beginPath();
                    this.ctx.textAlign = "center";
                    this.ctx.fillStyle = 'green';
                    this.ctx.font = "20px "+this.state.CONSTANTS.FONT;
                    this.ctx.fillText('HIT!', this.state.CONSTANTS.CANVAS_WIDTH / 2, resultY);
                }
                if(rightFighterMove.fightAnimation == 'defend'){
                    this.ctx.beginPath();
                    this.ctx.textAlign = "center";
                    this.ctx.fillStyle = 'green';
                    this.ctx.font = "20px "+this.state.CONSTANTS.FONT;
                    this.ctx.fillText('BLOCKED!', this.state.CONSTANTS.CANVAS_WIDTH / 2, resultY);
                }

            } else {
                // lose
                if(rightFighterMove.fightAnimation == 'attack'){
                    this.ctx.beginPath();
                    this.ctx.textAlign = "center";
                    this.ctx.fillStyle = 'red';
                    this.ctx.font = "20px "+this.state.CONSTANTS.FONT;
                    this.ctx.fillText('BLOCKED!', this.state.CONSTANTS.CANVAS_WIDTH / 2, resultY);
                }
                if(rightFighterMove.fightAnimation == 'defend'){
                    this.ctx.beginPath();
                    this.ctx.textAlign = "center";
                    this.ctx.fillStyle = 'red';
                    this.ctx.font = "20px "+this.state.CONSTANTS.FONT;
                    this.ctx.fillText('HIT!', this.state.CONSTANTS.CANVAS_WIDTH / 2, resultY);
                }
            }

        }
        this.ctx.textAlign = "left";
    }

    drawCombo(both = false)
    {
        if(!both){

            if(this.firstFighter.owner == this.player.number){
                // Draw right fighter combo
                var i = 0;
                for(const move of this.state.fight.combos[0]){
                    this.drawMove(
                        10 + i*50, 
                        100, 
                        move
                    )
                    i++;
                }
            } else {
                // Draw left fighter combo
                var i = 1;
                for(const move of this.state.fight.combos[1]){
                    this.drawMove(
                        this.state.CONSTANTS.CANVAS_WIDTH - (10 + i*50), 
                        100, 
                        move
                    )
                    i++;
                }
            }

        } else {

            // Draw right fighter combo
            var i = 0;
            for(const move of this.state.fight.combos[0]){
                this.drawMove(
                    10 + i*50, 
                    100, 
                    move
                )
                i++;
            }

            // Draw left fighter combo
            var i = 1;
            for(const move of this.state.fight.combos[1]){
                this.drawMove(
                    this.state.CONSTANTS.CANVAS_WIDTH - (10 + i*50), 
                    100, 
                    move
                )
                i++;
            }

        }



        

    }

    drawMove(x, y, move)
    {   
        // Shield or sword
        var sprite = this.sprites['combo_'+move.fightAnimation]
        this.ctx.beginPath();
        this.ctx.drawImage(
            sprite, 
            x,
            y,
        )

        // Height
        if(move.fightAnimation == 'attack'){
            var height = move.hitHeight;
        } else if(move.fightAnimation == 'defend') {
            var height = move.defendHeight;
        }
        var where = '';
        switch(height){
            case '_high':
                where = 'Head';
            break;
            case '_medium':
                where = 'Body';
            break;
            case '_low':
                where = 'Legs';
            break;
        }

        this.ctx.beginPath();
        this.ctx.fillStyle = 'black';
        this.ctx.font = "10px "+this.state.CONSTANTS.FONT;
        this.ctx.fillText(where, x + 10, y + 60);

    }

    drawHud()
    {
        // Draw left fighter pseudo
        this.drawPseudo(
            10, 
            30, 
            this.state.players[this.firstFighter.owner].pseudo
        )
        // Draw right fighter pseudo
        this.drawPseudo(
            this.state.CONSTANTS.CANVAS_WIDTH - this.state.CONSTANTS.FIGHT_BAR_WIDTH - 10,
            30, 
            this.state.players[this.secondFighter.owner].pseudo
        )

        // Draw left fighter hud
        this.drawHealthBar(
            10, 
            40, 
            this.state.soldiers[this.state.fight.who[0]].health
        );
        // Draw right fighter hud
        this.drawHealthBar(
            this.state.CONSTANTS.CANVAS_WIDTH - this.state.CONSTANTS.FIGHT_BAR_WIDTH - 10, 
            40, 
            this.state.soldiers[this.state.fight.who[1]].health
        );

        // Draw left fighter hud
        this.drawEnergyBar(
            10, 
            70, 
            this.state.soldiers[this.state.fight.who[0]].energy 
        );
        // Draw right fighter hud
        this.drawEnergyBar(
            this.state.CONSTANTS.CANVAS_WIDTH - this.state.CONSTANTS.FIGHT_BAR_WIDTH - 10, 
            70, 
            this.state.soldiers[this.state.fight.who[1]].energy 
        );


    }

    drawPseudo(x, y, pseudo)
    {   
        this.ctx.beginPath();
        this.ctx.fillStyle = 'black';
        this.ctx.font = "30px "+this.state.CONSTANTS.FONT;
        this.ctx.fillText(pseudo, x, y);
    }

    drawHealthBar(x, y, health)
    {

        // Health bar
        this.ctx.globalAlpha = 1;
        this.ctx.beginPath();
        this.ctx.lineWidth = '1';
        this.ctx.strokeStyle = 'black'
        this.ctx.rect(
            x, // x
            y, // y
            this.state.CONSTANTS.FIGHT_BAR_WIDTH, // width
            20 // height
        ); 
        this.ctx.stroke();

        
        // FILL HEALTH BAR
        this.ctx.beginPath();
        var healthBar = health/this.state.CONSTANTS.SOLDIER_HEALTH*this.state.CONSTANTS.FIGHT_BAR_WIDTH;
        this.ctx.fillStyle = 'green';
        this.ctx.fillRect(
            x, // x
            y, // y
            healthBar, // width
            20 // height
        )

    }

    drawEnergyBar(x, y, energy)
    {

        // energy bar
        this.ctx.globalAlpha = 1;
        this.ctx.beginPath();
        this.ctx.lineWidth = '1';
        this.ctx.strokeStyle = 'black'
        this.ctx.rect(
            x, // x
            y, // y
            this.state.CONSTANTS.FIGHT_BAR_WIDTH, // width
            20 // height
        ); 
        this.ctx.stroke();

        // FILL energy BAR
        
        var energyBar = energy/this.state.CONSTANTS.SOLDIER_ENERGY*this.state.CONSTANTS.FIGHT_BAR_WIDTH;
        this.ctx.beginPath();
        this.ctx.fillStyle = 'blue';
        this.ctx.fillRect(
            x, // x
            y, // y
            energyBar, // width
            20 // height
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

    removeHealth()
    {
        var rightFighterMove = this.state.fight.combos[0][0];
        var leftFighterMove = this.state.fight.combos[1][0];
        if(rightFighterMove.fightAnimation == 'attack'){
            if(rightFighterMove.hitHeight !== leftFighterMove.defendHeight){
                this.state.soldiers[this.state.fight.who[1]].health -= 1;
            }
        } else if(rightFighterMove.fightAnimation == 'defend'){
            if(rightFighterMove.defendHeight !== leftFighterMove.hitHeight){
                this.state.soldiers[this.state.fight.who[0]].health -= 1;
            }
        }
    }

    animate()
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
        if(this.animationStep < (4 - this.state.CONSTANTS.FIGHT_FRAME_RATE)){
            this.animationStep += this.state.CONSTANTS.FIGHT_FRAME_RATE;
            this.state.fight.animationStep = this.animationStep;
        } else {
            this.animationStep = 0;
            this.state.fight.animationStep = this.animationStep;
            this.removeHealth();           
            this.state.fight.combos[0].shift() // ICI IL FAUT RETIRER LA VIE
            this.state.fight.combos[1].shift()
        }

        let leftFighterMove = this.state.fight.combos[0][0]
        var leftFighterSprite = this.sprites['soldier_left_'+leftFighterMove.fightAnimation+leftFighterMove.hitHeight+leftFighterMove.defendHeight+'_'+Math.floor(this.animationStep)]

        let rightFighterMove = this.state.fight.combos[1][0]
        var rightFighterSprite = this.sprites['soldier_right_'+rightFighterMove.fightAnimation+rightFighterMove.hitHeight+rightFighterMove.defendHeight+'_'+Math.floor(this.animationStep)]

        // Draw fighters
        this.ctx.beginPath();
        this.ctx.drawImage(
            leftFighterSprite, 
            300,
            350,
        )

        this.ctx.beginPath();
        this.ctx.drawImage(
            rightFighterSprite, 
            this.state.CONSTANTS.CANVAS_WIDTH - 300 - 250,
            350,
        )

        this.drawHud()
        this.drawCombo(true)

        this.drawCurrentCombo(leftFighterMove, rightFighterMove)

    }

}