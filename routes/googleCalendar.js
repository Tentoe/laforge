// TODO split logic from the router

const express = require('express');
// const piheat = require('../piheat');
const fs = require('fs');
// const readline = require('readline');
const google = require('googleapis');
const googleAuth = require('google-auth-library');
const path = require('path');

const router = express.Router();

let credentials = null;

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/calendar-nodejs-quickstart.json
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_DIR = path.join(process.cwd(), `credentials${path.sep}`);
const TOKEN_PATH = `${TOKEN_DIR}calendar-nodejs.json`;
const URLPARAMS = {
  access_type: 'offline',
  scope: SCOPES,
};
// Load client secrets from a local file.
fs.readFile(path.join(process.cwd(), 'client_secret.json'),
    (err, content) => {
      if (err) { // TODO error handling
        console.log(`Error loading client secret file: ${err}`); // eslint-disable-line no-console
        return;
      }
      credentials = JSON.parse(content);
    });


function getOauth2Client(creds) {
  const clientSecret = creds.web.client_secret;
  const clientId = creds.web.client_id;
  const redirectUrl = creds.web.redirect_uris[0];
  const auth = new googleAuth(); // eslint-disable-line new-cap
  return new auth.OAuth2(clientId, clientSecret, redirectUrl);
}
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorizeFromFile(creds) {
  const oauth2Client = getOauth2Client(creds);
  return new Promise((resolve, reject) => {
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) {
                // getNewToken(oauth2Client, callback);
        reject(new Error('no token found'), oauth2Client);
      } else {
        oauth2Client.credentials = JSON.parse(token);
        resolve(oauth2Client);
      }
    });
  });
}


/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log(`Token stored to ${TOKEN_PATH}`); // eslint-disable-line no-console
} // TODO to callback


router.get('/', (req, res) => {
  const session = req.session;
  session.loggedIn = req.session.loggedIn || false;

    // TODO new Token put somewhere else
  if (req.query.code) {
    const oauth2Client = getOauth2Client(credentials);
    const authUrl = oauth2Client.generateAuthUrl(URLPARAMS);
    oauth2Client.getToken(req.query.code, (err, token) => {
      if (err) {
        console.log('Error while trying to retrieve access token', err); // eslint-disable-line no-console
        return;
      }
      oauth2Client.credentials = token; // eslint-disable-line no-param-reassign
      storeToken(token);
      res.render('googleCalendar', {
        loggedIn: req.session.loggedIn,
        message: 'new Token stored',
        authUrl,
      });
    });
  } else {
    authorizeFromFile(credentials)
            .then((oauth2Client) => {
              console.log(oauth2Client); // eslint-disable-line no-console
              const authUrl = oauth2Client.generateAuthUrl(URLPARAMS);


              const calendar = google.calendar('v3');
              calendar.calendarList.list({
                auth: oauth2Client,
              }, (err, response) => {
                if (err) {
                  res.render('googleCalendar', {
                    loggedIn: req.session.loggedIn,
                    message: 'error with request',
                    authUrl,
                  });
                  return;
                }
                let hasHeatingCalendar = false;
                if (response) {
                  response.items.forEach((val) => { // TODO use SOME function
                    if (val.summary.toUpperCase() === 'HEATING') hasHeatingCalendar = true;
                  });
                }
                res.render('googleCalendar', {
                  loggedIn: req.session.loggedIn,
                  message: hasHeatingCalendar.toString(),
                  authUrl,
                });
              });
            }, (err, oauth2Client) => { // errors from authorize
              const authUrl = oauth2Client.generateAuthUrl(URLPARAMS);
              res.render('googleCalendar', {
                loggedIn: req.session.loggedIn,
                message: err.message,
                authUrl,
              });
            });
  }
});


module.exports = router;
