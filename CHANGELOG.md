# Changelog

## 2021-11-01.2

* Dependency licenses should be text files, not MarkDown.

## 2021-11-01.1

* Update and reword README.md to be more concise. Fix a few typos.

* We no longer use a weird kludge to load sql.js, though the code should be functionally identical.

* sql.js is upgraded from version 1.2.2 to version 1.6.2

* Fix range-specification behavior fields 13-15.

## 2020-08-01.1

* Synchronize height of search fields and search results in widescreen (>1920 pixels in width) mode. The size of both can be changed at once, though the search results can still be scrolled.

* Fix huge gap between the search fields and search results in widescreen (>1920 pixels in width) mode.

## 2020-07-30.1

* Fix typo that prevents the sorting category button ('K') for the Story Checksum search field (5) from working.

## 2020-07-28.1

* Reword README.

* New screenshot to reflect interface changes.

* Fix '-' and '--' behavior for fields 13-15.

* Add order reversing option for sorting of fields 5, 8, 12-15, and 22.

* Fix sorting for fields 5, 8, 12-15, and 22.

## 2020-07-20.1

* Unecessary redraws of the search results are avoided, which means one's scroll position won't be changed, unless a new page is shown.

* Upgrade chrono version from 1.4.6 to 1.4.8

* Fix bug that prevented the Body Keywords field (25) from displaying more than one result.

* Some refactoring and code tidying.

## 2020-05-15.1

* Fix bug where inconsistent search field behavior. The precise causes and effects of it are unclear, but it at least prevented all the autocomplete options from being listed, when they should have been.

## 2020-05-14.1

* Wildcard globs will now be treated as one selection when using necessary (`+`) or soft-necessary (`?`) options. The code responsible for this was extremely slow for large selections (each keystroke easily taking 10+ seconds, for instance), and the same selections could be made with other, admittedly less intutive sequences.

* Code tidy-up.

## 2020-05-07.1

* Remove the search results order button (item 32 as of version 2020-05-06.1). Search results order is now set by the sorting buttons for the query fields the results are sorted by (selected by the `K` button).

* Fix a typo in the code which may have resulted in a bug. Perhaps it is functionally identical, and perhaps it isn't, but it was a typo nonetheless.

* Code tidy-up.

## 2020-05-06.1

* Fix a bug that prevents `-` from being removed from autocomplete lists.

* Attempt to optimize code to better handle soft-necessary (`?`) and necessary (`+`) wildcard queries. It is still too slow for many cases, however.

* Perform better input sanitizationa of the data-value attribute, and in JavaScript object element names. Should be functionally identical under most circumstances.

* In an attempt to minimize (slow) table reflow, the result counts beneath each field are always filled with empty space, if not in use.

* Fix bug that sometimes allows rangeSearcher to work without both ends being specified.

* Tidy up code.

## 2020-05-02.1

* Fix intermittent bug that prevents the count of negated (`-`) options from being removed, under certain circumstances.

* Fix bug that fails to properly handle first character of an soft-necessary (`?`) and necessary (`+`) options in fields 6, 7, 9-11, 16-21, 23, and 24. Its effects are likely rare, but it is a flaw in the old code, nonetheless.

* Create a soft-necessary option (`?`) which ensures that other results will have its value, but not generate any results of its own. Thus, the `+` option will have the result of entering the option normally, then again, preceded by `?`.

* Change the default text of fields 13-15 to reflect the requirement of both values in a range.

* Include base number of options retrieved by each field, before the actual value is calculated.

* An attempt was made to fix an intermittent bug where the autocomplete list will not open automatically. It seems this bug applies to negated (`-`) options, but perhaps now normal ones. Necessary (`+`) options were not tested for when this bug occurred.

* The height and overflow properties of autocomplete lists can now be freely adjusted in CSS.

* 'Archiver Comments' is reworded to 'Archivist Comments' in story info.

* Extra licensing information for chrono dependencies is included in the package.

* Autocomplete should now work consistently with negated (`-`) and necessary (`+`) options.

* Tidy up some code.

## 2020-04-28.1

* Range searches (fields 13-15) will only work if both ends of the range is included.

* Wildcard globs will now be treated as one selection when using necessary (`+`) options.

* Text keyword searches (fields 12 and 22) will no longer match empty completely strings to mean any message with any keywords.

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
