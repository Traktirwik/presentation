import {Component, OnInit} from '@angular/core';
import {Chart, registerables} from 'chart.js';
import 'chartjs-adapter-moment';
import ChartStreaming from 'chartjs-plugin-streaming';


Chart.register(...registerables);
Chart.register(ChartStreaming)

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'triggers';
  data: any =
    {
      labels: ["work", "idle"],
      datasets: [
        {
          label: 'work',
          borderColor: '#3e95cd',
          data: [],
          fill: false
        },
        {
          label: 'idle',
          borderColor: "#8e5ea2",
          data: [],
          fill: false
        }
      ]
    }
    activeLine: number = 0;


  ngOnInit(): void {
    Chart.defaults.set('plugins.streaming', {
      duration: 20000
    });

    const onRefresh = (chart: any) => {
      const now = Date.now();
      const lineCount = this.activeLine === 0 ? 1 : 2;
      console.log(this.data.datasets[0])

      this.data.datasets[this.activeLine].data.push({
        x: now,
        y: lineCount
      });
    };

    const canv = document.getElementById('canv');
    const config = {
      type: 'line',
      data: this.data,
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Person working or not'
          }
        },
        scales: {
          x: {
            type: 'realtime',
            realtime: {
              duration: 20000,
              refresh: 2000,
              delay: 2000,
              onRefresh: onRefresh
            }
          },
          y: {
            min: 0,
            max: 4,
            ticks: {
              // forces step size to be 50 units
              stepSize: 1
            }
          }
        },
        interaction: {
          intersect: false
        },
      }
    };

    // @ts-ignore
    new Chart(canv, config);

  }

  changeActiveLine() {
    this.activeLine = this.activeLine === 0 ? 1 : 0;
    console.log(this.activeLine)
    console.log(this.data.datasets[0].data);
    if (this.activeLine === 0) {
      setTimeout(() => {
        this.data.datasets[0].data.pop()
        console.log('TIMEOUT WORKED')
      }, 2000)
    }
  }


}
