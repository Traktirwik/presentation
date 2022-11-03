import {AfterViewInit, Component, OnInit} from '@angular/core';
import {Camera} from '@mediapipe/camera_utils';
import {HAND_CONNECTIONS, Holistic, POSE_CONNECTIONS} from '@mediapipe/holistic';

import {Chart, registerables} from 'chart.js';
import 'chartjs-adapter-moment';
import ChartStreaming from 'chartjs-plugin-streaming';
import {drawConnectors, drawLandmarks} from '@mediapipe/drawing_utils';
import {MediapipeService} from "./services/mediapipe.service";
import {ChartService} from "./services/chart.service";
import { CircleService } from './services/circle.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'triggers';
  safetyChart: any;
  productivityChart: any;

  constructor(
    private mediaPipeService: MediapipeService,
    private chartService: ChartService,
    private circleService: CircleService
  ) {
  }

  ngOnInit(): void {
    this.chartService.getSafetyChart.subscribe((data: any) => {
      this.safetyChart = data;
    })

    this.chartService.getProductivityChart.subscribe((data: any) => {
      this.productivityChart = data;
    })
  }

  changeCam(id:number){
    this.mediaPipeService.changeCamera(id)
  }
  changeCount() {
    this.circleService.changeCount();
  }
  changeActiveDataSet(chart: 'safety' | 'productivity') {
    this.chartService.changeActiveDataSet(chart);
  }

  ngAfterViewInit(): void {
    this.circleService.drawGraph()
    this.mediaPipeService.startPoseRecognition(0);

    setTimeout(() => {
      this.chartService.drawChart();
    }, 2000)
  }


}


