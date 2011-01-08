var StateEngine = new Class({
	initialize: function(game)
	{
		this.game = game;
	},

	start: function(options) {},
	end: function() {},
	drawGame: function(context) {},
	timerEvent: function(delta) {},
	keypressEvent: function(event) {},
	clickEvent: function(event) {},
	continueEvent: function() {},
});

var StateEngineStart = new Class({
	Extends: StateEngine,

	drawGame: function(context)
	{
		context.clearRect(0, 0, this.game.gameWidth, this.game.gameHeight);

		context.fillStyle = "black";

		context.font = "bold 20px Courier New";
		context.fillText("click to start", 100, 20);
	},

	continueEvent: function()
	{
		this.game.setStateEngine(StateEngineWordCollecting);
	},
});

function fillTextRect(context, wordList, x, y, width, spacing, lineHeight)
{
	var wordOffsetX = 0;
	var wordOffsetY = 0;

	for (var i = 0; i < wordList.length; i++)
	{
		var textWidth = context.measureText(wordList[i]).width;

		if (wordOffsetX != 0 && wordOffsetX + textWidth > width)
		{
			wordOffsetX = 0;
			wordOffsetY += lineHeight;
		}

		context.fillText(wordList[i], x + wordOffsetX, y + wordOffsetY);

		wordOffsetX += textWidth + spacing;
	}
}

var StateEngineWordsFinished = new Class({
	Extends: StateEngine,

	start: function(options)
	{
		this.game.setTimer(30);
		this.fadeEffect = 0;
	},

	drawGame: function(context)
	{
		context.clearRect(0, 0, this.game.gameWidth, this.game.gameHeight);

		context.fillStyle = "rgba(0, 0, 0, " + this.fadeEffect + ")";

		context.font = "bold 20px Courier New";

		context.fillText("Words entered:", 20, 20);

		fillTextRect(context, this.game.data.inputList, 40, 50, 300, 10, 25);

		if (this.fadeEffect < 1)
			return;
		context.font = "bold 14px Courier New";
		context.fillText("press Enter to continue", 20, 300);
	},

	timerEvent: function(delta)
	{
		this.fadeEffect += delta;
		if (this.fadeEffect >= 1)
		{
			this.fadeEffect = 1;
			this.game.setTimer(0);
		}
		this.game.draw();
	},

	continueEvent: function()
	{
		if (this.fadeEffect >= 1)
			this.game.setStateEngine(StateEngineInputLocation);
	},
});

var StateEngineInputLocation = new Class({
	Extends: StateEngine,

	start: function(options)
	{
		this.currentInputText = "";
	},

	drawGame: function(context)
	{
		context.clearRect(0, 0, this.game.gameWidth, this.game.gameHeight);

		context.fillStyle = "black";
		context.font = "bold 20px Courier New";

		context.fillText("Enter your location:", 20, 20);

		context.font = "bold 15px Courier New";
		context.fillText(this.currentInputText, 30, 50);
	},

	timerEvent: function(delta)
	{
	},

	keypressEvent: function(event)
	{
		if (event.event.keyCode == 8)
		{
			this.currentInputText = this.currentInputText.substr(0, this.currentInputText.length - 1);
			this.game.draw();
			return;
		}

		if (event.event.keyCode == 13)
		{
			if (this.currentInputText.trim() != "")
			{
				this.game.data.location = this.currentInputText;
				this.game.setStateEngine(StateEngineLocationWordCollecting);
			}
			return;
		}

		if (event.event.keyCode < 32)
			return;

		this.currentInputText = this.currentInputText + String.fromCharCode(event.event.charCode);
		this.game.draw();
	},
});

var StateEngineWordCollecting = new Class({
	Extends: StateEngine,

	start: function()
	{
		this.timeLeft = 30;
		this.currentInputText = "";
		this.inputList = [];
		this.inputListAnimation = [];
		this.headWord = "Berg";

		this.game.setTimer(10);
	},

	drawGame: function(context)
	{
		context.clearRect(0, 0, this.game.gameWidth, this.game.gameHeight);

		context.fillStyle = "black";

		context.font = "bold 25px Courier New";
		context.fillText(this.headWord, 20, 20);

		context.font = "bold 20px Courier New";
		context.fillText(Math.ceil(this.timeLeft), 400, 20);

		context.font = "bold 15px Courier New";
		context.fillText(this.currentInputText, 20, 300);

		for (var i = 0; i < this.inputList.length; i++)
		{
			var a = this.inputListAnimation[i];
			var b = 1 - a;
			context.fillText(this.inputList[i], 20, (i * 20 + 50) * a + 300 * b );
		}
	},

	timerEvent: function(delta)
	{
		var timeDisplayed = Math.ceil(this.timeLeft);

		this.timeLeft -= delta;
		if (this.timeLeft < 0)
		{
			this.finishInput();
			return;
		}

		var updateScreen = false;
		for (var i = 0; i < this.inputListAnimation.length; i++)
		{
			if (this.inputListAnimation[i] < 1)
			{
				this.inputListAnimation[i] += delta * 10;
				if (this.inputListAnimation[i] > 1)
					this.inputListAnimation[i] = 1;
				updateScreen = true;
			}
		}

		if (timeDisplayed != Math.ceil(this.timeLeft))
			updateScreen = true;

		if (updateScreen)
			this.game.draw();
	},

	keypressEvent: function(event)
	{
		if (event.event.keyCode == 8)
		{
			this.currentInputText = this.currentInputText.substr(0, this.currentInputText.length - 1);
			this.game.draw();
			return;
		}

		if (event.event.keyCode == 13)
		{
			this.inputList.push(this.currentInputText);
			this.inputListAnimation.push(0);

			this.currentInputText = "";
			this.game.draw();
			return;
		}

		if (event.event.keyCode <= 32)
			return;

		this.currentInputText = this.currentInputText + String.fromCharCode(event.event.charCode);
		this.game.draw();
	},

	finishInput: function()
	{
		this.game.data.inputList = this.inputList;
		this.game.setStateEngine(StateEngineWordsFinished);
	},
});

var StateEngineLocationWordCollecting = new Class({
	Extends: StateEngineWordCollecting,

	start: function()
	{
		this.parent();
		this.headWord = this.game.data.location;
	},

	finishInput: function()
	{
		this.game.data.locationInputList = this.inputList;
		this.game.setStateEngine(StateEngineStart);
	},
});

var Game = new Class({
    initialize: function()
    {
		this.gameCanvas = $("game");
		this.gameWidth = this.gameCanvas.getSize().x;
		this.gameHeight = this.gameCanvas.getSize().y;

		document.addEvent("keypress", this.onKeypress.bind(this));
		this.gameCanvas.addEvent("click", this.onClick.bind(this));

		this.timer = null;
		this.delta = 0;
		this.drawCount = 0;

		this.data = {};

		this.currentStateEngine = null;
		this.setStateEngine(StateEngineStart);
    },

	draw: function()
	{
		this.drawCount++;

		var context = this.gameCanvas.getContext('2d');
		context.save();
		this.currentStateEngine.drawGame(context);
		context.restore();

		context.save();
		context.shadowColor = "black";
		context.shadowBlur = 2;
		context.shadowOffsetX = 1;
		context.shadowOffsetY = 1;
		context.strokeStyle = "black";
		context.fillStyle = "black";

		context.font = "8px";
		var txt = Math.round(1 / this.delta) + " fps";
		context.fillText(txt, 460 - context.measureText(txt).width / 2, 380);

		context.translate(460, 350);
		context.rotate(this.drawCount * 2 * Math.PI / 64);
		context.strokeRect(-10, -10, 20, 20);
		context.restore();
	},

	setStateEngine: function(stateEngineClass, options)
	{
		this.setTimer(0);

		if (this.currentStateEngine)
			this.currentStateEngine.end();

		if (stateEngineClass)
		{
			this.currentStateEngine = new stateEngineClass(this);
			this.currentStateEngine.start(options);
			this.draw();
		}
		else
			this.currentStateEngine = null;
	},

	setTimer: function(interval)
	{
		if (this.timer)
			clearInterval(this.timer);

		this.lastTimerEventTime = Date.now() / 1000;

		if (interval == 0)
			this.timer = null;
		else
			this.timer = this.onTimer.periodical(interval, this);
	},

	onTimer: function()
	{
		this.delta = Date.now() / 1000 - this.lastTimerEventTime;
		this.lastTimerEventTime += this.delta;
		this.currentStateEngine.timerEvent(this.delta);
	},

	onKeypress: function(event)
	{
		this.currentStateEngine.keypressEvent(event);
		if (event.event.keyCode == 13)
			this.currentStateEngine.continueEvent();

		return event.event.keyCode != 8 && event.event.keyCode != 32;
	},

	onClick: function(event)
	{
		this.currentStateEngine.clickEvent(event);
		this.currentStateEngine.continueEvent();
	},
});

window.addEvent("domready", function() {
	new Game();
});
