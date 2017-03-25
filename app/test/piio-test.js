/* eslint-env node, mocha */
const piio = require('../routes/lib/piio');
const assert = require('assert');

describe('piio', () => {
  describe('#getCelsius()', () => {
    it('returns a number wrapped in a promise', () => piio.getCelsius().then((val) => {
      assert.equal('number', typeof val, `value is typeof: ${typeof val}`);
    }));
  });
  describe('#setHeating(boolean)', () => {
    it('turns heating on', () => piio.setHeating(true).then((val) => {
      assert.equal(true, val, `value is not true it is: ${val}`);
    }));
    it('turn heating off', () => piio.setHeating(false).then((val) => {
      assert.equal(false, val, `value is not false it is: ${val}`);
    }));
  });
});
