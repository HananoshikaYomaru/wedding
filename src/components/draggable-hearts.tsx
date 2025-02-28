import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Heart } from "lucide-react";

export const DraggableHearts = () => {
  const [hearts, setHearts] = useState<
    { id: number; x: number; y: number; rotation: number }[]
  >([]);
  const [draggingHeart, setDraggingHeart] = useState<number | null>(null);

  // Create initial hearts
  useEffect(() => {
    const initialHearts = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: 50 + i * 60,
      y: 50,
      rotation: Math.random() * 30 - 15,
    }));
    setHearts(initialHearts);
  }, []);

  const handleDragStart = (id: number) => {
    setDraggingHeart(id);
  };

  const handleDragEnd = (
    info: { offset: { x: number; y: number } },
    id: number,
  ) => {
    setDraggingHeart(null);
    setHearts(
      hearts.map((heart) =>
        heart.id === id
          ? { ...heart, x: heart.x + info.offset.x, y: heart.y + info.offset.y }
          : heart,
      ),
    );
  };

  const addHeart = () => {
    const newHeart = {
      id: Date.now(),
      x: Math.random() * 200 + 100,
      y: Math.random() * 100 + 50,
      rotation: Math.random() * 30 - 15,
    };
    setHearts([...hearts, newHeart]);
  };

  return (
    <>
      {/* Hearts */}
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          drag
          dragMomentum={false}
          onDragStart={() => handleDragStart(heart.id)}
          onDragEnd={(_: any, info: any) => handleDragEnd(info, heart.id)}
          initial={{ x: heart.x, y: heart.y, rotate: heart.rotation }}
          animate={{
            x: heart.x,
            y: heart.y,
            rotate: heart.rotation,
            scale: draggingHeart === heart.id ? 1.2 : 1,
          }}
          className="heart"
        >
          <Heart size={32} className="heart-icon" />
        </motion.div>
      ))}

      <button onClick={addHeart} className="add-heart-button">
        <Heart size={16} className="button-icon" />
        Add Heart
      </button>
    </>
  );
};
