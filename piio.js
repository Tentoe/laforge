var fs = require("fs");

var tempSensor = "/sys/bus/w1/devices/28-80000026cc60/w1_slave";

var Gpio = require("onoff").Gpio;
var radiator = new Gpio(18, "low");


module.exports.getCelsius = function(callback) {
    fs.readFileSync(tempSensor);
    fs.readFile(tempSensor, "utf8", function(err, data) {
        if (err) {
            return console.log(err);
        }
        var lines = data.split("\n");
        var temp = parseFloat(lines[1].split("t=")[1]) / 1000.0;
        if (callback) callback(null, temp);
    });
};
