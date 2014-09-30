const canvasSize = 512;
//配置オブジェクト系===============================
const ITEM_TYPE = {
	own : {id : 0, image : "mouse"},
	redWall : {id : 1, image : "none"},
	blueWall : {id : 2, image : "none"},
	goal : {id : 99, image : "goal"},
};

const directionType = {
	west : {extention : "_w"},
	east : {extention : "_e"},
	north : {extention : "_n"},
	south : {extention : "_s"},
	none : {extention : ""},
}

var Position = function(x, y) {
	this.x = x;
	this.y = y;
}

const commandMax = 20;

