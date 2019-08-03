"use strict";

function newAutocompleteList(listHeight, classes, targetElementOutput) {
	var output = {};
	output.targetElement = undefined;
	output.targetElementOutput = undefined;
	output._optionKeys = [];
	output._optionValues = [];
	output._optionElements = [];
	output._optionSelected = 0;
	output._listHoveredClass = undefined;
	output._listUnhoveredClass = undefined;

	output._ResetOptionElements = function() {
		ClearChildren(this.targetElement);
		this._optionElements = [];
	}
	output.activate = function() {
		if(this._optionElements.length > 0 && this.targetElement.style.display == "none") {
			this.targetElement.style.display = "block";
			this._SelectNewOption(this._optionSelected);
			this._ScrollToItem();
		}
	};
	output.deactivate = function() {
		this.targetElement.style.display = "none";
		this._SelectNewOption(0);
	};
	output._CreateOptionElement = function(idx) {
		var option = document.createElement('div');
		option.setAttribute("data-value", idx);
		option.className = this._listUnhoveredClass;
		AppendChildren(option, this._optionValues[idx]);
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
		var raw = e.getAttribute("data-value");
		return raw !== null && raw !== "" ? parseInt(raw, 10) : -1;
	}
	output._AdjustOptionSelected = function(optionSelected) {
		this._optionSelected = optionSelected > 0 ? optionSelected - 1 : optionSelected;
	}
	output._OutputOptionKey = function(optionSelected) {
		this.targetElementOutput.value = this._optionKeys[optionSelected] + ", ";
		this.targetElementOutput.dispatchEvent( new Event('input', {'bubbles': true, 'cancelable': true}) );
	}
	output._ClickListener = function(e) {
		if(e.target === this.targetElement || e.target === this.targetElementOutput) {
			this.activate();
		} else if(e.currentTarget !== document) {
			var value = this._GetOptionElementValue(e.currentTarget);
			if(this._optionElements[value] === e.currentTarget) {
				this._AdjustOptionSelected(value);
				this._OutputOptionKey(value);
			}
			e.stopPropagation();
		} else {
			this.deactivate();
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
			var optionSelected = this._optionSelected;
			this._AdjustOptionSelected(optionSelected);
			this._OutputOptionKey(optionSelected);
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
	output._BlurListener = function(e) {
		this.deactivate();
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
		} else if(eType === "blur") {
			this._BlurListener(e);
		}
	};
	output.update = function(optionKeys, optionValues) {
		this._optionKeys = optionKeys;
		this._optionValues = optionValues;
		this._SetDataList();
	};
	output.init = function(listHeight, classes, targetElementOutput) {
		this._listHoveredClass = classes.listHoveredClass;
		this._listUnhoveredClass = classes.listUnhoveredClass;
		this.targetElementOutput = targetElementOutput;
		this.targetElement = document.createElement("div");
		this.targetElement.className = classes.listContainerClass;
		this.targetElement.style.display = "none";
		this.targetElement.style.overflow = "scroll";
		this.targetElement.style.maxHeight = listHeight;
		this.targetElement.style.height = listHeight;
		this.targetElementOutput.addEventListener("keydown", this, false);
		this.targetElementOutput.addEventListener("click", this, false);
		this.targetElementOutput.addEventListener("focus", this, false);
		this.targetElementOutput.addEventListener("blur", this, false);
		document.addEventListener("click", this, false);
	};
	output.init(listHeight, classes, targetElementOutput);
	return output;
}
