const piio = process.env.NODE_ENV && process.env.NODE_ENV.search('dev') > -1 ?
    require('heating/piioDUMMY') : require('heating/piio'); // eslint-disable-line

const schedule = require('node-schedule');

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


function getTemp() {
  return piio.getCelsius();
}

function getTarget() {
  return target;
}

function setNewTarget(t) {
  target = t;
  state.value = 0.3; // TODO set dynamically
  clearTimeout(cycleTimeout);
  setImmediate(cycleControl);
}

function refreshCalendar(newJobs) {
  cancelAllJobs();
  newJobs.forEach((val) => {
    const start = Date.parse(val.start.dateTime);
    const end = Date.parse(val.end.dateTime);

        // i dindn't check for ongoing events because i
        // think thats not necessary

    jobs.push(schedule.scheduleJob(start, () => {
      setNewTarget(parseFloat(val.summary)); // Day
    }));
    jobs.push(schedule.scheduleJob(end, () => {
      setNewTarget(nightTarget); // Night
    }));
  });
}


module.exports = {
  getTemp,
  getTarget,
  setNewTarget,
  refreshCalendar,
  piio,
};
setImmediate(cycleControl);
