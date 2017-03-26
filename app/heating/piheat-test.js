/* eslint-env node, mocha */
const piheat = require('heating/piheat'); // eslint-disable-line
const assert = require('assert');

describe('piheat', () => {
  describe('#getTemp()', () => {
    it('returns a number wrapped in a promise', () => piheat.getTemp().then((val) => {
      assert.equal('number', typeof val, `value is typeof: ${typeof val}`);
    }));
  });
  describe('#getTarget() indirect setNewTarget(number)', () => {
    it('returns a number', () => {
      const val = piheat.getTarget();
      assert.equal('number', typeof val, `value is typeof: ${typeof val}`);
    });
    it('returns the number it is set to', () => { // TODO Test more
      const random = Math.random() * 40;
      piheat.setNewTarget(random);
      const val = piheat.getTarget();
      assert.equal(random, val, 'returned value is not as expected');
    });
  });
});
