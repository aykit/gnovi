var Graph = new Class({
    Extends: Game,

    currentNodesVisData: null,
    currentData: null,
    currentNodes: null,
    connections: [],
    nodesToDraw: [],
    mouseOverNodeId: -1,

    showInterpolation: true,
    interpolationProgress: 1,
    interpolationRunning: false,

    addWordToBrowserHistory: false,
    redrawScreen: false,
    notFound: false,
    rootWord: "",
    timeSliderTimestamp: 0,
    timeSliderHotspots: [],
    timeSliderHoverTime: -1,

    initialize: function(canvas, showAllUsers)
    {
        this.showAllUsers = showAllUsers;
        this.parent(canvas, new GraphGraphics(), 1);

        window.onpopstate = this.onPopState.bind(this);

        this.wordSearchForm = document.getElementById("word_search_form");
        this.wordInputField = document.getElementById("word_input");
        this.wordSubmitButton = document.getElementById("word_submit");
        this.graphInfoElement = document.getElementById("graph_info");
        this.personalGrapLink = document.getElementById("personal_graph_link");
        this.globalGrapLink = document.getElementById("global_graph_link");

        this.wordSearchForm.addEventListener("submit", this.onSearchWordSubmit.bind(this));
        this.personalGrapLink.addEventListener("click", this.onPersonalGraphClick.bind(this));
        this.globalGrapLink.addEventListener("click", this.onGlobalGraphClick.bind(this));

        this.setTimer("normalfps");
    },

    loadWordFromCurrentUri: function()
    {
        var uri = window.location.href;

        var uriInfo =
            //uri.match(/^(https?:\/\/[^\/]+\/[^\/]+)\/([^\/]+)\/([^\/]+)\/([^\/]+)$/) ||
            uri.match(/^(https?:\/\/[^\/]+\/[^\/]+)\/([^\/]+)\/([^\/]+)$/) ||
            uri.match(/^(https?:\/\/[^\/]+\/[^\/]+)\/([^\/]+)$/);

        if (!uriInfo || uriInfo.length < 3)
            return;

        this.timeSliderTimestamp = 0;

        if (uriInfo.length >= 4)
        {
            var time = parseInt(uriInfo[3]);
            if (!isNaN(time))
                this.timeSliderTimestamp = time;
        }

        var wordRequested = decodeURIComponent(uriInfo[2]);

        this.loadData(wordRequested, false, false);
    },

    imageLoadingFinished: function()
    {
        this.loadWordFromCurrentUri();
    },

    loadData: function(rootWord, addWordToBrowserHistory, animate)
    {
        this.showInterpolation = animate;
        this.addWordToBrowserHistory = addWordToBrowserHistory;
        this.transmitData("cmd=getrelations&word=" + encodeURIComponent(rootWord) +
            "&all=" + (this.showAllUsers ? 1 : 0) + "&time=" + this.timeSliderTimestamp);
    },

    transmitDataSuccess: function(responseData)
    {
        this.notFound = false;
        this.graphInfoElement.innerHTML = "";

        this.rootWord = responseData.root.word;

        if (window.history.pushState)
        {
            var graphUri = this.showAllUsers ? this.globalGrapLink.href : this.personalGrapLink.href;
            var timePostfix = this.timeSliderTimestamp != 0 ? "/" + this.timeSliderTimestamp : "";

            if (this.addWordToBrowserHistory)
                window.history.pushState("graph", "Graph - " + responseData.root.word,
                    graphUri + "/" + encodeURIComponent(responseData.root.word) + timePostfix);
            else
                window.history.replaceState("graph", "Graph - " + responseData.root.word,
                    graphUri + "/" + encodeURIComponent(responseData.root.word) + timePostfix);
        }

        this.buildVisualizationData(responseData);
        this.timeSliderHotspots = this.graphics.getTimeSliderHotspots(this.currentData.changeTimes);
    },

    transmitDataFailure: function(error)
    {
        this.timeSliderHotspots = [];

        if (error == "notfound")
        {
            this.notFound = true;
            this.graphInfoElement.innerHTML = "Wort nicht gefunden.";
        }
        else
            this.parent(error);
    },

    buildVisualizationData: function(newData)
    {
        /*if (this.interpolationRunning)
        {
            this.interpolationRunning = false;
            this.currentData = null;
            Object.append(this.currentNodes, this.prevNodes);
            this.currentNodesVisData = this.interpolatedNodesVisData;
        }*/

        this.prevData = this.currentData;
        this.currentData = newData;

        this.prevNodes = this.currentNodes;
        this.currentNodes = {};

        this.prevNodesVisData = this.currentNodesVisData;
        this.currentNodesVisData = {};

        // root node
        var node = this.currentData.root;
        this.currentNodes[node.id] = node;

        var visData = {};
        visData.position = {r: 0, phi: 0};
        visData.alpha = 1;
        visData.isDisplayed = 1;
        visData.isRoot = 1;
        this.currentNodesVisData[node.id] = visData;

        this.currentData.nodes.sort(function(node1, node2) { return node1.id - node2.id; });

        // other nodes
        var numNodes = this.currentData.nodes.length;
        for (var i = 0; i < numNodes; i++)
        {
            var node = this.currentData.nodes[i];
            this.currentNodes[node.id] = node;

            var distance = this.graphics.getNodeDistance(node);

            var visData = {};
            visData.position = {r: distance, phi: i / numNodes * 2 * Math.PI}; // nur diskrete abstände möglich
            visData.alpha = 1;
            visData.isDisplayed = 1;
            visData.isRoot = 0;
            this.currentNodesVisData[node.id] = visData;
        }

        if (this.showInterpolation)
        {
            this.interpolationRunning = true;
            this.interpolationProgress = 0;
        }
        else
        {
            this.interpolationRunning = false;

            this.calculateNodesToDraw();
            this.calculateConnections();

            this.redrawScreen = true;
        }
    },

    calculateNodesToDraw: function()
    {
        if (!this.interpolationRunning)
        {
            this.nodesToDraw = Object.values(this.currentNodes);
            this.interpolatedNodesVisData = this.currentNodesVisData;
            return;
        }

        var allNodes = Object.clone(this.prevNodes);
        Object.append(allNodes, this.currentNodes);
        this.nodesToDraw = Object.values(allNodes);

        this.interpolatedNodesVisData = {};

        for (var i = 0; i < this.nodesToDraw.length; i++)
        {
            var node = this.nodesToDraw[i];

            var prevVisData = this.prevNodesVisData[node.id];
            var currentVisData = this.currentNodesVisData[node.id];

            var hiddenDistance = this.graphics.getNodeStartDistance();
            if (!prevVisData)
            {
                prevVisData = Object.clone(currentVisData);
                prevVisData.position.r = hiddenDistance;
                prevVisData.isDisplayed = 0;
                prevVisData.isRoot = 0;
            }

            if (!currentVisData)
            {
                currentVisData = Object.clone(prevVisData);
                currentVisData.position.r = hiddenDistance;
                currentVisData.isDisplayed = 0;
                currentVisData.isRoot = 0;
            }

            var current = this.interpolationProgress;
            current = -2*current*current*current + 3*current*current;
            var prev = 1 - current;

            var angle =
                prevVisData.position.r == 0 ? currentVisData.position.phi :
                currentVisData.position.r == 0 ? prevVisData.position.phi :
                prevVisData.position.phi * prev + currentVisData.position.phi * current;

            var visData = {};
            visData.position =
            {
                r: prevVisData.position.r * prev + currentVisData.position.r * current,
                phi: angle,
            };
            visData.alpha = prevVisData.alpha * prev + currentVisData.alpha * current;
            visData.isRoot = prevVisData.isRoot * prev + currentVisData.isRoot * current;
            visData.isDisplayed = prevVisData.isDisplayed * prev + currentVisData.isDisplayed * current;

            this.interpolatedNodesVisData[node.id] = visData;
        }
    },

    calculateConnections: function()
    {
        this.connections = [];

        var current = 1 / (Math.exp(-20 * (this.interpolationProgress - 0.6)) + 1);
        var prev = 1 / (Math.exp(20 * (this.interpolationProgress - 0.4)) + 1);

        var rootNode = this.currentNodes[this.currentData.root.id];
        for (var id in this.currentNodes)
        {
            var node = this.currentNodes[id];

            var connection = {node1: rootNode, node2: node, alpha: current};
            this.connections.push(connection);
        }

        if (this.interpolationRunning)
        {
            var rootNode = this.prevNodes[this.prevData.root.id];    
            for (var id in this.prevNodes)
            {
                var node = this.prevNodes[id];

                var connection = {node1: rootNode, node2: node, alpha: prev};
                this.connections.push(connection);
            }
        }

        /*this.connections = [];

        for (var i = 0; i < this.nodesToDraw.length; i++)
        {
            var node1 = this.nodesToDraw[i];
            var visData1 = this.interpolatedNodesVisData[node1.id];

            for (var j = i + 1; j < this.nodesToDraw.length; j++)
            {
                var node2 = this.nodesToDraw[j];
                var visData2 = this.interpolatedNodesVisData[node2.id];

                var direction1 = Math.min(visData1.isRoot, visData2.isDisplayed);
                var direction2 = Math.min(visData2.isRoot, visData1.isDisplayed);
                var total = Math.max(direction1, direction2);

                if (total == 0)
                    continue;
                if (total > 1)
                    total = 1;

                alpha = 1 / (Math.exp(-15 * (total - 0.65)) + 1);
                //alpha = 1 / (Math.exp(-20 * (total - 0.6)) + 1);

                var connection = {node1: node1, node2: node2, alpha: alpha};
                this.connections.push(connection);
            }
        }

        for (var id1 in this.currentNodes)
        {
            var rootVisData = this.interpolatedNodesVisData[id1];
            if (rootVisData.isRoot == 0)
                continue;

            var rootNode = this.currentNodes[id1];
            for (var id in this.currentNodes)
            {
                var node = this.currentNodes[id];
                var nodeVisData = this.interpolatedNodesVisData[id];

                var connectionStrength = Math.min(rootVisData.isRoot, nodeVisData.isDisplayed);

                var connection = {
                    node1: rootNode,
                    node2: node,
                    alpha: 1 / (Math.exp(-15 * (connectionStrength - 0.7)) + 1),
                };
                this.connections.push(connection);
            }
        }

        if (this.interpolationRunning)
        {
            for (var id1 in this.prevNodes)
            {
                var rootVisData = this.interpolatedNodesVisData[id1];
                if (rootVisData.isRoot == 0)
                    continue;

                var rootNode = this.prevNodes[id1];    
                for (var id in this.prevNodes)
                {
                    var node = this.prevNodes[id];
                    var nodeVisData = this.interpolatedNodesVisData[id];

                    var connectionStrength = Math.min(rootVisData.isRoot, nodeVisData.isDisplayed);

                    var connection = {
                        node1: rootNode,
                        node2: node,
                        alpha: 1 / (Math.exp(-15 * (connectionStrength - 0.7)) + 1),
                    };
                    this.connections.push(connection);
                }
            }
        }*/
    },

    draw: function()
    {
        this.parent();

        this.context.save();
        this.graphics.drawBackground();
        this.context.restore();

        this.context.save();

        var graphCenter = this.graphics.getGraphCenter();

        for (var i = 0; i < this.connections.length; i++)
        {
            var connection = this.connections[i];

            var visData1 = this.interpolatedNodesVisData[connection.node1.id];
            var visData2 = this.interpolatedNodesVisData[connection.node2.id];

            var posX1 = visData1.position.r * Math.cos(visData1.position.phi) + graphCenter.x;
            var posY1 = visData1.position.r * Math.sin(visData1.position.phi) + graphCenter.y;

            var posX2 = visData2.position.r * Math.cos(visData2.position.phi) + graphCenter.x;
            var posY2 = visData2.position.r * Math.sin(visData2.position.phi) + graphCenter.y;

            this.graphics.drawConnection(posX1, posY1, posX2, posY2, connection.alpha);
        }

        for (var i = 0; i < this.nodesToDraw.length; i++)
        {
            var node = this.nodesToDraw[i];
            var visData = this.interpolatedNodesVisData[node.id];

            var r = visData.position.r;
            var phi = visData.position.phi;

            var posX = r * Math.cos(phi) + graphCenter.x;
            var posY = r * Math.sin(phi) + graphCenter.y;

            var mouseOver = this.mouseOverNodeId == node.id;

            if (visData.isRoot == 0)
                this.graphics.drawNode(node, posX, posY, false, mouseOver, visData.alpha);
            else if (visData.isRoot == 1)
                this.graphics.drawNode(node, posX, posY, true, mouseOver, visData.alpha);
            else
            {
                this.graphics.drawNode(node, posX, posY, false, mouseOver, visData.alpha * (1 - visData.isRoot));
                this.graphics.drawNode(node, posX, posY, true, mouseOver, visData.alpha * visData.isRoot);
            }
        }

        this.context.restore();

        if (!this.interpolationRunning && this.currentData)
        {
            this.context.save();
            this.graphics.drawTimeSlider(this.currentData.changeTimes, this.timeSliderTimestamp, this.timeSliderHoverTime);
            this.context.restore();
        }

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

    onTimer: function()
    {
        this.parent();

        if (this.interpolationRunning)
        {
            this.interpolationProgress += this.delta / this.graphics.getInterpolationTime();
            if (this.prevNodes == null || this.interpolationProgress >= 1)
            {
                this.interpolationRunning = false;
                this.interpolationProgress = 1;
            }

            this.calculateNodesToDraw();
            this.calculateConnections();

            this.redrawScreen = true;
        }

        if (this.loadingSomething())
            this.redrawScreen = true;

        var graphCenter = this.graphics.getGraphCenter();
        var newMouseOverNodeId = -1;

        for (var i = 0; i < this.nodesToDraw.length; i++)
        {
            var node = this.nodesToDraw[i];
            var visData = this.interpolatedNodesVisData[node.id];

            var r = visData.position.r;
            var phi = visData.position.phi;

            var posX = r * Math.cos(phi) + graphCenter.x;
            var posY = r * Math.sin(phi) + graphCenter.y;

            var dx = posX - this.mouseX;
            var dy = posY - this.mouseY;
            var mouseOver = dx*dx + dy*dy < 15*15; // TODO: determine size

            if (mouseOver)
            {
                newMouseOverNodeId = node.id;
                break;
            }
        }

        if (newMouseOverNodeId != this.mouseOverNodeId)
        {
            this.mouseOverNodeId = newMouseOverNodeId;
            this.redrawScreen = true;
        }

        var newTimeSliderHoverTime = -1;

        for (var i = 0; i < this.timeSliderHotspots.length; i++)
        {
            var hotspot = this.timeSliderHotspots[i];

            var dx = hotspot.x - this.mouseX;
            var dy = hotspot.y - this.mouseY;
            var mouseOver = dx*dx + dy*dy < hotspot.r*hotspot.r;

            if (mouseOver)
            {
                newTimeSliderHoverTime = hotspot.time;
                break;
            }
        }

        if (newTimeSliderHoverTime != this.timeSliderHoverTime)
        {
            this.timeSliderHoverTime = newTimeSliderHoverTime;
            this.redrawScreen = true;
        }

        if (this.redrawScreen)
        {
            this.draw();
            this.redrawScreen = false;
        }
    },

    onClick: function(event)
    {
        this.parent();

        if (this.interpolationRunning)
            return;

        if (this.mouseOverNodeId > 0)
            this.loadData(this.currentNodes[this.mouseOverNodeId].word, false, true);
        else if (this.timeSliderHoverTime >= 0)
        {
            this.timeSliderTimestamp = this.timeSliderHoverTime;
            this.loadData(this.rootWord, false, true);
        }
    },

    onPopState: function(event)
    {
        if (event.state == "graph")
            this.loadWordFromCurrentUri();
    },

    onSearchWordSubmit: function(event)
    {
        event.preventDefault();

        this.loadData(this.wordInputField.value, false, true);
        this.wordInputField.value = "";
    },

    onPersonalGraphClick: function(event)
    {
        event.preventDefault();

        if (!this.showAllUsers)
            return;
        this.showAllUsers = false;

        this.loadData(this.rootWord, false, true);
    },

    onGlobalGraphClick: function(event)
    {
        event.preventDefault();

        if (this.showAllUsers)
            return;
        this.showAllUsers = true;

        this.loadData(this.rootWord, false, true);
    },
});
