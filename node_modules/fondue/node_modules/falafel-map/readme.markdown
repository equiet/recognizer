# falafel-map

Transform the [ast](http://en.wikipedia.org/wiki/Abstract_syntax_tree) on a
recursive walk.

This module is like [falafel](https://github.com/substack/node-falafel),
except that it uses [source-map](https://github.com/mozilla/source-map) for
appending source maps to processed scripts.

![falafel döner](http://substack.net/images/falafel.png)

# example

## array.js

Put a function wrapper around all array literals.

``` js
var falafelMap = require('falafel-map');

var src = '(' + function () {
    var xs = [ 1, 2, [ 3, 4 ] ];
    var ys = [ 5, 6 ];
    console.dir([ xs, ys ]);
} + ')()';

var output = falafelMap(src, function (node) {
    if (node.type === 'ArrayExpression') {
        node.update('fn(' + node.source() + ')');
    }
});
console.log(output);
```

output:

```
(function () {
    var xs = fn([ 1, 2, fn([ 3, 4 ]) ]);
    var ys = fn([ 5, 6 ]);
    console.dir(fn([ xs, ys ]));
})()
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0LmpzIiwic291cmNlcyI6WyJpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxDQUFDLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFZLENBQUE7QUFBQSxDQUFBLENBQUEsQ0FBQSxDQUNULENBQUEsQ0FBQSxDQUFBLENBQUksQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFLLDBCQUFULENBRFM7QUFBQSxDQUFBLENBQUEsQ0FBQSxDQUVULENBQUEsQ0FBQSxDQUFBLENBQUksQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFLLFlBQVQsQ0FGUztBQUFBLENBQUEsQ0FBQSxDQUFBLENBR1QsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFRLENBQUEsQ0FBQSxDQUFSLENBQVksY0FBWixDQUFBLENBSFM7QUFBQSxDQUFiLENBQUEsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHhzID0gWyAxLCAyLCBbIDMsIDQgXSBdO1xuICAgIHZhciB5cyA9IFsgNSwgNiBdO1xuICAgIGNvbnNvbGUuZGlyKFsgeHMsIHlzIF0pO1xufSkoKSJdfQ==
```

## custom keyword

Creating custom keywords is super simple!

This example creates a new `beep` keyword that uppercases its arguments:

``` js
var falafelMap = require('falafel-map');
var src = 'console.log(beep "boop", "BOOP");';

function isKeyword (id) {
    if (id === 'beep') return true;
}

var output = falafelMap(src, { isKeyword: isKeyword }, function (node) {
    if (node.type === 'UnaryExpression'
    && node.keyword === 'beep') {
        node.update(
            'String(' + node.argument.source() + ').toUpperCase()'
        );
    }
});
console.log(output);
```

Now the source string `console.log(beep "boop", "BOOP");` is converted to:

```
$ node example/keyword.js
console.log(String("boop").toUpperCase(), "BOOP");
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0LmpzIiwic291cmNlcyI6WyJpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQVEsQ0FBQSxDQUFBLENBQVIsQ0FBWSw0QkFBWixDQUFBLENBQXlCLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUF6QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiY29uc29sZS5sb2coYmVlcCBcImJvb3BcIiwgXCJCT09QXCIpOyJdfQ==
```

which we can execute:

```
$ node example/keyword.js | node
BOOP BOOP
```

Neat!

# methods

``` js
var falafelMap = require('falafel-map')
```

## falafelMap(src, opts={}, fn)

Transform the string source `src` with the function `fn`, returning a
string-like transformed output object.

For every node in the ast, `fn(node)` fires. The recursive walk is a
pre-traversal, so children get called before their parents.

Performing a pre-traversal makes it easier to write nested transforms since
transforming parents often requires transforming all its children first.

The return value is string-like (it defines `.toString()` and `.inspect()`) so
that you can call `node.update()` asynchronously after the function has
returned and still capture the output.

Instead of passing a `src` you can also use `opts.source`.

All of the `opts` will be passed directly to esprima except for `'range'` and
`'loc'`, which are always turned on because falafel-map needs them.

`'sourceFilename'` and `'generatedFilename'` can be used to control the names
used in the map, and default to `in.js` and `out.js`, respectively.

Some of the options you might want from esprima includes:
`'loc'`, `'raw'`, `'comment'`, `'tokens'`, and `'tolerant'`.

falafel uses a custom patch of esprima with support for an `opts.isKeyword()`
function. When `opts.isKeyword(id)` returns `true`, the string `id` will be
treated as a keyword. You can use this behavior to create custom unary
expression keywords.

An `opts.isKeyword(id)` value that is a string will be mapped to existing types.
The only currently supported string value is `"block"`.

# nodes

Aside from the regular [esprima](http://esprima.org) data, you can also call
some inserted methods on nodes.

Aside from updating the current node, you can also reach into sub-nodes to call
update functions on children from parent nodes.

## node.source()

Return the source for the given node, including any modifications made to
children nodes.

## node.sourceNodes()

Return the array of strings and SourceNodes for the given esprima node.

## node.update()

Replace the source nodes for the given node with the arguments to `update`,
be they strings or SourceNodes.

To maintain source mappings to children, pass the result of `node.sourceNodes()`
as one of the arguments to this function. For example:
`node.update("[", node.sourceNodes(), "]")`.

Note that in `'ForStatement'` node types, there is an existing subnode called
`update`. For those nodes all the properties are copied over onto the
`node.update()` function.

## node.parent

Reference to the parent element or `null` at the root element.

# install

With [npm](http://npmjs.org) do:

```
npm install falafel-map
```

# license

MIT

