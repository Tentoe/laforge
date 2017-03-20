const database = require('./database');

function getChartData(req, res) {
  database.getTemperatures(new Date(Date.now() - (24 * 60 * 60 * 1000))) // data from last 24h
        .then(temps => res.send(temps)).catch(() => res.end());
}


module.exports = {
  getChartData,
};
