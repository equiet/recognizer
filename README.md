recognizer
==========

A concept for advanced developer tools for dynamic languages.
Ideas will be demostrated on JavaScript, using Brackets editor.

## Does it work already?

Yes (kind of).

1. Open some `.html` file with associated `.js` file in Brackets.
2. `.recognizer.js` file will be created. Use this file as `<script>` source.
3. Open Live Preview.
4. You should now see which functions were called and the values of some variables.

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
- shorten probes (display full on mouseover perhaps?)
- better object inspection
- built-in console
- semantic highlighting
- code execution animation
- execution timeline
- do not hide probed values after agent is disconnected