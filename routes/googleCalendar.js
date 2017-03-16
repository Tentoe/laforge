// TODO split logic from the router

const express = require('express');
const piheat = require('../piheat');
const fs = require('fs');
const readline = require('readline');
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

// Load client secrets from a local file.
fs.readFile(path.join(process.cwd(), 'client_secret.json'),
    (err, content) => {
      if (err) { // TODO error handling
        console.log(`Error loading client secret file: ${err}`);
        return;
      }
      credentials = JSON.parse(content);
    });

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const clientSecret = credentials.web.client_secret;
  const clientId = credentials.web.client_id;
  const redirectUrl = credentials.web.redirect_uris[0];
  const auth = new googleAuth();
  const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) {
            // getNewToken(oauth2Client, callback);
      callback(new Error('no token found'), oauth2Client);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(null, oauth2Client);
    }
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
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log(`Token stored to ${TOKEN_PATH}`); // TODO to callback
}


router.get('/', (req, res) => {
  req.session.loggedIn = req.session.loggedIn || false;


  authorize(credentials, (err, oauth2Client) => {
    console.log(oauth2Client);

    if (req.query.code) {
      oauth2Client.getToken(req.query.code, (err, token) => {
        if (err) {
          console.log('Error while trying to retrieve access token', err);
          return;
        }
        oauth2Client.credentials = token;
        storeToken(token);
      });
    }

    let message = '';
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    if (err) {
      res.render('googleCalendar', {
        loggedIn: req.session.loggedIn,
        message: err.message,
        authUrl,
      });
    } else {
      const calendar = google.calendar('v3');
      calendar.calendarList.list({
        auth: oauth2Client,
      }, (err, response) => {
        if (err) {
          res.render('googleCalendar', {
            loggedIn: req.session.loggedIn,
            message: err.message,
            authUrl,
          });
          return;
        }
        hasHeatingCalendar = false;
        if (response) {
          response.items.forEach((val) => { // TODO use SOME function
            if (val.summary.toUpperCase() === 'HEATING') hasHeatingCalendar = true;
          });
        }
        message = hasHeatingCalendar.toString();
        res.render('googleCalendar', {
          loggedIn: req.session.loggedIn,
          message,
          authUrl,
        });
      });
    }
  });
});


module.exports = router;
