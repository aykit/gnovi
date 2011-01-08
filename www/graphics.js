/*
 *  Attribute und Methoden, die mit Unterstrich beginnen,
 *  werden nur in dieser Datei verwendet und können geändert werden
 */

var Graphics = new Class({
	setContext: function(context) { this.context = context; },

	_drawCenteredText: function(text, posX, posY)
	{
		this.context.fillText(text, posX - this.context.measureText(text).width / 2, posY)
	},

	_fillCircle: function(x, y, r)
	{
		this.context.beginPath();
		this.context.arc(x, y, r, 0, 2 * Math.PI, false);
		this.context.closePath();
		this.context.fill();	
	},

	_drawGnoviIcon: function(posX, posY, size, glow)
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
		this._fillCircle(posX, posY, size / 2);
	},

	_fillTextRect: function(wordList, x, y, width, spacing, lineHeight)
	{
		var wordOffsetX = 0;
		var wordOffsetY = 0;

		for (var i = 0; i < wordList.length; i++)
		{
			var textWidth = this.context.measureText(wordList[i]).width;
	
			if (wordOffsetX != 0 && wordOffsetX + textWidth > width)
			{
				wordOffsetX = 0;
				wordOffsetY += lineHeight;
			}
	
			this.context.fillText(wordList[i], x + wordOffsetX, y + wordOffsetY);
	
			wordOffsetX += textWidth + spacing;
		}
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
		this._drawCenteredText(txt, 460, 380);

		this.context.translate(460, 350);
		this.context.rotate(drawCount * 2 * Math.PI / 64);
		this.context.strokeRect(-10, -10, 20, 20);
	},
});

var InputGraphics = new Class({
	Extends: Graphics,

	_drawWidth: 500,
	_drawHeight: 400,

	_clearCanvas: function()
	{
		this.context.clearRect(0, 0, this._drawWidth, this._drawHeight);
	},

	drawStartScreen: function()
	{
		this._clearCanvas();

		this.context.fillStyle = "black";

		this.context.font = "bold 20px Courier New";
		this.context.fillText("click to start", 100, 20);
	},

	drawWordsFinishedScreen: function(wordList, alpha, drawContinueNotice)
	{
		this._clearCanvas();

		this.context.fillStyle = "rgba(0, 0, 0, " + alpha + ")";

		this.context.font = "bold 20px Courier New";

		this.context.fillText("Words entered:", 20, 20);

		this._fillTextRect(wordList, 40, 50, 300, 10, 25);

		if (!drawContinueNotice)
			return;

		this.context.font = "bold 14px Courier New";
		this.context.fillText("press Enter to continue", 20, 300);
	},

	drawInputLocationScreen: function(inputText)
	{
		this._clearCanvas();

		this.context.fillStyle = "black";
		this.context.font = "bold 20px Courier New";

		this.context.fillText("Enter your location:", 20, 20);

		this.context.font = "bold 15px Courier New";
		this.context.fillText(inputText, 30, 50);
	},

	drawWordCollectingScreen: function(headWord, timeLeft, totalTime, currentInputText, inputList, inputListAnimation)
	{
		this._clearCanvas();

		this.context.fillStyle = "black";

		this.context.font = "bold 25px Courier New";
		this.context.fillText(headWord, 20, 20);

		this.context.font = "bold 20px Courier New";
		this.context.fillText(Math.ceil(timeLeft), 400, 20);

		this.context.font = "bold 15px Courier New";
		this.context.fillText(currentInputText, 20, 300);

		for (var i = 0; i < inputList.length; i++)
		{
			var a = inputListAnimation[i];
			var b = 1 - a;
			this.context.fillText(inputList[i], 20, (i * 20 + 50) * a + 300 * b );
		}
	}
});

var GraphGraphics = new Class({
	Extends: Graphics,

	_drawWidth: 500,
	_drawHeight: 400,

	drawBackground: function()
	{
		this.context.clearRect(0, 0, this._drawWidth, this._drawHeight);
	},

	drawNode: function(node, posX, posY, isRoot, mouseOver)
	{
		this.context.textBaseline = "middle";

		if (isRoot)
		{
			this.context.font = "bold 14px Verdana";
			this._drawGnoviIcon(0, 0, 50, true);
			this.context.fillStyle = "red";
			this._drawCenteredText(this.data.root.label, 0, 40);
		}
		else
		{
			this.context.font = "bold 10px Verdana";
			this._drawGnoviIcon(posX, posY, 30, mouseOver);
			this.context.fillStyle = "black";
			this._drawCenteredText(node.label, posX, posY + 25);
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
		return {x: this._drawWidth / 2, y: this._drawHeight / 2 };
	},

	getNodeStartDistance: function() { return 350; },
});
