const config = module.exports;
const path = require('path');
const fs = require('fs');

// const appDir = 'app'; TODO delete
const sslDir = 'ssl';

config.htmlPort = 3333;
config.shtmlPort = 4444;

config.express = {
  secret: 'a long save secret, that noone can guess',
  resave: false,
  rolling: true,
  saveUninitialized: false,
  cookie: {
    maxAge: 600000,
  },
};


config.cred = {
  key: fs.readFileSync(path.join(__dirname, sslDir, 'new.cert.key')),
  cert: fs.readFileSync(path.join(__dirname, sslDir, 'new.cert.cert')),
};


config.bodyParser = {
  extended: false,
};

config.viewsPath = path.join(__dirname, 'views');

config.viewEngine = 'handlebars';
config.handlebars = {
  layoutsDir: path.join(config.viewsPath, 'layouts'),
  partialsDir: path.join(config.viewsPath, 'partials'),
  defaultLayout: 'main',
};

config.staticPath = path.join(__dirname, '..', 'public');
