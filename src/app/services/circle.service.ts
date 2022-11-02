import { Injectable } from '@angular/core';
import {Chart} from "chart.js";

@Injectable({
  providedIn: 'root'
})

export class CircleService {
  chart: any;
  counter:any = 0
  myDoughnutChart: any;
  data = {
    datasets: [
        {
          data: [0, 10],
          borderWidth:0, 
          backgroundColor: [
                "#02A5FF",
                "#D9D9D9",
            ],
            hoverBackgroundColor: [
                "blue",
                "white",
            ]
        }]
};
  
  constructor() { 
  }
  drawGraph(){
    
  //@ts-ignore
this.myDoughnutChart = new Chart(document.getElementById('circle'), {
  type: 'doughnut',
  data: this.data,
  options: {
  	responsive: true,
    radius:'85%',
    cutout:'80%',
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
  const width = chart.width,
      height = chart.height,
      ctx =chart.ctx;

  ctx.restore();
  const fontSize = (height / 114).toFixed(2);
  ctx.font = fontSize + "em sans-serif";
  ctx.textBaseline = "middle";

  const text = `${this.counter<10?this.counter:10}/10`,
      textX = Math.round((width - ctx.measureText(text).width) / 2),
      textY = height / 2;

  ctx.fillText(text, textX, textY);
  ctx.save();
}

changeCount(){
    this.counter += 1
    this.data.datasets[0].data = this.counter<10?[this.counter, 10 - this.counter]:[10, 0]
    this.myDoughnutChart.update()
    //@ts-ignore
}
}
