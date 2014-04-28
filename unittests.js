define(function (require, exports, module) {
    "use strict";

    var Instrumenter = require('src/Instrumenter');
    var sampleAst = JSON.parse(require('text!test/fixtures/sampleAst.json'));

    describe('Instrumenter', function() {

        it('should find the position of simple MemberExpression probes in the code', function() {

            // Simple MemberExpression
            var instrumentedCode = Instrumenter.instrument('object.property;');

            expect(instrumentedCode.probes.length).toBe(2);
            
            // 'object'
            expect(instrumentedCode.probes[0].loc.start.line).toBe(1);
            expect(instrumentedCode.probes[0].loc.end.line).toBe(1);
            expect(instrumentedCode.probes[0].loc.start.column).toBe(0);
            expect(instrumentedCode.probes[0].loc.end.column).toBe(6);

            // 'property'
            expect(instrumentedCode.probes[1].loc.start.line).toBe(1);
            expect(instrumentedCode.probes[1].loc.end.line).toBe(1);
            expect(instrumentedCode.probes[1].loc.start.column).toBe(7);
            expect(instrumentedCode.probes[1].loc.end.column).toBe(15);

        });

        it('should find the position of nested MemberExpression probes in the code', function() {

            // Simple MemberExpression
            var instrumentedCode = Instrumenter.instrument('object.property.subproperty;');

            expect(instrumentedCode.probes.length).toBe(3);
            
            // 'object'
            expect(instrumentedCode.probes[0].loc.start.line).toBe(1);
            expect(instrumentedCode.probes[0].loc.end.line).toBe(1);
            expect(instrumentedCode.probes[0].loc.start.column).toBe(0);
            expect(instrumentedCode.probes[0].loc.end.column).toBe(6);

            // 'property'
            expect(instrumentedCode.probes[1].loc.start.line).toBe(1);
            expect(instrumentedCode.probes[1].loc.end.line).toBe(1);
            expect(instrumentedCode.probes[1].loc.start.column).toBe(7);
            expect(instrumentedCode.probes[1].loc.end.column).toBe(15);

            // 'subproperty'
            expect(instrumentedCode.probes[2].loc.start.line).toBe(1);
            expect(instrumentedCode.probes[2].loc.end.line).toBe(1);
            expect(instrumentedCode.probes[2].loc.start.column).toBe(16);
            expect(instrumentedCode.probes[2].loc.end.column).toBe(27);

        });

        it('should find the position of CallExpression', function() {

            // Simple MemberExpression
            var instrumentedCode = Instrumenter.instrument('fn();');

            expect(instrumentedCode.probes.length).toBe(2);

            // 'fn'
            expect(instrumentedCode.probes[0].loc.start.line).toBe(1);
            expect(instrumentedCode.probes[0].loc.end.line).toBe(1);
            expect(instrumentedCode.probes[0].loc.start.column).toBe(0);
            expect(instrumentedCode.probes[0].loc.end.column).toBe(2);

            // 'fn()'
            expect(instrumentedCode.probes[1].loc.start.line).toBe(1);
            expect(instrumentedCode.probes[1].loc.end.line).toBe(1);
            expect(instrumentedCode.probes[1].loc.start.column).toBe(0);
            expect(instrumentedCode.probes[1].loc.end.column).toBe(4);

        });

        it('should find the position of CallExpression with MemberExpression', function() {

            // Simple MemberExpression
            var instrumentedCode = Instrumenter.instrument('object.property();');

            expect(instrumentedCode.probes.length).toBe(3);

            // 'object'
            expect(instrumentedCode.probes[0].loc.start.line).toBe(1);
            expect(instrumentedCode.probes[0].loc.end.line).toBe(1);
            expect(instrumentedCode.probes[0].loc.start.column).toBe(0);
            expect(instrumentedCode.probes[0].loc.end.column).toBe(6);

            // 'property'
            expect(instrumentedCode.probes[1].loc.start.line).toBe(1);
            expect(instrumentedCode.probes[1].loc.end.line).toBe(1);
            expect(instrumentedCode.probes[1].loc.start.column).toBe(7);
            expect(instrumentedCode.probes[1].loc.end.column).toBe(15);

            // 'object.property()'
            expect(instrumentedCode.probes[2].loc.start.line).toBe(1);
            expect(instrumentedCode.probes[2].loc.end.line).toBe(1);
            expect(instrumentedCode.probes[2].loc.start.column).toBe(0);
            expect(instrumentedCode.probes[2].loc.end.column).toBe(17);

        });

        it('should find the position of MemberExpression properties consisting of CallExpressionss', function() {

            // Simple MemberExpression
            var instrumentedCode = Instrumenter.instrument('object().property;');

            expect(instrumentedCode.probes.length).toBe(3);

            // 'object'
            expect(instrumentedCode.probes[0].loc.start.line).toBe(1);
            expect(instrumentedCode.probes[0].loc.end.line).toBe(1);
            expect(instrumentedCode.probes[0].loc.start.column).toBe(0);
            expect(instrumentedCode.probes[0].loc.end.column).toBe(6);

            // 'object()'
            expect(instrumentedCode.probes[1].loc.start.line).toBe(1);
            expect(instrumentedCode.probes[1].loc.end.line).toBe(1);
            expect(instrumentedCode.probes[1].loc.start.column).toBe(0);
            expect(instrumentedCode.probes[1].loc.end.column).toBe(8);

            // 'property'
            expect(instrumentedCode.probes[2].loc.start.line).toBe(1);
            expect(instrumentedCode.probes[2].loc.end.line).toBe(1);
            expect(instrumentedCode.probes[2].loc.start.column).toBe(9);
            expect(instrumentedCode.probes[2].loc.end.column).toBe(17);


        });

        it('should find the position of nested MemberExpression properties consisting of CallExpressionss', function() {

            // Simple MemberExpression
            var instrumentedCode = Instrumenter.instrument('object.property().subproperty;');

            expect(instrumentedCode.probes.length).toBe(4);

            // 'object'
            expect(instrumentedCode.probes[0].loc.start.line).toBe(1);
            expect(instrumentedCode.probes[0].loc.end.line).toBe(1);
            expect(instrumentedCode.probes[0].loc.start.column).toBe(0);
            expect(instrumentedCode.probes[0].loc.end.column).toBe(6);

            // 'property'
            expect(instrumentedCode.probes[1].loc.start.line).toBe(1);
            expect(instrumentedCode.probes[1].loc.end.line).toBe(1);
            expect(instrumentedCode.probes[1].loc.start.column).toBe(7);
            expect(instrumentedCode.probes[1].loc.end.column).toBe(15);

            // object.property()
            expect(instrumentedCode.probes[2].loc.start.line).toBe(1);
            expect(instrumentedCode.probes[2].loc.end.line).toBe(1);
            expect(instrumentedCode.probes[2].loc.start.column).toBe(0);
            expect(instrumentedCode.probes[2].loc.end.column).toBe(17);

            // 'subproperty'
            expect(instrumentedCode.probes[3].loc.start.line).toBe(1);
            expect(instrumentedCode.probes[3].loc.end.line).toBe(1);
            expect(instrumentedCode.probes[3].loc.start.column).toBe(18);
            expect(instrumentedCode.probes[3].loc.end.column).toBe(29);


        });

    });

});