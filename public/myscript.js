/* eslint-env browser, jquery */
// Knob
function setNewTarget(target) {
  $('#newTarget').text(`target ${target}°C`);
}

$(() => {
  $('.knob').knob({
    change() {
      setNewTarget($('#target').val());
    },
  });
  setNewTarget($('#target').val());


  function newDate(minutes) {
    return new Date(Date.now() + (1000 * 60 * minutes));
  }

  const dataArr = [];

  dataArr.push({
    x: newDate(-1),
    y: (Math.random() * 30) + 10,
  });

  for (let i = 0; i < 50; i++) { // eslint-disable-line no-plusplus
    dataArr.push({
      x: newDate(i * 5),
      y: dataArr[dataArr.length - 1].y + (Math.random() - 0.5),
    });
  }

    // Chart
  const data = {
    datasets: [{
      label: 'temperature',
      lineTension: 0.2,
      backgroundColor: 'rgba(255, 0, 0, 0.3)',
      borderColor: 'rgba(255, 0, 0, 1)',
      borderCapStyle: 'butt',
      borderDash: [],
      borderDashOffset: 0.0,
      borderJoinStyle: 'miter',
      pointBorderColor: 'rgba(255, 0, 0, 1)',
      pointBackgroundColor: '#fff',
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: 'rgba(255, 0, 0, 1)',
      pointHoverBorderColor: 'rgba(220,220,220,1)',
      pointHoverBorderWidth: 2,
      pointRadius: 1,
      pointHitRadius: 10,
      data: dataArr,
    }],
  };

  const config = {
    type: 'line',
    data,
    options: {
      responsive: true,
      scales: {
        xAxes: [{
          type: 'time',
          display: true,
          ticks: {
            autoSkip: true,
            autoSkipPadding: 10,
          },
        }],
        yAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: '°C',
          },
        }],

      },
    },
  };


  const ctx = document.getElementById('myChart');

  const myChart = new Chart(ctx, config); // eslint-disable-line no-undef,no-unused-vars
});
