var Game = new Class({

    timer: null,
    delta: 0,
    drawCount: 0,
    clientX: 0,
    clientY: 0,
    mouseX: 0,
    mouseY: 0,
    images: {},
    loadingImages: false,
    dataRequest: null,
    loadingSomethingTime: 0,
    retransmitCount: 0,
    unloading: false,

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
        this.graphics.init(this.context, this.getImage.bind(this));

        document.addEventListener("keypress", this.onKeypress.bind(this), false);
        document.addEventListener("keydown", this.onKeydown.bind(this), false);
        this.canvas.addEventListener("click", this.onClick.bind(this), false);
        this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this), false);
        window.addEventListener("beforeunload", this.onUnload.bind(this), false);

        this.dataRequest = new Request.JSON({
            url: "/php/data.php",
            onSuccess: this.onDataRequestSuccess.bind(this),
            onFailure: this.onDataRequestFailure.bind(this),
            onTimeout: this.onDataRequestTimeout.bind(this),
            timeout: 60000,
        });

        this.loadImages(this.graphics.getImagesToLoad());
    },

    loadImages: function(imgList)
    {
        if (!imgList || Object.getLength(imgList) == 0)
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

    draw: function() {},

    drawDebugInfo: function()
    {
        /*this.drawCount++;

        this.context.save();
        this.graphics.drawDebugInfo(1 / this.delta, this.drawCount);
        this.context.restore();*/
    },

    setTimer: function(interval)
    {
        switch (interval)
        {
        case "normalfps":
            interval = 30;
            break;
        case "highfps":
            interval = 10;
            break;
        }

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

    imageLoadingFinished: function() {},

    loadingSomething: function()
    {
        return this.loadingImages || this.transmittingData();
    },

    transmittingData: function()
    {
        return this.dataRequest.isRunning();
    },

    transmitData: function(data)
    {
        this.dataRequest.cancel();
        this.dataRequest.setOptions({data: data});
        this.dataRequest.send({method: "get"});
        this.retransmitCount = 0;
    },

    retransmitData: function()
    {
        this.dataRequest.cancel();
        this.dataRequest.send({method: "get"});
        this.retransmitCount++;
    },

    onDataRequestSuccess: function(response, text)
    {
        if (response.status == "success")
            this.transmitDataSuccess(response.data, response.command);
        else
            this.transmitDataFailure(response.errorType);
    },

    onDataRequestFailure: function()
    {
        if (this.unloading)
            return;
        this.transmitDataFailure("transfer");
    },

    onDataRequestTimeout: function()
    {
        this.dataRequest.cancel();
        this.transmitDataFailure("timeout");
    },

    transmitDataSuccess: function(responseData, command) {},

    transmitDataFailure: function(error)
    {
        console.log("error: " + error);
        if (this.dataRequest.response)
            console.log("response: " + this.dataRequest.response.text);
    },

    mouseInsideRect: function(rect)
    {
        if (rect.x1 !== undefined)
            return this.mouseX >= rect.x1 && this.mouseY >= rect.y1 &&
                this.mouseX < rect.x2 && this.mouseY < rect.y2;

        return this.mouseX >= rect.x && this.mouseY >= rect.y &&
            this.mouseX < rect.x + rect.width && this.mouseY < rect.y + rect.height;
    },

    onTimer: function()
    {
        this.delta = Date.now() / 1000 - this.lastTimerEventTime;
        this.lastTimerEventTime += this.delta;

        if (this.loadingSomething())
        {
            this.loadingSomethingTime += this.delta;
            updateScreen = true;
        }
        else
            this.loadingSomethingTime = 0;
    },

    onMouseMove: function(event)
    {
        this.mouseX = (event.pageX - this.clientX) / this.scaling;
        this.mouseY = (event.pageY - this.clientY) / this.scaling;
    },

    onKeypress: function(event) {},

    onKeydown: function(event) {},

    onClick: function(event) {},

    onUnload: function(event)
    {
        this.unloading = true;
    },
});
