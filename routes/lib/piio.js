const fs = require('fs');

const tempSensor = '/sys/bus/w1/devices/28-80000026cc60/w1_slave';

const Gpio = require('onoff').Gpio;
const radiator = new Gpio(18, 'low');

function readSensor(resolve, reject) {
  fs.readFile(tempSensor, 'utf8', (err, data) => {
    if (err) reject(err);
    else resolve(data);
  });
}


module.exports = {
  getCelsius() {
    return new Promise(readSensor)
            .then(() =>  // we dont need the data from the first read
               new Promise(readSensor))
            .then((data) => {
              const lines = data.split('\n');
              return parseFloat(lines[1].split('t=')[1]) / 1000.0;
            });
  },
  setHeating(on) {
    return new Promise((resolve, reject) => {
      radiator.write(on ? 1 : 0, (err) => {
        if (err) reject(err);
        else resolve(on);
      });
    });
  },
};
