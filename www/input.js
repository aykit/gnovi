var StateEngine = new Class({
	initialize: function(game)
	{
		this.game = game;
	},

	start: function() {},
	end: function() {},
	drawGame: function(context) {},
	timerEvent: function(delta) {},
	keypressEvent: function(event) { return true; },
	clickEvent: function(event) { },
});

var StateEngineWait = new Class({
	Extends: StateEngine,

	clickEvent: function(event)
	{
		this.game.setStateEngine(this.getNextStateEngine());
	},

	keypressEvent: function(event)
	{
		if (event.event.keyCode == 13)
			this.game.setStateEngine(this.getNextStateEngine());

		return true;
	},

	getNextStateEngine: function() { },
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

	clickEvent: function(event)
	{
		this.game.setStateEngine(StateEngineWordCollecting);
	},

	keypressEvent: function(event)
	{
		if (event.event.keyCode == 13)
			this.game.setStateEngine(StateEngineWordCollecting);

		return true;
	},
});

var StateEngineWordCollecting = new Class({
	Extends: StateEngine,

	start: function()
	{
		this.timeLeft = 10;
		this.currentInputText = "";
		this.inputList = [];
		this.inputListAnimation = [];

		this.game.setTimer(10);
	},

	drawGame: function(context)
	{
		context.clearRect(0, 0, this.game.gameWidth, this.game.gameHeight);

		context.fillStyle = "black";

		context.font = "bold 20px Courier New";
		context.fillText(Math.ceil(this.timeLeft), 400, 20);

		context.font = "bold 15px Courier New";
		context.fillText(this.currentInputText, 20, 300);

		for (var i = 0; i < this.inputList.length; i++)
		{
			var a = this.inputListAnimation[i];
			var b = 1 - a;
			context.fillText(this.inputList[i], 20, (i * 20 + 20) * a + 300 * b );
		}
	},

	timerEvent: function(delta)
	{
		var timeDisplayed = Math.ceil(this.timeLeft);

		this.timeLeft -= delta;
		if (this.timeLeft < 0)
			this.timeLeft = 0;

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
		if (this.timeLeft <= 0)
			return true;

		if (event.event.keyCode == 8)
		{
			this.currentInputText = this.currentInputText.substr(0, this.currentInputText.length - 1);
			this.game.draw();
			return false;
		}

		if (event.event.keyCode == 13)
		{
			this.inputList.push(this.currentInputText);
			this.inputListAnimation.push(0);

			this.currentInputText = "";
			this.game.draw();
			return false;
		}

		this.currentInputText = this.currentInputText + String.fromCharCode(event.event.charCode);
		this.game.draw();

		return event.event.keyCode != 32;
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

		context.strokeStyle = "black";
		context.fillStyle = "black";

		context.font = "8px";
		var txt = Math.round(1 / this.delta) + " fps";
		context.fillText(txt, 460 - context.measureText(txt).width / 2, 380);

		context.save();
		context.translate(460, 350);
		context.rotate(this.drawCount * 2 * Math.PI / 64);
		context.strokeRect(-10, -10, 20, 20);
		context.restore();
	},

	setStateEngine: function(stateEngineClass)
	{
		this.setTimer(0);

		if (this.currentStateEngine)
			this.currentStateEngine.end();

		if (stateEngineClass)
		{
			this.currentStateEngine = new stateEngineClass(this);
			this.currentStateEngine.start();
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
		return this.currentStateEngine.keypressEvent(event);
	},

	onClick: function(event)
	{
		this.currentStateEngine.clickEvent(event);
	},
});

window.addEvent('domready', function() {
	new Game();
});
