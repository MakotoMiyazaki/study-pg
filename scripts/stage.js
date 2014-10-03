var Item = function(initializePosition, itemType, direction) {
	this.position = initializePosition;
	this.itemType = itemType;
	if(typeof direction == 'undefined') {
		this.direction = directionType.none;
	} else {
		this.direction = direction;
	}
}

const cellType = {
	small : {cellSize : 32},
	middle : {cellSize : 64},
	large : {cellSize : 128},
};

var Stage = function(cellType) {
	this.cellType = cellType;
	// cellTypからセルの数を計算
	this.cellCount = canvasSize / cellType.cellSize;
	this.items = new Array();
	this.ownInitPosX;
	this.ownInitPosY;
	this.ownInitDirection;
	this.cleared = false;
	this.index;
	this.minStep = 1;
	this.maxStep = 3;
	this.stepScore = 20;
	this.minCommand = 1;
	this.commandScore = 10;
	this.addItem = function(item) {
		var correctItem = true;
		if(item.position.x >= this.cellCount) {
			alert("xの位置がフィールドより大きいです x : " + item.position.x);
			correctItem = false;
		}
		if(item.position.y >= this.cellCount) {
			alert("yの位置がフィールドより大きいです y : " + item.position.y);
			correctItem = false;
		}
		if(correctItem) {
			this.items.push(item);
		}
		if(item.itemType == ITEM_TYPE.own) {
			this.ownInitPosX = item.position.x;
			this.ownInitPosY = item.position.y;
			this.ownInitDirection = item.direction;
		}
	};
	this.initialize = function() {
		// 自分の位置を初期位置に戻す
		for(var i = 0; i < this.items.length; i++) {
			if(this.items[i].itemType == ITEM_TYPE.own) {
				this.items[i].position.x = this.ownInitPosX;
				this.items[i].position.y = this.ownInitPosY;
				this.items[i].direction = this.ownInitDirection;
			}
		}
	};
	this.setClearCondition = function(minCommand, commandScore, minStep, maxStep, stepScore) {
		this.minCommand = minCommand;
		this.minStep = minStep;
		this.maxStep = maxStep;
		this.stepScore = stepScore;
		this.commandScore = commandScore;
	};
}

// ステージ生成
var StageController = function() {
	this.currentStageIndex = 0;
	this.stageList = new Array();
}
StageController.prototype = {
	addStage : function(stage) {
		stage.index = this.stageList.length + 1;
		this.stageList.push(stage);
	},
	init : function() {
		this.currentStageIndex = 0;
	},
	hasNext : function() {
		return this.stageList.length > this.currentStageIndex;
  },
	getNextStage : function() {
		var stage = this.stageList[this.currentStageIndex];
		this.currentStageIndex++;
		return stage;
  },
	getCurrentStageIndex : function() {
		return this.currentStageIndex;
	},
	initializeStageButton : function(divBlockId, stageCssId) {
		// 左側のステージメニューの表示切替
		var block = $("#" + divBlockId);
		var stageList = $(block.children("." + stageCssId));
		for(var i = 0; i < stageList.length; i++) {
			var stage = $(stageList[i]);
    }
		// タップ時のイベントバインド
		bindEvent("." + stageCssId, function() {
			var stageIndex = $(this).data("stage");
			if(stageIndex.hasClass("disableStage") || stageIndex.hasClass("selectStage")) {
				return;
			}
			var intIndex = parseInt(stageIndex);
			// 対象ステージの取得
    });
  }
}

var stageController = new StageController();

{
	var stage = new Stage(cellType.large);
	stage.addItem(new Item(new Position(0,2), ITEM_TYPE.own, directionType.east));
	stage.addItem(new Item(new Position(3,2), ITEM_TYPE.goal));
	stageController.addStage(stage);
}

{
	var stage = new Stage(cellType.large);
	stage.addItem(new Item(new Position(0, 3), ITEM_TYPE.own, directionType.north));
	stage.addItem(new Item(new Position(1, 3), ITEM_TYPE.goal));
	stage.setClearCondition(2, 10, 1, 4, 20);
	stageController.addStage(stage);
}

{
	var stage = new Stage(cellType.large);
	stage.addItem(new Item(new Position(0, 3), ITEM_TYPE.own, directionType.north));
	stage.addItem(new Item(new Position(0, 1), ITEM_TYPE.redWall));
	stage.addItem(new Item(new Position(3, 1), ITEM_TYPE.goal));
	stage.setClearCondition(3, 10, 1, 5, 10);
	stageController.addStage(stage);
}

{
	var stage = new Stage(cellType.middle);
	stage.addItem(new Item(new Position(2, 1), ITEM_TYPE.own, directionType.north));
	stage.addItem(new Item(new Position(2, 0), ITEM_TYPE.redWall));
	stage.addItem(new Item(new Position(2, 7), ITEM_TYPE.goal));
	stage.setClearCondition(5, 10, 1, 5, 20);
	stageController.addStage(stage);
}

