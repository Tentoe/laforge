// TODO put this file in root folder
const express = require('express');

const home = require('./home');
const ajax = require('database/ajax'); // eslint-disable-line


const router = express.Router();


// Get Homepage
router.get('/', home.get);
router.post('/', home.post);
router.get('/logout', require('./logout'));
router.use('/google', require('./calendar-config'));

router.get('/getChartData', ajax.getChartData); // TODO use router

// catch 404 and forward to error handler
router.use((req, res, next) => {
    // TODO error status ugly
  var err = new Error('Not Found'); // eslint-disable-line no-var
  err.status = 404;
  next(err);
});

// error handler TODO catch all errors and give a better error page
router.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    // set locals, only providing error in development
    // res.locals.message = err.message;
    // res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
  const vars = {
    loggedIn: req.session.loggedIn || false,
    message: err.message,
  };
  res.status(err.status || 500);
  if (err.status === 404) res.render('404', vars);
  else res.render('500', vars);
});


module.exports = router;
