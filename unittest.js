define(function (require, exports, module) {
    "use strict";

    var Instrumenter = require('src/Instrumenter');
    var sampleAst = JSON.parse(require('text!test/fixtures/sampleAst.json'));

    describe('Instrumentation', function() {

        it('should return inspectableObjects', function() {
            var instrumentedCode = Instrumenter.instrument('function() {}');
            console.log(instrumentedCode.code);
            // TODO: expect()
        });

    });

});