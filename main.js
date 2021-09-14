/* global mapboxgl Chart */

const get = document.getElementById.bind(document);

const MB_TOKEN =
  "pk.eyJ1IjoiY2FyZGVybmUiLCJhIjoiY2puMXN5cnBtNG53NDN2bnhlZ3h4b3RqcCJ9.eNjrtezXwvM7Ho1VSxo06w";
const MB_STYLE =
  "mapbox://styles/carderne/ckrjgvfbr8auv19nzc3fir8p9?fresh=true";

const dateSelect = get("date");

let dam = "krisharaja";
let date = "2020-01-01";

const setDate = (e) => {
  date = e.target.value;
  loadData(makeChart);
  updateLatest();
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
  "check-riv": ["rivers"],
  "check-basins": ["basins"],
  "check-aqueduct": ["aqueduct"],
  "check-precip": ["precip"],
  "check-benga": ["bengaluru"],
  "check-canal": ["canal-line"],
};
Object.entries(checkBoxes).forEach(([key, layers]) => {
  get(key).onchange = (e) => {
    setLayerVis(e, layers);
  };
});

const reservoirs = [
  "Krisharaja Sagar",
  "Harangi",
  "Hemavathy",
  "Kabini",
  //"Bhadra",
  //"Lower Bhawani",
];

mapboxgl.accessToken = MB_TOKEN;
let map = new mapboxgl.Map({
  container: "map",
  style: MB_STYLE,
  bounds: [73.94, 11.18, 83.35, 14.04], // bbox is in order west, south, east, north
  maxBounds: [71, 7, 86, 17],
  minZoom: 5,
  maxZoom: 11,
});
map.dragRotate.disable();
map.touchZoomRotate.disableRotation();

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
  dam = name.split(" ")[0].toLowerCase();
  const code = dam.slice(0, 3);
  clearColors();
  get("but-" + code).classList.add("selected");
  loadData(makeChart);
};

let chart;
Chart.defaults.font.size = 16;
const makeChart = (data) => {
  let datasets = [
    {
      label: "Forecast",
      data: data.forecast,
      fill: false,
      lineTension: 0.3,
      borderColor: "rgba(240, 171, 0, 1)",
      backgroundColor: "rgba(240, 171, 0, 0.15)",
      borderCapStyle: "round",
      pointBorderWidth: 0,
      borderWidth: 6,
    },
    {
      label: "Down",
      data: data.forecastUp,
      fill: "+1",
      lineTension: 0.3,
      borderColor: "rgba(240, 171, 0, 1)",
      backgroundColor: "rgba(240, 171, 0, 0.15)",
      borderCapStyle: "round",
      pointBorderWidth: 0,
      borderWidth: 1,
      radius: 0,
      legend: false,
    },
    {
      label: "Up",
      data: data.forecastDown,
      fill: false,
      hidden: false,
      lineTension: 0.3,
      borderColor: "rgba(240, 171, 0, 1)",
      backgroundColor: "rgba(240, 171, 0, 0.15)",
      borderCapStyle: "round",
      pointBorderWidth: 0,
      borderWidth: 1,
      radius: 0,
    },
    {
      label: "Historic",
      data: data.historic,
      fill: true,
      lineTension: 0.3,
      borderColor: "rgba(151, 189, 61, 1)",
      backgroundColor: "rgba(151, 189, 61, 0.15)",
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
        plugins: {
          legend: {
            display: false,
          },
        },
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
            title: {
              display: true,
              text: "Reservoir capacity (TMC)",
            },
            suggestedMin: 0,
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

const loadData = (fn, parDam = null, history = 180) => {
  const url = window.location.href.includes("h2ox")
    ? new URL("https://h2ox-api.herokuapp.com/api/")
    : new URL("http://localhost:5000/api/");
  url.searchParams.append("reservoir", parDam || dam);
  url.searchParams.append("date", date);
  url.searchParams.append("history", history);

  let headers = new Headers();
  let username = "wave2web";
  let password = "climateemergency";
  headers.set("Authorization", "Basic " + btoa(username + ":" + password));

  fetch(url, {
    method: "GET",
    headers: headers,
  })
    .then((response) => response.json())
    .then((data) => fn(data, parDam));
};

const handleButClick = (e) => {
  e.preventDefault();
  const name = e.currentTarget.children[0].innerText;
  dam = name.split(" ")[0].toLowerCase();
  clearColors();
  e.currentTarget.classList.add("selected");
  loadData(makeChart);
};

const latest = (data, name) => {
  if (data.historic) {
    const max = Math.max(...data.historic.map((el) => parseFloat(el.y)));
    const level = data.historic.slice(-1)[0].y;
    const fut = data.forecast.slice(-1)[0].y;

    const code = name.slice(0, 3);
    const divlev = get("lev-" + code);
    const divarr = get("dir-" + code);

    divlev.innerHTML = level + " <small>TMC</small>";
    divlev.style = "color:" + (level > max * 0.5 ? "green" : "red");
    divarr.innerText = fut > level ? "↑" : "↓";
    divarr.style = "color:" + (fut > level ? "green" : "red");
  }
};

const clearColors = () => {
  reservoirs.forEach((res) => {
    const name = res.split(" ")[0].toLowerCase();
    const code = name.slice(0, 3);
    get("but-" + code).classList.remove("selected");
  });
};

const updateLatest = () => {
  reservoirs.forEach((res) => {
    const name = res.split(" ")[0].toLowerCase();
    const code = name.slice(0, 3);
    get("but-" + code).onclick = handleButClick;
    loadData(latest, name, 3000);
  });
};

loadData(makeChart);
updateLatest();
