const fs = require('fs');
const pathreq = require('path');
const http = require('http');
const concat = require('concat-stream');

const CITY_ID = '2827989'; // TODO make dynamic
const APP_ID = fs.readFileSync(pathreq.join(process.cwd(), 'openweather.key')).toString().replace(require('os').EOL, '');
// TODO EOL regex
const host = 'api.openweathermap.org';
const path = `/data/2.5/weather?id=${CITY_ID}&units=metric&appid=${APP_ID}`;


const options = {
  host,
  path,
  method: 'GET', //TODO be a good web citizen
};


function getWeatherData() {
  return new Promise((resolve, reject) => {
    http.request(options, (response) => {
      response.pipe(concat((body) => {
                // TODO check for correctness
        const parsed = JSON.parse(body);
        resolve(parsed);
      })).on('error', e => reject(e));
    }).end();
  });
}


module.exports = {
  getWeatherData,
};
