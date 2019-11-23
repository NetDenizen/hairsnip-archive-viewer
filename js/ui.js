// TODO: Rewrite onclick to event handler
"use strict";

var defaultResultsPerPage = 10;
var defaultPageNumber = 0;
var defaultSearchResultClass = "SearchResult";
var defaultSearchResultSelectedClass = "SearchResult selected";
var defaultListHeight = "10em";

var defaultListContainerClass = "border AutocompleteArea container";
var defaultListHoveredClass = "AutocompleteArea option hovered";
var defaultListUnhoveredClass = "AutocompleteArea option unhovered";

var defaultListClasses = {
	listContainerClass: defaultListContainerClass,
	listHoveredClass: defaultListHoveredClass,
	listUnhoveredClass: defaultListUnhoveredClass
};

var dateFormatOptions = {
	timeZone: "UTC",
};

function newUiManager(searcher, name, classes, pageNumber, resultsPerPage) {
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

	output.queryManagerLookup = [];
	output.queryManagerResultsLookup = [];
	output.queryManagerNecessaryResultsLookup = [];
	output.queryOccurrenceTargetsLookup = [];
	output.searcher = undefined;

	output._allStoryIndexes = undefined;
	output._storyIndexes = undefined;

	output._resultsPerPageTarget = undefined;
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
		SetHTMLToText( this._maxPageNumberTarget, " / " + (this._maxPageNumber + 1).toString() );
		SetHTMLToText( this._storyAmountTarget, " (" + this._storyIndexes.length.toString() + ")" );
	};
	output._UpdateSingleQueryData = function(idx) {
		var found = this.queryManagerLookup[idx];
		if(found.edited) {
			this.queryManagerResultsLookup[idx] = found.results !== undefined ?
												  new Set( found.results.AllValues() ) :
												  undefined;
			if( found.hasOwnProperty("necessaryResults") ) {
				this.queryManagerNecessaryResultsLookup[idx] = found.necessaryResults !== undefined ?
															   found.necessaryResults :
															   undefined;
			}
			found.edited = false;
		}
	};
	output._StoryIdxHasNecessaryValues = function(queryIdx, storyIdx) {
		var output = true;
		if(this.queryManagerNecessaryResultsLookup[queryIdx] !== undefined) {
			var necessaryValues = this.queryManagerNecessaryResultsLookup[queryIdx].keys;
			var necessaryValuesLength = necessaryValues.length;
			var results = new Set( this.queryManagerLookup[queryIdx].lookup.GetReverse(storyIdx) );
			var idx = undefined;
			for(idx = 0; idx < necessaryValuesLength; ++idx) {
				if( !results.has(necessaryValues[idx]) ) {
					output = false;
					break;
				}
			}
		}
		return output;
	};
	output._UpdateSingleQuery = function(queryIdx) {
		if(this.queryManagerResultsLookup[queryIdx] !== undefined) {
			var filteredStoryIndexes = [];
			var allValues = this.queryManagerResultsLookup[queryIdx];
			var storyIndexesLength = this._storyIndexes.length;
			var idx = undefined;
			for(idx = 0; idx < storyIndexesLength; ++idx) {
				var storyIdx = this._storyIndexes[idx];
				if( allValues.has(storyIdx) && this._StoryIdxHasNecessaryValues(queryIdx, storyIdx) ) {
					filteredStoryIndexes.push(storyIdx);
				}
			}
			this._storyIndexes = filteredStoryIndexes;
		}
	};
	output._UpdateSingleQueryTarget = function(idx) {
		var target = this.queryOccurrenceTargetsLookup[idx];
		var targetString = "";
		if(this.queryManagerResultsLookup[idx] !== undefined) {
			targetString += this.queryManagerResultsLookup[idx].size.toString();
		}
		if(targetString.length > 0) {
			SetHTMLToText(target, targetString);
		} else {
			ClearChildren(target);
		}
	};
	output._UpdateQueries = function() {
		var queryManagerLookupLength = this.queryManagerLookup.length;
		var idx = undefined;
		this._storyIndexes = this._allStoryIndexes.slice(0);
		for(idx = 0; idx < queryManagerLookupLength; ++idx) {
			// TODO: Make sure this is right
			this._UpdateSingleQueryData(idx);
			this._UpdateSingleQuery(idx);
			this._UpdateSingleQueryTarget(idx);
		}
	};
	output._LookupTerm = function(manager, id) {
		var terms = manager.lookup.GetReverse(id);
		if( (terms.length > 1) || (terms.length > 0 && terms[0] !== "") ) {
			var idx = 0;
			while(true) {
				idx = terms.indexOf('', idx);
				if(idx === -1) {
					break;
				}
				terms[idx] = '-';
			}
		}
		return terms.join(", ");
	};
	output._BuildResultString = function(start, prefix, value) {
		var output = start;
		if(value !== "") {
			if(output !== "") {
				output += " | ";
			}
			output = output + prefix + value;
		}
		return output;
	};
	output._UpdateSingleResult = function(id) {
		// Main items
		var sha256 = this._LookupTerm(this.sha256Manager, id);
		var title = this._LookupTerm(this.titleManager, id);
		var domain = this._LookupTerm(this.domainManager, id);
		var format = this._LookupTerm(this.formatManager, id);
		var author = this._LookupTerm(this.authorManager, id);
		var date = this._LookupTerm(this.posixdateManager, id);
		var language = this._LookupTerm(this.languageManager, id);
		// Hideable items
		var comments = this._LookupTerm(this.commentsManager, id);
		var description = this._LookupTerm(this.descriptionManager, id);
		var rating = this._LookupTerm(this.ratingManager, id);
		var raters = this._LookupTerm(this.ratersManager, id);
		var viewcount = this._LookupTerm(this.viewcountManager, id);
		var content = this._LookupTerm(this.contentManager, id);
		var type = this._LookupTerm(this.typeManager, id);
		var category = this._LookupTerm(this.categoryManager, id);
		var storyLocation = this._LookupTerm(this.locationManager, id);
		var email = this._LookupTerm(this.emailManager, id);
		var tag = this._LookupTerm(this.tagManager, id);
		var origin = this._LookupTerm(this.originManager, id);
		var site = this._LookupTerm(this.siteManager, id);
		// HTML Elements
		var item = document.createElement("div");
		// Main items
		var titleItem = document.createElement("h3"); // Title, Author, Language
		var infoItem = document.createElement("p"); // Date, Domain, Format
		if(domain !== "") {
			domain = " | " + domain;
		}
		if(language !== "") {
			language = " | " + language;
		}
		if(format !== "") {
			format = " | Format: " + format;
		}
		if(author !== "") {
			author = " - " + author;
		}
		item.className = defaultSearchResultClass;
		SetHTMLToText(titleItem, title + author + " (" + sha256 + ")");
		if(date !== "") {
			SetHTMLToText(infoItem, new Date( parseInt(date) * 1000 ).toUTCString() + domain + language + format);
		} else {
			SetHTMLToText(infoItem, "Date not found " + domain + language + format);
		}
		item.appendChild(titleItem);
		item.appendChild(infoItem);
		// TODO: Fugly code... make it less fugly... maybe..... eventually....... ugh
		// Hideable items
		if(comments !== "") {
			var commentsItem = document.createElement("p"); // Comments
			SetHTMLToText(commentsItem, "Archiver Comments: " + comments);
			item.appendChild(commentsItem);
		}
		// TODO: Should we check for block element descriptions?
		if(description !== "") {
			var descriptionItem = document.createElement("p"); // Description
			var descriptionItemContainer = document.createElement("span");
			descriptionItemContainer.innerHTML = description;
			descriptionItem.appendChild( document.createTextNode("Author Description: ") );
			descriptionItem.appendChild(descriptionItemContainer);
			item.appendChild(descriptionItem);
		}
		if(viewcount !== "" || rating !== "" || raters !== "") {
			var statsItemsString = "";
			var statsItems = document.createElement("p"); // Views, Rating, Raters
			statsItemsString = this._BuildResultString(statsItemsString, "Views: ", viewcount);
			statsItemsString = this._BuildResultString(statsItemsString, "Rating: ", rating);
			statsItemsString = this._BuildResultString(statsItemsString, "Raters: ", raters);
			SetHTMLToText(statsItems, statsItemsString);
			item.appendChild(statsItems);
		}
		if(content !== "" || type !== "" || category !== "" || storyLocation !== "") {
			var categoryItemsString = "";
			var categoryItems = document.createElement("p"); // Content, Type, Category, Location
			categoryItemsString = this._BuildResultString(categoryItemsString, "Content Rating: ", content);
			categoryItemsString = this._BuildResultString(categoryItemsString, "Story Type: ", type);
			categoryItemsString = this._BuildResultString(categoryItemsString, "Category: ", category);
			categoryItemsString = this._BuildResultString(categoryItemsString, "Story Location: ", storyLocation);
			SetHTMLToText(categoryItems, categoryItemsString);
			item.appendChild(categoryItems);
		}
		if(email !== "" || site !== "") {
			var authorInfoItemsString = "";
			var authorInfoItems = document.createElement("p"); // Email, Site
			authorInfoItemsString = this._BuildResultString(authorInfoItemsString, "Author Email: ", email);
			authorInfoItemsString = this._BuildResultString(authorInfoItemsString, "Author Site: ", site);
			SetHTMLToText(authorInfoItems, authorInfoItemsString);
			item.appendChild(authorInfoItems);
		}
		if(origin !== "" || tag !== "") {
			var storyInfoItemsString = "";
			var storyInfoItems = document.createElement("p"); // Origin, Tag
			storyInfoItemsString = this._BuildResultString(storyInfoItemsString, "Origin Site: ", origin);
			storyInfoItemsString = this._BuildResultString(storyInfoItemsString, "Story Tags: ", tag);
			SetHTMLToText(storyInfoItems, storyInfoItemsString);
			item.appendChild(storyInfoItems);
		}
		item.setAttribute( "data-value", id.toString() );
		item.addEventListener("click", this, false);
		this._resultsDisplayTarget.appendChild(item);
		return item;
	};
	output._UpdateResults = function() {
		var resultsStart = this._pageNumber * this._resultsPerPage;
		var indexes = this._storyIndexes.slice(resultsStart, resultsStart + this._resultsPerPage);
		var indexesLength = indexes.length;
		var idx = undefined;
		ClearChildren(this._resultsDisplayTarget);
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
		} else if(value <= 0) {
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
		} else if(value <= 0) {
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
	output._PageNumberLeft = function() {
		if(this._maxPageNumber >= 0) {
			if( (this._pageNumber > this._maxPageNumber || this._pageNumber <= 0) ) {
				this._pageNumber = this._maxPageNumber;
			} else {
				this._pageNumber -= 1;
			}
		}
		this._pageNumberTarget.value = (this._pageNumber + 1).toString();
		this._UpdateResults();
	};
	output._PageNumberRight = function() {
		if(this._pageNumber < this._maxPageNumber) {
			this._pageNumber += 1;
		} else if(this._maxPageNumber >= 0) {
			this._pageNumber = 0;
		}
		this._pageNumberTarget.value = (this._pageNumber + 1).toString();
		this._UpdateResults();
	};
	output.handleEvent = function(e) {
		if(e.type === "input") {
			if(e.target == this._pageNumberTarget) {
				this._UpdatePageNumber(e);
			} else if(e.target == this._resultsPerPageTarget) {
				this._UpdateResultsPerPage(e);
			}
		} else if(e.type === "click") {
			if(e.currentTarget === this._pageNumberLeftTarget) {
				this._PageNumberLeft();
			} else if(e.currentTarget === this._pageNumberRightTarget) {
				this._PageNumberRight();
			} else {
				this._LoadStory(e.currentTarget);
			}
		}
	};
	output._BuildRangeTitleString = function(prefix, lookup) {
		var allValues = lookup.GetAll();
		var output = prefix;
		if(allValues.keys.length > 0) {
			output += (" (" + allValues.keys[0]);
			if(allValues.keys.length > 1) {
				output += (" - " + allValues.keys[allValues.keys.length - 1] + ")");
			} else {
				output += (" - " + allValues.keys[0] + ")");
			}
		}
		return output;
	};
	//TODO: Remove code duplication
	output._BuildDateRangeTitleString = function(prefix, lookup) {
		var allValues = lookup.GetAll();
		var output = prefix;
		if(allValues.keys.length > 0) {
			var minDate = new Date( parseInt(allValues.keys[0]) * 1000 ).toLocaleDateString(undefined, dateFormatOptions).slice(0, 10);
			output += (" (" + minDate);
			if(allValues.keys.length > 1) {
				output += (" - " +
						   new Date( parseInt(allValues.keys[allValues.keys.length - 1]) * 1000 ).toLocaleDateString(undefined, dateFormatOptions).slice(0, 10) +
						   ")"
						  );
			} else {
				output += (" - " + minDate + ")");
			}
		}
		return output;
	};
	output._InitQueryTable = function(parentField, names, managers) {
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
			if( managers[idx].hasOwnProperty('targetListElementSort') ) {
				heading.appendChild( document.createTextNode(" ") );
				heading.appendChild(managers[idx].targetListElementSort);
			}
			if( managers[idx].hasOwnProperty('targetListElementSortOrder') ) {
				heading.appendChild( document.createTextNode(" ") );
				heading.appendChild(managers[idx].targetListElementSortOrder);
			}
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
			this.queryManagerNecessaryResultsLookup.push(undefined);
			this.queryOccurrenceTargetsLookup.push(occurrence);
		}
		table.className = 'SearchWidgets';
		table.appendChild(headings);
		table.appendChild(queries);
		table.appendChild(occurrences);
		parentField.appendChild(table);
	};
	output._InitManagers = function(searcher) {
		this.searcher = searcher;

		// checksumSearcher
		this.sha256Manager = newChecksumSearcher("Sha256Query", this.searcher.sha256Lookup, this);

		// keywordSearcher
		this.commentsManager = newKeywordSearcher("CommentsQuery", this.searcher.commentsLookup, this);
		this.descriptionManager = newKeywordSearcher("DescriptionQuery", this.searcher.descriptionLookup, this);

		// fulltextSearcher
		this.bodyManager = newFulltextSearcher("BodyQuery", this.searcher, this);

		// dateSearcher
		this.posixdateManager = newDateSearcher("DateQuery", this.searcher.posixdateLookup, this);

		// rangeSearcher
		this.ratingManager = newRangeSearcher("RatingQuery", this.searcher.ratingLookup, this);
		this.ratersManager = newRangeSearcher("RatersQuery", this.searcher.ratersLookup, this);
		this.viewcountManager = newRangeSearcher("ViewcountQuery", this.searcher.viewcountLookup, this);

		// autocompleteSearcher
		this.domainManager = newAutocompleteSearcher("DomainQuery", defaultListHeight, classes, this.searcher.domainLookup, this);
		this.languageManager = newAutocompleteSearcher("LanguageQuery", defaultListHeight, classes, this.searcher.languageLookup, this);
		this.contentManager = newAutocompleteSearcher("ContentQuery", defaultListHeight, classes, this.searcher.contentLookup, this);
		this.typeManager = newAutocompleteSearcher("TypeQuery", defaultListHeight, classes, this.searcher.typeLookup, this);
		this.categoryManager = newAutocompleteSearcher("CategoryQuery", defaultListHeight, classes, this.searcher.categoryLookup, this);
		this.locationManager = newAutocompleteSearcher("LocationQuery", defaultListHeight, classes, this.searcher.locationLookup, this);
		this.formatManager = newAutocompleteSearcher("FormatQuery", defaultListHeight, classes, this.searcher.formatLookup, this);
		this.authorManager = newAutocompleteSearcher("AuthorQuery", defaultListHeight, classes, this.searcher.authorLookup, this);
		this.emailManager = newAutocompleteSearcher("EmailQuery", defaultListHeight, classes, this.searcher.emailLookup, this);
		this.tagManager = newAutocompleteSearcher("TagQuery", defaultListHeight, classes, this.searcher.tagLookup, this);
		this.originManager = newAutocompleteSearcher("OriginQuery", defaultListHeight, classes, this.searcher.originLookup, this);
		this.siteManager = newAutocompleteSearcher("SiteQuery", defaultListHeight, classes, this.searcher.siteLookup, this);
		this.titleManager = newAutocompleteSearcher("TitleQuery", defaultListHeight, classes, this.searcher.titleLookup, this);
	};
	output._InitAllQueryTables = function() {
		var searchFields = document.getElementById("SearchFields");
		ClearChildren(searchFields);
		this._InitQueryTable(searchFields, ["Story Checksum"], [this.sha256Manager]);
		this._InitQueryTable(searchFields,
							 ["Title",
							  "Author",
							  this._BuildDateRangeTitleString("Date Range", this.searcher.posixdateLookup),
							  "Story Language"
							 ],
							 [this.titleManager, this.authorManager, this.posixdateManager, this.languageManager]
							);
		this._InitQueryTable(searchFields,
							 ["Site Domain", "Archive Format", "Archive Comment"],
							 [this.domainManager, this.formatManager, this.commentsManager]
							);
		this._InitQueryTable(searchFields,
							 [this._BuildRangeTitleString("Views", this.searcher.viewcountLookup),
							  this._BuildRangeTitleString("Rating", this.searcher.ratingLookup),
							  this._BuildRangeTitleString("Raters", this.searcher.ratersLookup)
							 ],
							 [this.viewcountManager, this.ratingManager, this.ratersManager]
							);
		this._InitQueryTable(searchFields,
							 ["Content Rating", "Story Type", "Category", "Story Location"],
							 [this.contentManager, this.typeManager, this.categoryManager, this.locationManager]
							);
		this._InitQueryTable(searchFields,
							 ["Author Website", "Author Email", "Author Description"],
							 [this.siteManager, this.emailManager, this.descriptionManager]
							);
		this._InitQueryTable(searchFields,
							 ["Story Origin", "Story Tags", "Body Keywords"],
							 [this.originManager, this.tagManager, this.bodyManager]
							);
	};
	output._InitPageNumber = function(pageNumber) {
		var pageNumberContainer = document.createElement("tr");
		var pageNumberTitle = document.createElement("td");
		var pageNumberTargetContainer = document.createElement("td");

		SetHTMLToText(pageNumberTitle, "Page number: ");

		this._pageNumberLeftTarget = document.createElement("button");
		SetHTMLToText(this._pageNumberLeftTarget, "<");
		this.pageNumberLeftTarget.addEventListener("click", this, false);

		this._pageNumber = pageNumber;
		this._pageNumberTarget = document.createElement("input");
		this._pageNumberTarget.setAttribute("type", "text");
		this._pageNumberTarget.setAttribute("placeholder", "Page Number");
		this._pageNumberTarget.addEventListener("input", this, false);
		this._pageNumberTarget.value = (this._pageNumber + 1).toString();

		this._maxPageNumberTarget = document.createElement("span");
		this._storyAmountTarget = document.createElement("span");

		this._pageNumberRightTarget = document.createElement("button");
		SetHTMLToText(this._pageNumberRightTarget, ">");
		this.pageNumberRightTarget.addEventListener("click", this, false);

		pageNumberTargetContainer.appendChild(this._pageNumberLeftTarget);
		pageNumberTargetContainer.appendChild( document.createTextNode(" ") );
		pageNumberTargetContainer.appendChild(this._pageNumberTarget);
		pageNumberTargetContainer.appendChild(this._maxPageNumberTarget);
		pageNumberTargetContainer.appendChild(this._storyAmountTarget);
		pageNumberTargetContainer.appendChild( document.createTextNode(" ") );
		pageNumberTargetContainer.appendChild(this._pageNumberRightTarget);

		pageNumberContainer.appendChild(pageNumberTitle);
		pageNumberContainer.appendChild(pageNumberTargetContainer);

		return pageNumberContainer;
	};
	output._InitSearchResults = function(pageNumber, resultsPerPage) {
		var searchResults = document.getElementById("SearchResults");
		var resultsDisplay = document.createElement("div");
		var resultsControlTable = document.createElement("table");
		var resultsPerPageContainer = document.createElement("tr");
		var resultsPerPageTitle = document.createElement("td");
		var resultsPerPageTargetContainer = document.createElement("td");

		ClearChildren(searchResults);

		resultsDisplay.className = "ScrollField";
		this._resultsDisplayTarget = resultsDisplay;

		SetHTMLToText(resultsPerPageTitle, "Results per page: ");

		this._resultsPerPage = resultsPerPage;
		this._resultsPerPageTarget = document.createElement("input");
		this._resultsPerPageTarget.setAttribute("type", "text");
		this._resultsPerPageTarget.setAttribute("placeholder", "Results per page");
		this._resultsPerPageTarget.addEventListener("input", this, false);
		this._resultsPerPageTarget.value = this._resultsPerPage.toString();

		resultsPerPageTargetContainer.appendChild(this._resultsPerPageTarget);

		resultsPerPageContainer.appendChild(resultsPerPageTitle);
		resultsPerPageContainer.appendChild(resultsPerPageTargetContainer);

		resultsControlTable.appendChild(resultsPerPageContainer);
		resultsControlTable.appendChild( this._InitPageNumber(pageNumber) );

		searchResults.appendChild(resultsControlTable);
		searchResults.appendChild( document.createElement("hr") );
		searchResults.appendChild(resultsDisplay);
	};
	output.init = function(searcher, name, classes, pageNumber, resultsPerPage) {
		this._storyDisplayTarget = document.getElementById("StoryArea");
		ClearChildren(this._storyDisplayTarget);

		this.name = name;

		this._InitManagers(searcher);
		this._InitAllQueryTables();
		this._InitSearchResults(pageNumber, resultsPerPage);

		this._allStoryIndexes = range(0, this.titleManager.lookup.GetAll().AllValues().length);
		this._UpdateSearch();
	};
	output.init(searcher, name, classes, pageNumber, resultsPerPage);
	return output;
}

function ToggleSection(button, buttonOnText, buttonOffText, section) {
	if(section.style.display === "none") {
		section.style.display = "";
		button.innerHTML = buttonOffText;
	} else {
		section.style.display = "none";
		button.innerHTML = buttonOnText;
	}
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
