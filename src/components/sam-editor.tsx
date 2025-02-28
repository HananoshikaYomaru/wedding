"use client";
import React, { useState, useEffect, useRef } from "react";
import InputDialog from "@/components/ui/inputdialog";
import {
  resizeCanvas,
  maskImageCanvas,
  resizeAndPadBox,
  canvasToFloat32Array,
  float32ArrayToCanvas,
  sliceTensor,
} from "@/lib/imageutils";
// import { imageSize, useSamWorker,  } from "./page";

import { LoaderCircle, ImageUp, ImageDown, Github, Fan } from "lucide-react";

import { Button } from "@/components/ui/button";

// resize+pad all images to 1024x1024
export const imageSize = { w: 1024, h: 1024 };
export const maskSize = { w: 256, h: 256 };

type ActionButtonsProps = {
  encodeImageClick: () => void;
  loading: boolean;
  imageEncoded: boolean;
  status: string;
  fileInputEl: React.RefObject<HTMLInputElement | null>;
  setInputDialogOpen: (open: boolean) => void;
  cropClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  mask: HTMLCanvasElement | null;
};

// Component for the action buttons
export const ActionButtons = ({
  encodeImageClick,
  loading,
  imageEncoded,
  status,
  fileInputEl,
  setInputDialogOpen,
  cropClick,
  mask,
}: ActionButtonsProps) => (
  <div className="flex justify-between gap-4">
    <Button onClick={encodeImageClick} disabled={loading || imageEncoded}>
      <p className="flex items-center gap-2">
        {loading && <LoaderCircle className="animate-spin w-6 h-6" />}
        {status}
      </p>
    </Button>
    <div className="flex gap-1">
      <Button
        onClick={() => {
          if (!fileInputEl.current) {
            console.log("no file input");
            return;
          }
          fileInputEl.current.click();
        }}
        variant="secondary"
        disabled={loading}
      >
        <ImageUp /> Upload
      </Button>
      <Button
        onClick={() => {
          setInputDialogOpen(true);
        }}
        variant="secondary"
        disabled={loading}
      >
        <ImageUp /> From URL
      </Button>
      <Button onClick={cropClick} disabled={mask == null} variant="secondary">
        <ImageDown /> Crop
      </Button>
    </div>
  </div>
);

// Component for the canvas
export const ImageCanvas = ({
  canvasEl,
  imageClick,
}: {
  canvasEl: React.RefObject<HTMLCanvasElement | null>;
  imageClick: (event: React.MouseEvent<HTMLCanvasElement>) => void;
}) => (
  <div className="flex justify-center">
    <canvas
      ref={canvasEl}
      width={512}
      height={512}
      onClick={imageClick}
      onContextMenu={(event) => {
        event.preventDefault();
        imageClick(event);
      }}
    />
  </div>
);

export const useSamWorker = ({
  handleDecodingResults,
}: {
  handleDecodingResults: (decodingResults: {
    masks: { dims: number[]; cpuData: Float32Array };
    iou_predictions: { dims: number[]; cpuData: number[] };
  }) => void;
}) => {
  // web worker, image and mask
  const samWorker = useRef<Worker | null>(null);
  const [loading, setLoading] = useState(false);
  const [device, setDevice] = useState(null);
  const [status, setStatus] = useState("");
  const [imageEncoded, setImageEncoded] = useState(false);
  const [stats, setStats] = useState(null);

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
      // alert(data.durationMs)
      setImageEncoded(true);
      setLoading(false);
      setStatus("Ready. Click on image");
    } else if (type == "decodeMaskResult") {
      handleDecodingResults(data);
      setLoading(false);
      setStatus("Ready. Click on image");
    } else if (type == "stats") {
      setStats(data);
    }
  };

  // Load web worker
  useEffect(() => {
    if (!samWorker.current) {
      samWorker.current = new Worker(
        new URL(`../workers/worker.js`, import.meta.url),
        {
          type: "module",
        },
      );
      samWorker.current.addEventListener("message", onWorkerMessage);
      samWorker.current.postMessage({ type: "ping" });

      setLoading(true);
    }
  }, [onWorkerMessage, handleDecodingResults]);

  return {
    samWorker,
    loading,
    device,
    status,
    imageEncoded,
    stats,
    setLoading,
    setStatus,
    setImageEncoded,
    setStats,
  };
};

const inputDialogDefaultURL =
  "https://upload.wikimedia.org/wikipedia/commons/9/96/Pro_Air_Martin_404_N255S.jpg";

export function SamEditor() {
  // state

  // const [imageEncoded, setImageEncoded] = useState(false);

  // Decoding finished -> parse result and update mask
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

    setMask(bestMaskCanvas);
    setPrevMaskArray(bestMaskArray);
  };

  const {
    samWorker,
    loading,
    device,
    status,
    imageEncoded,
    stats,
    setLoading,
    setStatus,
    setImageEncoded,
    setStats,
  } = useSamWorker({ handleDecodingResults });

  const [image, setImage] = useState<HTMLCanvasElement | null>(null); // canvas
  const [mask, setMask] = useState<HTMLCanvasElement | null>(null); // canvas
  const [prevMaskArray, setPrevMaskArray] = useState<Float32Array | null>(null); // Float32Array
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const fileInputEl = useRef<HTMLInputElement>(null);
  const pointsRef = useRef<{ x: number; y: number; label: number }[]>([]);

  // const [stats, setStats] = useState(null);
  // input dialog for custom URLs
  const [inputDialogOpen, setInputDialogOpen] = useState(false);

  // Start encoding image
  const encodeImageClick = async () => {
    if (!samWorker.current) return;
    if (!image) return;
    samWorker.current.postMessage({
      type: "encodeImage",
      data: canvasToFloat32Array(resizeCanvas(image, imageSize)),
    });

    setLoading(true);
    setStatus("Encoding");
  };

  // Start decoding, prompt with mouse coords
  const imageClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageEncoded) return;

    event.preventDefault();
    console.log(event.button);

    const canvas = canvasEl.current;
    if (!canvas) {
      console.log("no canvas");
      return;
    }
    if (!event.target) {
      console.log("no event target");
      return;
    }
    if (samWorker.current == null) {
      console.log("no sam worker");
      return;
    }

    const rect = (event.target as HTMLElement).getBoundingClientRect();

    // input image will be resized to 1024x1024 -> normalize mouse pos to 1024x1024
    const point = {
      x: ((event.clientX - rect.left) / canvas.width) * imageSize.w,
      y: ((event.clientY - rect.top) / canvas.height) * imageSize.h,
      label: event.button === 0 ? 1 : 0,
    };
    pointsRef.current.push(point);

    // do we have a mask already? ie. a refinement click?
    if (prevMaskArray) {
      const maskShape = [1, 1, maskSize.w, maskSize.h];

      samWorker.current.postMessage({
        type: "decodeMask",
        data: {
          points: pointsRef.current,
          maskArray: prevMaskArray,
          maskShape: maskShape,
        },
      });
    } else {
      samWorker.current.postMessage({
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

  // Crop image with mask
  const cropClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!image || !mask) return;
    const link = document.createElement("a");
    link.href = maskImageCanvas(image, mask).toDataURL();
    link.download = "crop.png";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset all the image-based state: points, mask, offscreen canvases ..
  const resetState = () => {
    pointsRef.current = [];
    setImage(null);
    setMask(null);
    setPrevMaskArray(null);
    setImageEncoded(false);
  };

  // New image: From File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      console.log("no files");
      return;
    }
    const file = e.target.files[0];
    const dataURL = window.URL.createObjectURL(file);

    resetState();
    setStatus("Encode image");
    setImageOnCanvas(dataURL);
  };

  // New image: From URL
  const handleUrl = (urlText: string) => {
    const dataURL = urlText;

    resetState();
    setStatus("Encode image");
    setImageOnCanvas(dataURL);
  };

  function handleRequestStats() {
    if (!samWorker.current) return;
    samWorker.current.postMessage({ type: "stats" });
  }

  const setImageOnCanvas = (imageUrl: string) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = function () {
      const largestDim =
        img.naturalWidth > img.naturalHeight
          ? img.naturalWidth
          : img.naturalHeight;
      const box = resizeAndPadBox(
        { h: img.naturalHeight, w: img.naturalWidth },
        { h: largestDim, w: largestDim },
      );

      if (!box) {
        console.log("no box");
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = largestDim;
      canvas.height = largestDim;

      (canvas.getContext("2d") as CanvasRenderingContext2D).drawImage(
        img,
        0,
        0,
        img.naturalWidth,
        img.naturalHeight,
        box.x,
        box.y,
        box.w,
        box.h,
      );
      setImage(canvas);
    };
  };

  useEffect(() => {
    setImageOnCanvas(
      "https://upload.wikimedia.org/wikipedia/commons/3/38/Flamingos_Laguna_Colorada.jpg",
    );
  }, []);

  // Offscreen canvas changed, draw it
  useEffect(() => {
    if (image && canvasEl.current) {
      drawImageWithoutMask(canvasEl.current, image);
    }
  }, [image]);

  const drawImageWithoutMask = (
    canvas: HTMLCanvasElement,
    image: HTMLCanvasElement,
  ) => {
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      image,
      0,
      0,
      image.width,
      image.height,
      0,
      0,
      canvas.width,
      canvas.height,
    );
  };

  // Mask changed, draw original image and mask on top with some alpha
  useEffect(() => {
    if (mask && image && canvasEl.current) {
      drawImage(canvasEl.current, image, mask);
    }
  }, [mask, image]);

  const drawImage = (
    canvas: HTMLCanvasElement,
    image: HTMLCanvasElement,
    mask: HTMLCanvasElement,
  ) => {
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    if (!image) {
      console.log("no image");
      return;
    }

    ctx.drawImage(
      image,
      0,
      0,
      image.width,
      image.height,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    ctx.globalAlpha = 0.7;
    ctx.drawImage(
      mask,
      0,
      0,
      mask.width,
      mask.height,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    ctx.globalAlpha = 1;
  };
  // {/* <GitHubButton /> */}
  // {/* <Header device={device} /> */}
  return (
    <div className="flex flex-col gap-4 pt-4">
      <ActionButtons
        encodeImageClick={encodeImageClick}
        loading={loading}
        imageEncoded={imageEncoded}
        status={status}
        fileInputEl={fileInputEl}
        setInputDialogOpen={setInputDialogOpen}
        cropClick={cropClick}
        mask={mask}
      />
      <ImageCanvas canvasEl={canvasEl} imageClick={imageClick} />
      <InputDialog
        open={inputDialogOpen}
        setOpen={setInputDialogOpen}
        submitCallback={handleUrl}
        defaultURL={inputDialogDefaultURL}
      />
      <input
        ref={fileInputEl}
        hidden
        accept="image/*"
        type="file"
        onInput={handleFileUpload}
      />
    </div>
  );
  // {/* <StatsSection
  //   handleRequestStats={handleRequestStats}
  //   stats={stats}
  // /> */}
}
