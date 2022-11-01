import {Component, OnInit} from '@angular/core';
import { Camera } from '@mediapipe/camera_utils';
import { HAND_CONNECTIONS, Holistic, POSE_CONNECTIONS } from '@mediapipe/holistic';

import {Chart, registerables} from 'chart.js';
import 'chartjs-adapter-moment';
import ChartStreaming from 'chartjs-plugin-streaming';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';


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
this.getVideoStream();

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

  getVideoStream() {
    const videoElement:any = document.getElementsByClassName('input_video')[0];
    const canvasElement:any = document.getElementsByClassName('output_canvas')[0];
    const canvasCtx = canvasElement.getContext('2d');
    
    function onResults(results:any) {
      console.log(results.poseLandmarks)
      let allVisibleLandmarks = results.poseLandmarks?.map((el:any)=>el.visibility>0.0001?{...el, visibility:1}:el)
                                                                    .map((e:any,index:number)=>(index>10 && index<17) || (index>22)?e:{...e, visibility:0})
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  
    // Only overwrite existing pixels.
    canvasCtx.globalCompositeOperation = 'source-in';
    canvasCtx.fillStyle = '#00FF00';
    canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
  
    // Only overwrite missing pixels.
    canvasCtx.globalCompositeOperation = 'destination-atop';
    canvasCtx.drawImage(
        results.image, 0, 0, canvasElement.width, canvasElement.height);
  
    canvasCtx.globalCompositeOperation = 'source-over';
    drawConnectors(canvasCtx, allVisibleLandmarks, POSE_CONNECTIONS,
                   {color: 'white', lineWidth: 5});
    drawLandmarks(canvasCtx, allVisibleLandmarks,
                  {color: 'yellow', lineWidth: 3});
    drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS,
                   {color: 'bisque', lineWidth: 2});
    drawLandmarks(canvasCtx, results.leftHandLandmarks,
                  {color: 'orange', lineWidth: 1});
    drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS,
                   {color: 'aqua', lineWidth: 2});
    drawLandmarks(canvasCtx, results.rightHandLandmarks,
                  {color: 'gold', lineWidth: 1});
    canvasCtx.restore();
  }
  
  const holistic = new Holistic({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
  }});
  holistic.setOptions({
    selfieMode:true,
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    smoothSegmentation: true,
    refineFaceLandmarks: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });
  holistic.onResults(onResults);
  
  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await holistic.send({image: videoElement});
    },
    width: 1280,
    height: 720
  });
  camera.start();
  }


}


