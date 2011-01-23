var StateEngine = new Class({
    initialize: function(game)
    {
        this.game = game;
    },

    start: function(options) {},
    end: function() {},
    drawGame: function(context) {},
    timerEvent: function(delta) {},
    keypressEvent: function(event) {},
    clickEvent: function(event) {},
    continueEvent: function() {},
    isLoading: function() { return false; },
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

        if (this.isLoadingSomething())
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
            this.currentStateEngine.end();

        if (stateEngineClass)
        {
            this.currentStateEngine = new stateEngineClass(this);
            this.currentStateEngine.start(options);
            this.draw();
        }
        else
            this.currentStateEngine = null;
    },

    isLoadingSomething: function()
    {
        return this.parent() || (this.currentStateEngine && this.currentStateEngine.isLoading());
    },

    onTimer: function()
    {
        this.parent();

        this.currentStateEngine.timerEvent(this.delta);
    },

    onKeypress: function(event)
    {
        this.currentStateEngine.keypressEvent(event);
        if (event.event.keyCode == 13)
            this.currentStateEngine.continueEvent();

        return event.event.keyCode != 8 && event.event.keyCode != 32;
    },

    onClick: function(event)
    {
        this.currentStateEngine.clickEvent(event);
        this.currentStateEngine.continueEvent();
    },
});

window.addEvent("domready", function() {
    new Input($("game"));
});
