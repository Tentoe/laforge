// TODO split logic from the router


const fs = require('fs');
const googleApis = require('googleapis');
const googleAuth = require('google-auth-library');
const path = require('path');
const schedule = require('node-schedule');
const piheat = require('heating/piheat'); // eslint-disable-line

const calendar = googleApis.calendar('v3');

let credentials = null;

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/calendar-nodejs-quickstart.json
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_DIR = path.join('app', `token${path.sep}`);
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
fs.readFile(path.join('app', 'client_secret.json'),
    (err, content) => {
      if (err) { // TODO error handling
        console.log(`Error loading client secret file: ${err}`); // eslint-disable-line no-console
        return;
      }
      credentials = JSON.parse(content);
      oauth2Client = getOauth2Client(credentials);
    });

function getCalendarId() {
  return new Promise((resolve, reject) => {
    calendar.calendarList.list({
      auth: oauth2Client,
    }, (err, response) => {
      if (err) reject(err);
      if (response) resolve(response.items.find(val => val.summary.toUpperCase() === 'HEATING').id);
      reject(new Error('strange error happend again'));
    });
  });
}

function getResults() {
  return getCalendarId().then(id => new Promise((resolve, reject) => {
    calendar.events.list({
      auth: oauth2Client,
      calendarId: id,
      timeMin: (new Date()).toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    }, (err, response) => {
      if (err) reject(err);
      resolve(response.items);
    });
  }));
}

function updateCalendar() {
  getResults().then((results) => {
    piheat.refreshCalendar(results);
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
  updateCalendar();
} // TODO to callback


function getAuthUrl() {
  return oauth2Client.generateAuthUrl(URLPARAMS);
}


function storeNewToken(code) {
  return new Promise((resolve, reject) => {
    oauth2Client.getToken(code, (err, token) => {
      if (err) reject(err);

      oauth2Client.setCredentials(token); // eslint-disable-line no-param-reassign
      storeToken(token);
      resolve();
    });
  });
}

function getAccount() {
  return new Promise((resolve, reject) => {
    calendar.calendars.get({
      auth: oauth2Client,
      calendarId: 'primary',
    }, (err, response) => {
      if (err) reject(err);
      resolve(response.id);
    });
  });
}


// get Token from File

fs.readFile(TOKEN_PATH, (err, token) => {
  if (err) {
    console.log('could not load Token form File'); // eslint-disable-line no-console
  } else {
    oauth2Client.setCredentials(JSON.parse(token));
    updateCalendar();
    schedule.scheduleJob({
      minute: 0,
    }, updateCalendar);
        // TODO implement watching for changes
  }
});

module.exports = {
  getAuthUrl,
  storeNewToken,
  getAccount,

};
