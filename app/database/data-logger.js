// TODO maybe put in other folder

const schedule = require('node-schedule');
const database = require('database/database'); // eslint-disable-line
const piheat = require('heating/piheat'); // eslint-disable-line
const weather = require('apis/weather'); // eslint-disable-line

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
