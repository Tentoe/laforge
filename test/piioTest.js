const piio = require("../piio");
const assert = require('assert');

describe('piio', function() {
    describe("#getCelsius()", function() {
        it('returns a number wrapped in a promise', function() {
            return piio.getCelsius().then(function(val) {
                assert.equal("number", typeof val, "value is typeof: " + typeof val);
            });
        });

    });
    describe("#setHeating(boolean)", function() {
        it('turns heating on', function() {
            return piio.setHeating(true).then(function(val) {
                assert.equal(true, val, "value is not true it is: " + val);
            });
        });
        it('turn heating off', function() {
            return piio.setHeating(false).then(function(val) {
                assert.equal(false, val, "value is not false it is: " + val);
            });
        });
    })
});
