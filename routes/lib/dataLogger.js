// TODO maybe put in other folder

const schedule = require('node-schedule');
const database = require('./database');
const piheat = require('./piheat');
const weather = require('./weather');

const piio = piheat.piio;


function tempLogger() {
  piio.getCelsius().then((temp) => {
    database.logTemp(temp, piheat.getTarget()); // TODO error hanlding
  });
}

function weatherLogger() {
  weather.getWeatherData().then((data) => {
    database.logWeather(data.main.temp, data.main.pressure, data.main.humidity);
        // TODO error hanlding
  });
}


module.exports = {
  starLogging() { // TODO log sunrise and sunset
    schedule.scheduleJob('*/10 * * * *', tempLogger); // every 10 minutes
    schedule.scheduleJob('0 * * * *', weatherLogger); // every hour
  },
};
