const https = require('https');
const fs = require('fs');
const path = require("path");
const express = require('express');
const app = express();
const handlebars = require("express-handlebars").create({
    defaultLayout: "main"
});

const sslDir = "ssl";
const cred = {
    key: fs.readFileSync(path.join(__dirname, sslDir, "new.cert.key")),
    cert: fs.readFileSync(path.join(__dirname, sslDir, "new.cert.cert"))
};

//routes
const routes = require("./routes/home")
app.use('/', routes);

app.engine("handlebars", handlebars.engine);

app.set('port', process.env.PORT || 3333);
app.set('portssl', process.env.PORTSSL || 4444);
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, "public")));

app.get('/', function(req, res) {
    res.render("home");
});


https.createServer(cred, app).listen(app.get("portssl"), function(err) {
    if (err) console.error(err);
    else console.log("listening on port " + app.get("portssl"));
});

//TODO http redirect to https
