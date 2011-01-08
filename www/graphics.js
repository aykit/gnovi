var Graphics = new Class({
	initialize: function(context)
	{
		this.context = context;
	},

	drawCenteredText: function(context, text, posX, posY)
	{
		this.context.fillText(text, posX - context.measureText(text).width / 2, posY)
	},

	fillCircle: function(context, x, y, r)
	{
		this.context.beginPath();
		this.context.arc(x, y, r, 0, 2 * Math.PI, false);
		this.context.closePath();
		this.context.fill();	
	},

	drawGnoviIcon: function(context, posX, posY, size, glow)
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
		this.fillCircle(context, posX, posY, size / 2);
	},
});
