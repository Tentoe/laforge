const piheat = require("../piheat");
const assert = require('assert');

describe('piheat', function() {
    describe("#getTemp()", function() {
        it('returns a number wrapped in a promise', function() {
            return piheat.getTemp().then(function(val) {
                assert.equal("number", typeof val, "value is typeof: " + typeof val);
            });
        });

    });
    describe("#getTarget() indirect setNewTarget(number)", function() {
        it('returns a number', function() {
            var val = piheat.getTarget();
            assert.equal("number", typeof val, "value is typeof: " + typeof val);

        });
        it('returns the number it is set to', function() { //TODO Test more
            var random = Math.random() * 40;
            piheat.setNewTarget(random);
            var val = piheat.getTarget();
            assert.equal(random, val, "returned value is not as expected");

        });
    });


});
