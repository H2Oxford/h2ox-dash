/* global mapboxgl Chart historic forecast */

const get = document.getElementById.bind(document);
//const queryAll = document.querySelectorAll.bind(document);

const vh = Math.max(
  document.documentElement.clientHeight,
  window.innerHeight || 0
);

const MB_TOKEN =
  "pk.eyJ1IjoiY2FyZGVybmUiLCJhIjoiY2puMXN5cnBtNG53NDN2bnhlZ3h4b3RqcCJ9.eNjrtezXwvM7Ho1VSxo06w";
const MB_STYLE =
  "mapbox://styles/carderne/ckrjgvfbr8auv19nzc3fir8p9?fresh=true";

const chartTitle = get("chart-title");
const dateSelect = get("date");

let dam = "kabini";
let date = "2020-01-01";

const setDate = (e) => {
  date = e.target.value;
  makeChart(dam, date);
};
dateSelect.onchange = setDate;

const setLayerVis = (e, layers) => {
  const vis = e.target.checked ? "visible" : "none";
  layers.forEach((lay) => {
    map.setLayoutProperty(lay, "visibility", vis);
  });
};
const checkBoxes = {
  "check-res": ["res-fill", "res-line", "res-name"],
  "check-basins": ["basins", "basins-down"],
  "check-aqueduct": ["aqueduct"],
};
Object.entries(checkBoxes).forEach(([key, layers]) => {
  get(key).onchange = (e) => {
    setLayerVis(e, layers);
  };
});

mapboxgl.accessToken = MB_TOKEN;
let map = new mapboxgl.Map({
  container: "map",
  style: MB_STYLE,
  bounds: [75.7, 11.8, 76.7, 13.4], // bbox is in order west, south, east, north
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

map.on("load", () => {
  map.on("mouseenter", "res-fill", () => {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", "res-fill", () => {
    map.getCanvas().style.cursor = "";
  });

  map.on("click", "res-fill", handleClick);
});

const handleClick = (e) => {
  e.preventDefault();
  const name = e.features[0].properties.DAM_NAME;
  chartTitle.innerText = name;
  dam = name.split(" ")[0].toLowerCase();
  console.log(name);
  makeChart();
};

let chart;
const makeChart = () => {
  let hist = historic[dam];
  let fore = forecast[dam][date];

  hist = hist.filter(
    (it) => it.x >= "2019-01-01" && it.x < fore[fore.length - 1].x
  );

  let datasets = [
    {
      label: "Forecast",
      data: fore,
      fill: true,
      lineTension: 0.3,
      borderColor: "rgba(157, 62, 174, 1)",
      backgroundColor: "rgba(157, 62, 174, 0.2)",
      borderCapStyle: "round",
      pointBorderWidth: 0,
      borderWidth: 8,
    },
    {
      label: "Historic",
      data: hist,
      fill: true,
      lineTension: 0.3,
      borderColor: "rgba(57, 162, 174, 1)",
      backgroundColor: "rgba(57, 162, 174, 0.2)",
      borderCapStyle: "round",
      pointBorderWidth: 0,
      borderWidth: 4,
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
            suggestedMin: 0,
            suggestedMax: 50,
            gridLines: {
              drawBorder: false,
              lineWidth: 2,
              zeroLineWidth: 2,
            },
            ticks: {
              fontSize: 16,
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

makeChart(dam, date);
