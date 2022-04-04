/* global Vue mapboxgl Chart */

import { makeChart, trendLineConfig } from "./chart.js";
import { dams, checkBoxes } from "./data.js";
import reservoirs from "./reservoirs.js";

// Global variables and helpers
let chart;
const updateChart = (data) => {
  const [prediction, historic] = data;
  chart = makeChart(chart, prediction, historic);
};
const date = "2021-09-08";

const baseUrl = window.location.href.includes("h2ox")
  ? "https://h2ox-api-kdjsv6lupq-ez.a.run.app/api/"
  : "http://localhost:5111/api/";

const getHeaders = () => {
  const headers = new Headers();
  const username = "wave2web";
  const password = "climateemergency";
  const userPassEnc = btoa(`${username}:${password}`);
  headers.set("Authorization", `Basic ${userPassEnc}`);
  return headers;
};

const fetchOptions = { method: "GET", headers: getHeaders() };

const loadData = (activeReservoir) => {
  const urlPrediction = new URL(`${baseUrl}prediction`);
  const urlHistoric = new URL(`${baseUrl}historic`);
  [urlPrediction, urlHistoric].forEach((url) => {
    url.searchParams.append("reservoir", activeReservoir);
    url.searchParams.append("date", date);
  });

  Promise.all([
    fetch(urlPrediction, fetchOptions).then((resp) => resp.json()),
    fetch(urlHistoric, fetchOptions).then((resp) => resp.json()),
  ]).then((data) => updateChart(data));
};

Vue.component("Trend", {
  props: {
    data: {
      type: Array,
      default: () => [],
    },
  },
  watch: {
    data: function () {
      this.makeChart();
    },
  },
  methods: {
    makeChart() {
      const canvas = this.$refs.canvas.getContext("2d");
      const config = trendLineConfig(this.data);
      // eslint-disable-next-line
      new Chart(canvas, config);
    },
  },
  template: `
    <div>
      <canvas ref="canvas" width="0" height="0"></canvas>
    </div>
  `,
});

// Vue app for dam selectors and info
const app = new Vue({
  el: "#body",
  data: {
    dams: dams,
    active: dams[0].name,
    levels: dams.reduce((acc, el) => ((acc[el.name] = el.level), acc), {}),
    checks: checkBoxes,
    lastUpdate: date,
    fc: dams.reduce((acc, el) => ((acc[el.name] = []), acc), {}),
    search: "",
  },
  computed: {
    searchLow: function () {
      return this.search.toLowerCase();
    },
    includeRes: function () {
      return this.dams
        .filter((d) => d.name.toLowerCase().includes(this.searchLow))
        .map((d) => d.name);
    },
  },
  watch: {
    active: function () {
      loadData(this.active);
    },
  },
  methods: {
    update: function (layers, checked) {
      layers.forEach((lay) => {
        // eslint-disable-next-line no-use-before-define
        map.setLayoutProperty(lay, "visibility", checked ? "visible" : "none");
      });
    },
  },
});

mapboxgl.accessToken =
  "pk.eyJ1IjoiY2FyZGVybmUiLCJhIjoiY2puMXN5cnBtNG53NDN2bnhlZ3h4b3RqcCJ9.eNjrtezXwvM7Ho1VSxo06w";
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/carderne/ckrjgvfbr8auv19nzc3fir8p9?fresh=true",
  bounds: [73.94, 11.18, 83.35, 14.04], // bbox is in order west, south, east, north
  maxBounds: [71, 7, 86, 17],
  minZoom: 5,
  maxZoom: 11,
});
map.dragRotate.disable();
map.touchZoomRotate.disableRotation();

const getAllLevels = () => {
  const latest = (data) => {
    const [levels, predictions] = data;
    levels.forEach((el) => {
      const name = el.reservoir;
      app.levels[name] = el.volume;
    });
    predictions.forEach((el) => {
      const fc = el.prediction.map((f) => f.level);
      app.fc[el.reservoir] = fc;
    });
  };

  const urlLevels = new URL(`${baseUrl}levels`);
  const urlPredictions = new URL(`${baseUrl}predictions`);
  urlPredictions.searchParams.append("date", app.lastUpdate);

  Promise.all([
    fetch(urlLevels, fetchOptions).then((resp) => resp.json()),
    fetch(urlPredictions, fetchOptions).then((resp) => resp.json()),
  ]).then((data) => latest(data));
};

const pointer = () => (map.getCanvas().style.cursor = "pointer");
const nopointer = () => (map.getCanvas().style.cursor = "");

const handleClick = (e) => {
  e.preventDefault();
  const clickedName = e.features[0].properties.name;
  if (dams.map((el) => el.name).includes(clickedName)) app.active = clickedName;
};

map.on("load", () => {
  map.addSource("res", {
    type: "geojson",
    data: reservoirs,
  });
  map.addLayer({
    id: "res",
    type: "fill",
    source: "res",
    paint: {
      "fill-color": "#0ee1e1",
      "fill-opacity": 0.9,
    },
  });
  map.addLayer({
    id: "res-line",
    type: "line",
    source: "res",
    paint: {
      "line-color": "#4e6af9",
      "line-width": 2,
    },
  });
  map.addLayer({
    id: "res-name",
    type: "symbol",
    source: "res",
    layout: {
      "text-field": "{label}",
      "text-size": ["interpolate", ["linear"], ["zoom"], 5, 8, 11, 26],
    },
    paint: {
      "text-halo-width": 3,
      "text-halo-color": "#ccfffc",
      "text-halo-blur": 3,
      "text-color": "#000",
    },
  });

  map.on("mouseenter", "res", pointer);
  map.on("mouseleave", "res", nopointer);
  map.on("click", "res", handleClick);
  map.on("click", "res-line", handleClick);
  map.on("click", "res-name", handleClick);
});

// Load data on first load
loadData(app.active);
getAllLevels();
