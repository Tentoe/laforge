const database = require('./database');

function getChartData(req, res) {
    // data from last 24h
  const temps = database.getTemperatures(new Date(Date.now() - (24 * 60 * 60 * 1000)));
  const targets = database.getTargets(new Date(Date.now() - (24 * 60 * 60 * 1000)));

  Promise.all([temps, targets])
        .then((result) => {
          res.send(result);
        }).catch(() => res.end());
}


module.exports = {
  getChartData,
};
