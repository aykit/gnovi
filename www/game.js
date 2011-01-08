var Game = new Class({

	timer: null,
	delta: 0,
	drawCount: 0,
	mouseX: 0,
	mouseY: 0,

	initialize: function(canvas, graphics, scaling)
	{
		this.canvas = canvas;
		this.graphics = graphics;
		this.scaling = scaling;

		this.clientWidth = this.canvas.clientWidth;
		this.clientHeight = this.canvas.clientHeight;

		var canvasPos = this.canvas.getPosition();
		this.clientX = canvasPos.x + this.canvas.clientLeft;
		this.clientY = canvasPos.y + this.canvas.clientTop;

		this.context = this.canvas.getContext('2d');
		this.context.scale(this.scaling, this.scaling);
		this.graphics.setContext(this.context);

		document.addEvent("keypress", this.onKeypress.bind(this));
		this.canvas.addEvent("click", this.onClick.bind(this));
		this.canvas.addEvent("mousemove", this.onMouseMove.bind(this));
	},

	draw: function()
	{
		this.drawCount++;
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
	},

	onMouseMove: function(e)
	{
		this.mouseX = (e.event.pageX - this.clientX) / this.scaling;
		this.mouseY = (e.event.pageY - this.clientY) / this.scaling;
	},

	onKeypress: function(event) { },

	onClick: function(event){ },
});
