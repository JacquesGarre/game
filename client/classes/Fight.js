class Fight {

    constructor(ctx, state, sprites, player)
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
        console.log(this.state.fight)

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
            this.animationStep += this.state.CONSTANTS.FRAME_RATE * 20;
            this.state.fight.animationStep = this.animationStep;
        } else {
            this.animationStep = 0;
            this.state.fight.animationStep = this.animationStep;
        }

        if(this.player.keydown){
            this.player.keydown = false;

            if(this.player.number == this.firstFighter.owner){
                this.firstFighter.fightAnimation = 'attack';
                this.firstFighter.hitHeight = '_high';
                this.firstFighter.defendHeight = '';
            } else {
                this.secondFighter.fightAnimation = 'attack';
                this.secondFighter.hitHeight = '_high';
                this.secondFighter.defendHeight = '';
            }

        }

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

}