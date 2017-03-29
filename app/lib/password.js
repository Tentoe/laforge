const bcrypt = require('bcrypt');

function checkPassword(hash) {
  const passwords = global.configJSON.passwords;
  if (passwords.length <= 0) return Promise.resolve(false);
  const tests = [];

  passwords.forEach((val) => {
    tests.push(bcrypt.compare(hash, val));
  });

  return Promise.all(tests).then(finishedTests => finishedTests.some(val => val));
}

module.exports = {
  checkPassword,
};
