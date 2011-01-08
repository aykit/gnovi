var Graphics = new Class({
	setContext: function(context)
	{
		this.context = context;
	},

	drawCenteredText: function(text, posX, posY)
	{
		this.context.fillText(text, posX - this.context.measureText(text).width / 2, posY)
	},

	fillCircle: function(x, y, r)
	{
		this.context.beginPath();
		this.context.arc(x, y, r, 0, 2 * Math.PI, false);
		this.context.closePath();
		this.context.fill();	
	},

	drawGnoviIcon: function(posX, posY, size, glow)
	{
		var gradient = this.context.createRadialGradient(posX, posY, 0, posX, posY, size / 2);
		gradient.addColorStop(0.3, "rgba(255, 255, 255, 255)");
		gradient.addColorStop(0.5, "black");
		gradient.addColorStop(0.6, "green");

		if (glow)
			gradient.addColorStop(1, "red");
		else
			gradient.addColorStop(1, "blue");

		this.context.fillStyle = gradient;
		this.fillCircle(posX, posY, size / 2);
	},

	drawDebugInfo: function(fps, drawCount)
	{
		this.context.shadowColor = "black";
		this.context.shadowBlur = 2;
		this.context.shadowOffsetX = 1;
		this.context.shadowOffsetY = 1;
		this.context.strokeStyle = "black";
		this.context.fillStyle = "black";

		this.context.font = "8px";
		var txt = Math.round(fps) + " fps";
		this.drawCenteredText(txt, 460, 380);

		this.context.translate(460, 350);
		this.context.rotate(drawCount * 2 * Math.PI / 64);
		this.context.strokeRect(-10, -10, 20, 20);
	},
});

var InputGraphics = new Class({
	Extends: Graphics,

});

var GraphGraphics = new Class({
	Extends: Graphics,

	DRAW_WIDTH: 500,
	DRAW_HEIGHT: 400,

	drawBackground: function()
	{	
		this.context.fillStyle = "white";
		this.context.fillRect(0, 0, this.DRAW_WIDTH, this.DRAW_HEIGHT);
	},

	drawNode: function(node, posX, posY, isRoot, mouseOver)
	{
		this.context.textBaseline = "middle";

		if (isRoot)
		{
			this.context.font = "bold 14px Verdana";
			this.drawGnoviIcon(0, 0, 50, true);
			this.context.fillStyle = "red";
			this.drawCenteredText(this.data.root.label, 0, 40);
		}
		else
		{
			this.context.font = "bold 10px Verdana";
			this.drawGnoviIcon(posX, posY, 30, mouseOver);
			this.context.fillStyle = "black";
			this.drawCenteredText(node.label, posX, posY + 25);
		}
	},

	drawConnection: function(x1, y1, x2, y2, strength)
	{
		this.context.beginPath();
		this.context.moveTo(x1, y1);
		this.context.lineTo(x2, y2);

		this.context.strokeStyle = "black";
		this.context.lineWidth = strength;
		this.context.stroke();
	},

	getGraphCenter: function()
	{
		return {x: this.DRAW_WIDTH / 2, y: this.DRAW_HEIGHT / 2 };
	},

	getNodeStartDistance: function() { return 350; },
});
