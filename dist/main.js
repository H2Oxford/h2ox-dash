/* global Vue mapboxgl */

import { makeChart } from "./chart.js";
import { dams, checkBoxes } from "./data.js";

const get = document.getElementById.bind(document);

// Global variables and helpers
let chart;
const updateChart = (data) => {
  chart = makeChart(data, chart);
};
let date = "2021-09-08";
let history = 180;

// Vue app for dam selectors and info
const appDams = new Vue({
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
});

// Vue app for map layer check boxes
// eslint-disable-next-line no-unused-vars
const appChecks = new Vue({
  el: "#layers",
  data: {
    checks: checkBoxes,
  },
  methods: {
    update: function (layers, checked) {
      layers.forEach((lay) => {
        console.log(lay, checked);
        map.setLayoutProperty(lay, "visibility", checked ? "visible" : "none");
      });
    },
  },
});

// Date and history depth still managed manually
get("date").onchange = (e) => {
  date = e.target.value;
  loadData(updateChart);
  updateLatest();
};

get("history").onchange = (e) => {
  history = parseInt(e.target.value);
  loadData(updateChart);
};

// Mapbox stuff
mapboxgl.accessToken =
  "pk.eyJ1IjoiY2FyZGVybmUiLCJhIjoiY2puMXN5cnBtNG53NDN2bnhlZ3h4b3RqcCJ9.eNjrtezXwvM7Ho1VSxo06w";
let map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/carderne/ckrjgvfbr8auv19nzc3fir8p9?fresh=true",
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
  const clickedName = e.features[0].properties.label
    .split(" ")[0]
    .toLowerCase();
  if (dams.map((el) => el.name).includes(clickedName))
    appDams.active = clickedName;
  else console.log("This dam hasn't been set up");
};

// Data stuff
const loadData = (fn, parDam = null, parHistory = null) => {
  const url = window.location.href.includes("h2ox")
    ? new URL("https://h2ox-api.herokuapp.com/api/")
    : new URL("http://localhost:5111/api/");
  url.searchParams.append("reservoir", parDam || appDams.active);
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
    appDams.levels[name] = data.historic.slice(-1)[0].volume;
    appDams.futs[name] = data.forecast.slice(-1)[0].y;
  }
};

const updateLatest = () => {
  dams.forEach((d) => {
    loadData(latest, d.name);
  });
};

// Load data on first load
loadData(updateChart);
updateLatest();
