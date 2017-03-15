//TODO split logic from the router

var express = require('express');
var piheat = require("../piheat");
var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var path = require('path');

var router = express.Router();

var credentials = null;

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/calendar-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
var TOKEN_DIR = path.join(process.cwd(), "credentials" + path.sep);
var TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs.json';

// Load client secrets from a local file.
fs.readFile(path.join(process.cwd(), 'client_secret.json'),
    function processClientSecrets(err, content) {
        if (err) { //TODO error handling
            console.log('Error loading client secret file: ' + err);
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

    var clientSecret = credentials.web.client_secret;
    var clientId = credentials.web.client_id;
    var redirectUrl = credentials.web.redirect_uris[0];
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
        if (err) {
            //getNewToken(oauth2Client, callback);
            callback(new Error("no token found"), oauth2Client);
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
    console.log('Token stored to ' + TOKEN_PATH); //TODO to callback
}



router.get('/', function(req, res) {
    req.session.loggedIn = req.session.loggedIn || false;



    authorize(credentials, function(err, oauth2Client) {
        console.log(oauth2Client);

        if (req.query.code) {
            oauth2Client.getToken(req.query.code, function(err, token) {
                if (err) {
                    console.log('Error while trying to retrieve access token', err);
                    return;
                }
                oauth2Client.credentials = token;
                storeToken(token);
            });
        };

        var message = "";
        var authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES
        });
        if (err) {
            res.render("googleCalendar", {
                loggedIn: req.session.loggedIn,
                message: err.message,
                authUrl: authUrl
            });
        } else {
            var calendar = google.calendar('v3');
            calendar.calendarList.list({
                auth: oauth2Client
            }, function(err, response) {
                if (err) {
                    res.render("googleCalendar", {
                        loggedIn: req.session.loggedIn,
                        message: err.message,
                        authUrl: authUrl
                    });
                    return;
                }
                hasHeatingCalendar = false;
                if (response) response.items.forEach(function(val) { //TODO use SOME function
                    if (val.summary.toUpperCase() === "HEATING") hasHeatingCalendar = true;
                });
                message = hasHeatingCalendar.toString();
                res.render("googleCalendar", {
                    loggedIn: req.session.loggedIn,
                    message: message,
                    authUrl: authUrl
                });
            });

        }



    });


});


module.exports = router;
