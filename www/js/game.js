var Game = new Class({

    timer: null,
    delta: 0,
    drawCount: 0,
    mouseX: 0,
    mouseY: 0,
    images: {},
    loadingImages: false,
    dataRequest: null,
    loadingSomethingTime: 0,
    retransmitCount: 0,

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

        this.dataRequest = new Request.JSON({
            url: "/php/data.php",
            onSuccess: this.onDataRequestSuccess.bind(this),
            onFailure: this.onDataRequestFailure.bind(this),
            onTimeout: this.onDataRequestTimeout.bind(this),
            timeout: 60000,
        });
    },

    loadImages: function(imgList)
    {
        if (Object.getLength(imgList) == 0)
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

    imageLoadingFinished: function() { },

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
            this.transmitDataSuccess(response.data);
        else
            this.transmitDataFailure(response.error);
    },

    onDataRequestFailure: function()
    {
        this.transmitDataFailure("transfer error");
    },

    onDataRequestTimeout: function()
    {
        this.dataRequest.cancel();
        this.transmitDataFailure("timeout");
    },

    transmitDataSuccess: function(data) { },

    transmitDataFailure: function(error)
    {
        console.log("error: " + error);
        if (this.dataRequest.response)
            console.log("response: " + this.dataRequest.response.text);
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

    onMouseMove: function(e)
    {
        // TODO: da stimmt noch was nicht, wenn man die seite lädt während nach unten gescrollt ist!!
        // geht in Firefox & Opera
        this.mouseX = (e.event.pageX - this.clientX) / this.scaling;
        this.mouseY = (e.event.pageY - this.clientY) / this.scaling;
    },

    onKeypress: function(event) { },

    onClick: function(event){ },
});


Game.urlEncode = function(s)
{
    s = s.replace(/\+/g, "+0");
    s = s.replace(/%/g, "+1");
    s = s.replace(/_/g, "+2");
    s = s.replace(/\//g, "+3");
    s = s.replace(/\\/g, "+4");
    s = s.replace(/\./g, "+5");
    s = s.replace(/ /g, "_");
    s = encodeURIComponent(s); // escapes all except: - _ . ! ~ * ' ( )
    return s;
};

Game.urlDecode = function(s)
{
    s = decodeURIComponent(s);
    s = s.replace(/_/g, " ");
    s = s.replace(/\+5/g, ".");
    s = s.replace(/\+4/g, "\\");
    s = s.replace(/\+3/g, "/");
    s = s.replace(/\+2/g, "_");
    s = s.replace(/\+1/g, "%");
    s = s.replace(/\+0/g, "+");
    return s;
};
