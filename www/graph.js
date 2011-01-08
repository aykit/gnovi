var ImageLoader = new Class({
	initialize: function()
	{
	},

	load: function(source)
	{
		var img = new Image();
		img.onload = function() { }
		img.onerror = function() { }
		img.src = source;
	},
});

var Graph = new Class({
	Extends: Game,

    initialize: function(canvas, scaling)
    {
    	this.parent(canvas, new Graphics(), 1);

		console.log(this.canvas);

		this.realWidth = this.canvasWidth;
		this.realHeight = this.canvasHeight;

		this.nominalWidth = 500;
		this.nominalHeight = 400;

		this.currentData = null;
		this.currentNodes = null;

		this.sampleA =
		{
			root: {id: 1, label: "root"},
			nodes:
			[
				{id: 32, label: "du"},
				{id: 3, label: "ich"},
				{id: 4, label: "bla"},
				{id: 15, label: "blub"},
				{id: 6, label: "genau"},
			],
			relations:
			[
				{id2: 2, id2: 3, strength: 9},
			],
		}

		this.sampleB =
		{
			root: {id: 4, label: "bla"},
			nodes:
			[
				{id: 3, label: "ich"},
				{id: 1, label: "root"},
				{id: 11, label: "warum"},
				{id: 32, label: "du"},
				{id: 7, label: "nix"},
				{id: 8, label: "jap"},
			],
			relations:
			[
				{id2: 2, id2: 3, strength: 9},
			],
		}

		this.buildVisualizationData(this.sampleA);

		this.setTimer(30);
    },

	buildVisualizationData: function(newData)
	{
		this.prevData = this.currentData;
		this.currentData = newData;

		this.prevNodes = this.currentNodes;
		this.currentNodes = {};

		// root node
		var node = Object.clone(this.currentData.root);
		node.visData = {};
		node.visData.position = {r: 0, phi: 0};

		this.currentNodes[node.id] = node;

		// other nodes
		var numNodes = this.currentData.nodes.length;
		for (var i = 0; i < numNodes; i++)
		{
			var node = Object.clone(this.currentData.nodes[i]);
			node.visData = {};
			node.visData.position = {r: 100, phi: i / numNodes * 2 * Math.PI}; // nur diskrete abstände möglich

			this.currentNodes[node.id] = node;

			// connection
			var connection = {};
		}

		this.interpolationProgress = 0;
		this.interpolationRunning = true;

		console.log(JSON.encode(this.currentNodes));
	},

	calulateNodesToDraw: function()
	{
		if (!this.interpolationRunning)
		{
			this.nodesToDraw = Object.values(this.currentNodes);
			return;
		}

		var nodeIds = Object.keys(this.prevNodes).combine(Object.keys(this.currentNodes));

		this.nodesToDraw = [];

		for (var i = 0; i < nodeIds.length; i++)
		{
			var id = nodeIds[i];

			var prevVisData = null;
			if (this.prevNodes[id])
				prevVisData = this.prevNodes[id].visData;

			var currentVisData = null;
			if (this.currentNodes[id])
				currentVisData = this.currentNodes[id].visData;

			var hiddenDistance = Math.max(this.nominalWidth, this.nominalHeight) * 0.7;
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

			var a = this.interpolationProgress;
			a = -2*a*a*a + 3*a*a;
			//a = (1 - Math.cos(a * Math.PI)) / 2; // ca das gleiche wie oben
			//a = (Math.exp(-8/2) + 1) / (Math.exp(8*(0.5-a)) + 1); // FALSCH
			var b = 1 - a;

			var visData = {};
			visData.position =
			{
				r: prevVisData.position.r * b + currentVisData.position.r * a,
				phi: prevVisData.position.phi * b + currentVisData.position.phi * a,
			};

			var node = Object.clone(this.currentNodes[id] || this.prevNodes[id]);
			node.visData = visData;
			this.nodesToDraw.push(node);
		}
	},

	calulateConnections: function()
	{
		for (var i = 0; i < this.nodesToDraw.length; i++)
		{
		
		}

		//var relations = Object.merge();
		this.connections = [];
	},

	draw: function()
	{
		this.parent();

		this.context.save();

		this.context.fillStyle = "white";
		this.context.fillRect(0, 0, this.nominalWidth, this.nominalHeight);

		this.context.translate(this.nominalWidth / 2, this.nominalHeight / 2);

		this.context.textBaseline = "middle";

		for (var i = 0; i < this.connections.length; i++)
		{
			var connection = this.connections[i];

			var posX0 = connection[0].position.r * Math.cos(connection[0].position.phi);
			var posY0 = connection[0].position.r * Math.sin(connection[0].position.phi);

			var posX1 = connection[1].position.r * Math.cos(connection[1].position.phi);
			var posY1 = connection[1].position.r * Math.sin(connection[1].position.phi);

			this.context.beginPath();
			this.context.moveTo(posX0, posY0);
			this.context.lineTo(posX1, posY1);

			this.context.strokeStyle = "black";
			this.context.stroke();
		}

		for (var i = 0; i < this.nodesToDraw.length; i++)
		{
			var node = this.nodesToDraw[i];

			var r = node.visData.position.r;
			var phi = node.visData.position.phi;

			var posX = r * Math.cos(phi);
			var posY = r * Math.sin(phi);

			var dx = posX - this.mouseX + this.nominalWidth / 2;
			var dy = posY - this.mouseY + this.nominalHeight / 2;
			var glow = dx*dx + dy*dy < 15*15;
			//console.log(dy);

			if (false) // is root
			{
				this.context.font = "bold 14px Verdana";
				this.graphics.drawGnoviIcon(0, 0, 50, true);
				this.context.fillStyle = "red";
				this.graphics.drawCenteredText(this.data.root.label, 0, 40);
			}
			else
			{
				this.context.font = "bold 10px Verdana";
				this.graphics.drawGnoviIcon(posX, posY, 30, glow);
				this.context.fillStyle = "black";
				this.graphics.drawCenteredText(node.label, posX, posY + 25);
			}
		}

		this.context.restore();

		this.context.save();
		this.graphics.drawDebugInfo(1 / this.delta, this.drawCount);
		this.context.restore();
	},

	onTimer: function()
	{
		this.parent();

		if (this.interpolationRunning)
		{
			this.interpolationProgress += this.delta * 2;
			if (this.prevNodes == null || this.interpolationProgress >= 1)
				this.interpolationRunning = false;

			this.calulateNodesToDraw();
			this.calulateConnections();
		}

		this.draw();
	},

	onClick: function(event)
	{
		this.parent();

		if (this.uahh = !this.uahh)
			this.buildVisualizationData(this.sampleB);
		else
			this.buildVisualizationData(this.sampleA);

		this.transformProgress = 0;
	},
});

window.addEvent("domready", function() {
	new Graph($("graph"));
});
