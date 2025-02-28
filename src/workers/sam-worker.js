// This is a simplified worker that simulates SAM2 image segmentation
// In a real implementation, this would use the actual SAM2 model

// Simulate loading the model
self.onmessage = async (e) => {
  const { type, data } = e.data;

  if (type === "ping") {
    // Simulate model loading
    setTimeout(() => {
      self.postMessage({
        type: "pong",
        data: {
          success: true,
          device: "CPU (simulated)",
        },
      });
    }, 500);
  } else if (type === "encodeImage") {
    // Simulate image encoding
    setTimeout(() => {
      self.postMessage({
        type: "encodeImageDone",
        data: { durationMs: 200 },
      });
    }, 1000);
  } else if (type === "decodeMask") {
    // Simulate mask decoding
    const { points } = data;

    setTimeout(() => {
      // In a real implementation, this would return actual mask data
      self.postMessage({
        type: "decodeMaskResult",
        data: {
          masks: {
            dims: [1, 3, 256, 256],
            cpuData: new Float32Array(256 * 256).fill(0.5),
          },
          iou_predictions: {
            cpuData: [0.8, 0.7, 0.6],
          },
        },
      });
    }, 1500);
  }
};
