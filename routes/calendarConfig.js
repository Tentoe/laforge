const express = require('express');

const router = express.Router();

const googleCalendar = require('./lib/googleCalendar');

router.get('/', (req, res) => {
  const session = req.session;
  session.loggedIn = session.loggedIn || false;
  if (!session.loggedIn) {
    res.status(403).render('403', {
      message: 'you have to be logged in',
    });
    return;
  }
  if (req.query.code) { // store new Token TODO filter token with no refresh Token
    googleCalendar.storeNewToken(req.query.code).then(() => {
      res.render('googleCalendar', {
        loggedIn: req.session.loggedIn,
        message: 'new Token stored',
        authUrl: googleCalendar.getAuthUrl(),
      });
    }).catch((err) => {
      res.render('googleCalendar', {
        loggedIn: req.session.loggedIn,
        message: `new token not stored because:${err.message}`,
        authUrl: googleCalendar.getAuthUrl(),
      });
    });
  } else {
    const authUrl = googleCalendar.getAuthUrl();
    googleCalendar.getAccount()
            .then((acc) => {
              res.render('googleCalendar', {
                loggedIn: req.session.loggedIn,
                message: acc,
                authUrl,
              });
            })
            .catch((err) => {
              res.render('googleCalendar', {
                loggedIn: req.session.loggedIn,
                message: `Error:${err.message}`,
                authUrl,
              });
            });
  }
});


module.exports = router;
