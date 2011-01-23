var Graph = new Class({
    Extends: Game,

    currentNodesVisData: null,
    currentData: null,
    currentNodes: null,
    connections: [],
    nodesToDraw: [],

    interpolationProgress: 1,
    interpolationRunning: false,

    initialize: function(canvas, scaling)
    {
        this.parent(canvas, new GraphGraphics(), 1);

        this.setTimer(30);

        this.loadImages({
            //"google": "http://www.google.com/images/srpr/nav_logo27.png",
            //"earth": "http://www.nersc.gov/news/science/Earth_from_Space.jpg",
        });
    },

    imageLoadingFinished: function()
    {
        this.loadData(0);
    },

    loadData: function(rootId)
    {
        this.transmitData("cmd=getgraph&id=" + rootId);
    },

    transmitDataSuccess: function(data)
    {
        this.buildVisualizationData(data);
    },

    buildVisualizationData: function(newData)
    {
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
        visData.isRoot = 1;
        this.currentNodesVisData[node.id] = visData;

        // other nodes
        var numNodes = this.currentData.nodes.length;
        for (var i = 0; i < numNodes; i++)
        {
            var node = this.currentData.nodes[i];
            this.currentNodes[node.id] = node;

            var visData = {};
            visData.position = {r: 100, phi: i / numNodes * 2 * Math.PI}; // nur diskrete abstände möglich
            visData.alpha = 1;
            visData.isRoot = 0;
            this.currentNodesVisData[node.id] = visData;
        }

        this.interpolationProgress = 0;
        this.interpolationRunning = true;

        //console.log(this.currentNodes);
    },

    calculateNodesToDraw: function()
    {
        if (!this.interpolationRunning)
        {
            this.nodesToDraw = Object.values(this.currentNodes);
            this.interpolatedNodesVisData = this.currentNodesVisData;
            return;
        }

        this.nodesToDraw = Object.values(this.prevNodes).concat(Object.values(this.currentNodes));
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
            }

            if (!currentVisData)
            {
                currentVisData = Object.clone(prevVisData);
                currentVisData.position.r = hiddenDistance;
            }

            var current = this.interpolationProgress;
            current = -2*current*current*current + 3*current*current;
            var prev = 1 - current;

            var visData = {};
            visData.position =
            {
                r: prevVisData.position.r * prev + currentVisData.position.r * current,
                phi: prevVisData.position.phi * prev + currentVisData.position.phi * current,
            };
            visData.alpha = prevVisData.alpha * prev + currentVisData.alpha * current;
            visData.isRoot = prevVisData.isRoot * prev + currentVisData.isRoot * current;

            this.interpolatedNodesVisData[node.id] = visData;
        }
    },

    calculateConnections: function()
    {
        this.connections = [];

        var rootNode = this.currentNodes[this.currentData.root.id];

        var current = 1 / (Math.exp(-20 * (this.interpolationProgress - 0.6)) + 1);
        var prev = 1 / (Math.exp(20 * (this.interpolationProgress - 0.4)) + 1);

        var numNodes = this.currentData.nodes.length;
        for (var i = 0; i < numNodes; i++)
        {
            var node = this.currentNodes[this.currentData.nodes[i].id];
            var connection = {node1: rootNode, node2: node, alpha: current};
            this.connections.push(connection);
        }

        if (this.interpolationRunning)
        {
            var rootNode = this.prevNodes[this.prevData.root.id];

            var numNodes = this.prevData.nodes.length;
            for (var i = 0; i < numNodes; i++)
            {
                var node = this.prevNodes[this.prevData.nodes[i].id];
                var connection = {node1: rootNode, node2: node, alpha: prev};
                this.connections.push(connection);
            }
        }

        for (var i = 0; i < this.nodesToDraw.length; i++)
        {

        }

        //var relations = Object.merge();
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

            var dx = posX - this.mouseX;
            var dy = posY - this.mouseY;
            var mouseOver = dx*dx + dy*dy < 15*15; // TODO: determine size

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

        var updateScreen = false;

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

            updateScreen = true;
        }

        if (this.loadingSomething())
            updateScreen = true;

        if (updateScreen)
            this.draw();
    },

    onClick: function(event)
    {
        this.parent();

        if (!this.interpolationRunning)
        {
            if (this.currentData && this.currentData.root.id == 4)
                this.loadData(0);
            else
                this.loadData(4);
        }
    },
});

window.addEvent("domready", function() {
    new Graph($("graph"));
});
