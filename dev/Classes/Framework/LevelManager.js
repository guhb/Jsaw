var LevelManager = cc.Class.extend({
    _currentRound: null,
    _currentMission: null,
    _gameLayer: null,
    addQ:300,
    ctor: function (gameLayer) {
        if (!gameLayer) {
            throw "gameLayer must be non-nil";
        }
        this._currentRound = Game.round;
        this._currentMission = Game.mission;
        this._gameLayer = gameLayer;
    },

    _minuteToSecond: function (minuteStr) {
        if (!minuteStr)
            return 0;
        if (typeof(minuteStr) !=  "number") {
            var mins = minuteStr.split(':');
            if (mins.length == 1){
                return parseInt(mins[0]);
            } else {
                return parseInt(mins[0] )* 60 + parseInt(mins[1]);
            }
        }
        return minuteStr;
    },

    // 更新关卡的时间限制，目标分数等信息
    updateGameStatus: function () {
        Game.dst_score = this.getDstScore(Game.round);
        this._gameLayer.setDstScore(Game.dst_score);
        this._gameLayer.setCurScore(Game.cur_score);
        this._gameLayer.setRound(Game.round);
        //this._gameLayer._time_limit = Game.time_limit;
    },

    getDstScore:function(round) {
        var temp = Game.dst_score;
        if(round <= 1)
        {
            temp = 600;
        }
        else if(round <= 5 && round >1)
        {
            temp += 500;
        }
        else if(round >5 && round < 10)
        {
            this.addQ = 300 * (round - 4);
            temp += this.addQ;
        }
        else if(round >= 10)
        {
            temp += 2700;
        }
        return temp;
    },

    // 根据Level.js里面的Round信息，创建地图
    createMap:function(){
        if(Game.difficulty >= 3)
            Game.difficulty = 3;
        var difficulty = Game.difficulty - 1;
        //var difficulty = 2;
        console.log(Game.difficulty);
        this._gameLayer.mineContainer = [];
        var round = (this._currentRound - 1) % NUMBER_OF_ROUNDS;
        //var round = 2;

        this.updateGameStatus();
        // 生成物品MineObject
        for (var i=0; i<Round[difficulty][round].length; i++) {
            var size = Math.round(Math.random()),
                type = getObjectName(Round[difficulty][round][i].type),
                mine = new MineType[type].create(Round[difficulty][round][i], size);
            if (mine != null) {
                this._gameLayer.addChild(mine, mine.zOrder, mine.type);
                this._gameLayer.mineContainer.push(mine);
            } 
        }
              
        // 生成道具（问号物品），位置目前还是随机生成的
        var mission = this._currentMission;
        this._gameLayer.propContainer = [];
        var object = {};
        object.x = Math.random() * winSize.width;
        
        if (object.x <= 0) ojbect.x = 40;
        else if (object.x >= winSize.width) object.x = winSize.width - 20;
        
        object.y = Math.random() * winSize.height - 170;
        if (object.y <= 0) object.y = 40;
        else if (object.y >= winSize.height - 70) ojbect.y = 40;
        
        var type = Mission[0].props[round%3];
        //var type = Math.floor(Math.random()*3);
        object.type = global.Tag[type]; 
        var prop = new PropType[type].create(object);
        this._gameLayer.addChild(prop, global.zOrder.Prop);
        this._gameLayer.mineContainer.push(prop);
    }
});