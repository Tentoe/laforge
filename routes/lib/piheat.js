const piio = require('./piioDUMMY');

let target = 21;

let on = false; // TODO read back value
const cycleDuration = 1000 * 60 * 10; // 10 min
const cycleDurationMargin = 1000 * 60 * 5; // 5 min

const targetTolerance = 0.5; // in °C

let lastTemp = target;


const state = {
  value: 0.5,
  step: 0.1,
  min: 0,
  max: 1,
};

let cycleTimeout = null;


function valueInTolerance(value) {
  const diff = value - target;

  if (Math.abs(diff) > targetTolerance) return false;
  return true;
}

function fixMinMax(value) {
  if (value < state.min) return state.min;
  else if (value > state.max) return state.max;

  return value;
}

function cycleControl() {
    // TODO implement heating hours


  piio.getCelsius().then((data) => {
    const targetDiv = data - target;

    const lastTempBuffer = lastTemp;
    lastTemp = data;

        // Heat/Cool until we are in targetMargin
    if (!valueInTolerance(data)) {
            // adjust state
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
                // TODO  console.log("heating to margin");
      } else {
        on = false;
        piio.setHeating(on);
                // TODO  console.log("cooling to margin");
      }

      cycleTimeout = setTimeout(cycleControl, cycleDurationMargin);
      return;
    }

        // TODO  console.log(state);


    on = !on; // TODO read back value
        // initiate cooling cycle
    piio.setHeating(on);

    const duration = on ? cycleDuration * state.value : cycleDuration * (1 - state.value);

        // TODO  console.log("Heating:" + on + "for " + duration + "ms ");
    cycleTimeout = setTimeout(cycleControl, duration);
  });
}


module.exports = {
  getTemp() {
    return piio.getCelsius();
  },
  getTarget() {
    return target;
  },
  setNewTarget(t) {
    target = t;
    state.value = 0.5; // TODO set dynamically
    clearTimeout(cycleTimeout);
    setImmediate(cycleControl);
  },
};

setImmediate(cycleControl);