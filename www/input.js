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

	drawGame: function(graphics, context)
	{
		graphics.drawStartScreen();
	},

	continueEvent: function()
	{
		this.game.setStateEngine(StateEngineWordCollecting);
	},
});

var StateEngineWordsFinished = new Class({
	Extends: StateEngine,

	start: function(options)
	{
		this.game.setTimer(30);
		this.fadeEffect = 0;
	},

	drawGame: function(graphics, context)
	{
		graphics.drawWordsFinishedScreen(this.game.data.inputList, this.fadeEffect, this.fadeEffect >= 1);
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

	drawGame: function(graphics, context)
	{
		graphics.drawInputLocationScreen(this.currentInputText);
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
		this.totalTime = 3;
		this.timeLeft = this.totalTime;
		this.currentInputText = "";
		this.inputList = [];
		this.inputListAnimation = [];
		this.headWord = "Berg";

		this.game.setTimer(10);
	},

	drawGame: function(graphics, context)
	{
		graphics.drawWordCollectingScreen(this.headWord, this.timeLeft, this.totalTime,
			this.currentInputText, this.inputList, this.inputListAnimation);
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

var Input = new Class({
	Extends: Game,

	initialize: function(canvas)
	{
    	this.parent(canvas, new InputGraphics(), 1);

		this.data = {};

		this.currentStateEngine = null;
		this.setStateEngine(StateEngineStart);
	},

	draw: function()
	{
		this.parent();

		this.context.save();
		this.currentStateEngine.drawGame(this.graphics, this.context);
		this.context.restore();

		this.context.save();
		this.graphics.drawDebugInfo(1 / this.delta, this.drawCount);
		this.context.restore();
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

	onTimer: function()
	{
		this.parent();

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
	new Input($("game"));
});
