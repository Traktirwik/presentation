import {Injectable} from '@angular/core';
import {drawConnectors, drawLandmarks} from "@mediapipe/drawing_utils";
import {HAND_CONNECTIONS, Holistic, POSE_CONNECTIONS} from "@mediapipe/holistic";
import {Camera} from "@mediapipe/camera_utils";

@Injectable({
  providedIn: 'root'
})

export class MediapipeService {

  ctx: any;
  canvasElement: any;
  device: any[] = [];
  constructor() {
  }

  startPoseRecognition() {
    const videoElement: any = document.querySelector('.input_video');
    this.canvasElement = document.querySelector('.output_canvas');
    this.ctx = this.canvasElement.getContext('2d');

    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.log("enumerateDevices() not supported.");
    } else {
      // List cameras and microphones.
      navigator.mediaDevices.enumerateDevices()
        .then((devices) => {
          devices.forEach((device) => {
            this.device.push(device.deviceId);
            console.log(device)
          });
        })
        .catch((err) => {
          console.log(`${err.name}: ${err.message}`);
        });
    }

    navigator.mediaDevices.getUserMedia({audio: false, video: {deviceId: "218cfff2533651d7149bc13a9593927d384df528569062f92fa1c58e11d5bc65"}}).then((stream: any) => {
      videoElement.srcObject = stream;
    })

   
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

    const camera = new Camera(videoElement, {
      onFrame: async () => {
        await holistic.send({image: videoElement});
      },
      width: 1280,
      height: 720
    })
    camera.start();
  }

  drawResult(results: any) {
    let allVisibleLandmarks = results.poseLandmarks?.map((el: any) => el.visibility > 0.002 ? {
      ...el,
      visibility: 1
    } : el)
      .map((e: any, index: number) => (index > 10 && index < 17) || (index > 22) ? e : {...e, visibility: 0})
    this.ctx.save();
    if (this.canvasElement) {
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
}
