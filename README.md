Recognizer
==========

Experimental implementation of semantic highlighting for JavaScript development.

Every color is based on real data flowing through the app, not just an abstract syntax. So if the last value of a variable was a number, it would be blue. If it was undefined, it would be red. This makes it easy to spot bugs.

![Colors](https://raw.github.com/equiet/recognizer/master/colors.png)

## How to install

### From Brackets (recommended)

Go to Extension Manager in Brackets and look for `recognizer`.

### From source

Clone this repository into Brackets' `extensions/user/recognizer/` folder.

## How to use

1. Open a folder in Brackets (a project) with JavaScript files you want to debug.
1. Double-click on the JavaScript files you want to instrument (so that they are in `Working Files`).
1. Open Live Preview. You should now be able to inspect variables in JavaScript files.

Please note that Recognizer will create a new `.recognizer` folder in the project root. This is where all instrumented files are stored.

If you encounter any problems, more information might be available in the console (Debug -> Show Developer Tools).

## Screenshot

[![Screenshot](https://raw.github.com/equiet/recognizer/master/screenshot.png)](https://www.youtube.com/watch?v=1bjdekHj5ts)

## Some ideas which are not yet fully implemented

![Ideas](https://raw.github.com/equiet/recognizer/master/ideas.png)

- live editing
- inline tests
- code flow visualization
- code documentation
- flash changed value
- execution timeline