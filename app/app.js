require('app-module-path').addPath(__dirname);

const config = require('./config');
const https = require('https');
const express = require('express');
const path = require('path');

global.config = config;

const app = express();
const handlebars = require('express-handlebars').create(config.handlebars);

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressSession = require('express-session');


const cred = config.cred;

// middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded(config.bodyParser));
app.use(cookieParser());
app.use(expressSession(config.express));


// engine
app.engine('handlebars', handlebars.engine);


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', config.viewEngine);

// statics
app.use(express.static(config.staticPath));

// routes
app.use('/', require('./routes')); // TODO move routes to app folder


https.createServer(cred, app).listen(config.shtmlPort, (err) => {
  if (err) console.error(err); // eslint-disable-line no-console
  else console.log(`https listening on port ${config.shtmlPort}`); // eslint-disable-line no-console
});


// Redirect from http to https
const http = require('http');

http.createServer((req, res) => {
  res.writeHead(301, {
    Location: `https://${req.headers.host}${req.url}`,
  });
  res.end();
}).listen(config.htmlPort, (err) => {
  if (err) console.error(err); // eslint-disable-line no-console
  else console.log(`http listening on port ${config.htmlPort}`); // eslint-disable-line no-console
});
// TODO implement proper logger

// start Logging temperature data
const dataLogger = require('database/data-logger'); // eslint-disable-line

dataLogger.starLogging();
