const database = require('./database');

function getChartData(req, res) {
    // data from last 24h
  const goBack = (24 * 60 * 60 * 1000);
  const tempData = database.getTemperatures(new Date(Date.now() - goBack));
  const targetData = database.getTargets(new Date(Date.now() - goBack));
  const weatherData = database.getWeather(new Date(Date.now() - goBack));

  Promise.all([tempData, targetData, weatherData])
        .then((result) => {
          res.send(result);
        }).catch(() => res.end());
}


module.exports = {
  getChartData,
};
