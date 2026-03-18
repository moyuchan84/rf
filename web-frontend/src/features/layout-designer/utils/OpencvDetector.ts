import cv from '@techstark/opencv-js';
import { v4 as uuidv4 } from 'uuid';
import { GeometricObject } from '../store/useLayoutStore';

export class OpencvDetector {
  private static isReady = false;

  static async waitForReady(): Promise<void> {
    if (this.isReady) return;
    return new Promise((resolve) => {
      if (cv.Mat) {
        this.isReady = true;
        resolve();
        return;
      }
      cv['onRuntimeInitialized'] = () => {
        this.isReady = true;
        resolve();
      };
    });
  }

  static async detect(imgElement: HTMLImageElement): Promise<GeometricObject[]> {
    await this.waitForReady();

    const src = cv.imread(imgElement);
    const gray = new cv.Mat();
    const hsv = new cv.Mat();
    
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    cv.cvtColor(src, hsv, cv.COLOR_RGBA2RGB);
    cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);

    // 1. Color Masking (Red/Pink)
    const mask = new cv.Mat();
    const low1 = cv.matFromArray(3, 1, cv.CV_64F, [0, 50, 50]);
    const high1 = cv.matFromArray(3, 1, cv.CV_64F, [10, 255, 255]);
    const low2 = cv.matFromArray(3, 1, cv.CV_64F, [160, 50, 50]);
    const high2 = cv.matFromArray(3, 1, cv.CV_64F, [180, 255, 255]);
    
    const m1 = new cv.Mat(), m2 = new cv.Mat();
    cv.inRange(hsv, low1, high1, m1);
    cv.inRange(hsv, low2, high2, m2);
    cv.bitwise_or(m1, m2, mask);

    let finalMask = mask;
    const nonZeroCount = cv.countNonZero(mask);
    const edges = new cv.Mat();

    if (nonZeroCount < 100) {
      console.log('[OpenCV] Red color low, using Edge Detection...');
      cv.Canny(gray, edges, 50, 150);
      finalMask = edges;
    }

    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    // Use RETR_LIST to find nested boxes
    cv.findContours(finalMask, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

    const detectedRects: GeometricObject[] = [];
    const minArea = (imgElement.width * imgElement.height) * 0.0005;

    for (let i = 0; i < contours.size(); ++i) {
      const cnt = contours.get(i);
      const area = cv.contourArea(cnt);
      
      if (area < minArea) continue;

      const approx = new cv.Mat();
      cv.approxPolyDP(cnt, approx, 0.02 * cv.arcLength(cnt, true), true);

      // Check if it's a 4-point polygon
      if (approx.rows === 4) {
        const bound = cv.boundingRect(approx);
        const extent = area / (bound.width * bound.height);
        
        if (extent > 0.7) { // More generous extent
          detectedRects.push({
            id: uuidv4(),
            x: Math.round(bound.x),
            y: Math.round(bound.y),
            width: Math.round(bound.width),
            height: Math.round(bound.height),
            isManual: false,
            visible: true,
          });
        }
      }
      approx.delete();
    }

    console.log(`[OpenCV] Total contours: ${contours.size()}, Rects found: ${detectedRects.length}`);

    // Cleanup
    [src, gray, hsv, m1, m2, mask, edges, contours, hierarchy, low1, high1, low2, high2].forEach(m => {
      try { m.delete(); } catch(e) {}
    });

    return detectedRects;
  }
}
