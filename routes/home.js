var express = require('express');
var router = express.Router();

// Get Homepage
router.get('/', function(req, res) {



    res.render("home", {
        loggedIn: false
    });
});

router.post('/', function(req, res) {
    res.render("home", { //TODO write to session validate password activate stuff etc
        loggedIn: true
    });

});

module.exports = router;
