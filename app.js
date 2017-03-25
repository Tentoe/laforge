// add __dirname to module search path
require('app-module-path').addPath(__dirname);

const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
const handlebars = require('express-handlebars').create({
  defaultLayout: 'main',
});

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressSession = require('express-session');

const sslDir = 'ssl';
const cred = {
  key: fs.readFileSync(path.join(__dirname, sslDir, 'new.cert.key')),
  cert: fs.readFileSync(path.join(__dirname, sslDir, 'new.cert.cert')),
};

// middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false,
}));
app.use(cookieParser());
app.use(expressSession({
  secret: 'a long save secret, that noone can guess',
  resave: false,
  rolling: true,
  saveUninitialized: false,
  cookie: {
    maxAge: 600000,
  },
}));


// engine
app.engine('handlebars', handlebars.engine);

app.set('port', process.env.PORT || 3333);
app.set('portssl', process.env.PORTSSL || 4444);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

// statics
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.use('/', require('./routes/routes'));


https.createServer(cred, app).listen(app.get('portssl'), (err) => {
  if (err) console.error(err); // eslint-disable-line no-console
  else console.log(`https listening on port ${app.get('portssl')}`); // eslint-disable-line no-console
});


// Redirect from http to https
const http = require('http');

http.createServer((req, res) => {
  res.writeHead(301, {
    Location: `https://${req.headers.host}${req.url}`,
  });
  res.end();
}).listen(app.get('port'), (err) => {
  if (err) console.error(err); // eslint-disable-line no-console
  else console.log(`http listening on port ${app.get('port')}`); // eslint-disable-line no-console
});
// TODO implement proper logger


const dataLogger = require('./routes/lib/data-logger');

dataLogger.starLogging();
