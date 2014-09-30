//ゲーム処理=====================================
var Game = function(canvasId, stage) {
	// 変数宣言
	this.size = canvasSize;
	this.cell = stage.cellType.cellSize;
	this.stage = stage;
	this.canvas = new Canvas(canvasId);
	this.ownItem;
	this.objects = new Array(this.size / this.cell);
	for (var i = 0; i < this.objects.length; i++) {
		this.objects[i] = new Array(this.size / this.cell);
	}

	this.timer;
	this.drawScore1;
	this.drawScore2;
	this.drawScore3;

	this.commandList = new Array();
	this.commandField = $("#commandField");
	var startif = false;
	var startIndex = 0;
	this.commandCount = 0;
	this.stepCount = 0;
};

// メソッド
Game.prototype = {
	initialize : function() {
		this.canvas.clear();
		this.drawChequered();
		this.stage.initialize();
		this.drawItems();
		// 設定値の初期化
		this.commandCount = 0;
		this.stepCount = 0;
		samePositionCount = 0;
		this.redrawCommand();
		this.redrawStep();
		$("#redWall").removeAttr("disabled");
		$("#endif").attr("disabled", "disabled");
	},
	drawChequered : function() {
		var gameCanvas = this.canvas.getCanvas();
		var ctx = gameCanvas.getContext('2d');
		ctx.lineWidth = 1;
		ctx.strokeStyle = "#ccc";
		// 縦
		for (var i = 1; i < (this.size / this.cell); i++) {
			ctx.beginPath();
			ctx.moveTo(this.cell * i, 0);
			ctx.lineTo(this.cell * i, this.size);
			ctx.closePath();
			ctx.stroke();
		}
		// 横
		for (var i = 1; i < (this.size / this.cell); i++) {
			ctx.beginPath();
			ctx.moveTo(0, this.cell * i);
			ctx.lineTo(this.size, this.cell * i);
			ctx.closePath();
			ctx.stroke();
		}
	},
	drawItems : function() {
		var gameCanvas = this.canvas.getCanvas();
		var ctx = gameCanvas.getContext('2d');

		this.objects = new Array(this.size / this.cell);
		for (var i = 0; i < this.objects.length; i++) {
			this.objects[i] = new Array(this.size / this.cell);
		}
		var items = this.stage.items;
		// 表示位置を座標に変換
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			this.drawItem(ctx, item);
			if (item.itemType == ITEM_TYPE.own) {
				this.ownItem = item;
			}
			this.objects[item.position.x][item.position.y] = item;
		}
	},
	drawItem : function(ctx, item) {
		if (item.itemType.image != "none") {
			drawImage(ctx, item, this.cell);
		} else {
			var positionX = item.position.x * this.cell;
			var positionY = item.position.y * this.cell;
			switch (item.itemType.id) {
			case ITEM_TYPE.own.id:
				break;
			case ITEM_TYPE.redWall.id:
				ctx.fillStyle = "#f88";
				ctx.fillRect(positionX + 5, positionY + 5, this.cell - 10,
						this.cell - 10);
				ctx.fillStyle = "#fcc";
				ctx.fillRect(positionX + 20, positionY + 20, this.cell - 40,
						this.cell - 40);
				break;
			case ITEM_TYPE.blueWall.id:
				ctx.fillStyle = "#88f";
				ctx.fillRect(positionX + 5, positionY + 5, this.cell - 10,
						this.cell - 10);
				ctx.fillStyle = "#ccf";
				ctx.fillRect(positionX + 20, positionY + 20, this.cell - 40,
						this.cell - 40);
				break;
			default:
				// 残りは後で実装
				break;
			}
		}
	},
	moveMouse : function(positionX, positionY) {
		var gameCanvas = this.canvas.getCanvas();
		var ctx = gameCanvas.getContext('2d');
		// 移動先が枠外かどうか判定
		var fieldSize = this.size / this.cell;
		if (positionX < 0 || fieldSize <= positionX || positionY < 0
				|| fieldSize <= positionY) {
			return false;
		}
		// ownを探す
		for (var i = 0; i < this.stage.items.length; i++) {
			if (this.stage.items[i].itemType == ITEM_TYPE.own) {
				var ownPositionX = this.stage.items[i].position.x * this.cell;
				var ownPositionY = this.stage.items[i].position.y * this.cell;
				ctx.fillStyle = "#fff";
				ctx.fillRect(ownPositionX + 1, ownPositionY + 1, this.cell - 2,
						this.cell - 2);
				this.stage.items[i].position.x = positionX;
				this.stage.items[i].position.y = positionY;
				drawImage(ctx, this.stage.items[i], this.cell);
			}
		}
		return true;
	},
	reloadMouse : function() {
		var gameCanvas = this.canvas.getCanvas();
		var ctx = gameCanvas.getContext('2d');
		// ownを探す
		for (var i = 0; i < this.stage.items.length; i++) {
			if (this.stage.items[i].itemType == ITEM_TYPE.own) {
				var ownPositionX = this.stage.items[i].position.x * this.cell;
				var ownPositionY = this.stage.items[i].position.y * this.cell;
				ctx.fillStyle = "#fff";
				ctx.fillRect(ownPositionX + 1, ownPositionY + 1, this.cell - 2,
						this.cell - 2);
				//自分の下が壁だったら壁を描画
				var under = this.objects[this.stage.items[i].position.x][this.stage.items[i].position.y];
				if(typeof under != "undefined") {
					this.drawItem(ctx, under);
				}
				drawImage(ctx, this.stage.items[i], this.cell);
			}
		}
	},
	run : function(isStepRun) {
		var game = this;
		// 実行ボタンを非アクティブ化
		$("#step").attr("disabled", "disabled");
		$("#run").attr("disabled", "disabled");
		$("#stop").removeAttr("disabled");

		this.stepCount++;
		this.redrawStep();

		var firstStep = true;
		var zanki = this.stage.maxStep - this.stepCount;
		this.timer = setInterval(function() {
			var command = game.commandList[game.commandCount];
			// 実行ステップをハイライト化
			$(".runCommand").removeClass("currentCommand");
			if (firstStep) {
				firstStep = false;
				return;
			}
			$(".index" + command.index).addClass("currentCommand");

			// 処理を実行
			if (!command.exec(game)) {
				// 処理結果がfalseの場合終了する
				game.gameover();
				return;
			}

			game.commandCount++;
			if (game.commandCount >= game.commandList.length) {
				game.commandCount = 0;
				if (isStepRun) {
					if(zanki <= 0) {
						game.gameOver();
					}
					game.stopTimer();
				}
			}
		}, 500);
	},
	stopTimer : function() {
		clearInterval(this.timer);
		$("#step").removeAttr("disabled");
		$("#run").removeAttr("disabled");
	},
	stop : function() {
		clearInterval(this.timer);
		$("#run").removeAttr("disabled");
		this.clearCommand();
		this.initialize();
	},
	gameover : function() {
		this.stop();
		$("#gameover").show();
		samePositionCount = 0;
	},
	clear : function() {
		clearInterval(this.timer);
		clearInterval(this.drawScore1);
		clearInterval(this.drawScore2);
		clearInterval(this.drawScore3);
		currentGame.stage.cleared = true;
		$("#run").removeAttr("disabled");
		$("#stop").attr("disabled", "disabled");
		if (stageController.hasNext()) {
			$(".init").hide();
			$(".nextStage").show();
		} else {
			$(".init").show();
			$(".nextStage").hide();
		}
		$("#gameclear").show();
		samePositionCount = 0;

		//点数表示
		var commandSize = this.commandList.length;
		var stepSize = this.stepCount;
		var commandScore = 50 - ((commandSize - this.stage.minCommand) * this.stage.commandScore);
		if(commandScore <= 10) {
			commandScore = 10;
		}
		var stepScore = 50 - ((stepSize - this.stage.minStep) * this.stage.stepScore);
		if(stepScore <= 10) {
			stepScore = 10;
		}
		//スコア表示のアニメーション
		$("#commandScore").html("0");
		$("#stepScore").html("0");
		$("#totalScore").html("0");
		var count = 0;
		var flg = 0;
		var game = this;
		this.drawScore1 = setInterval(function() {
			if(flg != 0) {
				console.log(flg);
				return;
			}
			count++;
			$("#commandScore").html(count);
			if(count >= commandScore) {
				clearInterval(game.drawScore1);
				count = 0;
				flg = 1;
			}
		}, 30);
		this.drawScore2 = setInterval(function() {
			if(flg != 1) {
				return;
			}
			count++;
			$("#stepScore").html(count);
			if(count >= stepScore) {
				clearInterval(game.drawScore2);
				count = 0;
				flg = 2;
			}
		}, 30);
		this.drawScore3 = setInterval(function() {
			if(flg != 2) {
				return;
			}
			count++;
			$("#totalScore").html(count);
			if(count >= commandScore + stepScore) {
				clearInterval(game.drawScore3);
				count = 0;
				flg = 3;
			}
		}, 30);
	},
	clearCommand : function() {
		this.commandList = new Array();
		this.redrawCommand();
		$("#redWall").removeAttr("disabled");
		$("#endif").attr("disabled", "disabled");
	},
	addCommand : function(targetCommand) {
		var index = this.commandList.length;
		var command;
		for (i in COMMAND_TYPE) {
			var c = COMMAND_TYPE[i];
			if (c == targetCommand) {
				command = new c.commandObject(index);
			}
		}
		this.commandList.push(command);

		if(targetCommand == COMMAND_TYPE.redWall) {
			//もしボタンをdisableにして終わりをableに
			$("#redWall").attr("disabled", "disabled");
			$("#endif").removeAttr("disabled");
		} else if(targetCommand == COMMAND_TYPE.endif) {
			$("#endif").attr("disabled", "disabled");
		}

		this.redrawCommand();
	},
	redrawCommand : function() {
		var startif = false;
		for (var i = 0; i < commandMax; i++) {
			var strCommand = "";
			var strComment = "";
			if (this.commandList.length > i) {
				var command = this.commandList[i];
				strCommand = command.command;
				strComment = command.comment;
				if (startif) {
					if (typeof command.commandType.startif != "undefined") {
						startif = command.commandType.startif;
					}
				}
			}
			// trの取得
			var tr = $(".index" + i);
			var c = $(tr.children(".command")[0]);
			if (startif) {
				c.addClass("indent");
			} else {
				c.removeClass("indent");
			}
			c.html(strComment);

			var l = $(tr.children(".logic")[0]);
			if (startif) {
				l.addClass("indent");
			} else {
				l.removeClass("indent");
			}
			if(strCommand.indexOf("if") != -1) {
				l.addClass("startif");
			} else if(strCommand.indexOf("}") != -1) {
				//ひとつ上のlogicに { をつける
				var startiftd = $(".startif");
				if(startiftd.length != 0) {
					var s = $(startiftd[startiftd.length - 1]);
					if(s.html().indexOf("{") == -1) {
						s.html(s.html() + "{");
					}
				}
			}
			l.html(strCommand);

			if (this.commandList.length > i) {
				// 今後endifがなければフラグは落とす
				var hasEndIf = false;
				for (var j = i; j < this.commandList.length; j++) {
					var futureCommand = this.commandList[j];
					if (typeof futureCommand.commandType.startif != "undefined"
							&& !futureCommand.startif) {
						hasEndIf = true;
					}
				}
				if (!hasEndIf) {
					startif = false;
				} else {
					if (typeof command.commandType.startif != "undefined") {
						startif = command.commandType.startif;
					}
				}
			}
		}

		//実行ボタンの押下制御
		if(this.commandList.length == 0) {
			$("#step").attr("disabled", "disabled");
			$("#run").attr("disabled", "disabled");
		} else {
			$("#step").removeAttr("disabled");
			$("#run").removeAttr("disabled");
		}
	},
	redrawStep : function() {
		var zanki = this.stage.maxStep - this.stepCount;
		var area = $("#stepCountArea");
		area.html("");
		for (var i = 0; i < zanki; i++) {
			var img = $("<img>");
			img.attr({
				src : "./images/count.png"
			});
			area.append(img);
		}
		for (var i = 0; i < this.stepCount; i++) {
			var img = $("<img>");
			img.attr({
				src : "./images/count_end.png"
			});
			area.append(img);
		}
	},
	removeLastCommand : function() {
		var index = this.commandList.length - 1;
		this.commandList.splice(index, 1);
		$("#command_" + index).remove();
	},
	dispose : function() {
		clearInterval(this.drawScore1);
		clearInterval(this.drawScore2);
		clearInterval(this.drawScore3);
	},
};

function drawImage(ctx, item, cell) {
	var positionX = item.position.x * cell;
	var positionY = item.position.y * cell;
	var src = "images/" + item.itemType.image;
	src += item.direction.extention;
	src += ".png?" + new Date().getTime();
	var img = new Image();
	img.src = src;
	var $img = $(img);
	$img.data("x", positionX + 1);
	$img.data("y", positionY + 1);
	$img.data("size", cell - 2);
	img.onload = function() {
		ctx.drawImage(img, $(this).data("x"), $(this).data("y"), $(this).data(
				"size"), $(this).data("size"));
	}
}

var Canvas = function(canvasId) {
	this.canvasId = canvasId;
	this.getCanvas = function() {
		var canvas = $("#" + this.canvasId)[0];
		if (typeof G_vmlCanvasManager != 'undefined') {
			canvas = G_vmlCanvasManager.initElement(canvas);
		}
		if (typeof canvas == 'undefined') {
			alert("canvaが取得できませんでした。 canvas id is " + this.canvasId);
		}
		return canvas;
	};
	this.clear = function() {
		var canvas = this.getCanvas();
		var ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, canvasSize, canvasSize);
	}
}
