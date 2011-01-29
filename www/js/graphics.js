/*
 *  Attribute und Methoden, die mit Unterstrich beginnen,
 *  werden nur in dieser Datei verwendet und können geändert werden
 */

var Graphics = new Class({
    init: function(context, imageGetter)
    {
        this.context = context;
        this.getImage = imageGetter;
    },

    getImage: null,

    getImagesToLoad: function()
    {
        return {
            "gnovinode": "/images/gnovi_node.png",
            "gnovinodeselected": "/images/gnovi_node_selected.png",
            "gnovinoderoot": "/images/gnovi_node_root.png",
        };
    },

    _makeColor: function(r, g, b, a)
    {
        if (r < 0) r = 0;
        if (g < 0) g = 0;
        if (b < 0) b = 0;
        if (a < 0) a = 0;
        if (r > 255) r = 255;
        if (g > 255) g = 255;
        if (b > 255) b = 255;
        if (a > 1) a = 1;
        return "rgba(" + r + "," + g + "," + b + "," + a + ")";
    },

    _fillCircle: function(x, y, r)
    {
        this.context.beginPath();
        this.context.arc(x, y, r, 0, 2 * Math.PI, false);
        this.context.fill();
    },

    _strokeCircle: function(x, y, r)
    {
        this.context.beginPath();
        this.context.arc(x, y, r, 0, 2 * Math.PI, false);
        this.context.stroke();
    },

    _コード: function(x, y, width, height, cornerRadius)
    {
        this.context.beginPath();
        this.context.moveTo(x+cornerRadius, y);
        this.context.lineTo(x+cornerRadius+(width-2*cornerRadius), y);
        this.context.quadraticCurveTo(x+2*cornerRadius+(width-2*cornerRadius), y, 
            x+2*cornerRadius+(width-2*cornerRadius), y+cornerRadius);
        this.context.lineTo(x+2*cornerRadius+(width-2*cornerRadius), y+cornerRadius+(height-2*cornerRadius));
        this.context.quadraticCurveTo(x+2*cornerRadius+(width-2*cornerRadius), 
            y+2*cornerRadius+(height-2*cornerRadius),
            x+cornerRadius+(width-2*cornerRadius), y+2*cornerRadius+(height-2*cornerRadius));
        this.context.lineTo(x+cornerRadius, y+2*cornerRadius+(height-2*cornerRadius));
        this.context.quadraticCurveTo(x, y+2*cornerRadius+(height-2*cornerRadius), x, 
            y+cornerRadius+(height-2*cornerRadius));
        this.context.lineTo(x, y+cornerRadius);
        this.context.quadraticCurveTo(x, y, x+cornerRadius, y);
        this.context.stroke();
        this.context.fill();
        this.context.stroke();
        
    },

    _drawGnoviIcon: function(posX, posY, size, glow, alpha, isRoot)
    {
        /*
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
        
        */
        
        var gnoviImageRoot = this.getImage("gnovinode");
        var gnoviImageSelected = this.getImage("gnovinodeselected");
        var gnoviImage = this.getImage("gnovinoderoot");
            
        if (isRoot)
            this.context.drawImage(gnoviImageRoot, posX - gnoviImageRoot.width/2, posY - gnoviImageRoot.height/2);
        else if (glow)
            this.context.drawImage(gnoviImageSelected, posX - gnoviImageSelected.width/2, 
                posY - gnoviImageSelected.height/2);
        else
            this.context.drawImage(gnoviImage, posX - gnoviImage.width/2, posY - gnoviImage.height/2);
        
        
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
            
            this.context.strokeStyle = "#7F7F7F";
            this.context.fillStyle = "#231F20";
            this._コード(320 - rectWidth / 2, 45, rectWidth, 44, 12);

            this.context.fillText(wordList[i], x + wordOffsetX, y + wordOffsetY);

            wordOffsetX += textWidth + spacing;
        }
    },

    _clearCanvas: function()
    {
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    },

    _suffixNumber: function(number, singular, plural)
    {
        return number + (number == 1 ? singular : plural);
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

        this.context.font = "10px HeroRegular";
        this.context.textAlign = "center";
        var txt = Math.round(fps) + " fps";
        this.context.fillText(txt, 0, 30);

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
        this.context.font = "12px HeroRegular";
        this.context.textAlign = "center";

        this.context.strokeStyle = "rgba(255, 255, 255," + alpha + ")";
        this.context.lineWidth = 5;
        this.context.strokeText("loading . . .", 0, 200)

        this.context.fillStyle = "rgba(0, 0, 0," + alpha + ")";
        this.context.fillText("loading . . .", this.context.canvas.width / 2, this.context.canvas.height - 30)
    },
});

var InputGraphics = new Class({
    Extends: Graphics,

    _collectingWordDisplayCount: 8,

    drawStartScreen: function(canStart)
    {
        this._clearCanvas();

        if (!canStart)
            return;

        this.context.fillStyle = "black";

        this.context.font = "20px HeroRegular";
        this.context.fillText("click to start", 100, 20);
    },

    drawWordsFinishedScreen: function(initialWord, wordList, inputTime, fade, drawContinueNotice, wordsChecked)
    {
        this._clearCanvas();

        if (initialWord)
        {
            this.context.font = "20px HeroRegular";
            var rectWidth = Math.max(this.context.measureText(initialWord).width + 30, 136);
            
            this.context.strokeStyle = "#7F7F7F";
            this.context.fillStyle = "#231F20";
            this._コード(320 - rectWidth / 2, 45, rectWidth, 44, 12);
            
            
            this.context.fillStyle = "#FFFFFF";
            this.context.textAlign = "center";
            
            this.context.fillText(initialWord, 320, 72);
            

        }

        if (wordsChecked)
        {
            this.context.fillStyle = "rgba(0, 0, 0, " + fade + ")";
            this.context.textAlign = "center";
            this.context.fillText(this._suffixNumber(wordList.length, " Wort", " Wörter") +
                " eingegeben in " + inputTime + " Sekunden", 320, 30);
            this.context.textAlign = "left";
            this._fillTextRect(wordList, 40, 50, 300, 10, 25);
        }
        
        if (!drawContinueNotice)
            return;

        this.context.font = "14px HeroRegular";
        this.context.fillText("press Enter to continue", 20, 300);
    },

    drawLocationWordsFinishedScreen: function(location, wordList, inputTime, fade, drawContinueNotice, wordsChecked)
    {
        this.drawWordsFinishedScreen(location, wordList, inputTime, fade, drawContinueNotice, wordsChecked);
    },

    drawInputLocationScreen: function(inputText)
    {
        this._clearCanvas();

        this.context.fillStyle = "black";
        this.context.font = "20px HeroRegular";

        this.context.fillText("Enter your location:", 20, 20);

        this.context.font = "15px HeroRegular";
        this.context.fillText(inputText, 30, 50);
    },

    drawWordCollectingScreen: function(headWord, timeLeft, totalTime, currentInputText, inputList, inputListAnimation)
    {
        this._clearCanvas();

        this.context.font = "25px HeroRegular";
        var rectWidth = Math.max(this.context.measureText(headWord).width + 30, 136);

        this.context.strokeStyle = "#7F7F7F";
        this.context.fillStyle = "#231F20";
        this._コード(320 - rectWidth / 2, 85, rectWidth, 44, 12);

        this.context.fillStyle = "white";
        this.context.textAlign = "center";
        this.context.fillText(headWord, 320, 115);

            /* DRAW COUNTERTEXT
            this.context.font = "20px HeroRegular"; */
        
        this.context.fillText(Math.ceil(timeLeft), 400, 20);

        this.context.fillStyle = "#A7CF4A";
        this.context.strokeStyle = "#7F7F7F";
        this.context.lineCap = "round";
        this.context.lineJoin = "round";
        this.context.lineWidth = "1.5";
        this.context.fillRect(0, 37, timeLeft / totalTime * 640, 24);
        this.context.strokeRect(0, 37.5, 640, 25);

        this.context.fillStyle = "black";
        this.context.font = "15px HeroRegular";
        this.context.fillText(currentInputText, 320, 400);

        var wordsInPlace = 0;
        for (var i = 0; i < inputList.length; i++)
            wordsInPlace += inputListAnimation[i];

        var wordsOffset = wordsInPlace - this._collectingWordDisplayCount;
        if (wordsOffset < 0)
            wordsOffset = 0;

        var firstWordToDraw = Math.floor(wordsOffset);

        this.context.fillStyle = "rgba(0, 0, 0, " + (1 + firstWordToDraw - wordsOffset) + ")";

        for (var i = firstWordToDraw; i < inputList.length; i++)
        {
            var a = inputListAnimation[i];
            var b = 1 - a;
            this.context.fillText(inputList[i], 320, ((i - wordsOffset) * 20 + 150) * a + 400 * b);

            if (i == firstWordToDraw)
                this.context.fillStyle = "rgba(0, 0, 0, 1)";
        }
    },

    drawWordRatingScreen: function(word, selectedButton)
    {
        this._clearCanvas();
        this.context.font = "20px HeroRegular";
        var rectWidth = Math.max(this.context.measureText(word).width + 120, 136);

        this.context.strokeStyle = "#7F7F7F";
        this.context.fillStyle = "#231F20";
        this._コード(320 - rectWidth / 2, 85, rectWidth, 44, 12);

        this.context.strokeStyle = "";
        this.context.lineWidth = "2";

        this.context.fillStyle = selectedButton == "+" ? "#99CC33" : "#666666";
        this._コード(320 - rectWidth/2+1, 86, 40, 42, 12);
        
        this.context.fillStyle = selectedButton == "-" ? "#FF6666" : "#666666";
        this._コード(320 + rectWidth / 2 - 41, 86, 40, 42, 12);
    
        this.context.lineWidth = "10";
        this.context.strokeStyle = "#333333";
        this.context.fillStyle = "black";    
            
        this.context.beginPath();
        this.context.moveTo(320 - rectWidth/2+21, 95);
        this.context.lineTo(320 - rectWidth/2+21, 121);
        this.context.moveTo(320 - rectWidth/2+8, 108);
        this.context.lineTo(320 - rectWidth/2+34, 108);
        this.context.stroke();
        
        this.context.beginPath();
        this.context.moveTo(320 + rectWidth / 2 - 8 - 26, 108);
        this.context.lineTo(320 + rectWidth / 2 - 8, 108);
        this.context.stroke();


        this.context.fillStyle = "white";
        this.context.textAlign = "center";
        this.context.fillText(word, 320, 115);
    
        this.context.fillStyle = "#231F20";
        this.context.font = "15px HeroRegular";
        this.context.fillText("Empfindest du das Wort als negativ oder positiv?", 320, 170);
    },

    getWordRatingButtonPositions: function(word)
    {
        this.context.font = "20px HeroRegular";
        var rectWidth = Math.max(this.context.measureText(word).width + 120, 136);

        return {
            "+": {x: 320 - rectWidth/2+1, y: 86, width: 40, height: 42},
            "-": {x: 320 + rectWidth / 2 - 41, y: 86, width: 40, height: 42},
        };
    },

    drawFinishedScreen: function(dataTransmitted)
    {
        this._clearCanvas();

        if (!dataTransmitted)
            return;

        this.context.font = "20px HeroRegular";
        this.context.fillText("Haha.", 10, 30);
    },

    drawLoadingIndicator: function(loadTime)
    {
        loadTime -= 0.2;
        if (loadTime < 0)
            return;

        alpha = loadTime;
        if (alpha > 1)
            alpha = 1;

        scale1 = (Math.cos(loadTime * 2 * Math.PI) + 2) * 2;
        scale2 = (Math.cos(loadTime * 2 * Math.PI + Math.PI / 2) + 2) * 2;

        this.context.strokeStyle = "rgba(0, 0, 0," + alpha + ")";

        this.context.save();
        this.context.translate(this.context.canvas.width / 2, this.context.canvas.height / 2);
        this.context.scale(scale1, scale1);
        this._strokeCircle(0, 0, 20);
        this.context.restore();

        this.context.save();
        this.context.translate(this.context.canvas.width / 2, this.context.canvas.height / 2);
        this.context.scale(scale2, scale2);
        this._strokeCircle(0, 0, 20);
        this.context.restore();

        this.context.textBaseline = "middle";
        this.context.font = "12px HeroRegular";
        this.context.textAlign = "center";

        this.context.strokeStyle = "rgba(255, 255, 255," + alpha + ")";
        this.context.lineWidth = 5;
        this.context.strokeText("loading . . .", 0, 200)

        this.context.fillStyle = "rgba(0, 0, 0," + alpha + ")";
        this.context.fillText("loading . . .", this.context.canvas.width / 2, this.context.canvas.height - 30)
    },

    getWordCollectingAnimationTime: function() { return 0.2; },
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
        this.context.textAlign = "center";

        if (isRoot)
        {
            this.context.font = "20px HeroRegular";
            this._drawGnoviIcon(posX, posY, 50, true, alpha, true);
            this.context.fillStyle = "rgba(0, 0, 0, " + alpha + ")";
            this.context.fillText(node.word, Math.round(posX), Math.round(posY) + 40);
        }
        else
        {
            this.context.font = "15px HeroRegular";
            this._drawGnoviIcon(posX, posY, 30, mouseOver, alpha);
            this.context.fillStyle = "rgba(0, 0, 0, " + alpha + ")";
            this.context.fillText(node.word, Math.round(posX), Math.round(posY) + 25);
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

    getNodeDistance: function(node)
    {
        var category = Math.floor(node.distance * 3);
        if (category > 2)
            category = 2;

        return 100 + 50 * category;
    },

    getGraphCenter: function()
    {
        return {x: 320, y: 240};
    },

    getNodeStartDistance: function() { return 500; },

    getInterpolationTime: function() { return 1.8; },
});
