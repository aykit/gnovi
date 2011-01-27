var AUTOINPUT = {
    inputList: ["hallo", "du", "hallo", "nix"],
    inputLocation: "Berg",
    inputLocationList: ["deinemama", "du"],
    randomConnotations: true,
};

var InputStatesUtils = new Class({});

/*
 *  START SCREEN
 */

var StateEngineStart = new Class({
    Extends: StateEngine,

    loading: true,

    start: function()
    {
        this.game.transmitData("cmd=getword");
        this.game.setTimer("normalfps");
    },

    dataTransmitted: function(data)
    {
        this.loading = false;
        this.game.data.initialWord = String(data);
        this.game.draw();

        if (AUTOINPUT)
            this.continueEvent();
    },

    drawGame: function(graphics, context)
    {
        graphics.drawStartScreen(!this.loading);
    },

    timerEvent: function()
    {
        if (this.loading)
            this.game.draw();
    },

    continueEvent: function()
    {
        if (!this.loading)
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
        this.totalTime = 10;
        this.timeLeft = this.totalTime;
        this.currentInputText = "";
        this.inputList = [];
        this.inputListAnimation = [];
        this.headWord = this.game.data.initialWord;

        if (AUTOINPUT && AUTOINPUT.inputList)
        {
            this.timeLeft = 0.5;
            this.inputList = AUTOINPUT.inputList;
            this.inputListAnimation = [0.5, 0];
            for (var i = 0; i < AUTOINPUT.inputList.length - 2; i++)
                this.inputListAnimation.unshift(1);
        }

        this.game.setTimer("highfps");
    },

    drawGame: function(graphics, context)
    {
        graphics.drawWordCollectingScreen(this.headWord, this.timeLeft, this.totalTime,
            this.currentInputText, this.inputList, this.inputListAnimation);
    },

    timerEvent: function(delta)
    {
        var timeDisplayed = Math.ceil(this.timeLeft * 30);

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
                this.inputListAnimation[i] += delta / this.game.graphics.getWordCollectingAnimationTime();
                if (this.inputListAnimation[i] > 1)
                    this.inputListAnimation[i] = 1;
                updateScreen = true;
            }
        }

        if (timeDisplayed != Math.ceil(this.timeLeft * 30))
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

        if (event.event.keyCode == 13 && this.currentInputText != "")
        {
            if (this.currentInputText != "." && this.currentInputText != "..")
            {
                this.inputList.push(this.currentInputText);
                this.inputListAnimation.push(0);
            }

            this.currentInputText = "";
            this.game.draw();
            return;
        }

        if (event.event.keyCode < 65)
            return;

        this.currentInputText = this.currentInputText + String.fromCharCode(event.event.charCode);
        this.game.draw();
    },

    finishInput: function()
    {
        this.game.data.inputList = [];
        this.game.data.inputList.combine(this.inputList);
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
        this.game.setTimer("normalfps");
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
        graphics.drawWordsFinishedScreen(this.game.data.initialWord, this.game.data.inputList,
            this.inputTime, this.fadeEffect, this.fadeEffect >= 1);
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

        if (AUTOINPUT && AUTOINPUT.inputLocation)
        {
            this.game.data.location = AUTOINPUT.inputLocation;
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
            var text = this.currentInputText.trim();
            if (text == "." || text == "..")
            {
                this.currentInputText = "";
                this.game.draw();
                return;
            }

            if (text != "")
            {
                this.game.data.location = text;
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

        if (AUTOINPUT && AUTOINPUT.inputList)
        {
            this.timeLeft = 0.5;
            this.inputList = AUTOINPUT.inputLocationList;
            this.inputListAnimation = [0.5, 0];
            for (var i = 0; i < AUTOINPUT.inputLocationList.length - 2; i++)
                this.inputListAnimation.unshift(1);
        }
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
        graphics.drawLocationWordsFinishedScreen(this.game.data.location, this.game.data.locationInputList,
            this.inputTime, this.fadeEffect, this.fadeEffect >= 1);
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

    selectedButton: "",
    buttonPositions: null,

    start: function(options)
    {
        this.words = Array.clone(this.game.data.inputList);
        this.words.combine(this.game.data.locationInputList);

        this.connotations = {};

        if (!this.nextWord())
        {
            this.game.setStateEngine(StateEngineFinished);
            return;
        }

        this.game.setTimer("normalfps");
    },

    nextWord: function()
    {
        if (this.words.length == 0)
            return false;

        var i = Number.random(0, this.words.length - 1);
        this.currentWord = this.words[i];
        this.words.splice(i, 1);

        this.buttonPositions = this.game.graphics.getWordRatingButtonPositions(this.currentWord);
        return true;
    },

    setConnotation: function(connotation)
    {
        this.connotations[this.currentWord] = connotation;

        if (!this.nextWord())
        {
            this.game.data.connotations = this.connotations;
            this.game.setStateEngine(StateEngineFinished);
            return;
        }

        this.game.draw();
    },

    drawGame: function(graphics, context)
    {
        graphics.drawWordRatingScreen(this.currentWord, this.selectedButton);
    },

    timerEvent: function()
    {
        if (AUTOINPUT.randomConnotations)
        {
            this.setConnotation(Number.random(0, 1) ? "+" : "-");
            return;
        }

        if (this.game.mouseInsideRect(this.buttonPositions["+"]))
            newSelectedButton = "+";
        else if (this.game.mouseInsideRect(this.buttonPositions["-"]))
            newSelectedButton = "-";
        else
            newSelectedButton = "";

        if (this.selectedButton != newSelectedButton)
        {
            this.selectedButton = newSelectedButton;
            this.game.draw();
        }
    },

    clickEvent: function()
    {
        if (this.selectedButton != "+" && this.selectedButton != "-")
            return;

        this.setConnotation(this.selectedButton);
    },

    keydownEvent: function(event)
    {
        switch (event.event.keyCode)
        {
        case 37:
            this.setConnotation("+");
            break;
        case 39:
            this.setConnotation("-");
            break;
        }
    },
});

/*
 *  FINISHED
 */

var StateEngineFinished = new Class({
    Extends: StateEngine,

    dataIsTransmitted: false,

    start: function()
    {
        this.game.transmitData("cmd=storerun&data=" + encodeURIComponent(JSON.encode(this.game.data)));
        this.game.setTimer("normalfps");
    },

    dataTransmitted: function(data)
    {
        this.dataIsTransmitted = true;
        this.game.setTimer(0);
        this.game.draw();
    },

    drawGame: function(graphics, context)
    {
        graphics.drawFinishedScreen(this.dataIsTransmitted);
    },

    continueEvent: function()
    {
        if (this.dataTransmitted)
            window.location = document.getElementById("graph_link").href + "/" +
            encodeURIComponent(this.game.data.initialWord);
    },
});
