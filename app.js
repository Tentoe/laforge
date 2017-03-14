const https = require('https');
const fs = require('fs');
const path = require("path");
const express = require('express');
const app = express();
const handlebars = require("express-handlebars").create({
    defaultLayout: "main"
});

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressSession = require('express-session');

const sslDir = "ssl";
const cred = {
    key: fs.readFileSync(path.join(__dirname, sslDir, "new.cert.key")),
    cert: fs.readFileSync(path.join(__dirname, sslDir, "new.cert.cert"))
};

//middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(expressSession({
    secret: 'a long save secret, that noone can guess',
    resave: false,
    rolling: true,
    saveUninitialized: false,
    cookie: {
        maxAge: 600000
    }
}));




//engine
app.engine("handlebars", handlebars.engine);

app.set('port', process.env.PORT || 3333);
app.set('portssl', process.env.PORTSSL || 4444);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');


//routes
app.use('/', require("./routes/home"));
app.use('/google', require("./routes/googleCalendar"));

app.use(express.static(path.join(__dirname, "public")));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler TODO catch all errors and give a better error page
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    //res.locals.message = err.message;
    //res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    var vars = {
        loggedIn: req.session.loggedIn || false
    };
    res.status(err.status || 500);
    if (err.status === 404) res.render('404', vars);
    else res.render("500", vars);
});



https.createServer(cred, app).listen(app.get("portssl"), function(err) {
    if (err) console.error(err);
    else console.log("https listening on port " + app.get("portssl"));
});

// http redirect to http

// Redirect from http port 80 to https
const http = require('http');
http.createServer(function(req, res) {
    res.writeHead(301, {
        "Location": "https://" + req.headers['host'] + req.url
    });
    res.end();
}).listen(app.get("port"), function(err) {
    if (err) console.error(err);
    else console.log("http listening on port " + app.get("port"));
});
