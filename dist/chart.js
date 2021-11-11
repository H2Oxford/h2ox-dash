/* global Chart */

export const makeChart = (data, chart) => {
  let datasets = [
    {
      label: "Precipitation",
      data: data.prec,
      fill: false,
      lineTension: 0.3,
      borderColor: "rgba(0, 11, 200, 1)",
      backgroundColor: "rgba(0, 11, 200, 1)",
      borderCapStyle: "round",
      pointBorderWidth: 0,
      borderWidth: 1,
      radius: 0,
      yAxisID: "y1",
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
      label: "",
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
      label: "",
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
  ];

  if (chart == undefined) {
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
