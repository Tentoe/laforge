var crypto = require('crypto');
var express = require('express');
var piheat = require("../piheat");

var fs = require("fs");

var router = express.Router();


function getVars(session) {
    return piheat.getTemp().then(function(temp) {
        return {
            loggedIn: session.loggedIn,
            temp: temp,
            target: piheat.getTarget()
        }
    });
}

// Get Homepage
router.get('/', function(req, res) {

    req.session.loggedIn = req.session.loggedIn || false;

    getVars(req.session).then(function(val) {
        res.render("home", val);
    }); //TODO Catch


});

router.post('/', function(req, res) {
    console.log("post");
    if (req.body.password) {

        req.body.password = md5hash(req.body.password);
        req.session.loggedIn = passwordValid(req.body.password);
    }

    if (req.body.target && req.session.loggedIn) {
        piheat.setNewTarget(parseFloat(req.body.target));
    }


    getVars(req.session).then(function(val) {
        res.render("home", val);
    }); //TODO Catch


});




router.get('/logout', function(req, res) {

    req.session.loggedIn = false;

    res.render("logout");
});


function md5hash(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}

function passwordValid(pass) {

    var passwords = fs.readFileSync("passwords.md5").toString().split(/\r?\n/).reduce(function(acc, val) { // TODO assync
        return val !== "" ? acc.concat(val) : acc; //remove all empty strings (eof creates an empty string)
    }, []);


    return passwords.some(function(p) {
        return p === pass;
    });
}






module.exports = router;
