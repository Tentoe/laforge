const piheat = require('heating/piheat'); // eslint-disable-line
const password = require('lib/password'); // eslint-disable-line

function getVars(session) {
  return piheat.getTemp().then(temp => ({
    loggedIn: session.loggedIn,
    temp,
    target: piheat.getTarget(),
  }));
}

// TODO split function definition and exports
module.exports = {
  get(req, res) {
    const session = req.session;
    session.loggedIn = req.session.loggedIn || false;
    getVars(session).then((val) => {
      res.render('home', val);
    }); // TODO Catch
  },
  post(req, res) {
    function renderHome() {
      if (req.body.target && req.session.loggedIn) {
        piheat.setNewTarget(parseFloat(req.body.target));
      }


      getVars(req.session).then((val) => {
        res.render('home', val);
      }); // TODO Catch
    }

    if (req.body.password) {
      const session = req.session;
      password.checkPassword(req.body.password).then((passed) => {
        session.loggedIn = passed;
      }).then(renderHome);// TODO error handling
    } else renderHome();
  },
};
