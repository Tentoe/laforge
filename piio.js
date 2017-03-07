var fs = require("fs");

var tempSensor = "/sys/bus/w1/devices/28-80000026cc60/w1_slave";

var Gpio = require("onoff").Gpio;
var radiator = new Gpio(18, "low");

function readSensor(resolve, reject) {
    fs.readFile(tempSensor, "utf8", function(err, data) {
        if (err) reject(err);
        else resolve(data);
    });
};



module.exports = {
    getCelsius: function() {
        return new Promise(readSensor)
            .then(function() { //we dont need the data from the first read
                return new Promise(readSensor);
            })
            .then(function(data) {
                var lines = data.split("\n");
                return parseFloat(lines[1].split("t=")[1]) / 1000.0;
            });

    },
    setHeating: function(on) {
        return new Promise(function(resolve, reject) {
            radiator.write(on ? 1 : 0, function(err) {
                if (err) reject(err);
                else resolve(on);
            });
        });
    }
}
