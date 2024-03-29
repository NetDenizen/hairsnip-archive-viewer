# Hairsnip Archive Viewer (2021-11-01.2)

This webapp is meant to browse and display archives of the body of stories once shared between the domains: hairsnip.com, 1hss.com, and haircuttingstories.com, as recorded in an SQLite 3 format.


## Installation and Dependencies

To use the webapp, you will need a modern web browser with support for HTML5, asm.js, and the set of features included by ECMAScript 6 (Which was released in 2015, as the most recent of these three hard dependencies.).

Compatibility code to replace some of the functionality has been included, which might help with browsers that have not fully implemented them, but it doesn't cover every feature, and viewing the browser console seems the only reliable way related errors are reported.

Otherwise, the webapp should be entirely self-contained, and include any necessary code. The only third-party dependencies, which are already included with the webapp, are sql.js from https://github.com/sql-js/sql.js custom-compiled to support FTS5, and Chrono from https://github.com/wanasit/chrono Please refer to the documentation of those projects for building instructions.

Then, download the source code of the latest release at https://github.com/NetDenizen/hairsnip-archive-viewer/releases If you don't know which file to get, download the zip file. Unzip it, then open `hairsnip-viewer.html` in the newly-created folder. Check [Interface Guide](#interface-guide) for use instructions.

## Interface Guide

An example interface of the webapp is as follows; features are annotated with blue numbers. Note that the story body is not included in the display. The given screenshot reflects the last change of the UI layout. This screenshot may not be updated with every version.

All buttons should also have tooltips if hovered over.

![screenshot](https://i.imgur.com/cY7E9Wu.png)

### Query Fields

All search fields (items 5-25) take a number of comma-separated keywords. Commas themselves may be represented by `\,`. Each successive keyword modifies the result of the last, as does each field.

`-` alone represents a search for an empty (blank) string (or the absence of any value), which differs from not filtering any options, by leaving the actual field blank. Options may be preceded by `-` to negate them, including the blank string, which would be negated with `--`.

Keywords may be preceded by `?` to only match results if they contain them, regardless of whether they match and of the other keywords, or not.

`+` will perform the same functionality as `?`, as well as entering the keyword normally.

`-`, `?`, and `+` themselves may be represented by `\-`, `\?`, and `\+`, respectively.

The `K` button preceding applicable fields will cause the search results (field 33) to be sorted by the category associated with whichever one is selected.

The order of results may be toggled between alphabetical and number of occurrences, by the respective `ABC` and `123` settings of the relevant field (if it exists). The order may also be reversed and set normal again by the `^` and `v` settings of the field.

In fields 6, 7, 9-11, 16-21, 23, and 24, wildcard matches may be made with the `*` character, which represent 0 or more arbitrary characters in an option.

These fields also support tab completion, where the tab key can be pressed to complete the partially entered keyword, to the closest mutually matching parts among the options. The results from the dropdown menus may be switched between using the arrow keys, and will wrap around to the respective opposite position, if the first and last options are passed. Options from the list may be selected by clicking them, or pressing enter with the desired one selected.

In fields 8, and 13-15 an option is a single value, or a range. A range is two values separated by a `-`, their order being irrelevant. If either of these values is left out, the entry is ignored. The respective minimum and maximum values are included in the titles of these fields.

Underneath every field, the number of selected options is displayed. The first number in parentheses without a preceding `-` or a `?`, represents the actual number of selected options for that field only (as opposed to the number available by the time that field and all preceding fields have been processed). If there is a number preceded by a `-` in parentheses, it represents the number of options negated by `-`. Likewise for `?` which is also used to represent options selected by `+`. This number is calculated last.

### Items

1. Field to select the SQLite database to open. It also includes a status indicator, which will display the time taken to load the selected SQLite file. Note that when one is selected, the interface will completely freeze until it is loaded, which should take a few seconds. Only fields 1-4 are visible before that point.

2. Toggle display of first pane (The query fields.). (Displayed by default; encompasses items 5-25.)

3. Toggle display of second pane (The search results.). (Displayed by default; encompasses items 26-33.)

4. Toggle display of third pane, where the actual selected story content is shown. (Displayed by default, but not in view of screenshot.)

5. Select stories by their checksums (in parentheses after the title and author name).

6. Select stories by their titles.

7. Select stories by the names of their authors.

8. Use the Chrono library from https://github.com/wanasit/chrono to parse each date in a variety of formats. Ranges may be specified, in addition to individual dates, but note that even if the specific time is not specifed, the date will default to exactly noon of that day, and other times within that day will not be counted. For this reason, ranges are recommended for most situations.

9. Select stories by the language they were written in.

10. Select stories by the original domain they were hosted on.

11. Select stories by an source page format categorization system devised by the author.

  * 0.\* formatted stories were hand-processed by the author. They frequently represent very early outliers, which do not fall into the other categories.

  * 1.\* and 2.\* formatted stories only ever existed in haircuttingstories.com (Item 11) circa 2003, and 2004-2008, respectively. They were frequently represented by \*.htm files.

  * 3.\* formatted stories existed circa 2008, and were frequently represented by `story.aspx?id=\*` in the URL.

  * 4.\* is the newest format, and represents stories up to the end of the sites in 2016. They were frequently represented by \*.aspx files, with distinct, individual names.

12. Select stories by case-insensitive keywords contained in the author-added archive comments. Will likely only be for format 0.\* stories.

13. Select stories by the number of views. Only applies to format 3\*-4.\* stories.

14. Select stories by their rating between 0.0 and 5.0. Only applies to format 3\*-4.\* stories.

15. Select stories by their number of raters. Only applies to format 3\*-4.\* stories.

16. Select stories by their level of adult content. Only applies to format 3\*-4.\* stories.

17. Select stories by their `type`. Only applies to format 2\*-4.\* stories.

18. Select stories by their `categories`.

19. Select stories by their `location` or setting. Only applies to format 2\*-4.\* stories.

20. Select stories by the website listed in their author's profile. Only existed in limited use for format 2.\* stories.

21. Select stories by email addresses associated with an author, whether on their profile, or in the story info itself. Certain email addresses included in the body of the story, may not be retrieved.

22. Select stories by case-insensitive keywords in the description in the author's profile. Only existed in limited use for format 2.\*-3.\* stories. Note that this search will be performed against the raw HTML code of those descriptions, which might produce uncommon cases where the rendered results do not match the query.

23. Select stories by their listed origin site. Only `Haircut Story Archive` should be available, and only for format 4.\*.

24. Select stories by their related tags. Note that tags were separated by comma, but commas were not consistently used in the original website, which might produce some odd options. Only applies to format 4.\* stories.

25. Select stories by case-insensitive keywords or phrases in the body of the story itself. Note that this search will be performed against the raw HTML code of those descriptions, which might produce uncommon cases where the rendered results do not match the query.

26. Set the number of results available in each page. Must be a natural number greater than 0. Invalid entries will be replaced by 1.

27. Go to the previous page. Will wrap around to the last page if the first one is reached.

28. Jump to a result page number. Must be a natural number greater than 0, and less than the maximum listed in item 30.

  *  In the case that the maximum is exceeded by the number of pages changing, it is unchanged, letting the user decide how to continue from that point.

  * In the case that the maximum is exceeded by user entry, it is replaced by that value.

  * In the case that the value is less than or equal to zero, it is replaced by 1.

29. The maximum number of results pages.

30. The number of selected stories.

31. Go to the next page. Will wrap around to the first, if the last is reached.

32. The search results list.
