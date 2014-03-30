/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

define(function (require, exports, module) {
    'use strict';

    var esprima = require('thirdparty/esprima'),
        escodegen = require('thirdparty/escodegen'),
        estraverse = require('thirdparty/estraverse');

    var tracerSnippet = require('text!src/snippets/tracer.js');

    // From https://github.com/Constellation/estraverse/blob/master/estraverse.js
    var VisitorKeys = {
    //     AssignmentExpression: ['left', 'right'],
    //     ArrayExpression: ['elements'],
    //     ArrayPattern: ['elements'],
    //     ArrowFunctionExpression: ['params', 'defaults', 'rest', 'body'],
        BlockStatement: ['body'],
        BinaryExpression: ['left', 'right'],
    //     BreakStatement: ['label'],
        CallExpression: ['callee', 'arguments'],
    //     CatchClause: ['param', 'body'],
    //     ClassBody: ['body'],
    //     ClassDeclaration: ['id', 'body', 'superClass'],
    //     ClassExpression: ['id', 'body', 'superClass'],
    //     ConditionalExpression: ['test', 'consequent', 'alternate'],
    //     ContinueStatement: ['label'],
    //     DebuggerStatement: [],
    //     DirectiveStatement: [],
    //     DoWhileStatement: ['body', 'test'],
    //     EmptyStatement: [],
        ExpressionStatement: ['expression'],
    //     ForStatement: ['init', 'test', 'update', 'body'],
    //     ForInStatement: ['left', 'right', 'body'],
    //     ForOfStatement: ['left', 'right', 'body'],
    //     FunctionDeclaration: ['id', 'params', 'defaults', 'rest', 'body'],
        FunctionExpression: [/*'id', 'params', 'defaults', 'rest', */'body'],
    //     Identifier: [],
    //     IfStatement: ['test', 'consequent', 'alternate'],
    //     Literal: [],
    //     LabeledStatement: ['label', 'body'],
    //     LogicalExpression: ['left', 'right'],
        MemberExpression: ['object',/* 'property'*/],
    //     MethodDefinition: ['key', 'value'],
    //     NewExpression: ['callee', 'arguments'],
        ObjectExpression: ['properties'],
    //     ObjectPattern: ['properties'],
        Program: ['body'],
        Property: [/*'key', */'value'],
    //     ReturnStatement: ['argument'],
    //     SequenceExpression: ['expressions'],
    //     SwitchStatement: ['discriminant', 'cases'],
    //     SwitchCase: ['test', 'consequent'],
    //     ThisExpression: [],
    //     ThrowStatement: ['argument'],
    //     TryStatement: ['block', 'handlers', 'handler', 'guardedHandlers', 'finalizer'],
    //     UnaryExpression: ['argument'],
    //     UpdateExpression: ['argument'],
        VariableDeclaration: ['declarations'],
        VariableDeclarator: [/*'id', */'init'],
    //     WhileStatement: ['test', 'body'],
    //     WithStatement: ['object', 'body'],
    //     YieldExpression: ['argument']
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

        return {
            code: tracerSnippet + escodegen.generate(instrumentedAst.ast),
            probes: instrumentedAst.probes
        };

    }


    function _instrumentFunctionDeclarations(ast) {
        ast = traverse(ast, {
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
        ast = traverse(ast, {
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

        ast = traverse(ast, {
            Identifier: function(node) {
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
            MemberExpression: function(node) {
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
            CallExpression: function(node) {
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


    function traverse(node, visitor) {

        if (!node) {
            return node;
        }

        if (node.__instrumented) {
            return node;
        }

        // Log which nodes are not recognized yet in Instrumenter
        if (VisitorKeys[node.type] === undefined) {
            console.log('[recognizer] Not implemented yet:', node);
            return node;
        }

        // Traverse all leaves using the syntax tree database
        VisitorKeys[node.type].forEach(function (visitKey) {

            // If the leave is an array, traverse all of its elements
            if (Array.isArray(node[visitKey])) {
                node[visitKey].map(function (item) {
                    return traverse(item, visitor);
                });
            } else {
                node[visitKey] = traverse(node[visitKey], visitor);
            }

        });

        // Transform the AST with a visitor
        if (visitor[node.type]) {
            node = visitor[node.type]($.extend(true, {}, node));
        }

        return node;

    }


    exports.instrument = instrument;
    exports.traverse = traverse;

});