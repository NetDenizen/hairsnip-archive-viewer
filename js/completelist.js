function autocompleteMenu(targetElementOutput) {
	var output = {};
	output._targetElement = undefined;
	output.targetElementOutput = undefined;
	output._optionKeys = [];
	output._optionValues = [];
	output._optionElements = [];
	output._optionSelected = -1;

	output._ResetOptionElements = function() {
		this._targetElement.innerHTML = "";
		this._optionElements = [];
		this._optionSelected = -1;
	}
	output._EscapeHTML = function(text) {
		return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
	};
	output._CreateOptionElement = function(idx) {
		var option = document.createElement('div');
		option.setAttribute("data-value", idx);
		option.className = //TODO
		option.innerHTML = this._EscapeHTML(this._optionValues[idx]);
		option.addEventListener("click", this, false);
		this._optionElements.push(option);
		this._targetElement.appendChild(option);
	};
	output._SetDataList = function() {
		var optionsLength = this._optionKeys.length;
		var idx = undefined;
		this._ResetOptionElements();
		for(idx = 0; idx < optionsLength; ++idx) {
			this._CreateOptionElement(idx);
		}
	};
	output._GetOptionElementValue = function(e) {
		var output = -1;
		var raw = e.getAttribute("data-value");
		if(raw !== null && raw !== "") {
			output = parseInt(raw, 10);
		}
		return output;
	}
	output._OutputOptionKey = function(optionSelected) {
		this.targetElementOutput.value = this._optionKeys(optionSelected);
	}
	output._ClickListener = function(e) {
		var value = this._GetOptionElementValue(e.target);
		if(value === -1) {
			this._ResetOptionElements();
		} else {
			this.targetElementOutput.value = this._optionKeys(value);
		}
	};
	output._SelectNewOption = function(newOptionSelected) {
		var optionElementsLength = this._optionElements.length;
		if(optionElementsLength > 0) {
			var fixedOptionSelected = newOptionSelected;
			if(this._optionSelected >= 0 && this._optionSelected < optionElementsLength) {
				this._optionElements[this._optionSelected].className = //TODO
			}
			if(fixedOptionSelected < 0) {
				fixedOptionSelected = 0;
			} else if(fixedOptionSelected >= optionElementsLength) {
				fixedOptionSelected = optionElementsLength - 1;
			}
			this._optionSelected = newOptionSelected;
			this._optionElements[this._optionSelected].className = //TODO
		}
	};
	output._MouseoverListener = function(e) {
		this._SelectNewOption( this._GetOptionElementValue(e.target) );
	};
	output._OnEnter = function() {
		if(this._optionSelected !== -1) {
			this._OutputOptionKey(this._optionSelected);
			this._ResetOptionElements();
		}
	};
	output._OnArrowUp = function() {
		this._SelectNewOption(this._optionSelected - 1);
	};
	output._OnArrowDown = function() {
		this._SelectNewOption(this._optionSelected + 1);
	};
	output._KeydownListener = function(e) {
		if(e.keyCode === 13) { // Enter
			this._OnEnter();
		} else if(e.keyCode === 38) { // Arrow Key Up
			this._OnArrowUp();
		} else if(e.keyCode === 40) { // Arrow Key Down
			this._OnArrowDown();
		}
	};
	output.handleEvent = function(e) {
		var eType = e.type;
		if(eType === "click") {
			this._ClickListener(e);
		} else if(eType === "mouseover") {
			this._MouseoverListener(e);
		} else if(eType === "keydown") {
			this._KeydownListener(e);
		}
	};
	output.update = function(optionKeys, optionValues) {
		this._ResetOptionElements();
		this._optionKeys = optionKeys;
		this._optionValues = optionValues;
		this._SetDataList();
	};
	output.init = function(targetElementOutput) {
		this.targetElementOutput = targetElementOutput;
		this._targetElement = document.createElement("div");
		//TODO: Class/styling. We really want this to be scrollable, for one.
		option.style.display = "none";
	};
	output.activate = function() {
		//TODO: Should we check if there are options available?
		option.style.display = //TODO: Default state
		this._SelectNewOption(0);
	};
	output.deactivate = function() {
		option.style.display = "none";
		this._SelectNewOption(-1);
	};
	output.init(targetElementOutput);
	return output;
}
