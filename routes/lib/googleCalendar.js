// TODO split logic from the router


// const piheat = require('../piheat');
const fs = require('fs');
// const readline = require('readline');
const googleApis = require('googleapis');
const googleAuth = require('google-auth-library');
const path = require('path');


let credentials = null;

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/calendar-nodejs-quickstart.json
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_DIR = path.join(process.cwd(), `token${path.sep}`);
const TOKEN_PATH = `${TOKEN_DIR}calendar-nodejs.json`;
const URLPARAMS = {
  access_type: 'offline',
  scope: SCOPES,
};

let oauth2Client = null;


function getOauth2Client(creds) {
  const clientSecret = creds.web.client_secret;
  const clientId = creds.web.client_id;
  const redirectUrl = creds.web.redirect_uris[0];
  const auth = new googleAuth(); // eslint-disable-line new-cap
  return new auth.OAuth2(clientId, clientSecret, redirectUrl);
}
// Load client secrets from a local file.
fs.readFile(path.join(process.cwd(), 'client_secret.json'),
    (err, content) => {
      if (err) { // TODO error handling
        console.log(`Error loading client secret file: ${err}`); // eslint-disable-line no-console
        return;
      }
      credentials = JSON.parse(content);
      oauth2Client = getOauth2Client(credentials);
    });


// get Token from File

fs.readFile(TOKEN_PATH, (err, token) => {
  if (err) {
    console.log('could not load Token form File'); // eslint-disable-line no-console
  } else {
    oauth2Client.credentials = JSON.parse(token);
  }
});


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


module.exports = {
  getAuthUrl() {
    return oauth2Client.generateAuthUrl(URLPARAMS);
  },
  getOAuth2Client() {
    return oauth2Client;
  },
  storeNewToken(code) {
    return new Promise((resolve, reject) => {
      oauth2Client.getToken(code, (err, token) => {
        if (err) reject(err);

        oauth2Client.credentials = token; // eslint-disable-line no-param-reassign
        storeToken(token);
        resolve();
      });
    });
  },
  getResults() {
    const calendar = googleApis.calendar('v3');
    return new Promise((resolve, reject) => {
      calendar.calendarList.list({
        auth: oauth2Client,
      }, (err, response) => {
        if (err) reject(err);
        resolve(response);
      });
    });
  },
};
