import {Injectable} from '@angular/core';
import {drawConnectors, drawLandmarks} from "@mediapipe/drawing_utils";
import {HAND_CONNECTIONS, Holistic, POSE_CONNECTIONS} from "@mediapipe/holistic";
import {Camera} from "@mediapipe/camera_utils";
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class MediapipeService {

  ctx: any;
  canvasElement: any;
  device = new BehaviorSubject<string[]>([])
  camera:any
  mediaStream:any = null
  videoElement: any 
  constructor() {
  }

  get getDevices() {
    return this.device.asObservable();
  }

  setDevices(devices: string[]) {
    this.device.next(devices);
  }

  startPoseRecognition(idCamera:number) {
    this.videoElement = document.querySelector('.input_video');
    this.canvasElement = document.querySelector('.output_canvas');
    this.ctx = this.canvasElement.getContext('2d');

    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.log("enumerateDevices() not supported.");
    } else {
      // List cameras and microphones.
      navigator.mediaDevices.enumerateDevices()
        .then((devices) => {
          const devBuf:any = []
          devices.forEach((device) => {
            if(device.kind==='videoinput'){
              devBuf.push(device.deviceId);
            }
          });
          this.setDevices(devBuf);
        }).then(()=>{
          navigator.mediaDevices.getUserMedia({audio: false, video: //true
            {deviceId:
            { exact: this.device.value[idCamera] } //тут меняется вебка
             }
            })
          .then((stream: any) => {
            this.mediaStream = stream
            this.videoElement.srcObject = this.mediaStream;

          })
        })
        .then(()=>{
          this.camera = new Camera(this.videoElement, {
            onFrame: async () => {
              await holistic.send({image: this.videoElement});
            },
            width: 1024,
            height: 720
          })
          this.camera.start();
        })
        .catch((err) => {
          console.log(`${err.name}: ${err.message}`);
        });
    }
    
    const holistic = new Holistic({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
      }
    });

    holistic.setOptions({
      selfieMode: true,
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: true,
      refineFaceLandmarks: false,
      minDetectionConfidence: 0.3,
      minTrackingConfidence: 0.3
    });

    holistic.onResults((res) => {
      this.drawResult(res);
    });
  }

  drawResult(results: any) {
    let allVisibleLandmarks = results.poseLandmarks?.map((el: any) => el.visibility > 0.002 ? {
      ...el,
      visibility: 1
    } : el)
      .map((e: any, index: number) => (index > 10 && index < 17) || (index > 22) ? e : {...e, visibility: 0})
    this.ctx.save();
    if (this.canvasElement) {
      this.ctx.save()
      this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
      // Only overwrite existing pixels.
      this.ctx.globalCompositeOperation = 'source-in';
      this.ctx.fillStyle = '#00FF00';
      this.ctx.fillRect(0, 0, this.canvasElement.width, this.canvasElement.height);

      // Only overwrite missing pixels.
      this.ctx.globalCompositeOperation = 'destination-atop';
      this.ctx.drawImage(
        results.image, 0, 0, this.canvasElement.width, this.canvasElement.height);
    }

    this.ctx.globalCompositeOperation = 'source-over';
    drawConnectors(this.ctx, allVisibleLandmarks, POSE_CONNECTIONS,
      {color: 'white', lineWidth: 4});
    drawLandmarks(this.ctx, allVisibleLandmarks,
      {color: 'white', radius: 5});
    drawConnectors(this.ctx, results.leftHandLandmarks, HAND_CONNECTIONS,
      {color: 'white', lineWidth: 3});
    drawLandmarks(this.ctx, results.leftHandLandmarks,
      {color: 'yellow', radius: 3});
    drawConnectors(this.ctx, results.rightHandLandmarks, HAND_CONNECTIONS,
      {color: 'white', lineWidth: 3});
    drawLandmarks(this.ctx, results.rightHandLandmarks,
      {color: 'yellow', radius: 3});
    this.ctx.restore();
  }
  changeCamera(idCamera:number){
      const tracks = this.mediaStream.getTracks()
      tracks.forEach((element:any) => {
          element.stop()
      });
      this.mediaStream = null
      this.camera.stop()
      this.camera = null
      
setTimeout(()=>{
  this.startPoseRecognition(idCamera)
},200)
  }
}
