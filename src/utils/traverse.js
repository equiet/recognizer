/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

define(function (require, exports, module) {
    'use strict';

    var _ = brackets.getModule('thirdparty/lodash');

    // From https://github.com/Constellation/estraverse/blob/master/estraverse.js
    var VisitorKeys = {
        AssignmentExpression: [/*'left',*/ 'right'],
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
        ForInStatement: [/*'left',*/ 'right', 'body'],
        ForOfStatement: [/*'left',*/ 'right', 'body'],
        FunctionDeclaration: [/*'id', 'params',*/ 'defaults', 'rest', 'body'],
        FunctionExpression: [/*'id', 'params',*/ 'defaults', 'rest', 'body'],
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


    function traverse(node, parent, visitor) {
        if (!node) {
            return node;
        }

        // Do not instrument code which we have inserted in previous pass (usually when inserting logEntry() functions)
        if (node.__instrumented) {
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

        return newNode;
    }


    module.exports = traverse;

});