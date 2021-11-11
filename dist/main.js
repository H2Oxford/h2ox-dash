/* global Vue mapboxgl */

import { makeChart } from "./chart.js";

const updateChart = (data) => {
  chart = makeChart(data, chart);
};

const get = document.getElementById.bind(document);
let chart;

const MB_TOKEN =
  "pk.eyJ1IjoiY2FyZGVybmUiLCJhIjoiY2puMXN5cnBtNG53NDN2bnhlZ3h4b3RqcCJ9.eNjrtezXwvM7Ho1VSxo06w";
const MB_STYLE =
  "mapbox://styles/carderne/ckrjgvfbr8auv19nzc3fir8p9?fresh=true";

const dateSelect = get("date");
const historySelect = get("history");

let date = "2021-09-08";
let history = 180;

const dams = [
  {
    name: "krishnaraja",
    label: "Krishnaraja Sagar",
    max: 1163,
    level: 560,
    fut: 100,
    sel: true,
  },
  {
    name: "harangi",
    label: "Harangi",
    max: 220,
    level: 180,
    fut: 10,
    sel: false,
  },
  {
    name: "hemavathy",
    label: "Hemavathy",
    max: 927,
    level: 300,
    fut: 100,
    sel: false,
  },
  {
    name: "kabini",
    label: "Kabini",
    max: 444,
    level: 90,
    fut: 10,
    sel: false,
  },
  {
    name: "bhadra",
    label: "Bhadra",
    max: 1785,
    level: 1500,
    fut: 100,
    sel: false,
  },
  {
    name: "lower",
    label: "Lower Bhawani",
    max: 792,
    level: 400,
    fut: 100,
    sel: false,
  },
];

// eslint-disable-next-line no-unused-vars
const app = new Vue({
  el: "#dams",
  data: {
    dams: dams,
    active: dams[0].name,
    levels: dams.reduce((acc, el) => ((acc[el.name] = el.level), acc), {}),
    futs: dams.reduce((acc, el) => ((acc[el.name] = el.fut), acc), {}),
  },
  watch: {
    active: function () {
      loadData(updateChart);
    },
  },
  computed: {
    dirs: function () {
      return this.dams.reduce(
        (acc, el) => (
          (acc[el.name] = this.futs[el.name] > this.levels[el.name]), acc
        ),
        {}
      );
    },
    dirSymbs: function () {
      return this.dams.reduce(
        (acc, el) => (
          (acc[el.name] =
            this.futs[el.name] > this.levels[el.name] ? "↑" : "↓"),
          acc
        ),
        {}
      );
    },
  },
  methods: {},
});

const setDate = (e) => {
  date = e.target.value;
  loadData(updateChart);
  updateLatest();
};
dateSelect.onchange = setDate;

const setHistory = (e) => {
  history = parseInt(e.target.value);
  loadData(updateChart);
};
historySelect.onchange = setHistory;

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

const pointer = () => (map.getCanvas().style.cursor = "pointer");
const nopointer = () => (map.getCanvas().style.cursor = "");

map.on("load", () => {
  map.on("mouseenter", "res-fill", pointer);
  map.on("mouseleave", "res-fill", nopointer);
  map.on("mouseenter", "res-line", pointer);
  map.on("mouseleave", "res-line", nopointer);
  map.on("mouseenter", "res-name", pointer);
  map.on("mouseleave", "res-name", nopointer);
  map.on("click", "res-fill", handleClick);
  map.on("click", "res-line", handleClick);
  map.on("click", "res-name", handleClick);
});

const handleClick = (e) => {
  e.preventDefault();
  app.active = e.features[0].properties.DAM_NAME.split(" ")[0].toLowerCase();
  loadData(updateChart);
};

const loadData = (fn, parDam = null, parHistory = null) => {
  const url = window.location.href.includes("h2ox")
    ? new URL("https://h2ox-api.herokuapp.com/api/")
    : new URL("http://localhost:5111/api/");
  url.searchParams.append("reservoir", parDam || app.active);
  url.searchParams.append("date", date);
  url.searchParams.append("history", parHistory || history);

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

const latest = (data, name) => {
  if (data.historic) {
    app.levels[name] = data.historic.slice(-1)[0].y;
    app.futs[name] = data.forecast.slice(-1)[0].y;
  }
};

const updateLatest = () => {
  dams.forEach((d) => {
    loadData(latest, d.name, 3000);
  });
};

loadData(updateChart);
updateLatest();
