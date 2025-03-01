"use client";
import React, { useState, useEffect, useRef } from "react";
import InputDialog from "@/components/ui/inputdialog";
import { maskImageCanvas, resizeAndPadBox } from "@/lib/imageutils";

import { LoaderCircle, ImageUp, ImageDown, Github, Fan } from "lucide-react";

import { Button } from "@/components/ui/button";
import { imageSize, useSamWorker } from "./use-sam-worker";

export type Status =
  | "Encode image"
  | "Loading model"
  | "Ready. Click on image"
  | "Decoding"
  | "Encoding"
  | "Error (check JS console)";

type ActionButtonsProps = {
  // encodeImageClick: () => void;
  loading: boolean;
  imageEncoded: boolean;
  status: Status;
  fileInputEl: React.RefObject<HTMLInputElement | null>;
  setInputDialogOpen: (open: boolean) => void;
  cropClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  mask: HTMLCanvasElement | null;
};

// Component for the action buttons
export const ActionButtons = ({
  // encodeImageClick,
  loading,
  imageEncoded,
  status,
  fileInputEl,
  setInputDialogOpen,
  cropClick,
  mask,
}: ActionButtonsProps) => {
  // as soon as status is "Ready. we encode the image

  // useEffect(() => {
  //   if (status === "Encode image") {
  //     encodeImageClick();
  //   }
  // }, [status, encodeImageClick]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between gap-4">
        <Button disabled>
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
          <Button
            onClick={cropClick}
            disabled={mask == null}
            variant="secondary"
          >
            <ImageDown /> Crop
          </Button>
        </div>
      </div>
      <div className="selection-instructions">
        <div className="instruction-item">
          <span className="dot positive-dot"></span>
          <span>Left click to select area (positive selection)</span>
        </div>
        <div className="instruction-item">
          <span className="dot negative-dot"></span>
          <span>Right click to exclude area (negative selection)</span>
        </div>
      </div>
    </div>
  );
};

// Component for the canvas
export const ImageCanvas = ({
  canvasEl,
  imageClick,
}: {
  canvasEl: React.RefObject<HTMLCanvasElement | null>;
  imageClick: (event: React.MouseEvent<HTMLCanvasElement>) => void;
}) => {
  const [points, setPoints] = useState<
    Array<{ x: number; y: number; type: "positive" | "negative" }>
  >([]);

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasEl.current) return;

    const rect = canvasEl.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Add point to the array
    setPoints((prev) => [
      ...prev,
      {
        x,
        y,
        type: event.button === 0 ? "positive" : "negative",
      },
    ]);

    // Call the original click handler
    imageClick(event);
  };

  // Draw points on canvas overlay
  useEffect(() => {
    if (!canvasEl.current) return;

    const canvas = canvasEl.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw points after a small delay to ensure the main canvas has been updated
    const timer = setTimeout(() => {
      points.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = point.type === "positive" ? "#00ff00" : "#ff9900";
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [points, canvasEl]);

  return (
    <div className="flex justify-center canvas-container">
      <canvas
        ref={canvasEl}
        width={512}
        height={512}
        onClick={handleClick}
        onContextMenu={(event) => {
          event.preventDefault();
          handleClick(event);
        }}
        className="segmentation-canvas"
      />
    </div>
  );
};

const inputDialogDefaultURL =
  "https://upload.wikimedia.org/wikipedia/commons/9/96/Pro_Air_Martin_404_N255S.jpg";

type SamEditorProps = {
  onImageCropped: (imageUrl: string) => void;
  opened: boolean;
};

export function SamEditor({ onImageCropped, opened }: SamEditorProps) {
  const {
    loading,
    status,
    imageEncoded,
    maskCanvas,
    encodeImage,
    decodeMask,
    reset,
  } = useSamWorker();

  const [imageCanvas, setImage] = useState<HTMLCanvasElement | null>(null); // canvas
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const fileInputEl = useRef<HTMLInputElement>(null);
  // input dialog for custom URLs
  const [inputDialogOpen, setInputDialogOpen] = useState(false);

  // Start decoding, prompt with mouse coords
  const imageClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageEncoded) {
      console.log("image not encoded");
      return;
    }

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
    const rect = (event.target as HTMLElement).getBoundingClientRect();

    // input image will be resized to 1024x1024 -> normalize mouse pos to 1024x1024
    const point = {
      x: ((event.clientX - rect.left) / canvas.width) * imageSize.w,
      y: ((event.clientY - rect.top) / canvas.height) * imageSize.h,
      label: event.button === 0 ? 1 : 0,
    };

    decodeMask(point);
  };

  // Crop image with mask
  const cropClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!imageCanvas || !maskCanvas) return;

    const url = maskImageCanvas(imageCanvas, maskCanvas).toDataURL();
    onImageCropped(url);
  };

  // Reset all the image-based state: points, mask, offscreen canvases ..
  const resetState = () => {
    setImage(null);
    reset();
  };

  // New image: From File
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      console.log("no files");
      return;
    }
    const file = e.target.files[0];
    const dataURL = window.URL.createObjectURL(file);

    resetState();
    const canvas = await getCanvasFromImageUrl(dataURL);
    setImage(canvas);
    await encodeImage(canvas);
  };

  // New image: From URL
  const handleUrl = async (urlText: string) => {
    const dataURL = urlText;

    resetState();
    const canvas = await getCanvasFromImageUrl(dataURL);
    setImage(canvas);
    await encodeImage(canvas);
  };

  const getCanvasFromImageUrl: (
    imageUrl: string,
  ) => Promise<HTMLCanvasElement> = async (imageUrl: string) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;

      img.onload = function () {
        const largestDim = Math.max(img.naturalWidth, img.naturalHeight);

        const box = resizeAndPadBox(
          { h: img.naturalHeight, w: img.naturalWidth },
          { h: largestDim, w: largestDim },
        );

        if (!box) {
          console.log("no box");
          reject(new Error("Failed to create box dimensions"));
          return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = largestDim;
        canvas.height = largestDim;

        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        ctx.drawImage(
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

        resolve(canvas);
      };

      img.onerror = function () {
        reject(new Error("Failed to load image"));
      };
    });
  };

  useEffect(() => {
    console.log("opened", opened);
    if (!opened) {
      reset();
    }
  }, [opened]);

  useEffect(() => {
    const getImage = async () => {
      const canvas = await getCanvasFromImageUrl(
        "https://upload.wikimedia.org/wikipedia/commons/3/38/Flamingos_Laguna_Colorada.jpg",
      );
      setImage(canvas);
      await encodeImage(canvas);
    };
    getImage();
  }, []);

  // Offscreen canvas changed, draw it
  useEffect(() => {
    if (imageCanvas && canvasEl.current) {
      drawImage(canvasEl.current, imageCanvas, maskCanvas ?? undefined);
    }
  }, [imageCanvas, maskCanvas]);

  const drawImage = (
    canvas: HTMLCanvasElement,
    image: HTMLCanvasElement,
    mask?: HTMLCanvasElement,
  ) => {
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    // Clear canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the base image
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

    // If mask is provided, draw it on top with alpha
    if (mask) {
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
    }
  };

  return (
    <div className="flex flex-col gap-4 pt-4 sam-editor">
      <ActionButtons
        loading={loading}
        imageEncoded={imageEncoded}
        status={status}
        fileInputEl={fileInputEl}
        setInputDialogOpen={setInputDialogOpen}
        cropClick={cropClick}
        mask={maskCanvas}
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
}

// Assuming this is your resizeAndPadBox function's type definition
interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}
