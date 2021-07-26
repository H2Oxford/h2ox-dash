/* global mapboxgl Chart historic forecast */

//const get = document.getElementById.bind(document);
//const queryAll = document.querySelectorAll.bind(document);

const vh = Math.max(
  document.documentElement.clientHeight,
  window.innerHeight || 0
);

const MB_TOKEN =
  "pk.eyJ1IjoiY2FyZGVybmUiLCJhIjoiY2puMXN5cnBtNG53NDN2bnhlZ3h4b3RqcCJ9.eNjrtezXwvM7Ho1VSxo06w";
const MB_STYLE =
  "mapbox://styles/carderne/ckrjgvfbr8auv19nzc3fir8p9?fresh=true";

mapboxgl.accessToken = MB_TOKEN;
let map = new mapboxgl.Map({
  container: "map",
  style: MB_STYLE,
  bounds: [75.7, 11.8, 76.7, 13.0], // bbox is in order west, south, east, north
  fitBoundsOptions: {
    padding: { top: 10, bottom: vh * 0.5, left: 10, right: 10 },
  },
  maxBounds: [73, 9, 79, 15],
  minZoom: 7,
  maxZoom: 11,
});
map.dragRotate.disable();
map.touchZoomRotate.disableRotation();
map.addControl(
  new mapboxgl.ScaleControl({
    maxWidth: 200,
    unit: "metric",
  }),
  "bottom-right"
);
map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

const makeChart = (hist, pred) => {
  let chart;

  let datasets = [
    {
      label: "Historic",
      data: hist,
      lineTension: 0.3,
      borderColor: "rgba(57, 162, 174, 1)",
      backgroundColor: "rgba(57, 162, 174, 0.2)",
      borderCapStyle: "round",
      borderWidth: 4,
      pointBorderWidth: 0,
      pointBackgroundColor: "rgba(0, 0, 0, 0)",
      pointBorderColor: "rgba(0, 0, 0, 0)",
      datalabels: {
        display: false,
      },
    },
    {
      label: "Forecast",
      data: pred,
      lineTension: 0.3,
      borderColor: "rgba(157, 62, 174, 1)",
      backgroundColor: "rgba(157, 62, 174, 0.2)",
      borderCapStyle: "round",
      borderWidth: 4,
      pointBorderWidth: 0,
      pointBackgroundColor: "rgba(0, 0, 0, 0)",
      pointBorderColor: "rgba(0, 0, 0, 0)",
      datalabels: {
        display: false,
      },
    },
  ];

  if (chart == undefined) {
    chart = new Chart("chart", {
      type: "line",
      data: { datasets: datasets },
      options: {
        scales: {
          x: {
            gridLines: {
              drawBorder: false,
              lineWidth: 3,
              zeroLineWidth: 3,
              display: true,
              drawOnChartArea: false,
            },
            type: "time",
            time: {
              unit: "month",
              minUnit: "day",
              stepSize: 1,
            },
            ticks: {
              fontSize: 14,
            },
          },
          y: {
            gridLines: {
              drawBorder: false,
              lineWidth: 2,
              zeroLineWidth: 2,
            },
            ticks: {
              fontSize: 16,
              beginAtZero: true,
              maxTicksLimit: 8,
              stepSize: 30,
            },
          },
        },
        legend: {
          display: false,
        },
        showTooltips: false,
        tooltips: {
          enabled: false,
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  } else {
    chart.data.datasets.pop();
    chart.data.datasets = datasets;
    chart.update({ duration: 0 });
  }
};

makeChart(historic.kabini, forecast.kabini["2020-01-01"]);
