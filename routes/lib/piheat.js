const piio = require('./piioDUMMY');
const schedule = require('node-schedule');
const logTemperature = require('./logTemperature');

const nightTarget = 17;
let target = 21;

let on = false; // TODO read back value
const cycleDuration = 1000 * 60 * 10; // 10 min
const cycleDurationMargin = 1000 * 60 * 5; // 5 min

const targetTolerance = 0.5; // in °C

let lastTemp = target;
const jobs = [];

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

function cancelAllJobs() {
  while (jobs.length > 0) {
    const job = jobs.pop();
    if (job) job.cancel();
  }
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
  refreshCalendar(newJobs) {
    cancelAllJobs();
    newJobs.forEach((val) => {
      const start = Date.parse(val.start.dateTime);
      const end = Date.parse(val.end.dateTime);
      const now = new Date();

            // do we have to heat now?
      if ((start.valueOf() < now.valueOf()) && (end.valueOf() > now.valueOf())) {
        module.exports.setNewTarget(parseFloat(val.summary));
      }

      jobs.push(schedule.scheduleJob(start, () => {
        module.exports.setNewTarget(parseFloat(val.summary)); // Day
      }));
      jobs.push(schedule.scheduleJob(end, () => {
        module.exports.setNewTarget(nightTarget); // Night
      }));
    });
  },
};


setImmediate(cycleControl);

function logger() {
  piio.getCelsius().then((temp) => {
    logTemperature.log(temp); // TODO error hanlding
  });
}
// every 10 minutes
schedule.scheduleJob('*/10 * * * *', logger);
