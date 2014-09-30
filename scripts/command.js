//コマンド宣言========================================================
var Command = function(command, comment, index, commandType) {
	this.command = command;
	this.comment = comment;
	this.index = index;
	this.commandType = commandType;
	this.getNextItem = function(game) {
		var position = this.getNextPosition(game);
		if(position.x < 0 || position.y < 0) {
			return undefined;
    }
		var object = game.objects[position.x][position.y];
		return object;
  };
	this.getCurrentItem = function(game) {
		var position = this.getCurrentPosition(game);
		if(position.x < 0 || position.y < 0) {
			return undefined;
    }
		var object = game.objects[position.x][position.y];
		return object;
	};
	this.getNextPosition = function(game) {
		var ownItem = game.ownItem;
		var positionX = ownItem.position.x;
		var positionY = ownItem.position.y;
		var direction = ownItem.direction;
		switch(direction) {
			case directionType.north:
				positionY--;
				break;
			case directionType.south:
				positionY++;
				break;
			case directionType.east:
				positionX++;
				break;
			case directionType.west:
				positionX--;
				break;
		}
		return new Position(positionX, positionY);
  };
	this.getCurrentPosition = function(game) {
		return game.ownItem.position;
	}
}

var CommandRedWall = function(index) {
	Command.apply(this, ["if ( isNextRedWall() ) {", "もし赤いマスの上に乗ったら", index, COMMAND_TYPE.redWall]);
	this.exec = function(game) {
		var object = this.getCurrentItem(game);
		if(typeof object == "undefined" || object.itemType != ITEM_TYPE.redWall) {
			//移動先が赤い壁でなければ、endifまで、commandCountを飛ばす
			var hasEndIf = false;
			for(var i = game.commandCount; i < game.commandList.length; i++) {
				if(game.commandList[i].commandType == COMMAND_TYPE.endif) {
					game.commandCount = i - 1;
					hasEndIf = true;
					break;
				}
      }
			if(!hasEndIf) {
				game.commandCount++;
			}
		}
		return true;
  };
}
CommandRedWall.prototype = new Command;

var CommandBlueWall = function(index) {
	Command.apply(this, ["if ( isNextRedWall() ) {", "もし青いマスの上に乗ったら", index, COMMAND_TYPE.blueWall]);
	this.exec = function(game) {
		var object = this.getCurrentItem(game);
		if(typeof object == "undefined" || object.itemType != ITEM_TYPE.blueWall) {
			//移動先が赤い壁でなければ、endifまで、commandCountを飛ばす
			var hasEndIf = false;
			for(var i = game.commandCount; i < game.commandList.length; i++) {
				if(game.commandList[i].commandType == COMMAND_TYPE.endif) {
					game.commandCount = i - 1;
					break;
				}
      }
			if(!hasEndIf) {
				game.commandCount++;
			}
		}
		return true;
  };
}
CommandBlueWall.prototype = new Command;

var CommandEndIf = function(index) {
	Command.apply(this, ["}", "もしはここで終わり", index, COMMAND_TYPE.endif]);
	this.exec = function(game) {
		return true;
  };
}
CommandEndIf.prototype = new Command;

var CommandTurnRight = function(index) {
	Command.apply(this, ["turnRight();", "右を向く", index, COMMAND_TYPE.turnRight]);
	this.exec = function(game) {
		var ownItem = game.ownItem;
		var direction = ownItem.direction;
		switch(direction) {
			case directionType.north:
				direction = directionType.east;
				break;
			case directionType.south:
				direction = directionType.west;
				break;
			case directionType.east:
				direction = directionType.south;
				break;
			case directionType.west:
				direction = directionType.north;
				break;
		}
		game.ownItem.direction = direction;
		game.reloadMouse();
		return true;
  };
}
CommandTurnRight.prototype = new Command;

var CommandTurnLeft = function(index) {
	Command.apply(this, ["turnLeft();", "左を向く", index, COMMAND_TYPE.turnLeft]);
	this.exec = function(game) {
		var ownItem = game.ownItem;
		var direction = ownItem.direction;
		switch(direction) {
			case directionType.north:
				direction = directionType.west;
				break;
			case directionType.south:
				direction = directionType.east;
				break;
			case directionType.east:
				direction = directionType.north;
				break;
			case directionType.west:
				direction = directionType.south;
				break;
		}
		game.ownItem.direction = direction;
		game.reloadMouse();
		return true;
  };
}
CommandTurnLeft.prototype = new Command;

var samePositionCount = 0;
var CommandGoStrate = function(index) {
	Command.apply(this, ["goStrate();", "一歩進む", index, COMMAND_TYPE.goStrate]);
	this.exec = function(game) {
		//移動先を取得
		var object = this.getCurrentItem(game);
		if(typeof object == "undefined") {
			var position = this.getNextPosition(game);
			var result = game.moveMouse(position.x, position.y);
			object = this.getCurrentItem(game);
			if(typeof object != "undefined" && object.itemType == ITEM_TYPE.goal) {
				game.clear();
				return true;
			}
			return result;
		} else if(object.itemType == ITEM_TYPE.goal) {
			game.clear();
			return true;
		} else if(object.itemType == ITEM_TYPE.own) {
			samePositionCount++;
			if(samePositionCount >= 3) {
				samePositionCount = 0;
				return false;
			} else {
				var position = this.getNextPosition(game);
				var result = game.moveMouse(position.x, position.y);
				object = this.getCurrentItem(game);
				if(typeof object != "undefined" && object.itemType == ITEM_TYPE.goal) {
					game.clear();
					return true;
				}
				return game.moveMouse(position.x, position.y);
			}
		} else {
			var position = this.getNextPosition(game);
			var result = game.moveMouse(position.x, position.y);
			var gameCanvas = game.canvas.getCanvas();
			var ctx = gameCanvas.getContext('2d');
			game.drawItem(ctx, object);
			return result;
		}
  };
}
CommandGoStrate.prototype = new Command;

//var CommandGoTop = function(index) {
//	Command.apply(this, ["goTop();", "命令の頭に戻る", index, COMMAND_TYPE.goTop]);
//	this.exec = function(game) {
//		return true;
//	}
//}
//CommandGoTop.prototype = new Command;
//
//var CommandOneStep = function(index) {
//	Command.apply(this, ["oneStep();", "ここまでの命令を実行する", index, COMMAND_TYPE.oneStep]);
//	this.exec = function(game) {
//		return true;
//	}
//}
//CommandOneStep.prototype = new Command;

const COMMAND_TYPE = {
	redWall : {commandObject : CommandRedWall, id : "redWall", startif : true},
	blueWall : {commandObject : CommandBlueWall, id : "blueWall", startif : true},
	endif : {commandObject : CommandEndIf, id : "endif", startif : false},
	turnRight : {commandObject : CommandTurnRight, id : "turnRight"},
	turnLeft : {commandObject : CommandTurnLeft, id : "turnLeft"},
	goStrate : {commandObject : CommandGoStrate, id : "goStrate"},
//	goTop : {commandObject : CommandGoTop, id : "goTop"},
//	oneStep : {commandObject : CommandOneStep, id : "oneStep"},
};

