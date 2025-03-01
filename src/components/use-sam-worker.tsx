"use client";
import { useState, useRef, useEffect } from "react";
import { create } from "zustand";
import { Status } from "./sam-editor";
import {
  canvasToFloat32Array,
  float32ArrayToCanvas,
  sliceTensor,
} from "@/lib/imageutils";
import { resizeCanvas } from "@/lib/imageutils";

// resize+pad all images to 1024x1024
export const imageSize = { w: 1024, h: 1024 };
export const maskSize = { w: 256, h: 256 };

const handleDecodingResults = (decodingResults: {
  masks: { dims: number[]; cpuData: Float32Array };
  iou_predictions: { dims: number[]; cpuData: number[] };
}) => {
  // SAM2 returns 3 mask along with scores -> select best one
  const maskTensors = decodingResults.masks;
  const [bs, noMasks, width, height] = maskTensors.dims;
  const maskScores = decodingResults.iou_predictions.cpuData;
  const bestMaskIdx = maskScores.indexOf(Math.max(...maskScores));
  const bestMaskArray = sliceTensor(maskTensors, bestMaskIdx);
  let bestMaskCanvas = float32ArrayToCanvas(bestMaskArray, width, height);
  bestMaskCanvas = resizeCanvas(bestMaskCanvas, imageSize);

  return {
    bestMaskCanvas,
    bestMaskArray,
  };

  // setMask(bestMaskCanvas);
  // setPrevMaskArray(bestMaskArray);
};

type SamWorkerStore = {
  samWorker: Worker | null;
  setSamWorker: (samWorker: Worker | null) => void;
};
// we create a store for the worker
const useSamWorkerStore = create<SamWorkerStore>((set) => ({
  samWorker: null,
  setSamWorker: (samWorker: Worker | null) => set({ samWorker }),
}));

export const useSamWorker = () => {
  // web worker, image and mask
  // const samWorker = useRef<Worker | null>(null);
  const [loading, setLoading] = useState(false);
  const [device, setDevice] = useState(null);
  const [status, setStatus] = useState<Status>("Loading model");
  const [imageEncoded, setImageEncoded] = useState(false);
  const [stats, setStats] = useState(null);
  const { samWorker, setSamWorker } = useSamWorkerStore();
  const [prevMaskArray, setPrevMaskArray] = useState<Float32Array | null>(null); // Float32Array
  const pointsRef = useRef<{ x: number; y: number; label: number }[]>([]);
  const [maskCanvas, setMask] = useState<HTMLCanvasElement | null>(null); // canvas

  // Handle web worker messages
  const onWorkerMessage = (event: MessageEvent) => {
    const { type, data } = event.data;

    if (type == "pong") {
      const { success, device } = data;

      if (success) {
        setLoading(false);
        setDevice(device);
        setStatus("Encode image");
      } else {
        setStatus("Error (check JS console)");
      }
    } else if (type == "downloadInProgress" || type == "loadingInProgress") {
      setLoading(true);
      setStatus("Loading model");
    } else if (type == "encodeImageDone") {
      console.log("encodeImageDone", data.durationMs);
      setImageEncoded(true);
      setLoading(false);
      setStatus("Ready. Click on image");
    } else if (type == "decodeMaskResult") {
      const { bestMaskCanvas, bestMaskArray } = handleDecodingResults(data);
      setMask(bestMaskCanvas);
      setPrevMaskArray(bestMaskArray);
      setLoading(false);
      setStatus("Ready. Click on image");
    } else if (type == "stats") {
      setStats(data);
    }
  };

  const loadWorker = async () => {
    // setSamWorker(null);
    if (!samWorker) {
      console.log("loading worker");
      const worker = new Worker(
        new URL(`../workers/worker.js`, import.meta.url),
        {
          type: "module",
        },
      );
      worker.addEventListener("message", onWorkerMessage);

      // Create a promise that resolves when the worker responds with pong
      const workerReadyPromise = new Promise<Worker>((resolve) => {
        const messageHandler = (event: MessageEvent) => {
          const { type, data } = event.data;
          if (type === "pong" && data.success) {
            worker.removeEventListener("message", messageHandler);
            console.log("worker loaded, pong received");
            resolve(worker);
          }
        };
        worker.addEventListener("message", messageHandler);
        worker.postMessage({ type: "ping" });
      });

      const w = await workerReadyPromise;
      setSamWorker(w);
      return w;
    }
    return samWorker;
  };

  // Start encoding image
  const encodeImage = async (image: HTMLCanvasElement) => {
    const worker = await loadWorker();
    if (!worker) return;

    console.log("encoding image");
    worker.postMessage({
      type: "encodeImage",
      data: canvasToFloat32Array(resizeCanvas(image, imageSize)),
    });

    console.log("image encoded");

    // setLoading(true);
    // setStatus("Encoding");
  };

  const decodeMask = async (point: { x: number; y: number; label: number }) => {
    if (!samWorker) return;

    pointsRef.current.push(point);

    // do we have a mask already? ie. a refinement click?
    if (prevMaskArray) {
      const maskShape = [1, 1, maskSize.w, maskSize.h];

      samWorker.postMessage({
        type: "decodeMask",
        data: {
          points: pointsRef.current,
          maskArray: prevMaskArray,
          maskShape: maskShape,
        },
      });
    } else {
      samWorker.postMessage({
        type: "decodeMask",
        data: {
          points: pointsRef.current,
          maskArray: null,
          maskShape: null,
        },
      });
    }

    setLoading(true);
    setStatus("Decoding");
  };

  function reset() {
    console.log("resetting");
    pointsRef.current = [];
    setImageEncoded(false);
    setPrevMaskArray(null);
    setMask(null);
    setLoading(false);
    setStatus("Loading model");
    if (samWorker) {
      samWorker.removeEventListener("message", onWorkerMessage);
      samWorker.terminate();
      setSamWorker(null);
    }
  }

  return {
    // samWorker,
    loading,
    device,
    status,
    imageEncoded,
    stats,
    maskCanvas,
    encodeImage,
    decodeMask,
    reset,
  };
};
