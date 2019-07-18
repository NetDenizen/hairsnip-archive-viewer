"use strict";

function newAutocompleteList(listHeight, listHoveredClass, listUnhoveredClass, targetElementOutput) {
	var output = {};
	output.targetElement = undefined;
	output.targetElementOutput = undefined;
	output._optionKeys = [];
	output._optionValues = [];
	output._optionElements = [];
	output._optionSelected = -1;
	output._listHoveredClass = undefined;
	output._listUnhoveredClass = undefined;

	output._ResetOptionElements = function() {
		this.targetElement.innerHTML = "";
		this._optionElements = [];
		this._optionSelected = -1;
	}
	output.activate = function() {
		//TODO: Should we check if there are options available?
		this.targetElement.style.display = "block";
		this._SelectNewOption(this._optionSelected);
		this._ScrollToItem();
	};
	output.deactivate = function() {
		this.targetElement.style.display = "none";
		this._SelectNewOption(0);
	};
	output._CreateOptionElement = function(idx) {
		var option = document.createElement('div');
		option.setAttribute("data-value", idx);
		option.className = this._listUnhoveredClass;
		option.innerHTML = this._optionValues[idx];
		option.addEventListener("click", this, false);
		option.addEventListener("mouseover", this, false);
		this._optionElements.push(option);
		this.targetElement.appendChild(option);
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
		this.targetElementOutput.value = this._optionKeys[optionSelected] + ", ";
		this.targetElementOutput.dispatchEvent( new Event('input', {'bubbles': true, 'cancelable': true}) );
	}
	output._ClickListener = function(e) {
		var value = this._GetOptionElementValue(e.target);
		if(e.target === this.targetElement || e.target === this.targetElementOutput) {
			this.activate();
		} else if(value === -1) {
			this.deactivate();
		} else if(this._optionElements[value] === e.target) {
			this._OutputOptionKey(value);
		}
	};
	output._SelectNewOption = function(newOptionSelected) {
		var optionElementsLength = this._optionElements.length;
		if(optionElementsLength > 0) {
			var fixedOptionSelected = newOptionSelected;
			if(this._optionSelected >= 0 && this._optionSelected < optionElementsLength) {
				this._optionElements[this._optionSelected].className = this._listUnhoveredClass;
			}
			if(fixedOptionSelected < 0) {
				fixedOptionSelected = optionElementsLength - 1;
			} else if(fixedOptionSelected >= optionElementsLength) {
				fixedOptionSelected = 0;
			}
			this._optionSelected = fixedOptionSelected;
			this._optionElements[this._optionSelected].className = this._listHoveredClass;
		}
	};
	output._MouseoverListener = function(e) {
		this._SelectNewOption( this._GetOptionElementValue(e.target) );
	};
	output._OnEnter = function() {
		if(this._optionSelected !== -1) {
			this._OutputOptionKey(this._optionSelected);
		}
	};
	output._ScrollToItem = function() {
		if(this._optionSelected >= 0 && this._optionSelected < this._optionElements.length) {
			this._optionElements[this._optionSelected].scrollIntoView(false);
		}
	};
	output._OnArrowUp = function() {
		this._SelectNewOption(this._optionSelected - 1);
		this._ScrollToItem();
	};
	output._OnArrowDown = function() {
		this._SelectNewOption(this._optionSelected + 1);
		this._ScrollToItem();
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
	output._FocusListener = function(e) {
		this.activate();
	};
	output.handleEvent = function(e) {
		var eType = e.type;
		if(eType === "click") {
			this._ClickListener(e);
		} else if(eType === "mouseover") {
			this._MouseoverListener(e);
		} else if(eType === "keydown") {
			this._KeydownListener(e);
		} else if(eType === "focus") {
			this._FocusListener(e);
		}
	};
	output.update = function(optionKeys, optionValues) {
		this._ResetOptionElements();
		this._optionKeys = optionKeys;
		this._optionValues = optionValues;
		this._SetDataList();
	};
	output.init = function(listHeight, listHoveredClass, listUnhoveredClass, targetElementOutput) {
		this._listHoveredClass = listHoveredClass;
		this._listUnhoveredClass = listUnhoveredClass;
		this.targetElementOutput = targetElementOutput;
		this.targetElement = document.createElement("div");
		this.targetElement.style.display = "none";
		this.targetElement.style.overflow = "scroll";
		this.targetElement.style.maxHeight = listHeight;
		this.targetElement.style.height = listHeight;
		this.targetElementOutput.addEventListener("keydown", this, false);
		this.targetElementOutput.addEventListener("click", this, false);
		this.targetElementOutput.addEventListener("focus", this, false);
		document.addEventListener("click", this, false);
	};
	output.init(listHeight, listHoveredClass, listUnhoveredClass, targetElementOutput);
	return output;
}
