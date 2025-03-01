import { useState, useEffect, memo } from "react";
import { motion } from "motion/react";
import "./hero.css";
import { useWindowSize } from "react-use";
import type { PanInfo } from "motion/react";

// Type definitions
export type Sticker = {
  id: number;
  imageSrc: string;
};

export type StickerMetadata = {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
};

// Predefined sticker images
const predefinedImages = [
  `${import.meta.env.BASE_URL}/download (1).png`,
  `${import.meta.env.BASE_URL}/download (2).png`,
  `${import.meta.env.BASE_URL}/download (3).png`,
  `${import.meta.env.BASE_URL}/download (4).png`,
  `${import.meta.env.BASE_URL}/download (5).png`,
  `${import.meta.env.BASE_URL}/download (6).png`,
  `${import.meta.env.BASE_URL}/download (7).png`,
  `${import.meta.env.BASE_URL}/download (8).png`,
];

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
    width,
    height,
  }: {
    sticker: Sticker;
    width: number;
    height: number;
  }) => {
    const [data, setData] = useState<StickerMetadata>({
      id: sticker.id,
      x: Math.random() * (width * 0.6) + width * 0.2,
      y: Math.random() * (height * 0.2) + height * 0.6,
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
        className="sticker image-sticker"
        alt="Sticker"
        src={sticker.imageSrc}
      />
    );
  },
);

StickerItem.displayName = "StickerItem";

export const DraggableStickers2 = () => {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const { width, height } = useWindowSize();

  // Create initial stickers
  useEffect(() => {
    // Create all stickers initially
    const initialStickers = predefinedImages.map((imageSrc, index) => ({
      id: index,
      imageSrc,
    }));
    setStickers(initialStickers);
  }, []);

  return (
    <>
      {stickers.map((sticker) => (
        <StickerItem
          key={sticker.id}
          sticker={sticker}
          width={width}
          height={height}
        />
      ))}
    </>
  );
};

export default DraggableStickers2;
