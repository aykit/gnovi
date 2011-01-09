var AUTOINPUT = true;

/*
 *  START SCREEN
 */

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

/*
 *  WORD COLLECTING
 */

var StateEngineWordCollecting = new Class({
    Extends: StateEngine,

    start: function()
    {
        this.totalTime = 30;
        this.timeLeft = this.totalTime;
        this.currentInputText = "";
        this.inputList = [];
        this.inputListAnimation = [];
        this.headWord = "Berg";

        if (AUTOINPUT)
        {
            this.timeLeft = 0.5;
            this.inputList = ["hallo", "du"];
            this.inputListAnimation = [1, 0];
        }

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
        this.game.setStateEngine(StateEngineWordsFinished, {inputTime: this.totalTime});
    },
});

/*
 *  WORD COLLECTING FINISHED
 */

var StateEngineWordsFinished = new Class({
    Extends: StateEngine,

    start: function(options)
    {
        this.game.setTimer(30);
        this.fadeEffect = 0;
        this.inputTime = options.inputTime;

        if (AUTOINPUT)
        {
            this.fadeEffect = 1; // SKIP SCREEN
            this.continueEvent(); // SKIP SCREEN
        }
    },

    drawGame: function(graphics, context)
    {
        graphics.drawWordsFinishedScreen(this.game.data.inputList, this.inputTime, this.fadeEffect, this.fadeEffect >= 1);
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

/*
 *  INPUT LOCATION
 */

var StateEngineInputLocation = new Class({
    Extends: StateEngine,

    start: function(options)
    {
        this.currentInputText = "";

        if (AUTOINPUT)
        {
            this.game.data.location = "Küche";
            this.game.setStateEngine(StateEngineLocationWordCollecting);
        }
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

/*
 *  LOCATION WORD COLLECTING
 */

var StateEngineLocationWordCollecting = new Class({
    Extends: StateEngineWordCollecting,

    start: function()
    {
        this.parent();
        this.headWord = this.game.data.location;

        if (AUTOINPUT)
            this.inputList = ["ich", "du"];
    },

    finishInput: function()
    {
        this.game.data.locationInputList = this.inputList;
        this.game.setStateEngine(StateEngineLocationWordsFinished, {inputTime: this.totalTime});
    },
});

/*
 *  LOCATION WORD COLLECTING FINISHED
 */

var StateEngineLocationWordsFinished = new Class({
    Extends: StateEngineWordsFinished,

    drawGame: function(graphics, context)
    {
        graphics.drawLocationWordsFinishedScreen(this.game.data.locationInputList, this.inputTime, this.fadeEffect, this.fadeEffect >= 1);
    },

    continueEvent: function()
    {
        if (this.fadeEffect >= 1)
            this.game.setStateEngine(StateEngineWordRating);
    },
});

/*
 *  WORD RATING
 */

var StateEngineWordRating = new Class({
    Extends: StateEngine,

    start: function(options)
    {
        this.words = Array.clone(this.game.data.inputList);
        this.words.combine(this.game.data.locationInputList);

        this.connotations = [];

        this.nextWord();
    },

    nextWord: function()
    {
        var i = Number.random(0, this.words.length - 1);
        this.currentWord = this.words[i];
        this.words.splice(i, 1);
    },

    drawGame: function(graphics, context)
    {
        graphics._clearCanvas();

        if (this.dead)
        {
            context.fillText("bamwamm fertig", 10, 30);
            return;
        }

        graphics.drawWordRatingScreen(this.currentWord);
    },

    continueEvent: function()
    {
        if (this.dead)
            return;

        if (this.words.length > 0)
            this.nextWord();
        else
            this.dead = true;

        this.game.draw();
    },
});
