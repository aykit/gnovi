var StateEngine = new Class({
    inputText: "",

    initialize: function(game)
    {
        this.game = game;
    },

    timerEvent: function(delta)
    {
        this.game.draw();
    },

    clickEvent: function(event)
    {
        this.continueEvent();
    },

    keypressEvent: function(event, key)
    {
        if (key == 13)
            this.continueEvent();
        else if (key == 8)
            this.inputText = this.inputText.substr(0, this.inputText.length - 1);
        else if (this.inputCharacterAllowed(key))
            this.inputText += String.fromCharCode(key);
    },

    inputCharacterAllowed: function(key) { return key >= 32; },

    start: function(options) {},
    end: function() {},
    drawGame: function(context) {},
    keydownEvent: function(event) {},
    mouseMoveEvent: function(event) {},
    continueEvent: function() {},
    dataTransmitted: function(response) {},
});

var Input = new Class({
    Extends: Game,

    initialize: function(canvas, mode)
    {
        this.parent(canvas, new InputGraphics(), 1);

        this.mode = mode;
        this.data = {};

        this.currentStateEngine = null;
        this.setStateEngine(StateEngineStart);
    },

    draw: function()
    {
        this.context.save();
        this.currentStateEngine.drawGame(this.graphics, this.context);
        this.context.restore();

        if (this.loadingSomething())
        {
            this.context.save();
            this.graphics.drawLoadingIndicator(this.loadingSomethingTime);
            this.context.restore();
        }

        this.drawDebugInfo();
    },

    setStateEngine: function(stateEngineClass, options)
    {
        this.setTimer(0);

        if (this.currentStateEngine)
        {
            this.currentStateEngine.end();
            //console.log(JSON.encode(this.data));
        }

        if (stateEngineClass)
        {
            this.currentStateEngine = new stateEngineClass(this);
            this.currentStateEngine.start(options);
            this.draw();
        }
        else
            this.currentStateEngine = null;
    },

    transmitDataSuccess: function(responseData, command)
    {
        if (this.currentStateEngine)
            this.currentStateEngine.dataTransmitted(responseData);
    },

    transmitDataFailure: function(errorType)
    {
        this.parent(errorType);
        if (confirm("Fehler bei der Datenübertragung (" + errorType + "). Nochmal versuchen?"))
            this.retransmitData();
    },

    onTimer: function()
    {
        this.parent();
        this.currentStateEngine.timerEvent(this.delta);
    },

    onKeypress: function(event)
    {
        var key = event.charCode || event.keyCode;
        this.currentStateEngine.keypressEvent(event, key);
        if (key == 8 || key == 32)
            event.preventDefault();
    },

    onKeydown: function(event)
    {
        this.currentStateEngine.keydownEvent(event);
    },

    onClick: function(event)
    {
        this.currentStateEngine.clickEvent(event);
    },

    onMouseMove: function(event)
    {
        this.parent(event);
        this.currentStateEngine.mouseMoveEvent(event);
    },
});
