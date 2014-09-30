document.write('<script type="text/javascript" src="./scripts/global.js"></script>');
document.write('<script type="text/javascript" src="./scripts/stage.js"></script>');
document.write('<script type="text/javascript" src="./scripts/command.js"></script>');
document.write('<script type="text/javascript" src="./scripts/game.js"></script>');


//初期表示処理
var currentGame;
$(document).ready(function() {
	//コマンドテーブルに必要数のTHを追加
	var table = $(".commandTable");
	var tbody = $(table.children("tbody")[0]);
	for(var i = 0; i < commandMax; i++) {
		var tr = $("<tr>").clone();
		tr.data("index", i);
		tr.addClass("index" + i);
		tr.addClass("runCommand");

		var commandNo = $("<td>");
		commandNo.html(i + 1);
		tr.append(commandNo)

		var command = $("<td>");
		command.addClass("command");
		tr.append(command);

		var logic = $("<td>");
		logic.addClass("logic");
		tr.append(logic)

		tbody.append(tr);
	}

	var game = new Game("field", stageController.getNextStage());
	game.initialize();
	currentGame = game;

	stageController.initializeStageButton("stageSellect", "stage");

	// ボタンへのイベントバインド
	bindEvent("#run", function() {
		currentGame.run();
	});
	bindEvent("#stop", function() {
		currentGame.stop();
	});
	bindEvent("#clear", function() {
		currentGame.clearCommand();
	});
	bindEvent(".retry", function() {
		currentGame.stop();
		currentGame.clearCommand();
		$(".floatBox").hide();
	});
	bindEvent(".init", function() {
		stageController.init();
		var stage = stageController.getNextStage();
		var game = new Game("field", stage);
		game.initialize();
		currentGame = game;
		$(".floatBox").hide();
	});
	bindEvent(".nextStage", function() {
		currentGame.dispose();
		
		var stage = stageController.getNextStage();
		var game = new Game("field", stage);
		game.initialize();
		game.clearCommand();
		currentGame = game;
		$(".floatBox").hide();
	});
	bindEvent(".command", function() {
		var id = $(this).attr("id");
		for (i in COMMAND_TYPE) {
			if (COMMAND_TYPE[i].id == id) {
				currentGame.addCommand(COMMAND_TYPE[i]);
			}
		}
	});
	bindEvent("#step", function() {
//		currentGame.addCommand(COMMAND_TYPE.oneStep);
		currentGame.run(true);
	});

});

function bindEvent(target, func) {
	$(target).click(func);
	$(target).bind("touchend", func);
	$(target).bind("MSPointerUp", func);
}
