const express = require('express');

const home = require('./home');


const router = express.Router();


// Get Homepage
router.get('/', home.get);

router.post('/', home.post);


router.get('/logout', (req, res) => {
  req.session.loggedIn = false;

  res.render('logout');
});


// catch 404 and forward to error handler
router.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler TODO catch all errors and give a better error page
router.use((err, req, res, next) => {
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
  next();
});

// app.use('/google', require("./routes/googleCalendar"));


module.exports = router;
