var piio = require("./piio");

var target = 21;

var on = false; //TODO read back value
var cycleDuration = 1000 * 60 * 10; //10 min
var cycleDurationMargin = 1000 * 60 * 5; //5 min

var targetTolerance = 0.5; //in °C

var lastTemp = target;


var state = {
    value: 0.5,
    step: 0.1,
    min: 0,
    max: 1
};

var cycleTimeout = null;


function valueInTolerance(value) {

    var diff = value - target;

    if (Math.abs(diff) > targetTolerance) return false;
    else return true;
};

function fixMinMax(value) {
    if (value < state.min) return state.min;
    else if (value > state.max) return state.max;

    return value;
};

function cycleControl() {
    //TODO implement heating hours


    piio.getCelsius().then(function(data) {



        var targetDiv = data - target;

        var lastTempBuffer = lastTemp;
        lastTemp = data;

        //Heat/Cool until we are in targetMargin
        if (!valueInTolerance(data)) {
            //adjust state
            if (valueInTolerance(lastTempBuffer)) {

                if (targetDiv < 0) {
                    state.value += state.step;
                } else {
                    state.value -= state.step;
                }

                state.value = fixMinMax(state.value);
            }


            if (targetDiv < 0) {
                on = true;
                piio.setHeating(on);
                console.log("heating to margin");
            } else {
                on = false;
                piio.setHeating(on);
                console.log("cooling to margin");
            }

            cycleTimeout = setTimeout(cycleControl, cycleDurationMargin);
            return;
        }

        console.log(state);


        on = !on; //TODO read back value
        //initiate cooling cycle
        piio.setHeating(on);

        var duration = on ? cycleDuration * state.value : cycleDuration * (1 - state.value);

        console.log("Heating:" + on + "for " + duration + "ms ");
        cycleTimeout = setTimeout(cycleControl, duration);
    });
};


module.exports = {
    getTemp: function() {
        return piio.getCelsius();
    },
    getTarget: function() {
        return target
    },
    setNewTarget: function(t) {
        target = t;
        state.value = 0.5; //TODO set dynamically
        clearTimeout(cycleTimeout);
        setImmediate(cycleControl);
    }
}

setImmediate(cycleControl);
