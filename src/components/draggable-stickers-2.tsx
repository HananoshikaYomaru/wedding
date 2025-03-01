import { useEffect, useState } from "react";
import { motion } from "motion/react";
import "./hero.css";
import { useWindowSize } from "react-use";

// Type definitions
export type Sticker = {
  id: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  imageSrc: string;
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

const createInitialSticker = (index: number, width: number, height: number) => {
  return {
    id: index,
    x: Math.random() * (width * 0.6) + width * 0.2,
    y: Math.random() * (height * 0.2) + height * 0.6,
    rotation: Math.random() * INITIAL_ROTATION - INITIAL_ROTATION / 2,
    scale: Math.random() * INITIAL_SCALE_RANGE + BASIC_SCALE,
    imageSrc: predefinedImages[index],
  };
};

export const DraggableStickers2 = () => {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [draggingSticker, setDraggingSticker] = useState<number | null>(null);

  const { width, height } = useWindowSize();

  // Create initial stickers
  useEffect(() => {
    // Create all stickers initially with random size and position
    const initialStickers = predefinedImages.map((image, index) =>
      createInitialSticker(index, width, height),
    );
    setStickers(initialStickers);
  }, []);

  const handleStickerDragStart = (id: number) => {
    setDraggingSticker(id);
  };

  const handleStickerDragEnd = (
    info: { offset: { x: number; y: number } },
    id: number,
  ) => {
    setDraggingSticker(null);
    setStickers(
      stickers.map((sticker) =>
        sticker.id === id
          ? {
              ...sticker,
              x: sticker.x + info.offset.x,
              y: sticker.y + info.offset.y,
            }
          : sticker,
      ),
    );
  };

  const handleClick = (id: number) => {
    // randomly change the position and scale
    setStickers(
      stickers.map((sticker) =>
        sticker.id === id
          ? {
              ...sticker,
              scale: Math.random() * UPDATE_SCALE_RANGE + BASIC_SCALE,
              rotation:
                Math.random() * UPDATE_ROTATION_RANGE -
                UPDATE_ROTATION_RANGE / 2,
            }
          : sticker,
      ),
    );
  };

  return (
    <>
      {/* Predefined Image Stickers */}
      {stickers.map((sticker) => (
        <motion.img
          key={sticker.id}
          drag
          dragMomentum={false}
          onDragStart={() => handleStickerDragStart(sticker.id)}
          onDragEnd={(_: any, info: any) =>
            handleStickerDragEnd(info, sticker.id)
          }
          onClick={() => handleClick(sticker.id)}
          initial={{ x: sticker.x, y: sticker.y, rotate: sticker.rotation }}
          animate={{
            x: sticker.x,
            y: sticker.y,
            rotate: sticker.rotation,
            scale: sticker.scale * (draggingSticker === sticker.id ? 1.2 : 1),
          }}
          className="sticker image-sticker"
          alt="Sticker"
          src={sticker.imageSrc}
        />
      ))}
    </>
  );
};

export default DraggableStickers2;
