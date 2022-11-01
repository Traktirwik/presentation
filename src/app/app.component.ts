import {AfterViewInit, Component, OnInit} from '@angular/core';
import {Camera} from '@mediapipe/camera_utils';
import {HAND_CONNECTIONS, Holistic, POSE_CONNECTIONS} from '@mediapipe/holistic';

import {Chart, registerables} from 'chart.js';
import 'chartjs-adapter-moment';
import ChartStreaming from 'chartjs-plugin-streaming';
import {drawConnectors, drawLandmarks} from '@mediapipe/drawing_utils';
import {MediapipeService} from "./services/mediapipe.service";
import {ChartService} from "./services/chart.service";




@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'triggers';


  constructor(
    private mediaPipeService: MediapipeService,
    private chartService: ChartService
  ) {

  }


  ngOnInit(): void {
  }

  changeActiveLine() {
    this.chartService.changeActiveLine();
  }

  ngAfterViewInit(): void {
    this.mediaPipeService.startPoseRecognition();
    setTimeout(() => {
      this.chartService.drawChart();
    }, 2000)
  }


}


