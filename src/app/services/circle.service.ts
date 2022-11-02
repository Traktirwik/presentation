import { Injectable, NgZone } from '@angular/core';
import {Chart, registerables} from "chart.js";

@Injectable({
  providedIn: 'root'
})

export class CircleService {
  chart: any;
  counter:any = 1
  myDoughnutChart: any;
  data = {
    datasets: [
        {
          data: [this.counter, 10 - this.counter],
          borderColor: ['#333', '#333'],  
          backgroundColor: [
                "#2b9f1c",
                "#3866c2",
            ],
            hoverBackgroundColor: [
                "#FF4394",
                "#36A2EB",
            ]
            
            
        }]
};
  
  constructor(
    private zone: NgZone
  ) { 
  }
  drawGraph(){
    
  //@ts-ignore
this.myDoughnutChart = new Chart(document.getElementById('circle'), {
  type: 'doughnut',
  data: this.data,
  options: {
  	responsive: true,
    legend: {
      display: false
    }
  },
  plugins: [{
    beforeDraw: (chart: any)=>{
      this.befDraw(chart)
    }
}]


});
};
befDraw(chart:any) {
  var width = chart.width,
      height = chart.height,
      ctx =chart.ctx;

  ctx.restore();
  var fontSize = (height / 114).toFixed(2);
  ctx.font = fontSize + "em sans-serif";
  ctx.textBaseline = "middle";

  var text = this.counter,
      textX = Math.round((width - ctx.measureText(text).width) / 2),
      textY = height / 2;

  ctx.fillText(text, textX, textY);
  ctx.save();
}
changeCount(){
    this.counter += 1
    this.data.datasets[0].data = [this.counter, 10 - this.counter]
  
  this.myDoughnutChart.update()
    //@ts-ignore
}
}
