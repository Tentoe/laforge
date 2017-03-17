const piheat = require('./lib/piheat');
const fs = require('fs');
const crypto = require('crypto');

function getVars(session) {
  return piheat.getTemp().then(temp => ({
    loggedIn: session.loggedIn,
    temp,
    target: piheat.getTarget(),
  }));
}

function md5hash(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

function passwordValid(pass) { // TODO assync
  const passwords = fs.readFileSync('passwords.md5').toString().split(/\r?\n/).reduce((acc, val) =>  // eslint-disable-line no-confusing-arrow
     val !== '' ? acc.concat(val) : acc // remove all empty strings (eof creates an empty string)
  , []);


  return passwords.some(p => p === pass);
}

module.exports = {
  get(req, res) {
    const session = req.session;
    session.loggedIn = req.session.loggedIn || false;

    getVars(session).then((val) => {
      res.render('home', val);
    }); // TODO Catch
  },
  post(req, res) {
    if (req.body.password) {
      const session = req.session;
      const body = req.body;
      body.password = md5hash(req.body.password);
      session.loggedIn = passwordValid(req.body.password);
    }

    if (req.body.target && req.session.loggedIn) {
      piheat.setNewTarget(parseFloat(req.body.target));
    }


    getVars(req.session).then((val) => {
      res.render('home', val);
    }); // TODO Catch
  },
};
