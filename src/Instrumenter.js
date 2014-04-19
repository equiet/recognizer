/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

define(function (require, exports, module) {
    'use strict';

    var esprima = require('thirdparty/esprima'),
        escodegen = require('thirdparty/escodegen'),
        estraverse = require('thirdparty/estraverse'),
        _ = brackets.getModule("thirdparty/lodash");

    var tracerSnippet = require('text!src/snippets/tracer.js');

    // From https://github.com/Constellation/estraverse/blob/master/estraverse.js
    var VisitorKeys = {
        AssignmentExpression: [/*'left', */'right'],
        ArrayExpression: ['elements'],
        ArrayPattern: ['elements'],
        ArrowFunctionExpression: ['params', 'defaults', 'rest', 'body'],
        BlockStatement: ['body'],
        BinaryExpression: ['left', 'right'],
        BreakStatement: ['label'],
        CallExpression: ['callee', 'arguments'],
        CatchClause: ['param', 'body'],
        ClassBody: ['body'],
        ClassDeclaration: ['id', 'body', 'superClass'],
        ClassExpression: ['id', 'body', 'superClass'],
        ConditionalExpression: ['test', 'consequent', 'alternate'],
        ContinueStatement: ['label'],
        DebuggerStatement: [],
        DirectiveStatement: [],
        DoWhileStatement: ['body', 'test'],
        EmptyStatement: [],
        ExpressionStatement: ['expression'],
        ForStatement: ['init', 'test', 'update', 'body'],
        ForInStatement: ['left', 'right', 'body'],
        ForOfStatement: ['left', 'right', 'body'],
        FunctionDeclaration: ['id', 'params', 'defaults', 'rest', 'body'],
        FunctionExpression: ['id', 'params', 'defaults', 'rest', 'body'],
        Identifier: [],
        IfStatement: ['test', 'consequent', 'alternate'],
        Literal: [],
        LabeledStatement: ['label', 'body'],
        LogicalExpression: ['left', 'right'],
        MemberExpression: ['object', 'property'],
        MethodDefinition: ['key', 'value'],
        NewExpression: ['callee', 'arguments'],
        ObjectExpression: ['properties'],
        ObjectPattern: ['properties'],
        Program: ['body'],
        Property: ['key', 'value'],
        ReturnStatement: ['argument'],
        SequenceExpression: ['expressions'],
        SwitchStatement: ['discriminant', 'cases'],
        SwitchCase: ['test', 'consequent'],
        ThisExpression: [],
        ThrowStatement: ['argument'],
        TryStatement: ['block', 'handlers', 'handler', 'guardedHandlers', 'finalizer'],
        UnaryExpression: ['argument'],
        UpdateExpression: ['argument'],
        VariableDeclaration: ['declarations'],
        VariableDeclarator: ['id', 'init'],
        WhileStatement: ['test', 'body'],
        WithStatement: ['object', 'body'],
        YieldExpression: ['argument']
    };

    function instrument(code) {

        var ast = esprima.parse(code, {
            loc: true,
            tolerant: false
        });

        var astCopy = $.extend(true, {}, ast);

        var instrumentedAst;
        instrumentedAst = _instrumentFunctionDeclarations(astCopy);
        instrumentedAst = _instrumentFunctionExpressions(instrumentedAst.ast);
        instrumentedAst = _instrumentProbes(instrumentedAst.ast);

        console.log('AST', instrumentedAst.ast);

        return {
            code: tracerSnippet + escodegen.generate(instrumentedAst.ast),
            probes: instrumentedAst.probes
        };

    }


    function _instrumentFunctionDeclarations(ast) {
        ast = traverse(ast, null, {
            FunctionDeclaration: function(node) {
                node.body.body.unshift(_getFunctionEntryAst(
                    node.id.loc.start.line,
                    node.id.loc.start.column,
                    node.id.loc.end.line,
                    node.id.loc.end.column
                ));
                return node;
            }
        });
        return {
            ast: ast
        };
    }


    function _instrumentFunctionExpressions(ast) {
        ast = traverse(ast, null, {
            FunctionExpression: function(node) {
                node.body.body.unshift(_getFunctionEntryAst(
                    node.loc.start.line,
                    node.loc.start.column,
                    node.loc.start.line,
                    node.loc.start.column + 8
                ));
                return node;
            }
        });
        return {
            ast: ast
        };
    }


    function _instrumentProbes(ast) {
        var probes = [];

        ast = traverse(ast, null, {
            Identifier: function (node, parent) {
                // Do not instrument if parent is one of these
                if (['VariableDeclarator', 'Property', 'FunctionDeclaration'].indexOf(parent.type) !== -1) {
                    return node;
                }

                // In `Math.random`, we want to instrument `Math` (object) and `Math.random` (object.property), not `random` (property)
                if (parent.type === 'MemberExpression' && _.isEqual(parent.property, node)) {
                    return node;
                }

                probes.push({
                    code: escodegen.generate(node, {format: {compact: true}}),
                    loc: node.loc
                });
                node = _getProbeAst(
                    node.loc.start.line,
                    node.loc.start.column,
                    node.loc.end.line,
                    node.loc.end.column,
                    node
                );
                return node;
            },

            // `node` is instrumented. Therefore asking for children of this node is meaningless,
            // since it has been overwritten. `originalNode` is its uninstrumented version.
            CallExpression: function (node, parent, originalNode) {
                probes.push({
                    code: escodegen.generate(originalNode, {format: {compact: true}}),
                    loc: node.loc
                });

                // obj.fn('arg')
                if (originalNode.callee.type === 'MemberExpression') {
                    console.log('Path 1 input:', node, escodegen.generate(node, {format: {compact: true}}));
                    return _getFunctionProbeAst2(
                        node.loc.start.line,
                        node.loc.start.column,
                        node.loc.end.line,
                        node.loc.end.column,
                        node.callee.__original.object,
                        node.callee.__original.property,
                        node.arguments
                    );
                }

                // fn('arg')
                if (originalNode.callee.type === 'Identifier') {
                    console.log('Path 2 input:', node, escodegen.generate(node, {format: {compact: true}}));
                    return _getProbeAst(
                        node.loc.start.line,
                        node.loc.start.column,
                        node.loc.end.line,
                        node.loc.end.column,
                        node
                    );
                }

                // ?
                console.log('path 3');
                // console.warn('Unknown CallExpression', node);
                return _getProbeAst(
                    node.loc.start.line,
                    node.loc.start.column,
                    node.loc.end.line,
                    node.loc.end.column,
                    node
                );
            },

            MemberExpression: function (node, parent) {
                console.log('MemberExpression before:', escodegen.generate(node, {format: {compact: true}}));
                probes.push({
                    code: escodegen.generate(node, {format: {compact: true}}),
                    loc: node.loc
                });
                node = _getProbeAst(
                    node.loc.start.line,
                    node.loc.start.column,
                    node.loc.end.line,
                    node.loc.end.column,
                    node
                );
                console.log('Expression before:', escodegen.generate(node, {format: {compact: true}}));
                return node;
            }
        });

        return {
            ast: ast,
            probes: probes
        };
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
            "__original": node,
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

    // function _getFunctionProbeAst(startLine, startColumn, endLine, endColumn, node) {
    //     // if (node.callee.type === 'Identifier') {
    //     //     node.callee = {
    //     //         object: {
    //     //             "__instrumented": true,
    //     //             "type": "MemberExpression",
    //     //             "computed": false,
    //     //             "object": {
    //     //                 "type": "Identifier",
    //     //                 "name": "__recognizer{{tracerId}}"
    //     //             },
    //     //             "property": {
    //     //                 "type": "Identifier",
    //     //                 "name": "global"
    //     //             }
    //     //         },
    //     //         property: node.callee
    //     //     };
    //     // }
    //     return {
    //         "__instrumented": true,
    //         "type": "CallExpression",
    //         "callee": {
    //             "__instrumented": true,
    //             "type": "MemberExpression",
    //             "computed": false,
    //             "object": {
    //                 "type": "Identifier",
    //                 "name": "__recognizer{{tracerId}}"
    //             },
    //             "property": {
    //                 "type": "Identifier",
    //                 "name": "logProbeFn"
    //             }
    //         },
    //         "arguments": [
    //             {
    //                 "__instrumented": true,
    //                 "type": "ArrayExpression",
    //                 "elements": [
    //                     {
    //                         "type": "Literal",
    //                         "value": startLine,
    //                         "raw": "" + startLine
    //                     },
    //                     {
    //                         "type": "Literal",
    //                         "value": startColumn,
    //                         "raw": "" + startColumn
    //                     },
    //                     {
    //                         "type": "Literal",
    //                         "value": endLine,
    //                         "raw": "" + endLine
    //                     },
    //                     {
    //                         "type": "Literal",
    //                         "value": endColumn,
    //                         "raw": "" + endColumn
    //                     }
    //                 ]
    //             },
    //             node.callee.callee.object,
    //             {
    //                 "__instrumented": true,
    //                 "type": "ArrayExpression",
    //                 "elements": node.arguments
    //             },
    //             node.callee
    //         ]
    //     };
    // }

    // (function() {
    //     var obj = foo('bar'),
    //         fn = obj.html;
    //     return fn.apply(obj, arguments);
    // }.bind(this))
    function _getFunctionProbeAst2(startLine, startColumn, endLine, endColumn, nodeObject, nodeProperty, nodeArguments) {
        return {
            "__instrumented": true,
            "type": "CallExpression",
            "callee": {
                "__instrumented": true,
                "type": "CallExpression",
                "callee": {
                    "__instrumented": true,
                    "type": "MemberExpression",
                    "computed": false,
                    "object": {
                        "__instrumented": true,
                        "type": "FunctionExpression",
                        "id": null,
                        "params": [],
                        "defaults": [],
                        "body": {
                            "__instrumented": true,
                            "type": "BlockStatement",
                            "body": [
                                {
                                    "__instrumented": true,
                                    "type": "VariableDeclaration",
                                    "declarations": [
                                        {
                                            "__instrumented": true,
                                            "type": "VariableDeclarator",
                                            "id": {
                                                "type": "Identifier",
                                                "name": "obj"
                                            },
                                            "init": nodeObject
                                        },
                                        {
                                            "__instrumented": true,
                                            "type": "VariableDeclarator",
                                            "id": {
                                                "__instrumented": true,
                                                "type": "Identifier",
                                                "name": "fn"
                                            },
                                            "init": {
                                                "__instrumented": true,
                                                "type": "MemberExpression",
                                                "computed": false,
                                                "object": {
                                                    "type": "Identifier",
                                                    "name": "obj"
                                                },
                                                // TODO: this is not instrumented
                                                "property": nodeProperty
                                            },
                                        },
                                    ],
                                    "kind": "var"
                                },
                                {
                                    "__instrumented": true,
                                    "type": "ReturnStatement",
                                    "argument": {
                                        "__instrumented": true,
                                        "type": "CallExpression",
                                        "callee": {
                                            "__instrumented": true,
                                            "type": "MemberExpression",
                                            "computed": false,
                                            "object": {
                                                "__instrumented": true,
                                                "type": "Identifier",
                                                "name": "fn"
                                            },
                                            "property": {
                                                "__instrumented": true,
                                                "type": "Identifier",
                                                "name": "apply"
                                            }
                                        },
                                        "arguments": [
                                            {
                                                "__instrumented": true,
                                                "type": "Identifier",
                                                "name": "obj"
                                            },
                                            {
                                                "__instrumented": true,
                                                "type": "Identifier",
                                                "name": "arguments"
                                            }
                                        ]
                                    }
                                }
                            ]
                        },
                        "rest": null,
                        "generator": false,
                        "expression": false
                    },
                    "property": {
                        "type": "Identifier",
                        "name": "bind"
                    }
                },
                "arguments": [
                    {
                        "__instrumented": true,
                        "type": "ThisExpression"
                    }
                ]
            },
            "arguments": nodeArguments
        };
    }


    function traverse(node, parent, visitor) {

        if (!node) {
            return node;
        }

        if (node.__instrumented) {
            console.warn('Instrumented node, skipping');
            return node;
        }

        // Skip not implemented instrumentations
        if (VisitorKeys[node.type] === undefined) {
            return node;
        }

        // Traverse all leaves using the syntax tree database
        var newNode = _.cloneDeep(node);
        VisitorKeys[node.type].forEach(function (visitKey) {

            // If the leave is an array, traverse all of its elements
            if (Array.isArray(node[visitKey])) {
                newNode[visitKey] = newNode[visitKey].map(function (item) {
                    return traverse(item, node, visitor);
                });
            } else {
                newNode[visitKey] = traverse(node[visitKey], node, visitor);
            }

        });

        // Transform the AST with a visitor
        if (visitor[newNode.type]) {
            newNode = visitor[newNode.type](newNode, parent, node);
        }

        console.log('Leaving node', node.type, escodegen.generate(node, {format: {compact: true}}));

        return node;

    }


    exports.instrument = instrument;
    exports.traverse = traverse;

});