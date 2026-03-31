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

  /**
   * Detects rectangular objects in the image.
   * Logic: 
   * 1. Detect red/pink regions (CHIPs)
   * 2. Detect dark/black regions (BOUNDARY/SHOT)
   * 3. Use Canny edge detection as fallback/supplement
   * 4. Merge all candidates and tag the largest as BOUNDARY
   */
  static async detect(imgElement: HTMLImageElement): Promise<GeometricObject[]> {
    await this.waitForReady();

    const src = cv.imread(imgElement);
    const gray = new cv.Mat();
    const hsv = new cv.Mat();
    
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    cv.cvtColor(src, hsv, cv.COLOR_RGBA2RGB);
    cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);

    // 1. Prepare Masks
    const redMask = new cv.Mat();
    const darkMask = new cv.Mat();
    const edges = new cv.Mat();

    // Red color masking
    const low1 = cv.matFromArray(3, 1, cv.CV_64F, [0, 50, 50]);
    const high1 = cv.matFromArray(3, 1, cv.CV_64F, [10, 255, 255]);
    const low2 = cv.matFromArray(3, 1, cv.CV_64F, [160, 50, 50]);
    const high2 = cv.matFromArray(3, 1, cv.CV_64F, [180, 255, 255]);
    const m1 = new cv.Mat(), m2 = new cv.Mat();
    cv.inRange(hsv, low1, high1, m1);
    cv.inRange(hsv, low2, high2, m2);
    cv.bitwise_or(m1, m2, redMask);

    // Dark area masking (Shot Boundary)
    cv.threshold(gray, darkMask, 80, 255, cv.THRESH_BINARY_INV);

    // Edge detection (Fallback/Supplement)
    cv.Canny(gray, edges, 50, 150);

    // 2. Extract Candidates from all relevant masks
    // We run findContours on redMask and darkMask separately or a combined edges
    const candidates: GeometricObject[] = [];
    const minArea = (imgElement.width * imgElement.height) * 0.0005;

    const processMask = (mask: cv.Mat) => {
      const contours = new cv.MatVector();
      const hierarchy = new cv.Mat();
      cv.findContours(mask, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

      for (let i = 0; i < contours.size(); ++i) {
        const cnt = contours.get(i);
        const area = cv.contourArea(cnt);
        if (area < minArea) continue;

        const approx = new cv.Mat();
        cv.approxPolyDP(cnt, approx, 0.02 * cv.arcLength(cnt, true), true);

        // Accept rectangles (4-6 corners to allow for minor noise)
        if (approx.rows >= 4 && approx.rows <= 6) {
          const bound = cv.boundingRect(approx);
          const extent = area / (bound.width * bound.height);
          
          if (extent > 0.7) {
            candidates.push({
              id: uuidv4(),
              x: Math.round(bound.x),
              y: Math.round(bound.y),
              width: Math.round(bound.width),
              height: Math.round(bound.height),
              isManual: false,
              visible: true,
              tag: 'CHIP' // Temporary tag
            });
          }
        }
        approx.delete();
      }
      contours.delete();
      hierarchy.delete();
    };

    // Process both color-based and brightness-based masks
    processMask(redMask);
    processMask(darkMask);
    
    // If very few candidates, try edge-based detection
    if (candidates.length < 2) {
      processMask(edges);
    }

    // 3. Deduplication & Final Selection
    // Sort by area DESCENDING
    candidates.sort((a, b) => (b.width * b.height) - (a.width * a.height));

    const detectedRects: GeometricObject[] = [];
    const dupThreshold = 10; // px margin

    for (const cand of candidates) {
      let isDuplicate = false;
      for (const accepted of detectedRects) {
        const dx = Math.abs(cand.x - accepted.x);
        const dy = Math.abs(cand.y - accepted.y);
        const dw = Math.abs(cand.width - accepted.width);
        const dh = Math.abs(cand.height - accepted.height);

        // Check if this rectangle is already covered by a similar one
        if (dx < dupThreshold && dy < dupThreshold && dw < dupThreshold && dh < dupThreshold) {
          isDuplicate = true;
          break;
        }
      }
      
      if (!isDuplicate) {
        detectedRects.push(cand);
      }
    }

    // 4. Final Tagging: Largest is BOUNDARY, rest are CHIP
    if (detectedRects.length > 0) {
      detectedRects[0].tag = 'BOUNDARY';
      // Ensure others are CHIPs (they should be by default)
      for (let i = 1; i < detectedRects.length; i++) {
        detectedRects[i].tag = 'CHIP';
      }
    }

    console.log(`[OpenCV] Detection Summary - Total: ${detectedRects.length}, Boundary: ${detectedRects.length > 0 ? 1 : 0}, Chips: ${Math.max(0, detectedRects.length - 1)}`);

    // Cleanup
    [src, gray, hsv, m1, m2, redMask, darkMask, edges, low1, high1, low2, high2].forEach(m => {
      try { m.delete(); } catch(e) {}
    });

    return detectedRects;
  }
}
