var singleGameLayer = cc.Layer.extend({
    _time_limit: 60,
    _cur_score: 0,
    _dst_score: 200,
    _roundInterval: null,
    _hook: null,
    mineContainer: [],
    _propContainer: [],
    _criticalAngle: null,
    _round: 1,
    winSize: null,
    collectAction: null,
    collectedObject: null,
    shelfMap: null,
    
    init:function () {
        var bRet = false;
        if (this._super()) {
            this.winSize = cc.Director.sharedDirector().getWinSize();
            this.setAnchorPoint(cc.ccp(0, 0));
            
            // init
            this.initBackground();
            this.initLabels();
            this.initTimeCounter();
            this.initHook();
            // create map
            this.initShelfMap();
            this.createMap();

            this.setIsTouchEnabled(true);
            this.setIsKeypadEnabled(true);
            this.schedule(this.update);

            if (global.sound) {
                cc.AudioManager.sharedEngine().playBackgroundMusic(s_bgMusic, true);
            }

            bRet = true;
        }
        return bRet;
    },
    
    initBackground: function () {
        var bg = cc.Sprite.create(s_gamebg);
        bg.setAnchorPoint(cc.ccp(0, 0));
        this.addChild(bg, global.zOrder.Background);
		//³õÊ¼»¯Ð¡ÄÐº¢
		var textureForBoy = cc.TextureCache.sharedTextureCache().addImage(s_boy);
		var boyFrame1 = cc.SpriteFrame.create(textureForBoy,cc.RectMake(0,0,109,140));
		var boyFrame2 = cc.SpriteFrame.create(textureForBoy,cc.RectMake(109,0,109,140));
		var boySprite = cc.Sprite.createWithSpriteFrame(boyFrame1);
		boySprite.setPosition(new cc.ccp(this.winSize.width / 2 +115, this.winSize.height - 58));
		boySprite.setScale(0.3);
		this.addChild(boySprite,1);
		var boyFrames = [];
		boyFrames.push(boyFrame2);
		boyFrames.push(boyFrame1);
		var boyAnimation = cc.Animation.create(boyFrames,0.3);
		var boyAnim = cc.Animate.create(boyAnimation,false);
		boySprite.runAction(cc.RepeatForever.create(cc.Sequence.create(boyAnim,cc.DelayTime.create(3))));
		//³õÊ¼»¯·ÅµÀ¾ßµÄÄ¾°å
		var board = cc.Sprite.create(s_board);	
		board.setPosition(new cc.ccp(60, this.winSize.height - 70));
		this.addChild(board,30);
		board.setScale(0.7);
    },
    
    initLabels: function () {
        // dst score
        this._lbDstScore = cc.LabelBMFont.create("Goal: 000", s_futura_fnt);
        this._lbDstScore.setScale(0.5);
        //this._lbDstScore.setColor(cc.RED());
        this.addChild(this._lbDstScore, global.zOrder.Label);
        this._lbDstScore.setPosition(cc.ccp(this.winSize.width - 100, this.winSize.height - 30));
        
        // cur score
        this._lbCurScore = cc.LabelBMFont.create("Score: 000", s_futura_fnt);
        //this._lbCurScore.setColor(cc.RED());
        this._lbCurScore.setScale(0.5);
        this.addChild(this._lbCurScore, global.zOrder.Label);
        this._lbCurScore.setPosition(cc.ccp(this.winSize.width - 100, this.winSize.height - 60));
        
        // time
        this._lbTime = cc.LabelBMFont.create("Time: 00:00", s_futura_fnt);
        //this._lbTime.setColor(cc.RED());
        this._lbTime.setScale(0.5);
        this.addChild(this._lbTime, global.zOrder.Label);
        this._lbTime.setPosition(cc.ccp(this.winSize.width - 100, this.winSize.height - 90));

        // round count
        this._lbRound = cc.LabelBMFont.create("Round: 0", s_futura_fnt);
        this._lbRound.setScale(0.5);
        this._lbRound.setPosition(cc.ccp(60, this.winSize.height-100));
        //this._lbRound.setColor(cc.RED());
        this.addChild(this._lbRound, global.zOrder.Label);
    },
    
    initTimeCounter: function () {
        var that = this;
        //if(this._time_limit >= 0)
        {
            this._roundInterval = setInterval(
                function(){
                    that._time_limit--;
                    that._lbTime.setString("Time: 00:"+that._time_limit);
                },
                1000
            );
        }
    },
    
    initHook: function () {
        this._hook = new Hook();
        this.addChild(this._hook, global.zOrder.Hook);
        this._hook.setAnchorPoint(new cc.ccp(0.5, 1));
        //this._hook.setPosition(new cc.ccp(this.winSize.width/2, this.winSize.height-50));
        //this._hook.originPosition = new cc.ccp(this.winSize.width/2, this.winSize.height-50);
        this._hook.setPosition(cc.ccp(403, 462));
        this._hook.originPosition = cc.ccp(403, 462);
        this._hook.scheduleUpdate();
        this._criticalAngle = Math.atan((this.winSize.width/2)/(this.winSize.height-50))/Math.PI*180;
        this._hook_path = Math.sqrt(Math.pow(this._hook.getPosition().x, 2) + Math.pow(this._hook.getPosition().y, 2));
    },
    
    createMap: function () {
        var levelManager = new LevelManager(this);
        levelManager.createMap();
        var toolManager = new ToolManager(this);
        toolManager.getTools();
    },
    
    initShelfMap: function () {
        this.shelfMap = [
            {x: 40, y: 460},
            {x: 40, y: 435},
            {x: 40, y: 410},
            {x: 85, y: 460},
            {x: 85, y: 435},
            {x: 85, y: 410}
        ];
    },
    
    reOrderToolContainer: function () {
        var toolManager = new ToolManager(this);
        toolManager.cleanToolContainer();
        for (var i = 0; i < Game.toolContainer.length; i++) {
            if (!cc.Point.CCPointEqualToPoint(Game.toolContainer[i].getPosition(), cc.ccp(this.shelfMap[i].x, this.shelfMap[i].y))) {
                var action = cc.MoveTo.create(0.1, cc.ccp(this.shelfMap[i].x, this.shelfMap[i].y));
                Game.toolContainer[i].runAction(action);
            }
        }
    },
        
    ccTouchesBegan:function (touches, event) {
        if (this._hook.state == "swing") {
            this._hook.launch(this.getDstPoint());
        }
        if(this._hook.state == "retrieve"){
            var con = Game.toolContainer;
            for (var i = con.length - 1; i >= 0; i--) {
                if(con[i].type == global.Tag.Bombshell){
                    con[i].onUse();
                }
            };
        }
    },

    draw: function () {
        this._super();
        //cc.renderContext.lineWidth = 2;
        cc.renderContext.strokeStyle = "#3f3e3e";
        cc.drawingUtil.drawLine(this._hook.getOriginPosition(), this._hook.getPosition());
    },
    
    setCurScore: function (score) {
        if (score != null && typeof(score) == "number") {
            this._cur_score = score
            this._lbCurScore.setString("Score: " + this._cur_score);
        }
    },
    
    setDstScore: function (score) {
        if (score != null && typeof(score) == "number") {
            this._dst_score = score
            this._lbDstScore.setString("Goal: " + this._dst_score);
        }
    },
    
    setTimeLimit: function (limit) {
        if (limit != null && typeof(limit) == "number") {
            this._time_limit = limit
        }
    },
    
    setRound: function (round) {
        if (round != null && typeof(round) == "number") {
            this._round = round
            this._lbRound.setString("Round: " + this._round);
        }
    },
    
    updateScore: function (inc) {
        this._cur_score += inc;
        this._lbCurScore.setString("Score: " + this._cur_score);

        if (this.mineContainer.length == 0) {
            Game.round++;
            Game.cur_score = this._cur_score;
            this.onNextGame()
        }
    },
    
    update:function (dt) {
        this.onTimeLimit();
        this.checkCollision();
        if (this.collectAction && this.collectAction.isDone()) {
            if (this.collectedObject != null) {
                //this.collectedObject.setIsVisible(false);
                this.updateScore(this.collectedObject.getValue());
                this.showMineValue(this.collectedObject);
                //this.removeChild(this.collectedObject);
                this.collectedObject = null;
                this.collectAction = null;
            }
        }
    },
        
    getDstPoint: function () {
        var size = cc.Director.sharedDirector().getWinSize();
        //var mx = size.width / 2;
        //var my = size.height - 50;
        var mx = this._hook.getPosition().x;
        var my = this._hook.getPosition().y;
        var desX = null;
        var desY = null;
        var border = 10;

        if (this._hook.state == "swing") {
            this._hook.stopSwing();
            var angle = this._hook.getRotation();
            if (angle > this._criticalAngle) {
                desX = 0 + border;
                desY = my - Math.tan(((90-angle)*Math.PI)/180) * mx;
            } else if (angle < this._criticalAngle && angle >0) {
                desX = mx - Math.tan((angle*Math.PI)/180) * my;
                desY = 0 + border;
            } else if (angle > (-this._criticalAngle) && angle < 0) {
                desX = mx + Math.tan((-angle*Math.PI)/180) * my
                desY = 0 + border;
            } else if (angle < -this._criticalAngle) {
                desX = size.width - border;
                desY = my - Math.tan(((90+angle)*Math.PI)/180) * mx;
            }
            return cc.ccp(desX, desY);
        }
        console.error("Could not get dstPosition");
    },
    
   checkCollision: function () {
        if (this._hook.getState() == "launch") {
            var distance = null;
            for (var i=0; i<this.mineContainer.length; i++) {
                if (this.mineContainer[i] != null) {
                    var xlen = Math.pow(this._hook.getPositionX() - this.mineContainer[i].getPositionX(), 2);
                    var ylen = Math.pow(this._hook.getPositionY() - this.mineContainer[i].getPositionY(), 2);
                
                    distance = Math.sqrt(xlen + ylen);  
                    if (distance < this.mineContainer[i].getCollisionLength()/2) {
                        if (this.mineContainer[i].type == global.Tag.Pig)
                            this.mineContainer[i].stopAllActions();

                        // 计算速度，path为物体位置到回收点的距离，this._hook_path为钩子的绳子最长长度
                        var path = Math.sqrt(Math.pow(this.mineContainer[i].getPositionX() - this._hook.getCollectPosition().x, 2)
                            + Math.pow(this.mineContainer[i].getPositionY() - this._hook.getCollectPosition().y, 2))
                        var speed = (this.mineContainer[i].weight/100) * (path/this._hook_path) * Game.Speed.retrieve*2; //Game.Speed.retrieve;

                        this.mineContainer[i].setPosition(cc.ccp(this._hook.getPositionX(), this._hook.getPositionY()));
                        
                        // 创建物体的返回动作
                        this.mineContainer[i].collectAction = cc.MoveTo.create(speed, this._hook.getCollectPosition());
                        this.collectAction = this.mineContainer[i].collectAction;
                        this.mineContainer[i].runAction(cc.Sequence.create(this.mineContainer[i].collectAction/*,cc.CallFunc.create(this,this.showMineValue)*/));
                        this.collectedObject = this.mineContainer[i];
                 
                        this.popMineObject(i);
                        this._hook.retrieve(speed);
                    }
                }
            }
        }
    },
    
    showMineValue: function (obj) {
        var stringToShow;
        if(obj.type >= 900 && obj.type <=905){
            stringToShow = "+"+obj.getValue().toString();
        }
        else if(obj.type >= 912 && obj.type <= 916 ){
            console.log(obj.type);
            switch(obj.type){
                case 912:
                    stringToShow = "+10 seconds!";
                    break;
                /*case 913:
                case 914:
                    stringToShow = "Nothing there...";
                    break;*/
                case 915:
                    stringToShow = "Hook error!";
                    break;
                case 916:
                    stringToShow = "Scanning";
                    break;
            }
        }
        var showBoard = cc.LabelBMFont.create(stringToShow, s_futura_fnt);
        showBoard.setPosition(cc.ccp(winSize.width/2 , winSize.height-100));
        this.addChild(showBoard,50);
        setTimeout(function(){showBoard.setIsVisible(false);},1000); 
    },

    popMineObject: function (index) {
        var container = []; 
        var j = 0;
        for (var i = 0; i < this.mineContainer.length; i++) {
            if (i == index) continue;
            container[j++] = this.mineContainer[i]
        }
        this.mineContainer = container;
    },
   
    onTimeLimit: function () {
        if (this._time_limit <= 0 && this._cur_score < this._dst_score) {
            this.onGameOver();
        } else if (this._time_limit <= 0 && this._cur_score >= this._dst_score) {
            Game.round++;
            Game.cur_score = this._cur_score;
            this.onNextGame();
        }
    },
    
    onGameOver:function () {
        Game.resume();
        saveRecord(this._cur_score);
        var scene = cc.Scene.create();
        scene.addChild(GameOverLayer.create());
        scene.addChild(GameControlMenu.create());
        cc.Director.sharedDirector().replaceScene(cc.TransitionFade.create(1.2, scene));
        this.getParent().removeChild(this);
    },
    
    onNextGame: function () {
        Game.cleanToolObjects();
		//saveRecord(this._cur_score);
        /*if(Game.round == 6){
            Game.round = 1;
        }*/
        /*
        if (Game.round == 6) {
            if (Game.unlock + 1 <= NUMBER_OF_MISSIONS) {
                Game.unlock++;
                if(typeof(Storage)!=="undefined") {
                    if (Game.unlock > Number(localStorage.unlock)) localStorage.unlock = Game.unlock;
                } else {
                    console.error("Sorry! No web storage support..");
                }
            }
        }
        */
        //if (Game.round != NUMBER_OF_ROUNDS) {
        var scene = cc.Scene.create();
        scene.addChild(StoreLayer.create());
        scene.addChild(GameControlMenu.create());
        cc.Director.sharedDirector().replaceScene(cc.TransitionFade.create(1.2, scene));
        this.getParent().removeChild(this);
        /*} else {
            var scene = cc.Scene.create();
            scene.addChild(MissionLayer.create());
            scene.addChild(GameControlMenu.create());
            //MissionLayer.moveToMission(Game.mission);
            cc.Director.sharedDirector().replaceScene(cc.TransitionFade.create(1.2, scene));
            this.getParent().removeChild(this);
        }*/
        
    },
    
    onReturn: function () {
        var scene = cc.Scene.create();
        scene.addChild(StartLayer.create());
        cc.Director.sharedDirector().replaceScene(cc.TransitionFade.create(1.2, scene));
        this.getParent().removeChild(this);
    }
});

singleGameLayer.create = function () {
    var sg = new singleGameLayer();
    if (sg && sg.init()) {
        return sg;
    }
    return null;
};

singleGameLayer.scene = function () {
    var scene = cc.Scene.create();
    var layer = singleGameLayer.create();
    scene.addChild(layer, 1);
    return scene;
};
