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

var Utilities = new Class();

Utilities.getScreenPos = function(element)
{
	var x = 0;
	var y = 0;

	do
	{
		x += element.offsetLeft;
		y += element.offsetTop;
		element = element.offsetParent;
	}
	while (element);

	return {x: x, y: y};
};

var Graph = new Class({
    initialize: function(canvas)
    {
		this.canvas = canvas;
		this.realWidth = this.canvas.getSize().x;
		this.realHeight = this.canvas.getSize().y;

		this.nominalWidth = 500;
		this.nominalHeight = 400;

		this.graphics = new Graphics(this.canvas.getContext('2d'));

		var context = this.canvas.getContext('2d');
		context.scale(this.realWidth / this.nominalWidth, this.realHeight / this.nominalHeight);

		var screenPos = Utilities.getScreenPos(this.canvas);
		this.clientPosX = screenPos.x + this.canvas.clientLeft;
		this.clientPosY = screenPos.y + this.canvas.clientTop;

		document.addEvent("keypress", this.onKeypress.bind(this));
		this.canvas.addEvent("click", this.onClick.bind(this));
		this.canvas.addEvent("mousemove", this.onMouseMove.bind(this));

		this.timer = null;
		this.delta = 0;
		this.drawCount = 0;

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

		this.mouseX = 0;
		this.mouseY = 0;

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
		this.drawCount++;

		var context = this.canvas.getContext('2d');
		context.save();

		context.fillStyle = "white";
		context.fillRect(0, 0, this.nominalWidth, this.nominalHeight);

		context.translate(this.nominalWidth / 2, this.nominalHeight / 2);

		var scaling = Math.exp((this.mouseY - this.nominalHeight / 2) / 50);
		//context.scale(scaling, scaling);

		context.textBaseline = "middle";

		for (var i = 0; i < this.connections.length; i++)
		{
			var connection = this.connections[i];

			var posX0 = connection[0].position.r * Math.cos(connection[0].position.phi);
			var posY0 = connection[0].position.r * Math.sin(connection[0].position.phi);

			var posX1 = connection[1].position.r * Math.cos(connection[1].position.phi);
			var posY1 = connection[1].position.r * Math.sin(connection[1].position.phi);

			context.beginPath();
			context.moveTo(posX0, posY0);
			context.lineTo(posX1, posY1);

			context.strokeStyle = "black";
			context.stroke();
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

			if (false) // is root
			{
				context.font = "bold 14px Verdana";
				this.graphics.drawGnoviIcon(context, 0, 0, 50, true);
				context.fillStyle = "red";
				this.graphics.drawCenteredText(context, this.data.root.label, 0, 40);
			}
			else
			{
				context.font = "bold 10px Verdana";
				this.graphics.drawGnoviIcon(context, posX, posY, 30, glow);
				context.fillStyle = "black";
				this.graphics.drawCenteredText(context, node.label, posX, posY + 25);
			}
		}

		context.restore();

		context.save();
		context.shadowColor = "black";
		context.shadowBlur = 2;
		context.shadowOffsetX = 1;
		context.shadowOffsetY = 1;
		context.strokeStyle = "black";
		context.fillStyle = "black";

		context.font = "8px";
		var txt = Math.round(1 / this.delta) + " fps";
		context.fillText(txt, 460 - context.measureText(txt).width / 2, 380);

		context.translate(460, 350);
		context.rotate(this.drawCount * 2 * Math.PI / 64);
		context.strokeRect(-10, -10, 20, 20);
		context.restore();
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

	onTimer: function()
	{
		this.delta = Date.now() / 1000 - this.lastTimerEventTime;
		this.lastTimerEventTime += this.delta;

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

	onKeypress: function(event)
	{

		return event.event.keyCode != 8 && event.event.keyCode != 32;
	},

	onClick: function(event)
	{
		if (this.uahh = !this.uahh)
			this.buildVisualizationData(this.sampleB);
		else
			this.buildVisualizationData(this.sampleA);

		this.transformProgress = 0;
	},

	onMouseMove: function(event)
	{
		this.mouseX = (event.event.clientX - this.clientPosX) * this.nominalWidth / this.realWidth;
		this.mouseY = (event.event.clientY - this.clientPosY) * this.nominalHeight / this.realHeight;
	},
});

window.addEvent("domready", function() {
	new Graph($("graph"));
});
