var crypto = require('crypto');
var express = require('express');
var piheat = require("../piheat");

var fs = require("fs");

var router = express.Router();
// Get Homepage
router.get('/', function(req, res) {

    req.session.loggedIn = req.session.loggedIn || false;

    res.render("home", {
        loggedIn: req.session.loggedIn,
        temp: piheat.getTemp(),
        target: piheat.getTarget()
    });
});

router.post('/', function(req, res) {

    req.body.password = md5hash(req.body.password);



    req.session.loggedIn = passwordValid(req.body.password);

    res.render("home", { //TODO write to session validate password activate stuff etc
        loggedIn: req.session.loggedIn,
        temp: piheat.getTemp(),
        target: piheat.getTarget()
    });


});

router.get('/logout', function(req, res) {

    req.session.loggedIn = false;

    res.render("logout");
});


function md5hash(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}

function passwordValid(pass) {

    var passwords = fs.readFileSync("passwords.md5").toString().split(/\r?\n/).reduce(function(acc, val) {
        return val !== "" ? acc.concat(val) : acc; //remove all empty strings (eof creates an empty string)
    }, []);


    return passwords.some(function(p) {
        return p === pass;
    });
}




module.exports = router;
