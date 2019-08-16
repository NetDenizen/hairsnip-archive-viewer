# Hairsnip Archive Viewer (2019-08-12.1)

This webapp is meant to browse and display archives of the body of stories once shared between the domains: hairsnip.com, 1hss.com, and haircuttingstories.com, in the SQLite 3 format.


## Installation and Dependencies

To use the webapp, you will need a modern web browser with support for HTML5, asm.js, and the set of features included by ECMAScript 6 (Which was released in 2015, as the most recent of these three hard dependencies.).

Compatibility code to replace some of the functionality has been included, which might help with browsers that have not fully implemented them, but it doesn't cover every feature, and viewing the browser console seems the only reliable way related errors are reported.

Otherwise, the webapp should be entirely self-contained, and include any necessary code. The only third-party dependency, which is already included with the webapp, is https://github.com/kripken/sql.js/ custom-compiled to support FTS5. Please refer to the documentation of that project for building instructions.

Then, you may follow these steps.

1. Make sure you are on the master branch of the repository at: `Branch: master` should be present on the left-hand side of the screen.

2. Click `Clone or download` on the right-hand side of the screen, and `Download ZIP` from the popup box. Save the ZIP archive where you please, and extract it.

3. Enter the extracted `hairsnip-archive-viewer-master` directory, and open hairsnip-viewer.html in the compatible browser.

4. For instructions on using the software, check [Interface Guide](#interface-guide)

## Interface Guide

An example interface of the webapp is as follows; features are annotated with blue numbers.

![screenshot](https://i.imgur.com/1tpfpae.png)

Fields 6, 7, 9-12, and 16-25 may have multiple options, each separated by a comma. Commas themselves may be represented by `\,`.

In fields 6, 7, 9-12, and 16-24 `-` represents a search for an empty (blank) string, which differs from not filtering any options, by leaving the actual field blank. Options may be preceeded by `-` to negate them, including the blank string, which would be negated with `--`.

In fields 6, 7, 9-11, 16-21, 23, and 24, wildcard matches may be made with the `*` character, which represent 0 or more arbitrary characters in an option.

These fields also support tab completion, where the tab key can be pressed to complete the partially entered keyword, to the closest mutually matching parts among the options. The results from the dropdown menus may be switched between using the arrow keys, and will wrap around to the respective opposite position, if the first and last options are passed. Options from the list may be selected by clicking them, or pressing enter with the desired one selected.

Fields 13-15 may also have multiple options, each separated by a comma. Here, an option is a single number, or a range. A range is two numbers separated by a `-`, their order being irrelevant. If either of these numbers is left out, the maximum or minimum is available is assumed.

Fields 8, and 13-15 include their respective minimum and maximum values in their titles.

Underneath every field, the number of selected options is displayed, and if there are negating options, the number of those will be shown in parentheses.

1. Field to select the SQLite database to open. It also includes a status indicator, which will display the time taken to load the selected SQLite file. Note that when one is selected, the interface will completely freeze until it is loaded, which should take a few seconds. Only fields 1-4 are visible before that point.

2. Toggle display of first pane (The query fields.). (Displayed by default; encompasses items 5-25.)

3. Toggle display of second pane (The search results.). (Displayed by default; encompasses items 26-32.)

4. Toggle display of third pane, where the actual selected story content is shown. (Displayed by default, but not in view of screenshot.)

5. Select stories by their checksums (in parentheses after the title and author name).

6. Select stories by their titles.

7. Select stories by the names of their authors.

8. Select stories by dates between the specified range, order irrelevant.

9. Select stories by the language they were written in.

10. Select stories by the original domain they were hosted on.

11. Select stories by an source page format categorization system devised by the author.

  * 0.\* formatted stories were hand-processed by the author. They frequently represent very early outliers, which do not fall into the other categories.

  * 1.\* and 2.\* formatted stories only ever existed in haircuttingstories.com (Item 11) circa 2003, and 2004-2008, respectively. They were frequently represented by \*.htm files.

  * 3.\* formatted stories existed circa 2008, and were frequently represented by `story.aspx?id=\*` in the URL.

  * 4.\* is the newest format, and represents stories up to the end of the sites in 2016. They were frequently represented by \*.aspx files, with distinct, individual names.

12. Select stories by keywords contained in the author-added archive comments. Will likely only be for format 0.\* stories.

13. Select stories by the number of views. Only applies to format 3\*-4.\* stories.

14. Select stories by their rating between 0.0 and 5.0. Only applies to format 3\*-4.\* stories.

15. Select stories by their number of raters. Only applies to format 3\*-4.\* stories.

16. Select stories by their level of adult content. Only applies to format 3\*-4.\* stories.

17. Select stories by their 'type'. Only applies to format 2\*-4.\* stories.

18. Select stories by their 'categories'.

19. Select stories by their 'location' or setting. Only applies to format 2\*-4.\* stories.

20. Select stories by the website listed in their author's profile. Only existed in limited use for format 2.\* stories.

21. Select stories by email addresses associated with an author, whether on their profile, or in the story info itself. Certain email addresses included in the body of the story, may not be retrieved.

22. Select stories by keywords in the description in the author's profile. Only existed in limited use for format 2.\*-3.\* stories.

23. Select stories by their listed origin site. Only 'Haircut Story Archive' should be available, and only for format 4.\*.

24. Select stories by their related tags. Note that tags were separated by comma, but commas were not consistently used in the original website, which might produce some odd options. Only applies to format 4.\* stories.

25. Select stories by keywords in the body, or actual contents of the story itself.

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
