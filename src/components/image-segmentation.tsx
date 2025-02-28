import { useEffect, useRef } from "react";
import { Point } from "./image-upload-dialog";

// Helper functions for image manipulation
export const maskImageCanvas = (
  imageCanvas: HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.height = imageCanvas.height;
  canvas.width = imageCanvas.width;

  if (context) {
    context.drawImage(
      maskCanvas,
      0,
      0,
      maskCanvas.width,
      maskCanvas.height,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    context.globalCompositeOperation = "source-in";
    context.drawImage(
      imageCanvas,
      0,
      0,
      imageCanvas.width,
      imageCanvas.height,
      0,
      0,
      canvas.width,
      canvas.height,
    );
  }

  return canvas;
};

export const resizeCanvas = (
  canvasOrig: HTMLCanvasElement,
  size: { w: number; h: number },
): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.height = size.h;
  canvas.width = size.w;

  if (ctx) {
    ctx.drawImage(
      canvasOrig,
      0,
      0,
      canvasOrig.width,
      canvasOrig.height,
      0,
      0,
      canvas.width,
      canvas.height,
    );
  }

  return canvas;
};

// Convert canvas to Float32Array for model input
export const canvasToFloat32Array = (canvas: HTMLCanvasElement) => {
  const imageData = canvas
    .getContext("2d")!
    .getImageData(0, 0, canvas.width, canvas.height).data;
  const shape = [1, 3, canvas.width, canvas.height];

  const [redArray, greenArray, blueArray] = [[], [], []];

  for (let i = 0; i < imageData.length; i += 4) {
    redArray.push(imageData[i]);
    greenArray.push(imageData[i + 1]);
    blueArray.push(imageData[i + 2]);
    // skip data[i + 3] to filter out the alpha channel
  }

  const transposedData = redArray.concat(greenArray).concat(blueArray);

  let i,
    l = transposedData.length;
  const float32Array = new Float32Array(shape[1] * shape[2] * shape[3]);
  for (i = 0; i < l; i++) {
    float32Array[i] = transposedData[i] / 255.0; // convert to float
  }

  return { float32Array, shape };
};

// Convert Float32Array to canvas for visualization
export const float32ArrayToCanvas = (
  array: Float32Array,
  width: number,
  height: number,
): HTMLCanvasElement => {
  const C = 4; // 4 output channels, RGBA
  const imageData = new Uint8ClampedArray(array.length * C);

  for (let srcIdx = 0; srcIdx < array.length; srcIdx++) {
    const trgIdx = srcIdx * C;
    const maskedPx = array[srcIdx] > 0;
    imageData[trgIdx] = maskedPx ? 0x32 : 0; // R
    imageData[trgIdx + 1] = maskedPx ? 0xcd : 0; // G
    imageData[trgIdx + 2] = maskedPx ? 0x32 : 0; // B
    imageData[trgIdx + 3] = maskedPx ? 255 : 0; // Alpha
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.height = height;
  canvas.width = width;

  if (ctx) {
    ctx.putImageData(new ImageData(imageData, width, height), 0, 0);
  }

  return canvas;
};

interface ImageSegmentationProps {
  imageUrl: string;
  points: Point[];
  onMaskGenerated: (maskCanvas: HTMLCanvasElement) => void;
  onProcessingChange: (isProcessing: boolean) => void;
}

export const ImageSegmentation = ({
  imageUrl,
  points,
  onMaskGenerated,
  onProcessingChange,
}: ImageSegmentationProps) => {
  const workerRef = useRef<Worker | null>(null);
  const imageCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize worker
  useEffect(() => {
    if (!workerRef.current) {
      try {
        workerRef.current = new Worker(
          new URL("../workers/sam-worker.js", import.meta.url),
          {
            type: "module",
          },
        );

        // Handle worker messages
        workerRef.current.addEventListener("message", (event) => {
          const { type, data } = event.data;

          if (type === "encodeImageDone") {
            onProcessingChange(false);
          } else if (type === "decodeMaskResult") {
            handleSegmentationResult(data);
            onProcessingChange(false);
          }
        });

        return () => {
          workerRef.current?.terminate();
          workerRef.current = null;
        };
      } catch (error) {
        console.error("Failed to initialize worker:", error);
      }
    }
  }, [onProcessingChange]);

  // Load image and encode it
  useEffect(() => {
    if (imageUrl && workerRef.current) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;

      img.onload = () => {
        // Create canvas from image
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.drawImage(img, 0, 0);
          imageCanvasRef.current = canvas;

          // Resize to 1024x1024 for model input
          const resizedCanvas = resizeCanvas(canvas, { w: 1024, h: 1024 });

          // Convert to Float32Array and send to worker
          const tensorData = canvasToFloat32Array(resizedCanvas);

          onProcessingChange(true);
          workerRef.current?.postMessage({
            type: "encodeImage",
            data: tensorData,
          });
        }
      };
    }
  }, [imageUrl, onProcessingChange]);

  // Process points for segmentation
  useEffect(() => {
    if (points.length > 0 && workerRef.current) {
      onProcessingChange(true);

      workerRef.current.postMessage({
        type: "decodeMask",
        data: {
          points: points,
          maskArray: null,
          maskShape: null,
        },
      });
    }
  }, [points, onProcessingChange]);

  const handleSegmentationResult = (data: any) => {
    // Process the mask data from the worker
    // In a real implementation, we would extract the mask tensor
    // For now, we'll create a simple green mask

    if (imageCanvasRef.current) {
      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = 1024;
      maskCanvas.height = 1024;
      const ctx = maskCanvas.getContext("2d");

      if (ctx) {
        // Create a green mask
        ctx.fillStyle = "#32cd32";
        ctx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

        onMaskGenerated(maskCanvas);
      }
    }
  };

  return null; // This is a logic-only component, no UI
};
