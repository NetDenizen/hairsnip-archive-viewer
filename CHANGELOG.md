# Changelog

## 2020-04-28.1

* chrono is upgraded from to version 1.4.6

* sql.js is upgraded from version 1.0.1 to version 1.2.2

* Buttons now have tooltips/alt text.

* Properly display negated (`-`) and necessary (`+`) options retrieved beneath each query field (items 5-25)

* Fix bug which causes the results (item 33) order to be set back to normal whenever the query category they're sorted by is changed, regardless of the status of the order reverse button (item 32).

* Fix bug preventing NULL values for tags (item 24) from being recognized by the query fields. This will allow the full range of stories to be sorted by tag, and for tagless stories to be searched.

* Fix bug that broke the story body keyword searcher (item 25).

* Update the SQLite database format; versions released prior to the date of this release will no longer be supported.

## 2020-01-13.1

* Modify all the query fields (items 5-25) to be more consistent. They now all support negation options, necessary options, comma escapes, and the dash representation for empty strings; even if this doesn't make sense.

* NULL values from the SQLite tables will now be recognized by the query fields, instead of ignored. Among other things, this allows for stories without recorded ratings, raters, views, or date values (items 8 and 13-15) to be searched.

* The date searcher (field 8) will now actually properly recognize ranges, and individual values.

* The results page is scrolled to the top, each time it loads.

* The story info (formatted like relevant search option) is displayed before each story.

* Results can be sorted according to query categories.

* Story results can be reversed.

* The query fields (items 5-25) and the result controls (26-32) layouts are aligned differently. For the former, they're all handled as a single table and the cells are left-aligned, instead of center aligned, while for the latter, the result controls are centered.

* Assorted bugfixes, minor optimizations, and code cleanup.

## 2019-11-23.1

* General code cleanup.

* sql.js is upgraded from version 1.0.0 to version 1.0.1 Steps were also taken to reduce the size of the custom-compiled file.

* Massive overhaul to the way search queries are handled, so that changes take effect incrementally, rather than negation (`-`) options always taking precedence. Beneath each field, the total number of selected stories is displayed, with negations and required (`+`) results already factored in.

* Query field names are now center-aligned.

* Date ranges (field 8) are now handled using the Chrono library from: https://github.com/wanasit/chrono

## 2019-11-18.1

* Move autocomplete list sorting controls to the end of the title of the field.

* Exclude all tags by default, if a match is not found for a keyword.

* Add an autocomplete list sorting control to reverse the order of elements.

* Field 25 now behaves like a normal comma-separated keyword search.

* Add '+' options, which *must* be included, rather than simply can be, like a normal option.

* Add '-' options to fields 5 and 25.

## 2019-11-17.1

* Allow autocomplete list items to be sorted alphabetically *or* by the number of times that entry occurs.

## 2019-08-15.2

* I knew I forgot something (The updated screenshot). *Blush*

## 2019-08-15.1

* Tweak color palette to be easier on the eyes.

* Minor tweaking to page layout, mostly to better render in narrow displays.

* Fix horizontal arrangement of search fields and search results; it will now happen on displays greater than 1920 pixels in width.

* Lint and refactor code.

* Remove certain ECMAScript 6 specific features or replace them with polyfills. Certain ones are still necessary, however.

* Keyword searches are now case insensitive, and have option negation.

## 2019-08-12.1

* Wildcard queries will now include options that contain commas.

* Little extra whitespace by the SQLite file loading indicator.

* SQLite file loading indicator should default to a failure message, which is technically set before an error occurs, but should only be appear because the file actually failed to load, before the page updated.

## 2019-08-08.1

* Render HTML in author description.

* Do not choose undefined values when enter is pressed and no autocomplete list item is selected.

* Make wildcard matching completely case-insensitive.

* Use the selected option when pressing enter in an autocomplete list.

## 2019-08-03.1

* New SQLite format support, breaking compatibility with the old. Make sure to grab a new version of the SQLite file.

* Massive optimization to SQLite database loading; possibly around an order of magnitude faster.

* Allow query fields to be switched between using tab, without leaving menus open.

* Add SQLite file loading indicator.

* Remove 'Error Field' and related components, completely.

* UX tweaks and bugfixes.

## 2019-07-29.1

* Error Messages and Search Result boxes are now actually expandable.

* Optimization to page rendering.

* Arrange Search Fields and Search Results horizontally, if there's room for them both.

* Negative options and wildcard matches; check readme.

* Add minimum and maximum values for ranges, to the title of the respective field.

* Use locale specific time formatting.

* Many bugfixes and UX tweaks.

## 2019-07-19.1

* Include licences.

* Make README.

* 'Story Checksum' field now takes multiple entries.

* Position is saved when selecting option in autocomplete menus.

* Autocomplete menus now actually overlap the page.

* Many bugfixes.

## 2019-07-17.1

* Initial release.
