// TODO: Variable renaming.
// TODO: Strict typing
// TODO: Try to shrink functions
// TODO: constructors capitalize 'new'
// TODO: We build some SQLite requests in toxic ways, but shit if we have a documented API.
// TODO: Add info messages
"use strict";

function newStorySearcher(logger, _db) {
	var output = {};
	output._db = undefined;
	output._panic = false;
	output._errors = undefined;

	output.sha256Lookup = undefined;
	output.commentsLookup = undefined;
	output.descriptionLookup = undefined;

	output.ratingLookup = undefined;
	output.ratersLookup = undefined;
	output.rating1Lookup = undefined;
	output.rating2Lookup = undefined;
	output.rating3Lookup = undefined;
	output.rating4Lookup = undefined;
	output.rating5Lookup = undefined;
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

	//TODO: Refactor
	output._LoadIds = function(table) {
		var output = newIdLookup();
		if(!this._panic) {
			var values = this._db.exec("SELECT id, name FROM " + table)[0]['values'];
			var valuesLength = values.length;
			var idx = undefined;
			for (idx = 0; idx < valuesLength; ++idx) {
				if ( !output.get(values[idx][0]).empty() ) {
					this._errors.LogWarning("Value " + values[idx][0].toString() + " should not be repeated in '" + table + "'.");
				}
				output.add(values[idx][0], values[idx][1]);
			}
			this._errors.LogInfo("Loaded table: '" + table + "'");
		}
		return output;
	};
	output._LoadIntArray = function(intArrays, arrayId) {
		var output = [];
		if(!this._panic && arrayId !== null) {
			var values = [];
			var idx = undefined;
			var intArraysLength = intArrays.length;
			for(idx = 0; idx < intArraysLength; ++idx) {
				if(intArrays[idx][1] === arrayId){
					values.push([ intArrays[idx][2], intArrays[idx][3] ]);
				}
			}
			var valuesLength = values.length;
			output = Array.apply( undefined, Array(valuesLength) ).map(function () {});
			for (idx = 0; idx < valuesLength; ++idx) {
				if (output[ values[idx][0] ] !== undefined) {
					this._errors.LogWarning("Value at index " + values[idx][0].toString() + " should not be repeated for " + arrayId.toString() + ".");
				}
				output[ values[idx][0] ] = values[idx][1];
			}
			if ( output.includes(undefined) ) {
				this._errors.LogWarning("All of " + valuesLength.toString() + " indexes not filled.");
			}
		}
		return output;
	};
	output._resetPanic = function() {
		this._panic = false;
	};
	output._newLookups = function() {
		this.sha256Lookup = newIdLookup();
		this.commentsLookup = newIdLookup();
		this.descriptionLookup = newIdLookup();

		this.ratingLookup = newIdLookup();
		this.ratersLookup = newIdLookup();
		this.rating1Lookup = newIdLookup();
		this.rating2Lookup = newIdLookup();
		this.rating3Lookup = newIdLookup();
		this.rating4Lookup = newIdLookup();
		this.rating5Lookup = newIdLookup();
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
	output._populateContainers = function() {
		var intArrays = this._db.exec("SELECT id, array_id, idx, val FROM int_arrays")[0]['values'];

		var sha256 = this._db.exec("SELECT id, sha256 FROM stories ORDER BY sha256")[0]['values'];
		var comments = this._db.exec("SELECT id, comments FROM stories ORDER BY comments")[0]['values'];
		var domain_id = this._db.exec("SELECT id, domain_id FROM stories ORDER BY domain_id")[0]['values'];
		var language_id = this._db.exec("SELECT id, language_id FROM stories ORDER BY language_id")[0]['values'];
		var content_id = this._db.exec("SELECT id, content_id FROM stories ORDER BY content_id")[0]['values'];
		var type_id = this._db.exec("SELECT id, type_id FROM stories ORDER BY type_id")[0]['values'];
		var category_id = this._db.exec("SELECT id, category_id FROM stories ORDER BY category_id")[0]['values'];
		var location_id = this._db.exec("SELECT id, location_id FROM stories ORDER BY location_id")[0]['values'];
		var rating = this._db.exec("SELECT id, rating FROM stories ORDER BY rating")[0]['values'];
		var rating1 = this._db.exec("SELECT id, rating1 FROM stories ORDER BY rating1")[0]['values'];
		var rating2 = this._db.exec("SELECT id, rating2 FROM stories ORDER BY rating2")[0]['values'];
		var rating3 = this._db.exec("SELECT id, rating3 FROM stories ORDER BY rating3")[0]['values'];
		var rating4 = this._db.exec("SELECT id, rating4 FROM stories ORDER BY rating4")[0]['values'];
		var rating5 = this._db.exec("SELECT id, rating5 FROM stories ORDER BY rating5")[0]['values'];
		var raters = this._db.exec("SELECT id, raters FROM stories ORDER BY raters")[0]['values'];
		var viewcount = this._db.exec("SELECT id, viewcount FROM stories ORDER BY viewcount")[0]['values'];
		var format_id = this._db.exec("SELECT id, format_id FROM stories ORDER BY format_id")[0]['values'];
		var posixdate = this._db.exec("SELECT id, posixdate FROM stories ORDER BY posixdate")[0]['values'];
		var author_id = this._db.exec("SELECT id, author_id FROM stories ORDER BY author_id")[0]['values'];
		var email_array_id = this._db.exec("SELECT id, email_array_id FROM stories ORDER BY email_array_id")[0]['values'];
		var tags_array_id = this._db.exec("SELECT id, tags_array_id FROM stories ORDER BY tags_array_id")[0]['values'];
		var origin_id = this._db.exec("SELECT id, origin_id FROM stories ORDER BY origin_id")[0]['values'];
		var site_id = this._db.exec("SELECT id, site_id FROM stories ORDER BY site_id")[0]['values'];
		var description = this._db.exec("SELECT id, description FROM stories ORDER BY description")[0]['values'];
		var title_id = this._db.exec("SELECT id, title_id FROM stories ORDER BY title_id")[0]['values'];
		this._errors.LogInfo("Loaded story info ids.");

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
		var siteIds = this._LoadIds("site_ids");
		var titleIds = this._LoadIds("title_ids");

		var sha256Length = sha256.length;
		var idx = undefined;
		for(idx = 0; idx < sha256Length; ++idx) {
			var emailArray = this._LoadIntArray(intArrays, email_array_id[idx][1]);
			var tagArray = this._LoadIntArray(intArrays, tags_array_id[idx][1]);

			this.sha256Lookup.add(sha256[idx][1], sha256[idx][0]);
			this.commentsLookup.add(comments[idx][1], comments[idx][0]);
			this.descriptionLookup.add(description[idx][1], description[idx][0]);

			this.ratingLookup.add(rating[idx][1], rating[idx][0]);
			this.ratersLookup.add(raters[idx][1], raters[idx][0]);
			this.rating1Lookup.add(rating1[idx][1], rating1[idx][0]);
			this.rating2Lookup.add(rating2[idx][1], rating2[idx][0]);
			this.rating3Lookup.add(rating3[idx][1], rating3[idx][0]);
			this.rating4Lookup.add(rating4[idx][1], rating4[idx][0]);
			this.rating5Lookup.add(rating5[idx][1], rating5[idx][0]);
			this.viewcountLookup.add(viewcount[idx][1], viewcount[idx][0]);
			this.posixdateLookup.add(posixdate[idx][1], posixdate[idx][0]);

			this.domainLookup.add(domainIds.get(domain_id[idx][1]).AllValues(), domain_id[idx][0]);
			this.languageLookup.add(languageIds.get(language_id[idx][1]).AllValues(), language_id[idx][0]);
			this.contentLookup.add(contentIds.get(content_id[idx][1]).AllValues(), content_id[idx][0]);
			this.typeLookup.add(typeIds.get(type_id[idx][1]).AllValues(), type_id[idx][0]);
			this.categoryLookup.add(categoryIds.get(category_id[idx][1]).AllValues(), category_id[idx][0]);
			this.locationLookup.add(locationIds.get(location_id[idx][1]).AllValues(), location_id[idx][0]);
			this.formatLookup.add(formatIds.get(format_id[idx][1]).AllValues(), format_id[idx][0]);
			this.authorLookup.add(authorIds.get(author_id[idx][1]).AllValues(), author_id[idx][0]);
			this.originLookup.add(originIds.get(origin_id[idx][1]).AllValues(), origin_id[idx][0]);
			this.siteLookup.add(siteIds.get(site_id[idx][1]).AllValues(), site_id[idx][0]);
			this.titleLookup.add(titleIds.get(title_id[idx][1]).AllValues(), title_id[idx][0]);

			this.emailLookup.add(emailIds.get(emailArray).AllValues(), email_array_id[idx][0]);
			this.tagLookup.add(tagIds.get(tagArray).AllValues(), tags_array_id[idx][0]);
		}
	};
	output.init = function(logger, _db) {
		this._errors = logger;
		this._db = _db;
		this._errors.LogInfo("Initializing story searcher.");
		this._resetPanic();
		this._newLookups();
		this._populateContainers();
		this._errors.LogInfo("Story searcher initialized.");
	};
	output.LookupBody = function(keywords) {
		var outputKeywords = [];
		var outputIds = [];
		var arrayKeywords = !Array.isArray(keywords) ? [keywords] : keywords;
		var arrayKeywordsLength = arrayKeywords.length;
		var idxKeywordsArray = undefined;
		for(idxKeywordsArray = 0; idxKeywordsArray < arrayKeywordsLength; ++idxKeywordsArray) {
			var bodyIds = this._db.exec('SELECT id FROM stories_body WHERE body MATCH "' + arrayKeywords[idxKeywordsArray].replace('"', '""') + '" ORDER BY id')[0]['values'];
			var bodyIdsLength = bodyIds.length;
			var idxBodyIds = undefined;
			for(idxBodyIds = 0; idxBodyIds < bodyIdsLength; ++idxBodyIds) {
				var values = this._db.exec("SELECT id FROM stories WHERE body_id=" + bodyIds[idxBodyIds].toString() + " ORDER BY id")[0]['values'];
				outputKeywords.push(arrayKeywords[idxKeywordsArray]);
				outputIds = outputIds.concat( [].concat.apply([], values) );
			}
		}
		return newIdRecord(outputKeywords, outputIds);
	};
	output.GetBody = function(id) {
		//TODO: Rewrite?
		//TODO: Should we make sure input is sanitary, here?
		var bodyId = this._db.exec("SELECT body_id FROM stories WHERE id=" + id.toString() + " ORDER BY body_id", [id])[0]['values'][0];
		return this._db.exec("SELECT body FROM stories_body WHERE id=" + bodyId + " ORDER BY id", [bodyId])[0]['values'][0];
	};
	output.init(logger, _db);
	return output;
}
