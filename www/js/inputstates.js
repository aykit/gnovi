var AUTOINPUT = {
    /*info: true,
    inputList: ["nix", "haus", "du", "hallo", "nix"],
    inputLocation: "Berg",
    inputLocationList: ["deinemama", "du"],
    randomConnotations: true,*/
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
        this.game.transmitData("cmd=getword&mode=" + this.game.mode);
        this.game.setTimer("normalfps");
    },

    dataTransmitted: function(response)
    {
        this.loading = false;
        this.game.data.initialWord = String(response);
        this.game.draw();

        if (AUTOINPUT.info)
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
        this.totalTime = 20;
        this.timeLeft = this.totalTime;
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
            this.inputText, this.inputList, this.inputListAnimation);
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

    keypressEvent: function(event, key)
    {
        this.parent(event, key);
        this.game.draw();
    },

    inputCharacterAllowed: function(key) { return key >= 65 && key != 95; },

    continueEvent: function()
    {
        if (this.inputText != "")
        {
            this.inputList.push(this.inputText); // inputText should not be "." or ".."
            this.inputListAnimation.push(0);
            this.inputText = "";
            this.game.draw();
        }
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

    fadeEffect: 0,
    inputChecked: false,
    inputListField: "inputList",
    titlePosField: "titlePos",
    editingWordIndex: -1,
    editingWord: "",
    wordList: [],

    start: function(options)
    {
        this.inputTime = options.inputTime;

        this.performRequest("cmd=checkwords&words=" +
            encodeURIComponent(JSON.encode(this.game.data[this.inputListField])));
        delete this.game.data[this.inputListField];
    },

    performRequest: function(data)
    {
        this.game.setTimer("normalfps");
        this.requestPending = true;
        this.game.transmitData(data);
    },

    requestFinished: function()
    {
        this.game.setTimer(0);
        this.requestPending = false;
    },

    dataTransmitted: function(response)
    {
        if (this.editingWordIndex >= 0)
        {
            if (response[0].wordcheck != "")
                this.wordList[this.editingWordIndex].wordcheck = response[0].wordcheck;
            this.wordList[this.editingWordIndex].marked = response[0].original != response[0].wordcheck;

            this.requestFinished();
            this.editingWordIndex = -1;
            this.editWord(this.nextEditingWordIndex);
            return;
        }

        this.wordList = response.map(function(wordInfo) {
            return {
                "wordcheck": wordInfo.wordcheck,
                "word": wordInfo.wordcheck != "" ? wordInfo.wordcheck: wordInfo.original,
                "marked": wordInfo.original != wordInfo.wordcheck,
            }
        });
        this.inputChecked = true;

        if (AUTOINPUT.info)
        {
            this.fadeEffect = 1;
            this.requestFinished();
            this.continueEvent();
        }
    },

    drawGame: function(graphics, context)
    {
        if (this.editingWordIndex >= 0)
            this.wordList[this.editingWordIndex].word = this.inputText + "_";

        this.drawGameInternal(graphics, context);

        if (this.editingWordIndex >= 0)
            this.wordList[this.editingWordIndex].word = this.inputText;
    },

    drawGameInternal: function(graphics, context)
    {
        graphics.drawWordsFinishedScreen(this.game.data.initialWord, this.wordList,
            this.inputTime, this.fadeEffect, this.fadeEffect >= 1, this.inputChecked);
    },

    timerEvent: function(delta)
    {
        if (this.inputChecked && this.fadeEffect != 1)
        {
            this.fadeEffect += delta;
            if (this.fadeEffect >= 1)
            {
                this.fadeEffect = 1;
                this.requestFinished();
            }
        }

        this.game.draw();
    },

    keypressEvent: function(event, key)
    {
        //if (this.editingWordIndex >= 0 && key == 27) /* esc */
        //{
        //    this.continueEvent();
        //    return;
        //}

        this.parent(event, key);
        this.game.draw();
    },

    inputCharacterAllowed: function(key) { return key >= 65 && key != 95; },

    editWord: function(index)
    {
        if (this.editingWordIndex >= 0)
        {
            var oldIndex = this.editingWordIndex;
            if (this.wordList[oldIndex].word == this.wordList[oldIndex].wordcheck)
            {
                this.wordList[oldIndex].marked = false;
            }
            else
            {
                this.nextEditingWordIndex = index;
                this.performRequest("cmd=checkwords&words=" +
                    encodeURIComponent(JSON.encode([this.wordList[oldIndex].word])));
                return;
            }
        }

        this.editingWordIndex = index;
        if (index >= 0)
            this.inputText = this.wordList[index].word;

        this.game.draw();
    },

    clickEvent: function()
    {
        if (this.requestPending)
            return;

        if (this.editingWordIndex >= 0 && this.inputText == "")
            return;

        var hotspots = this.game.graphics.getWordsFinishedScreenHotspots(this.wordList);
        for (var i = 0; i < hotspots.length; i++)
        {
            if (this.game.mouseInsideRect(hotspots[i]))
            {
                this.editWord(i);
                return;
            }
        }
    },

    continueEvent: function()
    {
        if (this.requestPending)
            return;

        if (this.editingWordIndex >= 0)
        {
            if (this.inputText != "")
                this.editWord(-1);
            return;
        }

        if (!this.game.data.wordMap)
            this.game.data.wordMap = {};
        wordMap = this.game.data.wordMap;

        for (var i = 0; i < this.wordList.length; i++)
        {
            wordInfo = this.wordList[i];

            if (!wordMap[wordInfo.word])
                wordMap[wordInfo.word] = {};
            wordData = wordMap[wordInfo.word];

            wordData[this.titlePosField] = i + 1;
            wordData.word = wordInfo.word;
        }

        this.nextState();
    },

    nextState: function()
    {
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
        if (AUTOINPUT && AUTOINPUT.inputLocation)
        {
            this.game.data.location = AUTOINPUT.inputLocation;
            this.game.setStateEngine(StateEngineLocationWordCollecting);
        }
    },

    drawGame: function(graphics, context)
    {
        graphics.drawInputLocationScreen(this.inputText);
    },

    keypressEvent: function(event, key)
    {
        this.parent(event, key);
        this.game.draw();
    },

    continueEvent: function()
    {
        var text = this.inputText.trim();
        if (text == "." || text == "..")
        {
            this.inputText = "";
            this.game.draw();
        }
        else if (text != "")
        {
            this.game.data.location = text;
            this.game.setStateEngine(StateEngineLocationWordCollecting);
        }
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

    inputListField: "locationInputList",
    titlePosField: "locationPos",

    drawGameInternal: function(graphics, context)
    {
        graphics.drawLocationWordsFinishedScreen(this.game.data.location, this.wordList,
            this.inputTime, this.fadeEffect, this.fadeEffect >= 1, this.inputChecked);
    },

    nextState: function()
    {
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
        this.words = Object.keys(this.game.data.wordMap);

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
        this.game.data.wordMap[this.currentWord].connotation = connotation;

        if (!this.nextWord())
        {
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
        switch (event.keyCode)
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
        this.game.data.words = Object.values(this.game.data.wordMap);
        delete this.game.data.wordMap;

        this.game.transmitData("cmd=storerun&data=" + encodeURIComponent(JSON.encode(this.game.data)));
        this.game.setTimer("normalfps");
    },

    dataTransmitted: function(response)
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
            window.location = document.getElementById("personal_graph_link").href + "/" +
            encodeURIComponent(this.game.data.initialWord);
    },
});
