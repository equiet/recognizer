recognizer
==========

A concept for advanced developer tools for dynamic languages.
Ideas will be demostrated on JavaScript, using Brackets editor.

## How to use

Recognizer is finished and some steps are not fully automated yet. To try it out, here's what you should do:

1. Open the JavaScript files you want to debug (these need to be in `Working Files` in the left sidebar).
1. In your HTML file, you need to use instrumented files (these will be created automatically when you open Live Preview). Change `<script src="file.js">` to `<script src="file.recognizer.js">`.
1. Open Live Preview. You should now be able to inspect variables in JavaScript files.

If you encounter any problems, more information might be available in the console (Debug -> Show Developer Tools).

## Sketches

Real-time semantic highlighting
![Semantic highlighting](https://raw.github.com/equiet/recognizer/master/sketch_semantic_highlighting.png)

Function and variable inspection
![Design](https://raw.github.com/equiet/recognizer/master/recognizer.png)
<!-- ![Design](https://raw.github.com/equiet/recognizer/master/recognizer_concept.png) -->

## Scope
- automatic debugging, code inspection
- live editing
- inline tests
- code flow visualization
- using tests to define safe patterns of function usage
- code documentation
- semantic highlighting

## TODO
- better object inspection
- semantic highlighting
- code execution animation
- execution timeline
