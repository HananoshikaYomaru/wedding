import { useState } from "react";
import { motion } from "motion/react";
import { Image } from "lucide-react";
import { ImageUploadDialog, ImageUploadDialog2 } from "./image-upload-dialog";
import { useWindowSize } from "react-use";
// Type definitions
export type Sticker = {
  id: number;
  x: number;
  y: number;
  rotation: number;
  type: "heart" | "image";
  scale: number;
  imageSrc?: string;
};

const BASIC_SCALE = 1.5;
const INITIAL_ROTATION = 30;
const INITIAL_SCALE_RANGE = 4;

const UPDATE_SCALE_RANGE = 6;
const UPDATE_ROTATION_RANGE = 30;

const DEFAULT_WIDTH = 1920;

export const DraggableStickers = () => {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [draggingSticker, setDraggingSticker] = useState<number | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const { width, height } = useWindowSize();

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

  const handleAddSticker = () => {
    setShowUploadDialog(true);
  };

  const addImageSticker = (imageUrl: string) => {
    setStickers([
      ...stickers,
      {
        id: stickers.length,
        // +- 100
        x: -100 + Math.random() * 200,
        y: -100 + Math.random() * 200,
        rotation: Math.random() * INITIAL_ROTATION - INITIAL_ROTATION / 2,
        scale:
          (Math.random() * INITIAL_SCALE_RANGE + BASIC_SCALE) *
          (width / DEFAULT_WIDTH),
        type: "image",
        imageSrc: imageUrl,
      },
    ]);
  };

  const handleClick = (id: number) => {
    setStickers(
      [...stickers].map((sticker) =>
        sticker.id === id
          ? {
              ...sticker,
              rotation:
                Math.random() * UPDATE_ROTATION_RANGE -
                UPDATE_ROTATION_RANGE / 2,
              scale:
                (Math.random() * UPDATE_SCALE_RANGE + BASIC_SCALE) *
                (width / DEFAULT_WIDTH),
            }
          : sticker,
      ),
    );
  };

  return (
    <>
      {/* Custom Image Stickers */}
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
          className="sticker img-sticker"
          alt="Custom sticker"
          src={sticker.imageSrc}
        />
      ))}
      <button onClick={handleAddSticker} className="add-sticker-button">
        <Image size={16} className="button-icon" />
        Add Sticker
      </button>
      <ImageUploadDialog2
        onImageCreated={addImageSticker}
        isOpen={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
      />
    </>
  );
};
