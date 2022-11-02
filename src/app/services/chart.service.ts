import {Injectable} from '@angular/core';
import {Chart, registerables} from "chart.js";
import ChartStreaming from "chartjs-plugin-streaming";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  chart: any;
  safetyDataSets = {
    datasets: [
      {
        backgroundColor: '#469F15',
        borderColor: '#469F15',
        borderWidth: 1,
        data: [],
        barPercentage: 1.1,
        categoryPercentage: 1.1,
      },
      {
        backgroundColor: "#DB2820",
        borderColor: "#DB2820",
        borderWidth: 1,
        data: [],
        barPercentage: 1.1,
        categoryPercentage: 1.1,
      }
    ]
  };
  productivityDataSets = {
    datasets: [
      {
        backgroundColor: '#469F15',
        borderColor: '#469F15',
        borderWidth: 1,
        data: [],
        barPercentage: 1.1,
        categoryPercentage: 1.1,
      },
      {
        backgroundColor: "#DB2820",
        borderColor: "#DB2820",
        borderWidth: 1,
        data: [],
        barPercentage: 1.1,
        categoryPercentage: 1.1,
      }
    ]
  };
  safetyChart: any = new BehaviorSubject<any[]>([
    {
      chart: 'Compliance',
      time: 0,
      title: '0'
    },
    {
      chart: 'Violation',
      time: 0,
      title: '0'
    }
  ])
  productivityChart: any = new BehaviorSubject<any[]>([
    {
      chart: 'Productive',
      time: 0,
      title: '0'
    },
    {
      chart: 'Idle',
      time: 0,
      title: '0'
    }
  ])
  safetyActiveDs: number = 0;
  productivityActiveDs: number = 0;

  constructor() {
    Chart.register(...registerables);
    Chart.register(ChartStreaming)
    Chart.defaults.set('plugins.streaming', {
      duration: 20000
    });
  }

  get getSafetyChart() {
    return this.safetyChart.asObservable();
  }

  get getProductivityChart() {
    return this.productivityChart.asObservable();
  }

  setSafetyChart(chart: string, time: number, title: any) {
    const safetyChartCopy = [...this.safetyChart.value];
    safetyChartCopy.forEach((item: any) => {
      if (item.chart === chart) {
        item.time = time;
        item.title = title
      }
    });
    this.safetyChart.next(safetyChartCopy);
  }

  setProductivityChart(chart: string, time: number, title: any) {
    const productivityChartCopy = [...this.productivityChart.value];
    productivityChartCopy.forEach((item: any) => {
      if (item.chart === chart) {
        item.time = time;
        item.title = title
      }
    });
    this.productivityChart.next(productivityChartCopy);
  }

  onRefresh(chart: 'safety' | 'productivity') {
    const now = Date.now();

    if (chart === 'safety') {
      console.log('HERE')
      const lineCount: number = this.safetyActiveDs === 0 ? -1 : 1;
      const chartName = this.safetyActiveDs === 0 ? 'Compliance' : 'Violation';
      const time = this.safetyChart.value.find((item: any) => item.chart === chartName).time;
      const timeTitle = this.convertSecondsToTime(time);
      this.setSafetyChart(chartName, time + 1, timeTitle);
      this.safetyDataSets.datasets[this.safetyActiveDs].data.push({
        // @ts-ignore
        x: now,
        // @ts-ignore
        y: lineCount
      });
    }
    else if (chart === 'productivity') {
      const lineCount: number = this.productivityActiveDs === 0 ? -1 : 1;
      const chartName = this.productivityActiveDs === 0 ? 'Productive' : 'Idle';
      const time = this.productivityChart.value.find((item: any) => item.chart === chartName).time;
      const timeTitle = this.convertSecondsToTime(time);
      this.setProductivityChart(chartName, time + 1, timeTitle);
      this.productivityDataSets.datasets[this.productivityActiveDs].data.push({
        // @ts-ignore
        x: now,
        // @ts-ignore
        y: lineCount
      });
    }
  };

  drawChart() {
    const canv = document.getElementById('canv');
    const safetyComplianceConfig = this.getSafetyComplianceConfig();

    const productivityCanvas = document.getElementById('prod-canv')
    const productivityConfig = this.getProductivityConfig();

    // @ts-ignore
    new Chart(canv, safetyComplianceConfig);
    // @ts-ignore
    new Chart(productivityCanvas, productivityConfig)
  }

  changeActiveDataSet(chart: 'safety' | 'productivity') {
    if (chart === 'safety') {
      this.safetyActiveDs = this.safetyActiveDs === 0 ? 1 : 0;
    }
    else if (chart === 'productivity') {
      this.productivityActiveDs = this.productivityActiveDs === 0 ? 1 : 0;
    }
  }

  convertSecondsToTime(time
                         :
                         number
  ) {
    const minutes = Math.floor(time / 60);
    const seconds = time - minutes * 60;
    return seconds < 10 ? minutes + ':' + '0' + seconds : minutes + ':' + seconds;
  }

  getSafetyComplianceConfig() {
    return {
      type: 'bar',
      data: this.safetyDataSets,
      options: {
        plugins: {
          title: {
            display: false,
          },
          legend: {
            display: false
          }
        },
        responsive: true,
        scales: {
          x: {
            stacked: true,
            type: 'realtime',
            realtime: {
              duration: 10000,
              refresh: 1000,
              delay: 500,
              onRefresh: () => {
                this.onRefresh('safety');
              }
            }
          },
          y: {
            stacked: true,
            min: -1,
            max: 1,
            ticks: {
              stepSize: 1
            }
          }
        },
      }
    };
  }

  getProductivityConfig() {
    return {
      type: 'bar',
      data: this.productivityDataSets,
      options: {
        plugins: {
          title: {
            display: false,
          },
          legend: {
            display: false
          }
        },
        responsive: true,
        scales: {
          x: {
            stacked: true,
            type: 'realtime',
            realtime: {
              duration: 10000,
              refresh: 1000,
              delay: 500,
              onRefresh: () => {
                this.onRefresh('productivity');
              }
            }
          },
          y: {
            stacked: true,
            min: -1,
            max: 1,
            ticks: {
              stepSize: 1
            }
          }
        },
      }
    };
  }
}
