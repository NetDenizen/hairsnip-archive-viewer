// TODO: Rewrite onclick to event handler
"use strict";

var defaultResultsPerPage = 10;
var defaultPageNumber = 0;
var defaultListHoveredClass = "AutocompleteArea hovered";
var defaultListUnhoveredClass = "AutocompleteArea unhovered";
var defaultSearchResultClass = "SearchResult";
var defaultSearchResultSelectedClass = "SearchResult selected";
var defaultListHeight = "10em";

function newUiManager(logger, searcher, name, pageNumber, resultsPerPage) {
	var output = {};
	// keywordSearcher
	output.commentsManager = undefined;
	output.descriptionManager = undefined;

	// fulltextSearcher
	output.bodyManager = undefined;

	// dateSearcher
	output.posixdateManager = undefined;

	// rangeSearcher
	output.ratingManager = undefined;
	output.ratersManager = undefined;
	output.viewcountManager = undefined;

	// autocompleteSearcher
	output.sha256Manager = undefined;
	output.domainManager = undefined;
	output.languageManager = undefined;
	output.contentManager = undefined;
	output.typeManager = undefined;
	output.categoryManager = undefined;
	output.locationManager = undefined;
	output.formatManager = undefined;
	output.authorManager = undefined;
	output.emailManager = undefined;
	output.tagManager = undefined;
	output.originManager = undefined;
	output.siteManager = undefined;
	output.titleManager = undefined;

	// logManager
	output.logger = undefined;

	output.queryManagerLookup = [];
	output.queryManagerResultsLookup = [];
	output.queryOccurrenceTargetsLookup = [];
	output.searcher = undefined;

	output._allStoryIndexes = undefined;
	output._storyIndexes = undefined;
	//_currentStoryIndex = undefined;

	output._resultsPerPageTarget = undefined;
	//_defaultResultsPerPage = undefined;
	output._resultsPerPage = undefined;

	output._pageNumberTarget = undefined;
	output._pageNumberLeftTarget = undefined;
	output._pageNumberRightTarget = undefined;
	output._maxPageNumberTarget = undefined;
	output._storyAmountTarget = undefined;
	output._pageNumber = undefined;
	output._maxPageNumber = undefined;

	output._currentResultId = undefined;
	output._currentResultTarget = undefined;
	output._resultsDisplayTarget = undefined;
	output._storyDisplayTarget = undefined;

	output._UpdateMaxPageNumber = function() {
		this._maxPageNumber = Math.floor(this._storyIndexes.length / this._resultsPerPage);
		if(this._storyIndexes.length % this._resultsPerPage === 0) {
			this._maxPageNumber -= 1;
		}
		this._maxPageNumberTarget.innerHTML = " / " + (this._maxPageNumber + 1).toString();
		this._storyAmountTarget.innerHTML = " (" + this._storyIndexes.length.toString() + ")";
	};
	output._UpdateSingleQuery = function(idx) {
		var target = this.queryOccurrenceTargetsLookup[idx];
		var found = this.queryManagerLookup[idx]
		if(found.edited) {
			var results = found.results;
			if(results !== undefined){
				this.queryManagerResultsLookup[idx] = new Set( results.AllValues() );
			} else {
				this.queryManagerResultsLookup[idx] = undefined;
			}
			found.edited = false;
		}
		if(this.queryManagerResultsLookup[idx] !== undefined) {
			var allValues = this.queryManagerResultsLookup[idx];
			//TODO: Rewrite
			this._storyIndexes = this._storyIndexes.filter( function(e) { return allValues.has(e); } );
			target.innerHTML = allValues.size.toString();
		} else {
			target.innerHTML = "";
		}
	};
	output._UpdateQueries = function() {
		var queryManagerLookupLength = this.queryManagerLookup.length;
		var idx = undefined;
		this._storyIndexes = this._allStoryIndexes.slice(0);
		for(idx = 0; idx < queryManagerLookupLength; ++idx) {
			this._UpdateSingleQuery(idx);
		}
	};
	output._LookupTerm = function(manager, id) {
		return manager.lookup.GetReverse(id).join(", ");
	};
	output._UpdateSingleResult = function(id) {
		// Main items
		var title = this._LookupTerm(this.titleManager, id);
		var domain = this._LookupTerm(this.domainManager, id);
		var format = this._LookupTerm(this.formatManager, id);
		var author = this._LookupTerm(this.authorManager, id);
		var date = this._LookupTerm(this.posixdateManager, id);
		//TODO
		// Hideable items
		//var comments = this._LookupTerm(this.commentsManager, id);
		//var description = this._LookupTerm(this.descriptionManager, id);
		//var rating = this._LookupTerm(this.ratingManager, id);
		//var raters = this._LookupTerm(this.ratersManager, id);
		//var viewcount = this._LookupTerm(this.viewcountManager, id);
		//var language = this._LookupTerm(this.languageManager, id);
		//var content = this._LookupTerm(this.contentManager, id);
		//var type = this._LookupTerm(this.typeManager, id);
		//var category = this._LookupTerm(this.categoryManager, id);
		//var storyLocation = this._LookupTerm(this.locationManager, id);
		//var email = this._LookupTerm(this.emailManager, id);
		//var tag = this._LookupTerm(this.tagManager, id);
		//var origin = this._LookupTerm(this.originManager, id);
		//var site = this._LookupTerm(this.siteManager, id);
		// HTML Elements
		var item = document.createElement("div");
		var titleItem = document.createElement("h3"); // Title, and Author
		var infoItem = document.createElement("p"); // Date, Domain, Format
		item.className = defaultSearchResultClass;
		titleItem.innerHTML = title +  " - " + author;
		if(date !== "") {
			infoItem.innerHTML = new Date( parseInt(date) * 1000 ).toISOString() + " - " + domain + " | Format: " + format;
		} else {
			infoItem.innerHTML = "Date not found - " + domain + " | Format: " + format;
		}
		item.appendChild(titleItem);
		item.appendChild(infoItem);
		item.setAttribute( "data-value", id.toString() );
		item.addEventListener("click", this, false);
		this._resultsDisplayTarget.appendChild(item);
		return item
	};
	output._UpdateResults = function() {
		var resultsStart = this._pageNumber * this._resultsPerPage;
		var indexes = this._storyIndexes.slice(resultsStart, resultsStart + this._resultsPerPage);
		var indexesLength = indexes.length;
		var idx = undefined;
		this._resultsDisplayTarget.innerHTML = "";
		this._currentResultTarget = undefined;
		for(idx = 0; idx < indexesLength; ++idx) {
			var id = indexes[idx];
			var item = this._UpdateSingleResult(id);
			if(id === this._currentResultId) {
				item.dispatchEvent( new Event('click', {'bubbles': true, 'cancelable': true}) );
			}
		}
	};
	output._UpdateSearch = function() {
		this._UpdateQueries();
		this._UpdateMaxPageNumber();
		this._UpdateResults();
	};
	output.UpdateSearchCallback = function(thisThis) {
		thisThis._UpdateSearch();
	};
	output._UpdatePageNumber = function(e) {
		//TODO: Optimize
		var value = Number(this._pageNumberTarget.value);
		if(isNaN(value) || Math.floor(value) !== value) {
			this._pageNumberTarget.value = (this._pageNumber + 1).toString();
		} else if(value === 0) {
			this._pageNumber = 0;
			this._pageNumberTarget.value = "1";
		} else if(value > this._maxPageNumber) {
			this._pageNumber = this._maxPageNumber;
			this._pageNumberTarget.value = (this._pageNumber + 1).toString();
		} else {
			this._pageNumber = value;
		}
		this._UpdateResults();
	};
	output._UpdateResultsPerPage = function(e) {
		var value = Number(this._resultsPerPageTarget.value);
		if(isNaN(value) || Math.floor(value) !== value) {
			this._resultsPerPageTarget.value = this._resultsPerPage.toString();
		} else if(value === 0) {
			this._resultsPerPage = 1;
			this._resultsPerPageTarget.value = "1";
		} else {
			this._resultsPerPage = value;
		}
		this._UpdateResults();
		this._UpdateMaxPageNumber();
	};
	output._LoadStory = function(e) {
		var id = parseInt(e.getAttribute("data-value"), 10);
		if(this._currentResultTarget !== e) {
			if(this._currentResultTarget !== undefined) {
				this._currentResultTarget.className = defaultSearchResultClass;
			}
			this._currentResultTarget = e;
			this._currentResultTarget.className = defaultSearchResultSelectedClass;
		}
		if(this._currentResultId !== id) {
			this._currentResultId = id;
			this._storyDisplayTarget.innerHTML = this.searcher.GetBody(id);
		}
	};
	output.handleEvent = function(e) {
		if(e.type === "keyup") {
			if(e.target == this._pageNumberTarget) {
				this._UpdatePageNumber(e);
			} else if(e.target == this._resultsPerPageTarget) {
				this._UpdateResultsPerPage(e);
			}
		} else if(e.type === "click") {
			this._LoadStory(e.currentTarget);
		}
	};
	//TODO: Remove duplication
	output.pageNumberRight = function() {
		if(this._pageNumber < this._maxPageNumber) {
			this._pageNumber += 1;
		} else if(this._maxPageNumber >= 0) {
			this._pageNumber = 0;
		}
		this._pageNumberTarget.value = (this._pageNumber + 1).toString();
		this._UpdateResults();
	};
	output.pageNumberLeft = function() {
		if(this._pageNumber > this._maxPageNumber || this._pageNumber <= 0) {
			this._pageNumber = this._maxPageNumber;
		} else {
			this._pageNumber -= 1;
		}
		this._pageNumberTarget.value = (this._pageNumber + 1).toString();
		this._UpdateResults();
	};
	output._range = function(start, end) {
		var idx = undefined;
		var output = [];
		for(idx = start; idx < end; ++idx) {
			output.push(idx);
		}
		return output;
	};
	output._initQueryTable = function(parentField, names, managers) {
		var table = document.createElement("table");
		var headings = document.createElement("tr");
		var queries = document.createElement("tr");
		var occurrences = document.createElement("tr");
		var idx = undefined;
		var namesLength = names.length;
		for(idx = 0; idx < namesLength; ++idx) {
			var heading = document.createElement("th");
			var query = document.createElement("td");
			var occurrence = document.createElement("td");
			heading.innerHTML = names[idx];
			headings.appendChild(heading);
			if( managers[idx].hasOwnProperty("targetMinElement") ) {
				query.appendChild(managers[idx].targetMinElement);
				query.appendChild( document.createTextNode(" - ") );
				query.appendChild(managers[idx].targetMaxElement);
			} else {
				query.appendChild(managers[idx].targetElement);
			}
			queries.appendChild(query);
			occurrences.appendChild(occurrence);
			this.queryManagerLookup.push(managers[idx]);
			this.queryManagerResultsLookup.push(undefined);
			this.queryOccurrenceTargetsLookup.push(occurrence);
		}
		table.appendChild(headings);
		table.appendChild(queries);
		table.appendChild(occurrences);
		parentField.appendChild(table);
	};
	output.init = function(logger, searcher, name, pageNumber, resultsPerPage) {
		var searchFields = document.getElementById("SearchFields");
		var searchResults = document.getElementById("SearchResults");
		var resultsControl = document.createElement("div");
		var resultsDisplay = document.createElement("div");
		var resultsPerPageTitle = document.createElement("p");
		var resultsPerPageP = document.createElement("p");
		var pageNumberTitle = document.createElement("p");
		var pageNumberP = document.createElement("p");

		searchResults.appendChild(resultsControl);
		searchResults.appendChild(resultsDisplay);

		resultsDisplay.className = "ScrollField";

		this._resultsDisplayTarget = resultsDisplay;
		this._storyDisplayTarget = document.getElementById("StoryArea");

		this.searcher = searcher;
		this.name = name; // TODO: Where to put this?

		// logManager
		this.logger = logger;

		// checksumSearcher
		this.sha256Manager = newChecksumSearcher("Sha256Query", this.searcher.sha256Lookup, this);

		// keywordSearcher
		this.commentsManager = newKeywordSearcher("CommentsQuery", this.searcher.commentsLookup, this);
		this.descriptionManager = newKeywordSearcher("DescriptionQuery", this.searcher.descriptionLookup, this);

		// fulltextSearcher
		this.bodyManager = newFulltextSearcher("BodyQuery", this.searcher, this);

		// dateSearcher
		this.posixdateManager = newDateSearcher("MinDateQuery", "MaxDateQuery", this.searcher.posixdateLookup, this);

		// rangeSearcher
		this.ratingManager = newRangeSearcher("RatingQuery", this.searcher.ratingLookup, this);
		this.ratersManager = newRangeSearcher("RatersQuery", this.searcher.ratersLookup, this);
		this.viewcountManager = newRangeSearcher("ViewcountQuery", this.searcher.viewcountLookup, this);

		// autocompleteSearcher
		this.domainManager = newAutocompleteSearcher("DomainQuery", defaultListHeight, defaultListHoveredClass, defaultListUnhoveredClass, this.searcher.domainLookup, this);
		this.languageManager = newAutocompleteSearcher("LanguageQuery", defaultListHeight, defaultListHoveredClass, defaultListUnhoveredClass, this.searcher.languageLookup, this);
		this.contentManager = newAutocompleteSearcher("ContentQuery", defaultListHeight, defaultListHoveredClass, defaultListUnhoveredClass, this.searcher.contentLookup, this);
		this.typeManager = newAutocompleteSearcher("TypeQuery", defaultListHeight, defaultListHoveredClass, defaultListUnhoveredClass, this.searcher.typeLookup, this);
		this.categoryManager = newAutocompleteSearcher("CategoryQuery", defaultListHeight, defaultListHoveredClass, defaultListUnhoveredClass, this.searcher.categoryLookup, this);
		this.locationManager = newAutocompleteSearcher("LocationQuery", defaultListHeight, defaultListHoveredClass, defaultListUnhoveredClass, this.searcher.locationLookup, this);
		this.formatManager = newAutocompleteSearcher("FormatQuery", defaultListHeight, defaultListHoveredClass, defaultListUnhoveredClass, this.searcher.formatLookup, this);
		this.authorManager = newAutocompleteSearcher("AuthorQuery", defaultListHeight, defaultListHoveredClass, defaultListUnhoveredClass, this.searcher.authorLookup, this);
		this.emailManager = newAutocompleteSearcher("EmailQuery", defaultListHeight, defaultListHoveredClass, defaultListUnhoveredClass, this.searcher.emailLookup, this);
		this.tagManager = newAutocompleteSearcher("TagQuery", defaultListHeight, defaultListHoveredClass, defaultListUnhoveredClass, this.searcher.tagLookup, this);
		this.originManager = newAutocompleteSearcher("OriginQuery", defaultListHeight, defaultListHoveredClass, defaultListUnhoveredClass, this.searcher.originLookup, this);
		this.siteManager = newAutocompleteSearcher("SiteQuery", defaultListHeight, defaultListHoveredClass, defaultListUnhoveredClass, this.searcher.siteLookup, this);
		this.titleManager = newAutocompleteSearcher("TitleQuery", defaultListHeight, defaultListHoveredClass, defaultListUnhoveredClass, this.searcher.titleLookup, this);

		this._allStoryIndexes = this._range(0, this.titleManager.lookup.GetAll().AllValues().length);

		this._initQueryTable(searchFields, ["Story Checksum"], [this.sha256Manager]);
		this._initQueryTable(searchFields, ["Title", "Author", "Date Range", "Story Language"], [this.titleManager, this.authorManager, this.posixdateManager, this.languageManager]);
		this._initQueryTable(searchFields, ["Site Domain", "Archive Format", "Archive Comment"], [this.domainManager, this.formatManager, this.commentsManager]);
		this._initQueryTable(searchFields, ["Views", "Rating", "Raters"], [this.viewcountManager, this.ratingManager, this.ratersManager]);
		this._initQueryTable(searchFields, ["Content Rating", "Story Type", "Category", "Story Location"], [this.contentManager, this.typeManager, this.categoryManager, this.locationManager]);
		this._initQueryTable(searchFields, ["Author Website", "Author Email", "Author Description"], [this.siteManager, this.emailManager, this.descriptionManager]);
		this._initQueryTable(searchFields, ["Story Origin", "Story Tags", "Body Keywords"], [this.originManager, this.tagManager, this.bodyManager]);

		resultsPerPageTitle.innerHTML = "Results per page:"

		this._resultsPerPage = resultsPerPage;
		this._resultsPerPageTarget = document.createElement("input"),
		this._resultsPerPageTarget.setAttribute("type", "text");
		this._resultsPerPageTarget.setAttribute("placeholder", "Results per page");
		this._resultsPerPageTarget.addEventListener("keyup", this, false);
		this._resultsPerPageTarget.value = this._resultsPerPage.toString();

		pageNumberTitle.innerHTML = "Page number:"

		this._pageNumberLeftTarget = document.createElement("button");
		this._pageNumberLeftTarget.innerHTML = "<";
		this._pageNumberLeftTarget.setAttribute("onclick", this.name + ".pageNumberLeft()");

		this._pageNumber = pageNumber;
		this._pageNumberTarget = document.createElement("input");
		this._pageNumberTarget.setAttribute("type", "text");
		this._pageNumberTarget.setAttribute("placeholder", "Page Number");
		this._pageNumberTarget.addEventListener("keyup", this, false);
		this._pageNumberTarget.value = (this._pageNumber + 1).toString();

		this._maxPageNumberTarget = document.createElement("span");
		this._storyAmountTarget = document.createElement("span");

		this._pageNumberRightTarget = document.createElement("button");
		this._pageNumberRightTarget.innerHTML = ">";
		this._pageNumberRightTarget.setAttribute("onclick", this.name + ".pageNumberRight()");

		resultsPerPageP.appendChild(this._resultsPerPageTarget);

		pageNumberP.appendChild(this._pageNumberLeftTarget);
		pageNumberP.appendChild(this._pageNumberTarget);
		pageNumberP.appendChild(this._maxPageNumberTarget);
		pageNumberP.appendChild(this._storyAmountTarget);
		pageNumberP.appendChild(this._pageNumberRightTarget);

		resultsControl.appendChild(resultsPerPageTitle);
		resultsControl.appendChild(resultsPerPageP);
		resultsControl.appendChild(pageNumberTitle);
		resultsControl.appendChild(pageNumberP);

		this._UpdateSearch();
	};
	output.init(logger, searcher, name, pageNumber, resultsPerPage);
	return output;
}

function ToggleSection(button, buttonOnText, buttonOffText, section) {
	if(section.style.display === "" || section.style.display === "none") {
		section.style.display = "block";
		button.innerHTML = buttonOffText;
	} else {
		section.style.display = "none";
		button.innerHTML = buttonOnText;
	}
}

function ToggleErrorField(button, section) {
	ToggleSection( button, "Error Messages v", "Error Messages ^", document.getElementById("ErrorField") );
}

function ToggleSearchFields(button, section) {
	ToggleSection( button, "Search Fields v", "Search Fields ^", document.getElementById("SearchFields") );
}

function ToggleSearchResults(button, section) {
	ToggleSection( button, "Search Results v", "Search Results ^", document.getElementById("SearchResults") );
}

function ToggleStoryArea(button, section) {
	ToggleSection( button, "Story Area v", "Story Area ^", document.getElementById("StoryArea") );
}
