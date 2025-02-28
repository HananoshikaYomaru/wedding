import { useEffect, useState, useRef } from "react";
import { Upload, LoaderCircle, Crop } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Sticker } from "./draggable-stickers";
import {
  resizeCanvas,
  maskImageCanvas,
  canvasToFloat32Array,
  float32ArrayToCanvas,
} from "./image-segmentation";

import {
  mergeMasks,
  resizeAndPadBox,
  sliceTensor,
  maskCanvasToFloat32Array,
} from "@/lib/imageutils";
import { SamEditor } from "./sam-editor";

// Point type for selection
export type Point = {
  x: number;
  y: number;
  label: 0 | 1; // 0 = negative (red), 1 = positive (green)
};

// use the sam-editor component to create a sticker

type ImageUploadDialog2Props = {
  onStickerCreated: (sticker: Sticker) => void;
  isOpen: boolean;
  onClose: () => void;
};

export const ImageUploadDialog2 = ({
  isOpen,
  onClose,
}: ImageUploadDialog2Props) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Your Sticker</DialogTitle>
        </DialogHeader>
        <SamEditor />
      </DialogContent>
    </Dialog>
  );
};

export const ImageUploadDialog = ({
  onStickerCreated,
  isOpen,
  onClose,
}: {
  onStickerCreated: (sticker: Sticker) => void;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  /**
   * the image we are currently working on
   */
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  /**
   * the image we are currently working on
   */
  const [segmentedImage, setSegmentedImage] = useState<string | null>(null);
  /**
   * the mask we are currently working on
   */
  const [maskCanvas, setMaskCanvas] = useState<HTMLCanvasElement | null>(null);
  /**
   * the file input ref
   */
  const fileInputRef = useRef<HTMLInputElement>(null);
  /**
   * the canvas ref
   */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const imageCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const samWorker = useRef<Worker | null>(null);
  const [imageEncoded, setImageEncoded] = useState(false);
  const [prevMaskArray, setPrevMaskArray] = useState<Float32Array | null>(null);

  const imageSize = { w: 1024, h: 1024 };
  const maskSize = { w: 256, h: 256 };

  // Decoding finished -> parse result and update mask
  const handleDecodingResults = (decodingResults: any) => {
    // SAM2 returns 3 mask along with scores -> select best one
    const maskTensors = decodingResults.masks;
    const [bs, noMasks, width, height] = maskTensors.dims;
    const maskScores = decodingResults.iou_predictions.cpuData;
    const bestMaskIdx = maskScores.indexOf(Math.max(...maskScores));
    const bestMaskArray = sliceTensor(maskTensors, bestMaskIdx);
    let bestMaskCanvas = float32ArrayToCanvas(bestMaskArray, width, height);
    bestMaskCanvas = resizeCanvas(bestMaskCanvas, imageSize);

    setMaskCanvas(bestMaskCanvas);
    setPrevMaskArray(bestMaskArray);
  };

  // Handle web worker messages
  const onWorkerMessage = (event: MessageEvent): void => {
    const { type, data } = event.data;

    if (type == "pong") {
      const { success, device } = data;

      if (success) {
        setIsProcessing(false);
        // setDevice(device);
        // setStatus("Encode image");
      } else {
        // setStatus("Error (check JS console)");
      }
    } else if (type == "downloadInProgress" || type == "loadingInProgress") {
      setIsProcessing(true);
      //   setStatus("Loading model");
    } else if (type == "encodeImageDone") {
      // alert(data.durationMs)
      //   setImageEncoded(true);
      setIsProcessing(false);
      //   setStatus("Ready. Click on image");
    } else if (type == "decodeMaskResult") {
      handleDecodingResults(data);
      setIsProcessing(false);
      //   setStatus("Ready. Click on image");
    } else if (type == "stats") {
      //   setStats(data);
    }
  };

  // Draw points and mask on canvas
  useEffect(() => {
    if (canvasRef.current && selectedImage) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the background image
        const img = new Image();
        img.onload = () => {
          // Draw the image
          ctx.drawImage(
            img,
            0,
            0,
            img.width,
            img.height,
            0,
            0,
            canvas.width,
            canvas.height,
          );

          // Draw the mask if available
          if (maskCanvas) {
            ctx.globalAlpha = 0.5; // Set transparency
            ctx.drawImage(
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
            ctx.globalAlpha = 1.0;
          }

          // Draw points
          points.forEach((point) => {
            ctx.beginPath();
            ctx.arc(
              (point.x / 1024) * canvas.width,
              (point.y / 1024) * canvas.height,
              8,
              0,
              2 * Math.PI,
            );
            ctx.fillStyle =
              point.label === 1
                ? "rgba(0, 255, 0, 0.7)"
                : "rgba(255, 0, 0, 0.7)";
            ctx.fill();

            // Add a border to make points more visible
            ctx.strokeStyle =
              point.label === 1 ? "rgba(0, 200, 0, 1)" : "rgba(200, 0, 0, 1)";
            ctx.lineWidth = 2;
            ctx.stroke();
          });
        };
        img.src = selectedImage;
      }
    }
  }, [points, selectedImage, maskCanvas]);

  // Start encoding image
  const encodeImageClick = async () => {
    if (!samWorker.current || !imageCanvasRef.current) return;
    samWorker.current.postMessage({
      type: "encodeImage",
      data: canvasToFloat32Array(
        resizeCanvas(imageCanvasRef.current, imageSize),
      ),
    });

    setIsProcessing(true);
    // setStatus("Encoding");
  };

  // Start decoding, prompt with mouse coords
  const imageClick = (event: React.MouseEvent) => {
    if (!imageEncoded) return;

    event.preventDefault();

    const canvas = imageCanvasRef.current;
    // TODO: fix this
    const rect = event.target.getBoundingClientRect();

    // input image will be resized to 1024x1024 -> normalize mouse pos to 1024x1024
    // const point = {
    //   x: ((event.clientX - rect.left) / canvas.width) * imageSize.w,
    //   y: ((event.clientY - rect.top) / canvas.height) * imageSize.h,
    //   label: event.button === 0 ? 1 : 0,
    // };
    // pointsRef.current.push(point);

    // do we have a mask already? ie. a refinement click?
    if (!samWorker.current) return;
    if (prevMaskArray) {
      const maskShape = [1, 1, maskSize.w, maskSize.h];

      samWorker.current.postMessage({
        type: "decodeMask",
        data: {
          points: points,
          maskArray: prevMaskArray,
          maskShape: maskShape,
        },
      });
    } else {
      samWorker.current.postMessage({
        type: "decodeMask",
        data: {
          points: points,
          maskArray: null,
          maskShape: null,
        },
      });
    }

    setIsProcessing(true);
    // setStatus("Decoding");
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setSelectedImage(e.target.result as string);
        // Clear any existing points and mask when loading a new image
        setPoints([]);
        setMaskCanvas(null);
        setSegmentedImage(null);

        // Create an image canvas for later use
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            imageCanvasRef.current = canvas;
          }
        };
        img.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canvasRef.current || !selectedImage) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / canvasRef.current.width) * 1024; // Normalize to 1024
    const y = ((e.clientY - rect.top) / canvasRef.current.height) * 1024;

    const newPoint: Point = {
      x,
      y,
      label: e.button === 0 ? 1 : 0, // Left click = foreground (green), right click = background (red)
    };

    setPoints([...points, newPoint]);
    setIsProcessing(true);

    // Create a green mask for the selected area
    // In a real implementation, this would come from the segmentation model
    setTimeout(() => {
      if (canvasRef.current) {
        const mask = document.createElement("canvas");
        mask.width = 1024;
        mask.height = 1024;
        const maskCtx = mask.getContext("2d") as CanvasRenderingContext2D;

        if (maskCtx) {
          // Fill with green for the selected area
          maskCtx.fillStyle = "#32cd32"; // lime green

          maskCtx.fillRect(0, 0, mask.width, mask.height);

          setMaskCanvas(mask);
          setSegmentedImage(selectedImage);
          setIsProcessing(false);
        }
      }
    }, 1000);

    imageClick(e);
  };

  const handleConfirm = () => {
    if (segmentedImage && maskCanvas && imageCanvasRef.current) {
      // Create a masked image using the original image and the mask
      const maskedCanvas = maskImageCanvas(imageCanvasRef.current, maskCanvas);

      // Create the sticker
      const newSticker: Sticker = {
        id: Date.now(),
        x: Math.random() * 200 + 100,
        y: Math.random() * 100 + 50,
        rotation: Math.random() * 30 - 15,
        type: "image",
        imageSrc: maskedCanvas.toDataURL(),
      };

      onStickerCreated(newSticker);
      resetState();
      onClose();
    }
  };

  const resetState = () => {
    setSelectedImage(null);
    setSegmentedImage(null);
    setPoints([]);
    setMaskCanvas(null);
    imageCanvasRef.current = null;
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          resetState();
        }
      }}
    >
      <DialogContent className="dialog-content-wrapper">
        <DialogHeader>
          <DialogTitle>Create Your Sticker</DialogTitle>
        </DialogHeader>

        <div className="dialog-content">
          {!selectedImage ? (
            <div className="file-upload-container">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInput}
                accept="image/*"
                className="hidden-input"
              />
              <button
                className="file-select-button"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={24} />
                <span>Select an image</span>
              </button>
            </div>
          ) : (
            <>
              <p className="dialog-instructions">
                <span className="instruction-highlight positive">
                  Left-click
                </span>{" "}
                to select the object (green),{" "}
                <span className="instruction-highlight negative">
                  right-click
                </span>{" "}
                to mark background (red)
              </p>

              <div className="canvas-container">
                <canvas
                  ref={canvasRef}
                  width={512}
                  height={512}
                  onClick={handleCanvasClick}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleCanvasClick(e);
                  }}
                />

                {isProcessing && (
                  <div className="processing-overlay">
                    <LoaderCircle className="spinner" />
                    <p>Processing...</p>
                  </div>
                )}
              </div>

              <DialogFooter className="dialog-actions">
                <DialogClose className="cancel-button">Cancel</DialogClose>
                <button
                  className="confirm-button"
                  onClick={handleConfirm}
                  disabled={!segmentedImage}
                >
                  <Crop size={16} />
                  Create Sticker
                </button>
              </DialogFooter>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
