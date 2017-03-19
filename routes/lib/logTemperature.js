const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/laforge');

const Schema = mongoose.Schema;

const temperatureDataPoint = new Schema({
  date: Date,
  temperature: Number,
});

const TemperatureDataPoint = mongoose.connection.model('TemperatureDataPoint', temperatureDataPoint);

module.exports = {
  log(temp) {
    const tDP = new TemperatureDataPoint({
      date: new Date(),
      temperature: temp,
    });
    return tDP.save();
  },
};
