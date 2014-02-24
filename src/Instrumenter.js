/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

define(function (require, exports, module) {
    'use strict';

    var TracedDocument = require('src/TracedDocument').TracedDocument;

    var esprima = require('thirdparty/esprima'),
        escodegen = require('thirdparty/escodegen'),
        estraverse = require('thirdparty/estraverse');

    var tracerSnippet = require('text!src/snippets/tracer.js');


    function instrument(filename, code) {

        var ast = esprima.parse(code, {
            loc: true,
            tolerant: false
        });

        var inspectableObjects = [];
        // inspectableObjects = inspectableObjects.concat(_findInspectableObjects(astCopy));
        // inspectableObjects = inspectableObjects.concat(_findFunctionCalls(ast));
        // inspectableObjects = inspectableObjects.filter(function(obj) { // Proble only one-liners for now
            // return obj.loc.start.line === obj.loc.end.line;
        // });
        // console.log(inspectableObjects);

        // TODO: Use estraverse
        var instrumentedAst = $.extend(true, {}, ast);
        instrumentedAst = _instrumentFunctionDeclarations(instrumentedAst);
        instrumentedAst = _instrumentFunctionExpressions(instrumentedAst);

        var probes = [];
        instrumentedAst = _instrumentProbes(instrumentedAst, probes);

        console.log(probes);

        var tracerId = Math.floor(Math.random() * 1000 * 1000 * 1000);

        return new TracedDocument(
            filename,
            tracerId,
            (tracerSnippet + escodegen.generate(instrumentedAst)).replace(/\{\{tracerId\}\}/g, tracerId),
            // inspectableObjects
            probes
        );

    }


    function _instrumentFunctionDeclarations(node) {

        if (Array.isArray(node.body)) {
            node.body.map(_instrumentFunctionDeclarations);
        }

        if (node.body && Array.isArray(node.body.body)) {
            node.body.body.map(_instrumentFunctionDeclarations);
        }

        if (node.type === 'FunctionDeclaration') {
            node.body.body.unshift(_getFunctionEntryAst(
                node.id.loc.start.line,
                node.id.loc.start.column,
                node.id.loc.end.line,
                node.id.loc.end.column
            ));
        }

        return node;
    }



    function _instrumentFunctionExpressions(node) {

        if (Array.isArray(node.body)) {
            node.body.map(_instrumentFunctionExpressions);
        }

        if (node.body && Array.isArray(node.body.body)) {
            node.body.body.map(_instrumentFunctionExpressions);
        }

        if (node.type === 'VariableDeclaration') {
            node.declarations.forEach(function(declaration) {
                _instrumentFunctionExpressions(declaration.init);
            });
        }

        if (node.type === 'VariableDeclarator') {
            _instrumentFunctionExpressions(node.init);
        }

        if (node.type === 'ExpressionStatement') {
            if (node.expression.type === 'CallExpression') {
                node.expression.arguments.forEach(_instrumentFunctionExpressions);
            }
        }

        if (node.type === 'FunctionExpression') {
            node.body.body.unshift(_getFunctionEntryAst(
                node.loc.start.line,
                node.loc.start.column,
                node.loc.start.line,
                node.loc.start.column + 8
            ));
        }

        // // Instrument probes, TODO move to separate function?
        // if (node.type === 'CallExpression') {
        //     console.log('call', node.loc.start.line);
        //     node = _getProbeAst(
        //         node.loc.start.line,
        //         node.loc.start.column,
        //         node.loc.start.line,
        //         node.loc.start.column,
        //         node
        //     );
        // }

        return node;
    }


    function _getFunctionEntryAst(startLine, startColumn, endLine, endColumn) {
        return {
            "__instrumented": true,
            "type": "ExpressionStatement",
            "expression": {
                "__instrumented": true,
                "type": "CallExpression",
                "callee": {
                    "__instrumented": true,
                    "type": "MemberExpression",
                    "computed": false,
                    "object": {
                        "type": "Identifier",
                        "name": "__recognizer{{tracerId}}"
                    },
                    "property": {
                        "type": "Identifier",
                        "name": "logEntry"
                    }
                },
                "arguments": [
                    {
                        "__instrumented": true,
                        "type": "ArrayExpression",
                        "elements": [
                            {
                                "type": "Literal",
                                "value": startLine,
                                "raw": "" + startLine
                            },
                            {
                                "type": "Literal",
                                "value": startColumn,
                                "raw": "" + startColumn
                            },
                            {
                                "type": "Literal",
                                "value": endLine,
                                "raw": "" + endLine
                            },
                            {
                                "type": "Literal",
                                "value": endColumn,
                                "raw": "" + endColumn
                            }
                        ]
                    },
                    {
                        "type": "Identifier",
                        "name": "arguments"
                    }
                ]
            }
        };
    }

    function _getProbeAst(startLine, startColumn, endLine, endColumn, node) {
        return {
            "__instrumented": true,
            "type": "CallExpression",
            "callee": {
                "__instrumented": true,
                "type": "MemberExpression",
                "computed": false,
                "object": {
                    "type": "Identifier",
                    "name": "__recognizer{{tracerId}}"
                },
                "property": {
                    "type": "Identifier",
                    "name": "logProbe"
                }
            },
            "arguments": [
                {
                    "__instrumented": true,
                    "type": "ArrayExpression",
                    "elements": [
                        {
                            "type": "Literal",
                            "value": startLine,
                            "raw": "" + startLine
                        },
                        {
                            "type": "Literal",
                            "value": startColumn,
                            "raw": "" + startColumn
                        },
                        {
                            "type": "Literal",
                            "value": endLine,
                            "raw": "" + endLine
                        },
                        {
                            "type": "Literal",
                            "value": endColumn,
                            "raw": "" + endColumn
                        }
                    ]
                },
                node
            ]
        };
    }



    function _instrumentProbes(node, probes) {

        var nodeCopy = $.extend(true, {}, node);

        if (node.__instrumented) {
            return node;
        }

        if (Array.isArray(node.body)) {
            node.body = node.body.map(function (item) {
                return _instrumentProbes(item, probes);
            });
            return node;
        }

        if (node.body && Array.isArray(node.body.body)) {
            node.body.body = node.body.body.map(function (item) {
                return _instrumentProbes(item, probes);
            });
            return node;
        }

        if (node.type === 'VariableDeclaration') {
            node.declarations = node.declarations.map(function(declaration) {
                return _instrumentProbes(declaration, probes);
            });
            return node;
        }

        if (node.type === 'VariableDeclarator') {
            node.init = _instrumentProbes(node.init, probes);
            return node;
        }

        if (node.type === 'ExpressionStatement') {
            node.expression = _instrumentProbes(node.expression, probes);
            return node;
        }

        if (node.type === 'MemberExpression') {

            probes.push({
                code: escodegen.generate(node, {format: {compact: true}}),
                loc: node.loc
            });

            nodeCopy.object = _instrumentProbes(nodeCopy.object, probes);

            node = _getProbeAst(
                node.loc.start.line,
                node.loc.start.column,
                node.loc.end.line,
                node.loc.end.column,
                nodeCopy
            );

            return node;
        }

        if (node.type === 'CallExpression') {

            probes.push({
                code: escodegen.generate(node, {format: {compact: true}}),
                loc: node.loc
            });

            nodeCopy.arguments = nodeCopy.arguments.map(function (item) {
                return _instrumentProbes(item, probes)
            });
            // nodeCopy.callee = _instrumentProbes(nodeCopy.callee, probes);

            node = _getProbeAst(
                node.loc.start.line,
                node.loc.start.column,
                node.loc.end.line,
                node.loc.end.column,
                nodeCopy
            );

            return node;
        }

        return node;

    }


    // function _findInspectableObjects(ast) {
    //     var objects = [];

    //     function getName(node) {
    //         if (node.name) {
    //             return node.name;
    //         }
    //         if (node.type === 'MemberExpression') {
    //             return getName(node.object) + '.' + getName(node.property);
    //         }
    //         if (node.type === 'CallExpression') {
    //             var args = node.arguments.map(function (arg) { return arg.value; })
    //             return getName(node.callee) + '(' + args.join(', ') + ')';
    //         }
    //     }

    //     estraverse.traverse(ast, {
    //         enter: function(node, parent) {
    //             if (node.type === 'MemberExpression') {
    //                 objects.push({
    //                     name: getName(node),
    //                     loc: node.loc
    //                 });
    //             }
    //         }
    //     });

    //     return objects;
    // }

    // function _instrumentProbes(ast, probes) {
    //     return estraverse.replace(ast, {
    //         enter: function(node, parent) {

    //             // console.log(node);

    //             // Do not log our own inserted code
    //             if (node.__instrumented) {
    //                 return node;
    //             }

    //             if (parent.__instrumented) {
    //                 return node;
    //             }

    //             // Do not log Identifiers TODO: only for now
    //             if (node.type === 'Identifier') {
    //                 return node;
    //             }

    //             // Do not log Literals
    //             if (node.type === 'Literal') {
    //                 return node;
    //             }

    //             // Instrument only 1-liners
    //             if (node.loc.start.line !== node.loc.end.line) {
    //                 return node;
    //             }

    //             if (node.type === 'MemberExpression' && node.loc) {

    //                 // node.__instrument = true;

    //             }

    //             if (node.type === 'CallExpression' && node.loc) {
    //                 // this.skip(); // Do not traverse inside

    //                 node.__instrument = true;

    //                 // probes.push({
    //                 //     code: escodegen.generate(parent, {format: {compact: true}}),
    //                 //     loc: node.loc
    //                 // });

    //                 // console.log('Probe:', escodegen.generate(parent, {format: {compact: true}}), 'Start:', node.loc.start, 'End:', node.loc.end);

    //                 // var nodeCopy = $.extend(true, {}, node);
    //                 // return _getProbeAst(
    //                 //     node.loc.start.line,
    //                 //     node.loc.start.column,
    //                 //     node.loc.end.line,
    //                 //     node.loc.end.column,
    //                 //     nodeCopy
    //                 // );
    //             }

    //             return node;

    //         },
    //         leave: function(parent, node) {

    //             if (node.__instrument) {

    //                 probes.push({
    //                     code: escodegen.generate(parent, {format: {compact: true}}),
    //                     loc: node.loc
    //                 });

    //                 console.log({
    //                     code: escodegen.generate(parent, {format: {compact: true}}),
    //                     loc: node.loc
    //                 });
    //                 // console.log('Probe:', escodegen.generate(parent, {format: {compact: true}}), 'Start:', node.loc.start, 'End:', node.loc.end);

    //                 var nodeCopy = $.extend(true, {}, node);
    //                 return _getProbeAst(
    //                     node.loc.start.line,
    //                     node.loc.start.column,
    //                     node.loc.end.line,
    //                     node.loc.end.column,
    //                     // nodeCopy
    //                     {}
    //                 );

    //             }

    //         }
    //     });
    // }

    function _findFunctionCalls(ast) {
        var objects = [];

        estraverse.traverse(ast, {
            enter: function(node, parent) {
                if (node.type === 'CallExpression') {
                    objects.push({
                        code: escodegen.generate(parent, {format: {compact: true}}),
                        loc: node.loc
                    });
                }
            }
        });

        return objects;
    }

    exports.instrument = instrument;

    // For testing
    // exports._findInspectableObjects = _findInspectableObjects;

});