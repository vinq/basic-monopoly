App = new function () {

    // cb when app loads
    this.load = function() { 
        
    }
    /*
    // sets value from input to db
    this.set = function(){
        var self = this;

        var memo1 = document.getElementsByName("memo1")[0].value.trim();
        var memo2 = document.getElementsByName("memo2")[0].value;
        
        if (memo1 && memo2){
            db.set(memo1, memo2, function(obj){                
                self.fillSelect();
            });
        }
    };

    // gets value from db to input
    this.get = function(){
        var memo1 = document.getElementsByName("memo1")[0].value;
        var memo2 = document.getElementsByName("memo2")[0];
        db.get(memo1, function (err, doc) {
            if (!err) {
                memo2.value = doc.value;
            }
        })
    }

    // selects variable
    this.select = function() {
        var memo3 = document.getElementsByName("memo3")[0].value;
        var memo1 = document.getElementsByName("memo1")[0];
        memo1.value = memo3;
    }

    // fills controls with values
    this.fillSelect = function(){
        var memo3 = document.getElementsByName("memo3")[0];

        db.getKeys(function(err, docs) {
            console.log(docs, err ,'test')
            if (!err && docs && docs.rows.length) {
                memo3.innerHTML = "";
                for (var row of docs.rows) {
                    memo3.innerHTML += "<option>"+row.key+"</option>";
                }
            }
        })
    }
    */
};

Monopoly = function() {

    this.AI = {}

    this.AI.getAnswer = function(e) {
        return Random.getRandomBool();
    }

    this.money = function(playerName, money, text){
        document.dispatchEvent(new CustomEvent("money", {
            detail: {
                playerName: playerName,
                money: money,
                text: text
            }
        }));
    }

    this.reCountFields = function(algorithm){   
        for (var player of algorithm.players) {
            var maxPlayerFieldCount = 0;

            for (var f in selfGame.Fields) {
                if (player.fieldsPercents[f] > maxPlayerFieldCount) {
                    
                }
            }
        }
    }

    this.Board = function(options = {}){
        this.array = [];
        this.name = Random.getRandomName(); 
        this.events = {};

        var selfBoard = this;

        this.init = function(cellsCount){
            for(var i = 0;i < cellsCount; i++) {
                selfBoard.array[i] = new selfGame.Firm();
            }
        }

        this.getBoardEvent = function(options) {
            var e = new selfGame.BoardEvent(options);
            selfBoard.events[e.name] = e;
            return e;
        }

        this.getQuestion = function(e) {
            var question, alert, buy = false, status, moneyCharge = 0;
            var field = e.firm.field;
            
            moneyCharge = Random.getRandomArbitrary(-100, 100);

            var pluses = selfGame.Fields[field.name].plus;
            var minuses = selfGame.Fields[field.name].minus;

            if (moneyCharge > 0) {
                var randomPlus = Random.getRandomArbitrary(0, pluses.length);
                question = pluses[randomPlus];
            }

            if (moneyCharge < 0) {
                var randomMinus = Random.getRandomArbitrary(0, minuses.length);
                question = minuses[randomMinus];
            }

            alert = false;

            if ((e.firm.canBuy) && (e.player.canBuy(e.firm))) {
                question = "buy? " + e.firm.name + " " + e.firm.field.name + " " + e.firm.cost.price
                moneyCharge = e.firm.cost.price;
                buy = true;
                alert = true;
            }

            status = moneyCharge > 0 ? Random.getRandomArbitrary(0, 5) : Random.getRandomArbitrary(-5, 0);
            var q = {
                text: question,
                type: question,
                moneyCharge: moneyCharge,
                status: status,
                alert: alert,
                buy: buy
            };

            selfBoard.events[e.name].question = q;
            return q;
        }

        this.html = function(players){
            var html = "", i = 0, cellPlayered = "", cellBoted = "";

            for (var firm of selfBoard.array) {
                var inCellPlayer = "";

                for (var player of players) {
                    inCellPlayer += i == player.positions[selfBoard.name] ? player.name + " " : "";

                    if (player.name == firm.owner.name) {
                        player.bot ? (cellBoted = " cellBoted "): (cellPlayered = " cellPlayered ");
                    }
                }

                html += "<div data-position='" + i + "' class='cell" + cellPlayered + cellBoted + "'>" + firm.name + "     " + inCellPlayer + "</div>";
                
                cellBoted = "";
                cellPlayered = "";

                i++;
            }

            return html;
        }

        this.init(options.cellsCount);
    };

    this.BoardEvent = function(options = {}) {
        this.name = Random.getRandomName();
        this.done = false;

        var firm = options.board.array[options.position];
        var selfEvent = this;

        selfEvent.firm = firm;
        selfEvent.player = options.player;

        this.do = function(answer){
            if (firm.canBuy && options.player.canBuy(firm) && answer) {
                firm.buy(options);
                options.player.owns.push(firm);

                selfGame.money(options.player.name, selfEvent.question.moneyCharge, "buy");
            }

            if (selfEvent.question.moneyCharge && !selfEvent.question.buy) {           
                selfGame.money(options.player.name, selfEvent.question.moneyCharge, "surprize " + selfEvent.question.type);
            }

            if (!firm.canBuy && firm.tax) {
                selfGame.money(options.player.name, -firm.tax, "tax");
                selfGame.money(firm.owner.name, firm.tax, "tax");
            }

            selfEvent.done = true;
        }
    }

    this.Fields = [];

    var selfGame = this;

    (function(){

        selfGame.Fields["government"] = {
           name: "government",
            power: 99,
            loyalty: 30,
            plus: ["grant", "treasure", "percents"],
            minus: ["penalty", "commission", "percents", "revolution"]
        }

        selfGame.Fields["military"] = {
            name: "military",
            power: 90,
            loyalty: 20,
            plus: ["duty", "investment"],
            minus: ["war", "conflict", "duty"]
        }

        selfGame.Fields["police"] ={
            name: "police",
            power: 80,
            loyalty: 40,
            plus: ["duty", "investment"],
            minus: ["reform", "court penalty", "duty", "jail"]
        }

        selfGame.Fields["medical"] = {
            name: "medical",
            power: 60,
            loyalty: 40,
            plus: ["duty", "investment", "insurance"],
            minus: ["reform", "court penalty", "duty", "insurance", "trauma", "sickness"]
        }

        selfGame.Fields["media"] = {
            name: "media",
            power: 60,
            loyalty: 50,
            plus: ["article", "interview", "report", "tv show", "sensation", "investment"],
            minus: ["duty", "olympics", "championship"]
        }

        selfGame.Fields["business"] = {
            name: "business",
            power: 40,
            loyalty: 60,
            plus: ["investment", "technical revolution", "percents"],
            minus: ["percents"]
        }

        selfGame.Fields["charity"] = {
            name: "charity",
            power: 20,
            loyalty: 90,
            plus: ["donations", "patronism"],
            minus: ["crisys"]
        }

        selfGame.Fields["fermers"] = {
            name: "fermers",
            power: 10,
            loyalty: 99,
            plus: ["agrar revolution", "harvest", "percents", "weather"],
            minus: ["duty", "illneses", "weather"]
        }
    })()

    this.Player = function(options = {}) {
        this.bot = !options.human;
        this.name = Random.getRandomName();
        this.status = 10;
        this.owns = [];
        this.positions = [];
        this.positions[options.board.name] = 0;
        this.money = 1000;
        this.options = options;
        this.power = 10;
        this.loyalty = 10;
        this.fieldsPercents = {};

        this.gameGo = new Event("gameGo");
        this.gamePause = new Event("gamePause");

        var selfPlayer = this;

        this.reCount = function(){
            var ownsLength = selfPlayer.owns.length, sumPower = 0, sumLoyalty = 0, fieldsArray = {};

            for(var i=0;i<ownsLength;i++){
                selfPlayer.status += selfPlayer.owns[i].cost.status / 100;
                sumPower += selfPlayer.owns[i].field.power;
                sumLoyalty += selfPlayer.owns[i].field.loyalty;

                if (!fieldsArray[selfPlayer.owns[i].field.name]) {
                    fieldsArray[selfPlayer.owns[i].field.name] = 0;
                }

                fieldsArray[selfPlayer.owns[i].field.name]++;
            }

            selfPlayer.power = Math.ceil(sumPower / ownsLength);
            selfPlayer.loyalty = Math.ceil(sumLoyalty / ownsLength);
            selfPlayer.fieldsPercents = fieldsArray;
        }

        this.html = function(){
            var html = "<div id=" + selfPlayer.name + " class='player'>";

            html += "bot:" + selfPlayer.bot + ";\r\n"
            html += "name:" + selfPlayer.name + ";\r\n"
            html += "status:" + selfPlayer.status + ";\r\n"
            html += "money:" + Math.ceil(selfPlayer.money) + ";\r\n";

            var owns = "";
            for(var i in selfPlayer.owns) {
                owns += selfPlayer.owns[i].html();
            }

            html += owns + "</div>";
            return html;
        }

        this.turn = function(board) {
            var question = {};

            do {
                var position = selfPlayer.positions[board.name];
                position += Random.rollDices();

                if (position >= board.array.length) {
                    position = position - board.array.length;
                    selfGame.money(selfPlayer.name, selfPlayer.options.cycleBonus, "cycle done");
                }

                selfPlayer.positions[board.name] = position;

                var options = {
                    player: selfPlayer,
                    board: board,
                    position: position
                }

                var e = board.getBoardEvent(options);
                question = board.getQuestion(e);
            } while (question.position)


            var turnEvent = new CustomEvent("turn", {
                detail: {
                    question: question,
                    cb: function(answer){
                        e.do(answer);
                        document.dispatchEvent(selfPlayer.gameGo)
                    }
                }
            });

            if (question.alert) {
                document.dispatchEvent(selfPlayer.gamePause);
                document.dispatchEvent(turnEvent);
            }            
        }

        this.turnSelf = function(board) {            
            var question = {};

            do {        
                var position = selfPlayer.positions[board.name];
                position += Random.rollDices();

                if (position >= board.array.length) {
                    position = position - board.array.length;
                    selfGame.money(selfPlayer.name, selfPlayer.options.cycleBonus, "cycle done");
                }

                selfPlayer.positions[board.name] = position;

                var options = {
                    player: selfPlayer,
                    board: board,
                    position: position
                }

                var e = board.getBoardEvent(options);
                question = board.getQuestion(e);
                e.do(selfGame.AI.getAnswer(e));
            } while (question.position)
        }

        this.canBuy = function(firm) {
            return firm.cost.price <= selfPlayer.money && firm.cost.status <= selfPlayer.status;
        }
    }

    this.Firm = function(options = {}) {
        this.name = Random.getRandomName();
        this.q = Random.getRandomQ();
        this.field = Random.getRandomArrayValue(selfGame.Fields);
        this.owner = options.owner ? options.owner: false;
        this.canBuy = true;

        // this.check = new Event("firmCheck");

        var options = {
            field: this.field
        };

        this.cost = Random.getRandomCost(options);
        this.tax = this.q * (this.cost.status * this.cost.price) / 10;

        var selfFirm = this;

        // this.check = function(e){
            
        // }

        this.buy = function(options = {}){
            selfFirm.owner = options.player;
            selfFirm.canBuy = false;
        }

        this.html = function(){
            var html = "<div class='firm'>";
            
            html += "firm name:" + selfFirm.name + ";\r\n";
            html += "firm field name:" + selfFirm.field.name + ";\r\n";
            html += "canBuy:" + selfFirm.canBuy + ";\r\n";
            html += "price:" + selfFirm.cost.price + ";\r\n";
            html += "status:" + selfFirm.cost.status + ";\r\n";
            html += "tax:" + Math.ceil(selfFirm.tax) + ";\r\n";

            html += "</div>";

            return html;
        }
    }

    this.BaseAlgorithm = function(options = {}) {
        this.gameTime = 0;
        this.players = [];
        this.options = options;

        this.draw = new Event("draw");

        var selfBaseAlgorithm = this;

        this.timerTick = function(){
            this.gameTime++;
            selfBaseAlgorithm.doIteration();
        }

        this.doIteration = function(){
            selfBaseAlgorithm.turnPlayers();
            selfBaseAlgorithm.countPlayers();

            document.dispatchEvent(selfBaseAlgorithm.draw);
        } 

        this.createPlayers = function(playersCount, botsCount, board, bonus){
            for(var i=0;i<playersCount;i++){
                selfBaseAlgorithm.players.push(new selfGame.Player({human: i<(playersCount-botsCount), board: board, cycleBonus: bonus}))
            }
        }

        this.countPlayers = function(){
            var length = selfBaseAlgorithm.players.length;

            for(var i=0;i<length;i++){
                selfBaseAlgorithm.players[i].reCount();
            }
        }

        this.turnPlayers = function(){
            var length = selfBaseAlgorithm.players.length;

            for(var i=0;i<length;i++){
                var player = selfBaseAlgorithm.players[i];
                if (player.bot){
                    player.turnSelf(selfBaseAlgorithm.board)
                } else {
                    player.turn(selfBaseAlgorithm.board);
                }
            }
        }
        
        this.getTheWinner = function(){
            var length = selfBaseAlgorithm.players.length;
            var maxPlayerCount, winner;

            for(var i = 0; i < length; i++){
                var player = selfBaseAlgorithm.players[i];

                var playerQuantity = player.owns.length;
                var playerPower = player.power;
                var playerLoyalty = player.loyalty;

                var playerCount = (playerPower * 0.5 + playerLoyalty * 0.3) * playerQuantity;

                if (playerCount > maxPlayerCount) {
                    maxPlayerCount = playerCount;
                    winner = player.name;
                }
            }
            return winner;
        }

        this.countFields = function() {
            for (var field of selfGame.Fields) {

            }
        }

        this.createGame = function() {
            var interval;

            document.addEventListener("gameGo", function(){
                interval = setInterval(function(){
                    selfBaseAlgorithm.timerTick();
                }, options.speed);
            });

            document.addEventListener("gamePause", function(){
                clearInterval(interval); 
            });

            selfBaseAlgorithm.board = new selfGame.Board(options.board);
            selfBaseAlgorithm.createPlayers(options.playersCount, options.botsCount, selfBaseAlgorithm.board, options.bonus);

            interval = setInterval(function(){
                selfBaseAlgorithm.timerTick();
            }, options.speed);
        }
    }

    this.drawBoard = function(algorithm) {
        $(algorithm.options.boardcard).html("");
        $(algorithm.options.players).html("");
        $(algorithm.options.fields).html("");

        $(algorithm.options.boardcard).append(algorithm.board.html(algorithm.players));

        for(var player of algorithm.players) {
            $(algorithm.options.players).append(player.html())
        }

        for(var i in selfGame.Fields) {
            var html = "<div class='field'>";
            html += selfGame.Fields[i].name + ";\r\n";
            html += selfGame.Fields[i].power + ";\r\n";
            html += selfGame.Fields[i].loyalty + ";</div>";
            $(algorithm.options.fields).append(html);
        }
    }

    this.init = function(){
        var options = {
            speed: 4000,
            bonus: 100,
            playersCount: 3,
            botsCount: 2,
            players: ".players-card",
            fields: ".fields-cards",
            boardcard: ".board",
            board: {
                cellsCount: 50
            }
        };

        var ba = new selfGame.BaseAlgorithm(options);
        ba.createGame();

        document.addEventListener("draw", function(){
            selfGame.drawBoard(ba);
        });

        document.addEventListener("turn", function(e){            
            if (confirm(e.detail.question.text)) {
                e.detail.cb(true)
            } else {
               e.detail.cb(false);
            }
        }); 

        document.addEventListener("money", function(e){            
            for (var i in ba.players) {
                if (ba.players[i].name == e.detail.playerName) {
                    ba.players[i].money += e.detail.money;

                    $(".events-card").append("<option>" + ba.players[i].name + " " + Math.ceil(e.detail.money) + " " + e.detail.text + "</option>")
                }
            }
        });


        $(document).on("click", ".cell", function(e) {
            var position = $(e.currentTarget).data("position");
            alert(ba.board.array[position].html());
        });
    }

    this.init();
}