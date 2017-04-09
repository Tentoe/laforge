const piio = process.env.NODE_ENV && process.env.NODE_ENV.search('dev') > -1 ?
    require('heating/piioDUMMY') : require('heating/piio'); // eslint-disable-line

const schedule = require('node-schedule');

const nightTarget = 17;
let target = 21;

const cycleDuration = 1000 * 60 * 10; // 10 min

const targetTolerance = 0.5; // in °C

const jobs = [];

const state = {
  value: 0.5,
  step: 0.1,
  min: 0,
  max: 1,
};

let cycleTimeout = null;


function cycleControl() {
  piio.getCelsius().then(
        (data) => {
          const diff = data - target;
          if (diff < -targetTolerance) piio.setHeating(true);
          else piio.setHeating(false);
        });
  cycleTimeout = setTimeout(cycleControl, cycleDuration);
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
