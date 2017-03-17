module.exports = function (req, res) { // eslint-disable-line func-names
  const session = req.session;
  session.loggedIn = false;

  res.render('logout');
};
