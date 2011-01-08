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
