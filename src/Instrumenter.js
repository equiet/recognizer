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
        inspectableObjects = inspectableObjects.concat(_findFunctionCalls(ast));
        inspectableObjects = inspectableObjects.filter(function(obj) { // Proble only one-liners for now
            return obj.loc.start.line === obj.loc.end.line;
        });

        console.log(inspectableObjects);

        // TODO: Use estraverse
        var instrumentedAst = $.extend(true, {}, ast);
        instrumentedAst = _instrumentFunctionDeclarations(instrumentedAst);
        instrumentedAst = _instrumentFunctionExpressions(instrumentedAst);

        var tracerId = Math.floor(Math.random() * 1000 * 1000 * 1000);

        return new TracedDocument(
            filename,
            tracerId,
            (tracerSnippet + escodegen.generate(instrumentedAst)).replace(/\{\{tracerId\}\}/g, tracerId),
           inspectableObjects
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

        return node;
    }


    function _getFunctionEntryAst(startLine, startColumn, endLine, endColumn) {
        return {
            "type": "ExpressionStatement",
            "expression": {
                "type": "CallExpression",
                "callee": {
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