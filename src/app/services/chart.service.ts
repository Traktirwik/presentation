import {Injectable} from '@angular/core';
import {Chart, registerables} from "chart.js";
import ChartStreaming from "chartjs-plugin-streaming";

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  chart: any;
  data: any =
    {
      datasets: [
        {
          label: 'work',
          backgroundColor: '#3e95cd',
          borderColor: '#3e95cd',
          borderWidth: 1,
          data: [],
          barPercentage: 1.1,
          categoryPercentage: 1.1,
        },
        {
          label: 'idle',
          backgroundColor: "#8e5ea2",
          borderColor: "#8e5ea2",
          borderWidth: 1,
          data: [],
          barPercentage: 1.1,
          categoryPercentage: 1.1,
        }
      ]
    }
  activeLine: number = 0;


  constructor() {
    Chart.register(...registerables);
    Chart.register(ChartStreaming)
    Chart.defaults.set('plugins.streaming', {
      duration: 20000
    });
  }

  onRefresh() {
    const now = Date.now();
    const lineCount = this.activeLine === 0 ? -1 : 1;
    console.log(this.data.datasets[0])

    this.data.datasets[this.activeLine].data.push({
      x: now,
      y: lineCount
    });
  };

  drawChart() {
    const canv = document.getElementById('canv');
    const config = {
      type: 'bar',
      data: this.data,
      options: {
        plugins: {
          title: {
            display: true,
            text: 'person working or not'
          },
        },
        responsive: true,
        scales: {
          x: {
            stacked: true,
            type: 'realtime',
            realtime: {
              duration: 20000,
              refresh: 1000,
              delay: 500,
              onRefresh: () => {
                this.onRefresh();
              }
            }
          },
          y: {
            stacked: true,
            min: -1,
            max: 1,
            ticks: {
              // forces step size to be 50 units
              stepSize: 1
            }
          }
        },
      }
    };
    // @ts-ignore
    this.chart = new Chart(canv, config);
  }

  changeActiveLine() {
    this.activeLine = this.activeLine === 0 ? 1 : 0;
  }


}
