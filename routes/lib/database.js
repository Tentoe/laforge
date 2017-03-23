const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/laforge');

const Schema = mongoose.Schema;


const temperatureDataPointSchema = new Schema({
  date: Date,
  temperature: Number,
});

const weatherDataPointSchema = new Schema({
  date: Date,
  temperature: Number,
  pressure: Number,
  humidity: Number,
});

const TemperatureDataPoint = mongoose.connection.model('TemperatureDataPoint', temperatureDataPointSchema);
const TargetDataPoint = mongoose.connection.model('TargetDataPoint', temperatureDataPointSchema);

const WeatherDataPoint = mongoose.connection.model('WeatherDataPoint', weatherDataPointSchema);

function getLocalDate(date) {
  return new Date(date.getTime() - (new Date().getTimezoneOffset() * 60 * 1000));
}

function logTemp(temp, target) {
  const date = new Date();
  const tDP = new TemperatureDataPoint({
    date,
    temperature: temp,
  });
  const tDP2 = new TargetDataPoint({
    date,
    temperature: target,
  });
  return Promise.all([tDP.save(), tDP2.save()]);
}

function logWeather(temperature, pressure, humidity) {
  const date = new Date();
  const wDP = new WeatherDataPoint({
    date,
    temperature,
    pressure,
    humidity,
  });
  return wDP.save();
}

function getTemperatures(date) {
  return TemperatureDataPoint.find({
    date: {
      $gte: date,
    },
  }).sort('date').then((result) => {
    const ret = [];
    result.forEach((val) => {
      new Date().getTimezoneOffset();
      ret.push({
        x: getLocalDate(val.date),
        y: val.temperature,
      });
    });
    return ret;
  });
}

// TODO reduce redundancy
function getTargets(date) {
  return TargetDataPoint.find({
    date: {
      $gte: date,
    },
  }).then((result) => {
    const ret = [];
    result.forEach((val) => {
      ret.push({
        x: getLocalDate(val.date),
        y: val.temperature,
      });
    });
    return ret;
  });
}

module.exports = {
  logTemp,
  logWeather,
  getTemperatures,
  getTargets,
};
