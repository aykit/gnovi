var InputField = new Class({
	initialize: function(textElement)
	{
		this.textElement = textElement;
		this.keypressEvent = document.addEvent("keypress", this.onKeypress.bind(this));
		this.enabled = false;
		this.text = this.textElement.get("text");
	},

	enable: function() { this.enabled = true; },
	disable: function()	{ this.enabled = false; },

	getText: function()	{ return this.text; },
	setText: function(text)
	{
		this.text = text;
		this.textElement.set("text", text);
	},

	onReturn: function() { },

	onKeypress: function(e)
	{
		if (!this.enabled)
			return true;

		if (e.event.keyCode == 8)
		{
			this.setText(this.text.substr(0, this.text.length - 1));
			return false;
		}

		if (e.event.keyCode == 13)
		{
			this.onReturn();
			return true;
		}

		this.setText(this.text + String.fromCharCode(e.event.charCode));
		return true;
	},

});

var Input = new Class({
    initialize: function()
    {
		this.referenceWordElement = $("referenceWord");
		this.answerListElement = $("answerList");
		this.answerTextElement = $("answerText");
		this.countdownElement = $("countdown");
		this.buttonElement = $("button");

		this.inputField = new InputField(this.answerTextElement);
		this.inputField.onReturn = this.onInputReturn.bind(this);
		this.inputField.setText("");

		this.referenceWordElement.set("text", "Malte")
		this.answerListElement.empty();
		this.countdownElement.set("text", "");

		this.inputList = [];

		this.hideButton();
		this.start();
    },

	hideButton: function()
	{
		this.buttonElement.setStyle("visibility", "hidden");
	},

	showButton: function(label)
	{
		this.buttonElement.set("text", label);
		this.buttonElement.setStyle("visibility", "visible");
	},

	addAnswer: function(text)
	{
		this.inputList.push(text);
		var textElement = new Element('li', {text: text});
		this.answerListElement.grab(textElement);
	},

	onInputReturn: function(e)
	{
		this.addAnswer(this.inputField.getText());
		this.inputField.setText("");
	},

	start: function()
	{
		this.timeLeft = Input.MAX_TIME;
		this.countdownTimer = this.updateCountdown.periodical(1000, this);
		this.inputField.enable();
	},

	updateCountdown: function()
	{
		this.timeLeft--;

		if (this.timeLeft == 0)
		{
			clearInterval(this.countdownTimer);
			this.countdownElement.set("text", "KABOOM");
			this.showButton("Juhuu");
			this.inputField.setText("");
			this.inputField.disable();
			return;
		}

		this.countdownElement.set("text", this.timeLeft);
	},
});

Input.MAX_TIME = 10;

window.addEvent('domready', function() {
	Input.singleton = new Input();
});
