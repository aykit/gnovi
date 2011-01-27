var StateEngine = new Class({
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

    keypressEvent: function(event)
    {
        if (event.event.keyCode == 13)
            this.continueEvent();
    },

    start: function(options) {},
    end: function() {},
    drawGame: function(context) {},
    keydownEvent: function(event) {},
    mouseMoveEvent: function(event) {},
    continueEvent: function() {},
    dataTransmitted: function(data) {},
});

var Input = new Class({
    Extends: Game,

    initialize: function(canvas)
    {
        this.parent(canvas, new InputGraphics(), 1);

        this.data = {};

        this.currentStateEngine = null;
        this.setStateEngine(StateEngineStart);
    },

    draw: function()
    {
        this.parent();

        this.context.save();
        this.currentStateEngine.drawGame(this.graphics, this.context);
        this.context.restore();

        if (this.loadingSomething())
        {
            this.context.save();
            this.graphics.drawLoadingIndicator(this.loadingSomethingTime);
            this.context.restore();
        }

        this.context.save();
        this.graphics.drawDebugInfo(1 / this.delta, this.drawCount);
        this.context.restore();
    },

    setStateEngine: function(stateEngineClass, options)
    {
        this.setTimer(0);

        if (this.currentStateEngine)
        {
            this.currentStateEngine.end();
            console.log(JSON.encode(this.data));
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

    transmitDataSuccess: function(data)
    {
        if (this.currentStateEngine)
            this.currentStateEngine.dataTransmitted(data);
    },

    transmitDataFailure: function(error)
    {
        this.parent(error);
        if (confirm("Fehler bei der Datenübertragung. Nochmal versuchen?"))
            this.retransmitData();
    },

    onTimer: function()
    {
        this.parent();
        this.currentStateEngine.timerEvent(this.delta);
    },

    onKeypress: function(event)
    {
        this.currentStateEngine.keypressEvent(event);
        return event.event.keyCode != 8 && event.event.keyCode != 32;
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

window.addEvent("load", function() {
    new Input($("game"));
});
