/* global Chart */
/* eslint no-param-reassign: 0 */

const conf = (data, direction) => {
  const s = direction === "up" ? 1 : -1;
  const power = 0.4;
  const growth = s * (Math.random() * 0.003 + 0.01);
  const noise = s * 0.001;
  return data.map((row, i) => ({
    x: row.x,
    y: Math.max(0, row.y * (1 + i ** power * (Math.random() * noise + growth))),
  }));
};

export const makeChart = (chart, prediction, historic) => {
  const predParsed = prediction.map((el) => ({ x: el.date, y: el.value }));
  const up = conf(predParsed, "up");
  const down = conf(predParsed, "down");

  const datasets = [
    {
      label: "Volume",
      data: historic.map((el) => ({ x: el.date, y: el.value })),
      fill: true,
      lineTension: 0.3,
      borderColor: "rgba(151, 189, 61, 1)",
      backgroundColor: "rgba(151, 189, 61, 0.15)",
      borderCapStyle: "round",
      pointBorderWidth: 0,
      borderWidth: 4,
    },
    {
      label: "Prediction",
      data: predParsed,
      fill: false,
      lineTension: 0.3,
      borderColor: "rgba(240, 171, 0, 1)",
      backgroundColor: "rgba(240, 171, 0, 0.15)",
      borderCapStyle: "round",
      pointBorderWidth: 0,
      borderWidth: 6,
    },
    {
      label: "",
      data: up,
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
      label: "",
      data: down,
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
  ];

  if (chart === undefined) {
    chart = new Chart("chart", {
      type: "line",
      data: { datasets: datasets },
      options: {
        plugins: {
          legend: {
            display: true,
            labels: {
              filter: function (legendItem, chartData) {
                return chartData.datasets[legendItem.datasetIndex].label;
              },
            },
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
              text: "Reservoir capacity (MMC)",
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
          y1: {
            title: {
              display: true,
              text: "Precipitation",
              color: "rgba(0, 11, 200, 1)",
            },
            position: "right",
            grid: {
              drawOnChartArea: false,
            },
            ticks: {
              color: "rgba(0, 11, 200, 1)",
            },
          },
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
  return chart;
};

export const trendLineConfig = (data) => {
  const increasing = data.slice(-1)[0] - data[0] >= 0;
  const color = increasing ? "rgb(21, 128, 61)" : "rgb(185, 28, 28)";
  const dataset = {
    labels: Array(data.length)
      .fill()
      .map((_, i) => i),
    datasets: [
      {
        label: "",
        data: data,
        fill: false,
        borderColor: color,
        tension: 0.1,
        radius: 0,
      },
    ],
  };

  const config = {
    type: "line",
    data: dataset,
    options: {
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
        },
      },
      layout: {
        padding: 4,
      },
      scales: {
        x: {
          display: false,
        },
        y: {
          display: false,
        },
      },
    },
  };
  return config;
};
