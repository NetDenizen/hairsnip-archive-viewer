"use strict";

function newStorySearcher(_db) {
	var output = {};
	output._db = undefined;

	output.sha256Lookup = undefined;
	output.commentsLookup = undefined;
	output.descriptionLookup = undefined;

	output.ratingLookup = undefined;
	output.ratersLookup = undefined;
	output.viewcountLookup = undefined;
	output.posixdateLookup = undefined;

	output.domainLookup = undefined;
	output.languageLookup = undefined;
	output.contentLookup = undefined;
	output.typeLookup = undefined;
	output.categoryLookup = undefined;
	output.locationLookup = undefined;
	output.formatLookup = undefined;
	output.authorLookup = undefined;
	output.emailLookup = undefined;
	output.tagLookup = undefined;
	output.originLookup = undefined;
	output.siteLookup = undefined;
	output.titleLookup = undefined;

	output._bodyLookup = undefined;
	output._bodyLookupReverse = undefined;

	output._LoadBodyIds = function() {
		var bodyLookup = this._db.exec("SELECT body_id FROM stories ORDER BY id")[0]['values'];
		var bodyLookupLength = bodyLookup.length;
		var bodyLookupReverse = {};
		var idx = undefined;
		for(idx = 0; idx < bodyLookupLength; ++idx) {
			var key = "v" + bodyLookup[idx];
			if( bodyLookupReverse.hasOwnProperty(key) ) {
				bodyLookupReverse[key].push(idx);
			} else {
				bodyLookupReverse[key] = [idx];
			}
		}
		this._bodyLookup = bodyLookup;
		this._bodyLookupReverse = bodyLookupReverse;
	};
	output._LoadIds = function(table) {
		var output = newIdLookup();
		var values = this._db.exec("SELECT id, name FROM " + table)[0]['values'];
		var valuesLength = values.length;
		var idx = undefined;
		output.add("", -1);
		for (idx = 0; idx < valuesLength; ++idx) {
			output.add(values[idx][1], values[idx][0]);
		}
		output.sort();
		return output;
	};
	output._BuildIntArrayLookup = function() {
		var output = [];
		var intArrays = this._db.exec("SELECT array_id, val FROM int_arrays")[0]['values'];
		var currentArrayId = undefined;
		var currentArray = undefined;
		var intArraysLength = intArrays.length;
		var idx = undefined;
		for(idx = 0; idx < intArraysLength; ++idx) {
			var array = intArrays[idx];
			if(array[0] !== currentArrayId){
				currentArrayId = array[0];
				currentArray = [];
				output.push(currentArray);
			}
			currentArray.push(array[1]);
		}
		return output;
	};
	output._NewLookups = function() {
		this.sha256Lookup = newIdLookup();
		this.commentsLookup = newIdLookup();
		this.descriptionLookup = newIdLookup();

		this.ratingLookup = newIdLookup();
		this.ratersLookup = newIdLookup();
		this.viewcountLookup = newIdLookup();
		this.posixdateLookup = newIdLookup();

		this.domainLookup = newIdLookup();
		this.languageLookup = newIdLookup();
		this.contentLookup = newIdLookup();
		this.typeLookup = newIdLookup();
		this.categoryLookup = newIdLookup();
		this.locationLookup = newIdLookup();
		this.formatLookup = newIdLookup();
		this.authorLookup = newIdLookup();
		this.emailLookup = newIdLookup();
		this.tagLookup = newIdLookup();
		this.originLookup = newIdLookup();
		this.siteLookup = newIdLookup();
		this.titleLookup = newIdLookup();
	};
	output._PopulateLookups = function() {
		var intArrays = this._BuildIntArrayLookup();

		var sha256 = this._db.exec("SELECT id, sha256 FROM stories ORDER BY sha256")[0]['values'];
		var comments = this._db.exec("SELECT id, comments FROM stories ORDER BY comments")[0]['values'];
		var domain_array_id = this._db.exec("SELECT id, domain_array_id FROM stories ORDER BY domain_array_id")[0]['values'];
		var language_id = this._db.exec("SELECT id, language_id FROM stories ORDER BY language_id")[0]['values'];
		var content_array_id = this._db.exec("SELECT id, content_array_id FROM stories ORDER BY content_array_id")[0]['values'];
		var type_array_id = this._db.exec("SELECT id, type_array_id FROM stories ORDER BY type_array_id")[0]['values'];
		var category_array_id = this._db.exec("SELECT id, category_array_id FROM stories ORDER BY category_array_id")[0]['values'];
		var location_array_id = this._db.exec("SELECT id, location_array_id FROM stories ORDER BY location_array_id")[0]['values'];
		var rating = this._db.exec("SELECT id, rating FROM stories ORDER BY rating")[0]['values'];
		var raters = this._db.exec("SELECT id, raters FROM stories ORDER BY raters")[0]['values'];
		var viewcount = this._db.exec("SELECT id, viewcount FROM stories ORDER BY viewcount")[0]['values'];
		var format_array_id = this._db.exec("SELECT id, format_array_id FROM stories ORDER BY format_array_id")[0]['values'];
		var posixdate = this._db.exec("SELECT id, posixdate FROM stories ORDER BY posixdate")[0]['values'];
		var author_id = this._db.exec("SELECT id, author_id FROM stories ORDER BY author_id")[0]['values'];
		var email_array_id = this._db.exec("SELECT id, email_array_id FROM stories ORDER BY email_array_id")[0]['values'];
		var tags_array_id = this._db.exec("SELECT id, tags_array_id FROM stories ORDER BY tags_array_id")[0]['values'];
		var origin_id = this._db.exec("SELECT id, origin_id FROM stories ORDER BY origin_id")[0]['values'];
		var site_id = this._db.exec("SELECT id, site_id FROM stories ORDER BY site_id")[0]['values'];
		var description_id = this._db.exec("SELECT id, description_id FROM stories ORDER BY description_id")[0]['values'];
		var title_id = this._db.exec("SELECT id, title_id FROM stories ORDER BY title_id")[0]['values'];

		var domainIds = this._LoadIds("domain_ids");
		var languageIds = this._LoadIds("language_ids");
		var contentIds = this._LoadIds("content_ids");
		var typeIds = this._LoadIds("type_ids");
		var categoryIds = this._LoadIds("category_ids");
		var locationIds = this._LoadIds("location_ids");
		var formatIds = this._LoadIds("format_ids");
		var authorIds = this._LoadIds("author_ids");
		var emailIds = this._LoadIds("email_ids");
		var tagIds = this._LoadIds("tag_ids");
		var originIds = this._LoadIds("origin_ids");
		var descriptionIds = this._LoadIds("description_ids");
		var siteIds = this._LoadIds("site_ids");
		var titleIds = this._LoadIds("title_ids");

		var sha256Length = sha256.length;
		var idx = undefined;
		for(idx = 0; idx < sha256Length; ++idx) {
			var domainArray = domain_array_id[idx][1] !== null ? intArrays[ domain_array_id[idx][1] ] : -1;
			var contentArray = content_array_id[idx][1] !== null ? intArrays[ content_array_id[idx][1] ] : -1;
			var typeArray = type_array_id[idx][1] !== null ? intArrays[ type_array_id[idx][1] ] : -1;
			var categoryArray = category_array_id[idx][1] !== null ? intArrays[ category_array_id[idx][1] ] : -1;
			var locationArray = location_array_id[idx][1] !== null ? intArrays[ location_array_id[idx][1] ] : -1;
			var formatArray = format_array_id[idx][1] !== null ? intArrays[ format_array_id[idx][1] ] : -1;
			var emailArray = email_array_id[idx][1] !== null ? intArrays[ email_array_id[idx][1] ] : -1;
			var tagArray = tags_array_id[idx][1] !== null ? intArrays[ tags_array_id[idx][1] ] : -1;

			this.sha256Lookup.add(sha256[idx][1], sha256[idx][0]);
			this.commentsLookup.add(comments[idx][1], comments[idx][0]);

			this.ratingLookup.add(rating[idx][1], rating[idx][0]);
			this.ratersLookup.add(raters[idx][1], raters[idx][0]);
			this.viewcountLookup.add(viewcount[idx][1], viewcount[idx][0]);
			this.posixdateLookup.add(posixdate[idx][1], posixdate[idx][0]);

			this.languageLookup.add(languageIds.GetReverse(language_id[idx][1]), language_id[idx][0]);
			this.authorLookup.add(authorIds.GetReverse(author_id[idx][1]), author_id[idx][0]);
			this.originLookup.add(originIds.GetReverse(origin_id[idx][1]), origin_id[idx][0]);
			this.siteLookup.add(siteIds.GetReverse(site_id[idx][1]), site_id[idx][0]);
			this.descriptionLookup.add(descriptionIds.GetReverse(description_id[idx][1]), description_id[idx][0]);
			this.titleLookup.add(titleIds.GetReverse(title_id[idx][1]), title_id[idx][0]);

			this.domainLookup.add(domainIds.GetReverse(domainArray), domain_array_id[idx][0]);
			this.contentLookup.add(contentIds.GetReverse(contentArray), content_array_id[idx][0]);
			this.typeLookup.add(typeIds.GetReverse(typeArray), type_array_id[idx][0]);
			this.categoryLookup.add(categoryIds.GetReverse(categoryArray), category_array_id[idx][0]);
			this.locationLookup.add(locationIds.GetReverse(locationArray), location_array_id[idx][0]);
			this.formatLookup.add(formatIds.GetReverse(formatArray), format_array_id[idx][0]);
			this.emailLookup.add(emailIds.GetReverse(emailArray), email_array_id[idx][0]);
			this.tagLookup.add(tagIds.GetReverse(tagArray), tags_array_id[idx][0]);
		}

		this._LoadBodyIds();
	};
	output._SortLookups = function() {
		this.sha256Lookup.sort();
		this.commentsLookup.sort();
		this.descriptionLookup.sort();

		this.ratingLookup.sort();
		this.ratersLookup.sort();
		this.viewcountLookup.sort();
		this.posixdateLookup.sort();

		this.domainLookup.sort();
		this.languageLookup.sort();
		this.contentLookup.sort();
		this.typeLookup.sort();
		this.categoryLookup.sort();
		this.locationLookup.sort();
		this.formatLookup.sort();
		this.authorLookup.sort();
		this.emailLookup.sort();
		this.tagLookup.sort();
		this.originLookup.sort();
		this.siteLookup.sort();
		this.titleLookup.sort();
	};
	output.init = function(_db) {
		this._db = _db;
		this._NewLookups();
		this._PopulateLookups();
		this._SortLookups();
	};
	output.LookupBody = function(keywords) {
		var outputKeywords = [];
		var outputIds = [];
		var arrayKeywords = !Array.isArray(keywords) ? [keywords] : keywords;
		var arrayKeywordsLength = arrayKeywords.length;
		var idxKeywordsArray = undefined;
		for(idxKeywordsArray = 0; idxKeywordsArray < arrayKeywordsLength; ++idxKeywordsArray) {
			var found = this._db.exec('SELECT id FROM stories_body WHERE body MATCH "' + arrayKeywords[idxKeywordsArray].replace(/"/g, '""') + '" ORDER BY id');
			if(found.length > 0) {
				var bodyIds = found[0]['values'];
				var bodyIdsLength = bodyIds.length;
				var idxBodyIds = undefined;
				for(idxBodyIds = 0; idxBodyIds < bodyIdsLength; ++idxBodyIds) {
					var values = newRecordSetFromArray(this._bodyLookupReverse[ "v" + bodyIds[idxBodyIds] ]);
					outputKeywords.push(arrayKeywords[idxKeywordsArray]);
					outputIds.push( [].concat.apply([], values) );
				}
			}
		}
		return newIdRecord(outputKeywords, outputIds);
	};
	output.GetBody = function(id) {
		output = "ERROR: Failed to retrieve body from id: " + id;
		if( !isNaN( parseInt(id, 10) ) ) {
			output = this._db.exec("SELECT body FROM stories_body WHERE id=" + this._bodyLookup[id])[0]['values'][0];
		}
		return output;
	};
	output.init(_db);
	return output;
}
