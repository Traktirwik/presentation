import {AfterViewInit, Component, OnInit} from '@angular/core';
import 'chartjs-adapter-moment'
import {MediapipeService} from "./services/mediapipe.service";
import {ChartService} from "./services/chart.service";
import {CircleService} from './services/circle.service';
import {AngularFirestore,} from "@angular/fire/compat/firestore";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'triggers';
  safetyChart: any;
  productivityChart: any;
  device: any = [];

  constructor(
    private mediaPipeService: MediapipeService,
    private chartService: ChartService,
    private circleService: CircleService,
    private firestore: AngularFirestore,
  ) {
  }

  ngOnInit(): void {
    this.chartService.getSafetyChart.subscribe((data: any) => {
      this.safetyChart = data;
    })

    this.chartService.getProductivityChart.subscribe((data: any) => {
      this.productivityChart = data;
    })

    const callDocCollection = this.firestore.collection('events');
    const productivityCollection = callDocCollection.doc('productivity');
    const safetyCollection = callDocCollection.doc('safety');
    const processCollection = callDocCollection.doc('process');

    productivityCollection.valueChanges().subscribe((data: any) => {
      console.log(data);
    })

    safetyCollection.valueChanges().subscribe((data) => {
      console.log(data);
    })

    processCollection.valueChanges().subscribe((data) => {
      console.log(data);
    })

    this.mediaPipeService.device.subscribe((data: string[]) => {
      this.device = data;
    })
  }

  changeCam(id:any){
    this.mediaPipeService.changeCamera(id)
  }
  changeCount() {
    this.circleService.changeCount();
  }
  changeProgress(sum:any) {
    this.circleService.updateProgress(sum);
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


