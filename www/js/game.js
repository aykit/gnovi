var Game = new Class({

    timer: null,
    delta: 0,
    drawCount: 0,
    mouseX: 0,
    mouseY: 0,
    images: {},
    loadingImages: false,
//    requestPending: false,

    initialize: function(canvas, graphics, scaling)
    {
        this.canvas = canvas;
        this.graphics = graphics;
        this.scaling = scaling;

        var canvasPos = this.canvas.getPosition();
        this.clientX = canvasPos.x + this.canvas.clientLeft;
        this.clientY = canvasPos.y + this.canvas.clientTop;

        this.context = this.canvas.getContext('2d');
        this.context.scale(this.scaling, this.scaling);
        this.graphics.setContext(this.context);

        document.addEvent("keypress", this.onKeypress.bind(this));
        this.canvas.addEvent("click", this.onClick.bind(this));
        this.canvas.addEvent("mousemove", this.onMouseMove.bind(this));
    },

    loadImages: function(imgList)
    {
        if (imgList.length == 0)
        {
            if (!this.loadingImages)
                this.imageLoadingFinished();
            return;
        }

        this.loadingImages = true;

        for (var name in imgList)
        {
            var path = imgList[name];

            var img = new Image();
            img.onload = this.onImageLoaded.bind(this);
            img.onerror = this.onImageLoadingError.bind(this);
            img.src = path;
            img.gameName = name;
            img.gameStatus = "loading";

            this.images[name] = img;
        }
    },

    getImage: function(name)
    {
        return this.images[name];
    },

    draw: function()
    {
        this.drawCount++;
    },

    setTimer: function(interval)
    {
        if (this.timer)
            clearInterval(this.timer);

        this.lastTimerEventTime = Date.now() / 1000;

        if (interval == 0)
            this.timer = null;
        else
            this.timer = this.onTimer.periodical(interval, this);
    },

    onImageLoaded: function(e)
    {
        e.target.gameStatus = "loaded";

        for (var name in this.images)
        {
            if (this.images[name].gameStatus == "loading")
                return;
        }

        this.loadingImages = false;
        this.imageLoadingFinished();
    },

    onImageLoadingError: function(e)
    {
        e.target.gameStatus = "error";

        for (var name in this.images)
        {
            if (this.images[name].gameStatus == "loading")
                return;
        }

        this.imageLoadingFinished();
    },

    imageLoadingFinished: function() { },

    isLoadingSomething: function()
    {
        return this.isLoadingImages;
    },

    onTimer: function()
    {
        this.delta = Date.now() / 1000 - this.lastTimerEventTime;
        this.lastTimerEventTime += this.delta;

        if (this.isLoadingSomething())
        {
            this.loadingSomethingTime += this.delta;
            updateScreen = true;
        }
        else
            this.loadingSomethingTime = 0;
    },

    onMouseMove: function(e)
    {
        this.mouseX = (e.event.pageX - this.clientX) / this.scaling;
        this.mouseY = (e.event.pageY - this.clientY) / this.scaling;
    },

    onKeypress: function(event) { },

    onClick: function(event){ },
});
