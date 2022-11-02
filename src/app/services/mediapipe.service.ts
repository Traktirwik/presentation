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

  constructor() {
  }

  startPoseRecognition() {
    const videoElement: any = document.querySelector('.input_video');
    this.canvasElement = document.querySelector('.output_canvas');
    this.ctx = this.canvasElement.getContext('2d');

    navigator.mediaDevices.getUserMedia({audio: false, video: true}).then((stream: any) => {
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
      width: 1000,
      height: 600
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
      {color: 'white', lineWidth: 5});
    drawLandmarks(this.ctx, allVisibleLandmarks,
      {color: 'yellow', radius: 10});
    drawConnectors(this.ctx, results.leftHandLandmarks, HAND_CONNECTIONS,
      {color: 'white', lineWidth: 4});
    drawLandmarks(this.ctx, results.leftHandLandmarks,
      {color: 'orange', radius: 4});
    drawConnectors(this.ctx, results.rightHandLandmarks, HAND_CONNECTIONS,
      {color: 'white', lineWidth: 4});
    drawLandmarks(this.ctx, results.rightHandLandmarks,
      {color: 'gold', radius: 4});
    this.ctx.restore();
  }
}
