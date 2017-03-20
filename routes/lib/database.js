const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/laforge');

const Schema = mongoose.Schema;


const temperatureDataPoint = new Schema({
  date: Date,
  temperature: Number,
});

const TemperatureDataPoint = mongoose.connection.model('TemperatureDataPoint', temperatureDataPoint);

function log(temp) {
  const tDP = new TemperatureDataPoint({
    date: new Date(),
    temperature: temp,
  });
  return tDP.save();
}

function getTemperatures(date) {
  return TemperatureDataPoint.find({
    date: {
      $gte: date,
    },
  }).then((result) => {
    const ret = [];
    result.forEach((val) => {
      ret.push({
        x: val.date,
        y: val.temperature,
      });
    });
    return ret;
  });
}

module.exports = {
  log,
  getTemperatures,
};
