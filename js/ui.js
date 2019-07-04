// TODO: Update search query options on change
// TODO: Add dropdown in search results
// TODO: Rewrite onclick to event handler
"use strict";

var defaultResultsPerPage = 100;
var defaultPageNumber = 0;
var defaultUpdateInterval = 1000;

function newUiManager(logger, searcher, name, updateInterval, pageNumber, resultsPerPage) {
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

	output._displayStates = {};
	output.ToggleDisplay = function(id) {
		var e = document.getElementById(id);
		if(e.style.display === "none") {
			if( this._displayStates.hasOwnProperty(id) ) {
				e.style.display = this._displayStates[id];
			} else {
				e.style.display = initial;
			}
		} else {
			this._displayStates[id] = e.style.display;
			e.style.display = "none";
		}
	};

	// logManager
	output.logger = undefined;

	output.queryManagerLookup = [];
	output.queryOccurrenceTargetsLookup = [];
	output.searcher = undefined;

	output._lastUpdateTime = undefined;
	output._updateInterval = undefined;
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
	output._pageNumber = undefined;
	output._maxPageNumber = undefined;

	output._resultsDisplayTarget = undefined;
	output._storyDisplayTarget = undefined;

	output._UpdateMaxPageNumber = function() {
		this._maxPageNumber = Math.floor(this._storyIndexes.length / this._resultsPerPage);
		this._maxPageNumberTarget.innerHTML = " / " + (this._maxPageNumber + 1).toString();
	};
	output._UpdateSingleQuery = function(idx) {
		if(this.queryManagerLookup[idx].edited) {
			var results = this.queryManagerLookup[idx].results;
			if(results !== undefined) {
				var allValues = results.AllValues();
				var target = this.queryOccurrenceTargetsLookup[idx];
				//TODO: Rewrite
				this._storyIndexes = this._storyIndexes.filter( function(e) { return allValues.includes(e); } );
				target.innerHTML = allValues.length.ToString();
			}
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
		titleItem.innerHTML = title +  " - " + author;
		if(date !== "") {
			infoItem.innerHTML = new Date( parseInt(date) ).toISOString() + " - " + domain + " | Format: " + format;
		} else {
			infoItem.innerHTML = "Date not found - " + domain + " | Format: " + format;
		}
		item.appendChild(titleItem);
		item.appendChild(infoItem);
		item.setAttribute("onclick", this.name + ".LoadStory(" + id.toString() + ")");
		this._resultsDisplayTarget.appendChild(item);
	};
	output._UpdateResults = function() {
		var resultsStart = this._pageNumber * this._resultsPerPage;
		var indexes = this._storyIndexes.slice(resultsStart, resultsStart + this._resultsPerPage);
		var indexesLength = indexes.length;
		var idx = undefined;
		this._resultsDisplayTarget.innerHTML = "";
		for(idx = 0; idx < indexesLength; ++idx) {
			this._UpdateSingleResult( indexes[idx] );
		}
	};
	output._UpdateSearch = function() {
		var currentTime = Date.now();
		var deltaTime = currentTime - this._lastUpdateTime;
		if(this._lastUpdateTime === undefined || deltaTime >= this._updateInterval) {
			this._lastUpdateTime = currentTime;
			this._UpdateQueries();
			this._UpdateMaxPageNumber();
			this._UpdateResults();
		} else {
			setTimeout(this._UpdateSearch, deltaTime);
		}
	};
	output._UpdatePageNumber = function(e) {
		//TODO: Optimize
		// TODO: Make proportional to number of pages
		var value = Number(this._pageNumberTarget.value);
		if(isNaN(value) || Math.floor(value) !== value) {
			this._pageNumberTarget.value = this._pageNumber.toString();
		} else if(value === 0) {
			this._pageNumber = 0;
			this._pageNumberTarget.value = "1";
		} else if(value > this._maxPageNumber) {
			this._pageNumber = this._maxPageNumber;
			this._pageNumberTarget.value = this._pageNumber.toString();
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
	output.handleEvent = function(e) {
		if(e.type === "keyup") {
			if(e.target == this._pageNumberTarget) {
				this._UpdatePageNumber(e);
			} else if(e.target == this._resultsPerPageTarget) {
				this._UpdateResultsPerPage(e);
			}
		}
	};
	//TODO: Remove duplication
	output.pageNumberRight = function() {
		if(this._pageNumber < this._maxPageNumber) {
			this._pageNumber += 1;
		} else {
			this._pageNumber = 0;
		}
		this._pageNumberTarget.value = (this._pageNumber + 1).toString();
		this._UpdateResults();
	};
	output.pageNumberLeft = function() {
		if(this._pageNumber > 0) {
			this._pageNumber -= 1;
		} else {
			this._pageNumber = this._maxPageNumber;
		}
		this._pageNumberTarget.value = (this._pageNumber + 1).toString();
		this._UpdateResults();
	};
	output.LoadStory = function(id) {
		this._storyDisplayTarget.innerHTML = this.searcher.GetBody(id);
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
			heading.innerHTML = names[idx];
			headings.appendChild(heading);
			var query = document.createElement("td");
			if( managers[idx].hasOwnProperty("targetMinElement") ) {
				query.appendChild(managers[idx].targetMinElement);
				query.appendChild( document.createTextNode(" - ") );
				query.appendChild(managers[idx].targetMaxElement);
			} else {
				query.appendChild(managers[idx].targetElement);
			}
			queries.appendChild(query);
			var occurrence = document.createElement("td");
			occurrences.appendChild(occurrence);
			this.queryManagerLookup.push(managers[idx]);
			this.queryOccurrenceTargetsLookup.push(occurrence);
		}
		table.appendChild(headings);
		table.appendChild(queries);
		table.appendChild(occurrences);
		parentField.appendChild(table);
	};
	output.init = function(logger, searcher, name, updateInterval, pageNumber, resultsPerPage) {
		var searchFields = document.getElementById("SearchFields");
		var sha256Table = document.createElement("table");
		var sha256Tr1 = document.createElement("tr");
		var sha256Tr2 = document.createElement("tr");
		var sha256Th = document.createElement("th");
		var sha256Td = document.createElement("td");
		var searchResults = document.getElementById("SearchResults");
		var resultsControl = document.createElement("div");
		var resultsDisplay = document.createElement("div");
		var resultsPerPageP = document.createElement("p");
		var pageNumberP = document.createElement("p");

		searchResults.appendChild(resultsControl);
		searchResults.appendChild(resultsDisplay);

		this._resultsDisplayTarget = resultsDisplay;
		this._storyDisplayTarget = document.getElementById("StoryArea");

		this.searcher = searcher;
		this.name = name; // TODO: Where to put this?

		// logManager
		this.logger = logger;

		// keywordSearcher
		this.commentsManager = newKeywordSearcher("CommentsQuery", this.searcher.commentsLookup, this._UpdateSearch);
		this.descriptionManager = newKeywordSearcher("DescriptionQuery", this.searcher.descriptionLookup, this._UpdateSearch);

		// fulltextSearcher
		this.bodyManager = newFulltextSearcher("BodyQuery", this.searcher, this._UpdateSearch);

		// dateSearcher
		this.posixdateManager = newDateSearcher("MinDateQuery", "MaxDateQuery", this.searcher.posixdateLookup, this._UpdateSearch);

		// rangeSearcher
		this.ratingManager = newRangeSearcher("RatingQuery", this.searcher.ratingLookup, this._UpdateSearch);
		this.ratersManager = newRangeSearcher("RatersQuery", this.searcher.ratersLookup, this._UpdateSearch);
		this.viewcountManager = newRangeSearcher("ViewcountQuery", this.searcher.viewcountLookup, this._UpdateSearch);

		// autocompleteSearcher
		this.sha256Manager = newAutocompleteSearcher("Sha256Query", "Sha256QueryList", this.searcher.sha256Lookup, this._UpdateSearch);
		this.domainManager = newAutocompleteSearcher("DomainQuery", "DomainQueryList", this.searcher.domainLookup, this._UpdateSearch);
		this.languageManager = newAutocompleteSearcher("LanguageQuery", "LanguageQueryList", this.searcher.languageLookup, this._UpdateSearch);
		this.contentManager = newAutocompleteSearcher("ContentQuery", "ContentQueryList", this.searcher.contentLookup, this._UpdateSearch);
		this.typeManager = newAutocompleteSearcher("TypeQuery", "TypeQueryList", this.searcher.typeLookup, this._UpdateSearch);
		this.categoryManager = newAutocompleteSearcher("CategoryQuery", "CategoryQueryList", this.searcher.categoryLookup, this._UpdateSearch);
		this.locationManager = newAutocompleteSearcher("LocationQuery", "LocationQueryList", this.searcher.locationLookup, this._UpdateSearch);
		this.formatManager = newAutocompleteSearcher("FormatQuery", "FormatQueryList", this.searcher.formatLookup, this._UpdateSearch);
		this.authorManager = newAutocompleteSearcher("AuthorQuery", "AuthorQueryList", this.searcher.authorLookup, this._UpdateSearch);
		this.emailManager = newAutocompleteSearcher("EmailQuery", "EmailQueryList", this.searcher.emailLookup, this._UpdateSearch);
		this.tagManager = newAutocompleteSearcher("TagQuery", "TagQueryList", this.searcher.tagLookup, this._UpdateSearch);
		this.originManager = newAutocompleteSearcher("OriginQuery", "OriginQueryList", this.searcher.originLookup, this._UpdateSearch);
		this.siteManager = newAutocompleteSearcher("SiteQuery", "SiteQueryList", this.searcher.siteLookup, this._UpdateSearch);
		this.titleManager = newAutocompleteSearcher("TitleQuery", "TitleQueryList", this.searcher.titleLookup, this._UpdateSearch);

		sha256Th.innerHTML = "Story Checksum";
		sha256Td.appendChild(this.sha256Manager.targetElement);
		sha256Tr1.appendChild(sha256Th);
		sha256Tr2.appendChild(sha256Td);
		sha256Table.appendChild(sha256Tr1);
		sha256Table.appendChild(sha256Tr2);
		searchFields.appendChild(sha256Table);

		this._updateInterval = updateInterval;
		this._allStoryIndexes = this._range(0, this.titleManager.lookup.GetAll().AllValues().length);

		this._initQueryTable(searchFields, ["Title", "Author", "Date Range", "Story Language"], [this.titleManager, this.authorManager, this.posixdateManager, this.languageManager]);
		this._initQueryTable(searchFields, ["Site Domain", "Archive Format", "Archive Comment"], [this.domainManager, this.formatManager, this.commentsManager]);
		this._initQueryTable(searchFields, ["Views", "Rating", "Raters"], [this.viewcountManager, this.ratingManager, this.ratersManager]);
		this._initQueryTable(searchFields, ["Content Rating", "Story Type", "Category", "Story Location"], [this.contentManager, this.typeManager, this.categoryManager, this.locationManager]);
		this._initQueryTable(searchFields, ["Author Website", "Author Email", "Author Description"], [this.siteManager, this.emailManager, this.descriptionManager]);
		this._initQueryTable(searchFields, ["Story Origin", "Story Tags", "Body Keywords"], [this.originManager, this.tagManager, this.bodyManager]);

		this._resultsPerPage = resultsPerPage;
		this._resultsPerPageTarget = document.createElement("input"),
		this._resultsPerPageTarget.setAttribute("type", "text");
		this._resultsPerPageTarget.setAttribute("placeholder", "Results per page");
		this._resultsPerPageTarget.addEventListener("keyup", this, false);
		this._resultsPerPageTarget.value = this._resultsPerPage.toString();

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

		this._pageNumberRightTarget = document.createElement("button");
		this._pageNumberRightTarget.innerHTML = ">";
		this._pageNumberRightTarget.setAttribute("onclick", this.name + ".pageNumberRight()");

		resultsPerPageP.appendChild(this._resultsPerPageTarget);

		pageNumberP.appendChild(this._pageNumberLeftTarget);
		pageNumberP.appendChild(this._pageNumberTarget);
		pageNumberP.appendChild(this._maxPageNumberTarget);
		pageNumberP.appendChild(this._pageNumberRightTarget);

		resultsControl.appendChild(resultsPerPageP);
		resultsControl.appendChild(pageNumberP);

		this._UpdateSearch();
	};
	output.init(logger, searcher, name, updateInterval, pageNumber, resultsPerPage);
	return output;
}