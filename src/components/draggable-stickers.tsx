import { useState, memo } from "react";
import { motion } from "motion/react";
import { Image } from "lucide-react";
import { ImageUploadDialog } from "./image-upload-dialog";
import { useWindowSize } from "react-use";
import "./hero.css";
import type { PanInfo } from "motion/react";
// Type definitions
export type Sticker = {
  id: number;
  // x: number;
  // y: number;
  // rotation: number;
  // scale: number;
  type: "heart" | "image";
  imageSrc?: string;
};

export type StickerMetadata = {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
};

const BASIC_SCALE = 1.5;
const INITIAL_ROTATION = 30;
const INITIAL_SCALE_RANGE = 4;

const UPDATE_SCALE_RANGE = 6;
const UPDATE_ROTATION_RANGE = 30;

const DEFAULT_WIDTH = 1920;

// Individual sticker component to prevent unnecessary re-renders
const StickerItem = memo(
  ({
    sticker,
    // onDragStart,
    // onDragEnd,
    // onClick,
    // isDragging,
  }: {
    sticker: Sticker;
    // onDragStart: () => void;
    // onDragEnd: (info: any) => void;
    // onClick: () => void;
    // isDragging: boolean;
  }) => {
    const { width } = useWindowSize();
    const [data, setData] = useState<StickerMetadata>({
      id: sticker.id,
      x: Math.random() * 200,
      y: Math.random() * 200,
      rotation: Math.random() * INITIAL_ROTATION - INITIAL_ROTATION / 2,
      scale:
        (Math.random() * INITIAL_SCALE_RANGE + BASIC_SCALE) *
        (width / DEFAULT_WIDTH),
    });
    const [isDragging, setIsDragging] = useState(false);

    const handleClick = () => {
      if (isDragging) return;
      setData((data) => ({
        ...data,
        rotation:
          Math.random() * UPDATE_ROTATION_RANGE - UPDATE_ROTATION_RANGE / 2,
        scale:
          (Math.random() * UPDATE_SCALE_RANGE + BASIC_SCALE) *
          (width / DEFAULT_WIDTH),
      }));
    };

    const handleDragEnd = (
      event: MouseEvent | TouchEvent | PointerEvent,
      info: PanInfo,
    ) => {
      setIsDragging(false);
      setData((data) => ({
        ...data,
        x: data.x + info.offset.x,
        y: data.y + info.offset.y,
      }));
    };

    const handleDragStart = (
      event: MouseEvent | TouchEvent | PointerEvent,
      info: PanInfo,
    ) => {
      setIsDragging(true);
      setData((data) => ({
        ...data,
        x: data.x,
        y: data.y,
      }));
    };

    return (
      <motion.img
        key={data.id}
        drag
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        initial={{ x: data.x, y: data.y, rotate: data.rotation }}
        animate={{
          x: data.x,
          y: data.y,
          rotate: data.rotation,
          scale: data.scale * (isDragging ? 1.2 : 1),
        }}
        className="sticker img-sticker"
        alt="Custom sticker"
        src={sticker.imageSrc}
      />
    );
  },
);

StickerItem.displayName = "StickerItem";

export const DraggableStickers = () => {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  // const [draggingSticker, setDraggingSticker] = useState<number | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const { width } = useWindowSize();

  // const handleStickerDragStart = (id: number) => {
  //   // setDraggingSticker(id);
  // };

  // const handleStickerDragEnd = (
  //   id: number,
  //   info: { offset: { x: number; y: number } },
  // ) => {
  //   // setDraggingSticker(null);
  //   setStickers(
  //     stickers.map((sticker) =>
  //       sticker.id === id
  //         ? {
  //             ...sticker,
  //             x: sticker.x + info.offset.x,
  //             y: sticker.y + info.offset.y,
  //           }
  //         : sticker,
  //     ),
  //   );
  // };

  const handleAddSticker = () => {
    setShowUploadDialog(true);
  };

  const addImageSticker = (imageUrl: string) => {
    const newSticker = {
      id: Date.now(), // Using timestamp for more unique IDs
      // x: -100 + Math.random() * 200,
      // y: -100 + Math.random() * 200,
      // rotation: Math.random() * INITIAL_ROTATION - INITIAL_ROTATION / 2,
      // scale:
      //   (Math.random() * INITIAL_SCALE_RANGE + BASIC_SCALE) *
      //   (width / DEFAULT_WIDTH),
      type: "image",
      imageSrc: imageUrl,
    } satisfies Sticker;
    setStickers([...stickers, newSticker]);
  };

  // const handleClick = (id: number) => {
  //   setStickers(
  //     stickers.map((sticker) =>
  //       sticker.id === id
  //         ? {
  //             ...sticker,
  //             rotation:
  //               Math.random() * UPDATE_ROTATION_RANGE -
  //               UPDATE_ROTATION_RANGE / 2,
  //             scale:
  //               (Math.random() * UPDATE_SCALE_RANGE + BASIC_SCALE) *
  //               (width / DEFAULT_WIDTH),
  //           }
  //         : sticker,
  //     ),
  //   );
  // };

  return (
    <>
      {/* Custom Image Stickers */}
      {stickers.map((sticker) => (
        <StickerItem
          key={sticker.id}
          sticker={sticker}
          // onDragStart={() => handleStickerDragStart(sticker.id)}
          // onDragEnd={(info) => handleStickerDragEnd(sticker.id, info)}
          // onClick={() => handleClick(sticker.id)}
          // isDragging={draggingSticker === sticker.id}
        />
      ))}
      <button onClick={handleAddSticker} className="add-sticker-button">
        <Image size={16} className="button-icon" />
        Add Sticker
      </button>
      <ImageUploadDialog
        onImageCreated={addImageSticker}
        isOpen={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
      />
    </>
  );
};
