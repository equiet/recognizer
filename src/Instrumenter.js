/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

define(function (require, exports, module) {
    'use strict';

    var esprima = require('thirdparty/esprima'),
        escodegen = require('thirdparty/escodegen');

    var tracerSnippet = require('text!src/snippets/tracer.js');


    function instrument(filename, code) {

        var ast = esprima.parse(code, {
            loc: true,
            tolerant: true
        });

        ast = _instrumentFunctionDeclarations(ast);

        return tracerSnippet + escodegen.generate(ast);

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
                        "name": "__tracer"
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


    exports.instrument = instrument;

});