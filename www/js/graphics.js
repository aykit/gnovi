/*
 *  Attribute und Methoden, die mit Unterstrich beginnen,
 *  werden nur in dieser Datei verwendet und können geändert werden
 */

var Graphics = new Class({
	setContext: function(context) { this.context = context; },

	_fillCenteredText: function(text, posX, posY)
	{
		this.context.fillText(text, posX - this.context.measureText(text).width / 2, posY)
	},

	_strokeCenteredText: function(text, posX, posY)
	{
		this.context.strokeText(text, posX - this.context.measureText(text).width / 2, posY)
	},

	_fillCircle: function(x, y, r)
	{
		this.context.beginPath();
		this.context.arc(x, y, r, 0, 2 * Math.PI, false);
		this.context.fill();	
	},

	_drawGnoviIcon: function(posX, posY, size, glow, alpha)
	{
		var gradient = this.context.createRadialGradient(posX, posY, 0, posX, posY, size / 2);
		gradient.addColorStop(0.3, "rgba(255, 255, 255, " + alpha + ")");
		gradient.addColorStop(0.5, "rgba(0, 0, 0, " + alpha + ")");
		gradient.addColorStop(0.6, "rgba(0, 255, 0, " + alpha + ")");

		if (glow)
			gradient.addColorStop(1, "rgba(255, 0, 0, " + alpha + ")");
		else
			gradient.addColorStop(1, "rgba(0, 0, 255, " + alpha + ")");

		this.context.fillStyle = gradient;
		this._fillCircle(posX, posY, size / 2);
		//this.context.putImageData(this.getImage("google"), posX, posY);
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

	_clearCanvas: function()
	{
		this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
	},

	drawDebugInfo: function(fps, drawCount)
	{
		this.context.translate(this.context.canvas.width - 40, this.context.canvas.height - 50);

		this.context.shadowColor = "black";
		this.context.shadowBlur = 2;
		this.context.shadowOffsetX = 1;
		this.context.shadowOffsetY = 1;
		this.context.strokeStyle = "black";
		this.context.fillStyle = "black";

		this.context.font = "8px";
		var txt = Math.round(fps) + " fps";
		this._fillCenteredText(txt, 0, 30);

		this.context.rotate(drawCount * 2 * Math.PI / 64);
		this.context.strokeRect(-10, -10, 20, 20);
	},

	drawLoadingIndicator: function(loadTime)
	{
	   loadTime -= 0.2;
        if (loadTime < 0)
            return;

		alpha = loadTime;
		if (alpha > 1)
			alpha = 1;

		scale1 = loadTime * 10;
		if (scale1 > 5)
			scale1 = 5;

		scale2 = 10 - loadTime * 10;
		if (scale2 < 3)
			scale2 = 3;

		this.context.strokeStyle = "rgba(0, 0, 0," + alpha + ")";

		this.context.save();
		this.context.translate(this.context.canvas.width / 2, this.context.canvas.height / 2);
		this.context.rotate(loadTime * 2 * Math.PI / 4);
		this.context.scale(scale1, scale1);
		this.context.strokeRect(-10, -10, 20, 20);
		this.context.restore();

		this.context.save();
		this.context.translate(this.context.canvas.width / 2, this.context.canvas.height / 2);
		this.context.rotate(- loadTime * 2 * Math.PI / 4);
		this.context.scale(scale2, scale2);
		this.context.strokeRect(-10, -10, 20, 20);
		this.context.restore();

		this.context.textBaseline = "middle";
		this.context.font = "bold 12px Verdana";

		this.context.strokeStyle = "rgba(255, 255, 255," + alpha + ")";
		this.context.lineWidth = 5;
		this._strokeCenteredText("loading . . .", 0, 200)

		this.context.fillStyle = "rgba(0, 0, 0," + alpha + ")";
		this._fillCenteredText("loading . . .", this.context.canvas.width / 2, this.context.canvas.height - 30)
	},
});

var InputGraphics = new Class({
	Extends: Graphics,

	drawStartScreen: function()
	{
		this._clearCanvas();

		this.context.fillStyle = "black";

		this.context.font = "bold 20px Courier New";
		this.context.fillText("click to start", 100, 20);
	},

	drawWordsFinishedScreen: function(wordList, inputTime, alpha, drawContinueNotice)
	{
		this._clearCanvas();

		this.context.fillStyle = "rgba(0, 0, 0, " + alpha + ")";

		this.context.font = "bold 20px Courier New";

		this.context.fillText(wordList.length + " words entered in " + inputTime + " seconds", 20, 20);

		this._fillTextRect(wordList, 40, 50, 300, 10, 25);

		if (!drawContinueNotice)
			return;

		this.context.font = "bold 14px Courier New";
		this.context.fillText("press Enter to continue", 20, 300);
	},

	drawLocationWordsFinishedScreen: function(wordList, inputTime, alpha, drawContinueNotice)
	{
		this.drawWordsFinishedScreen(wordList, inputTime, alpha, drawContinueNotice);
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

        /* TIME */
        this.context.fillRect(10, 20, timeLeft / totalTime * 640, 2);

		this.context.font = "bold 15px Courier New";
		this.context.fillText(currentInputText, 20, 300);

		for (var i = 0; i < inputList.length; i++)
		{
			var a = inputListAnimation[i];
			var b = 1 - a;
			this.context.fillText(inputList[i], 20, (i * 20 + 50) * a + 300 * b );
		}
	},

    drawWordRatingScreen: function(word)
    {
		this.context.font = "bold 20px Courier New";
        this.context.fillText(word, 10, 30);

		this.context.font = "bold 30px Courier New";
        this.context.fillText("+ -", 10, 60);
    },
});

var GraphGraphics = new Class({
	Extends: Graphics,

	drawBackground: function()
	{
		this._clearCanvas();
	},

	drawNode: function(node, posX, posY, isRoot, mouseOver, alpha)
	{
		this.context.textBaseline = "middle";

		if (isRoot)
		{
			this.context.font = "bold 14px Verdana";
			this._drawGnoviIcon(posX, posY, 50, true, alpha);
			this.context.fillStyle = "rgba(255, 0, 0, " + alpha + ")";
			this._fillCenteredText(node.label, posX, posY + 40);
		}
		else
		{
			this.context.font = "bold 10px Verdana";
			this._drawGnoviIcon(posX, posY, 30, mouseOver, alpha);
			this.context.fillStyle = "rgba(0, 0, 0, " + alpha + ")";
			this._fillCenteredText(node.label, posX, posY + 25);
		}
	},

	drawConnection: function(x1, y1, x2, y2, alpha)
	{
		this.context.beginPath();
		this.context.moveTo(x1, y1);
		this.context.lineTo(x2, y2);

		this.context.strokeStyle = "rgba(0, 0, 0, " + alpha + ")";
		this.context.lineWidth = 1.5;
		this.context.stroke();
	},

	getGraphCenter: function()
	{
		return {x: 320, y: 240};
	},

	getNodeStartDistance: function() { return 350; },

	getInterpolationTime: function() { return 1.8; },
});
