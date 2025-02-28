import { useState } from "react";
import { motion } from "motion/react";
import { Image } from "lucide-react";
import { ImageUploadDialog, ImageUploadDialog2 } from "./image-upload-dialog";

// Type definitions
export type Sticker = {
  id: number;
  x: number;
  y: number;
  rotation: number;
  type: "heart" | "image";
  imageSrc?: string;
};

export const DraggableStickers = () => {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [draggingSticker, setDraggingSticker] = useState<number | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

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

  const addImageSticker = (sticker: Sticker) => {
    setStickers([...stickers, sticker]);
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
          initial={{ x: sticker.x, y: sticker.y, rotate: sticker.rotation }}
          animate={{
            x: sticker.x,
            y: sticker.y,
            rotate: sticker.rotation,
            scale: draggingSticker === sticker.id ? 1.2 : 1,
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
        onStickerCreated={addImageSticker}
        isOpen={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
      />
    </>
  );
};
