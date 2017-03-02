const path = require("path");
const express = require('express');
const app = express();
const handlebars = require("express-handlebars").create({
    defaultLayout: "main"
});

app.engine("handlebars", handlebars.engine);

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, "public")));

app.get('/', function(req, res) {
    res.render("home");
});

app.listen(app.get("port"), function(err) {
    if (err) console.error(err);
    else console.log("listening on port " + app.get("port"));
})
