import { useEffect, useState } from "react";
import { motion, useAnimation } from "motion/react";
import { Heart } from "lucide-react";

const DraggableHearts = () => {
  const [hearts, setHearts] = useState<
    { id: number; x: number; y: number; rotation: number }[]
  >([]);
  const [draggingHeart, setDraggingHeart] = useState<number | null>(null);
  const controls = useAnimation();

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

  const handleDragEnd = (info: any, id: number) => {
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
      id: hearts.length,
      x: Math.random() * 200 + 100,
      y: Math.random() * 100 + 50,
      rotation: Math.random() * 30 - 15,
    };
    setHearts([...hearts, newHeart]);
  };

  return (
    <div>
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          drag
          // dragConstraints={{ left: 0, right: 400, top: 0, bottom: 150 }}
          onDragStart={() => handleDragStart(heart.id)}
          onDragEnd={(_, info) => handleDragEnd(info, heart.id)}
          initial={{ x: heart.x, y: heart.y, rotate: heart.rotation }}
          animate={{
            x: heart.x,
            y: heart.y,
            rotate: heart.rotation,
            scale: draggingHeart === heart.id ? 1.2 : 1,
          }}
          className="absolute cursor-grab active:cursor-grabbing"
          style={{ x: heart.x, y: heart.y }}
        >
          <Heart size={32} className="text-[#d1837b] fill-[#e5a199] " />
        </motion.div>
      ))}

      <button
        onClick={addHeart}
        className="absolute bottom-2 right-2 text-sm text-[#d3b8a3] hover:text-[#c09a7e]"
      >
        Add Heart
      </button>
    </div>
  );
};

export default function Hero() {
  return (
    <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden ">
      <div className="absolute inset-0 z-0">
        <img
          src={`${import.meta.env.BASE_URL}/placeholder.svg?height=1080&width=1920`}
          alt="Wedding background"
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#faf7f5]"></div>
      </div>

      <div className="relative z-10 text-center px-4">
        <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-[#3d3d3d] mb-4">
          Natalie & Man Lung
        </h1>
        <p className="text-xl md:text-2xl text-[#6d6d6d] font-light mb-8">
          We're getting married!
        </p>
        <p className="text-lg md:text-xl text-[#6d6d6d] font-light italic">
          July 6, 2025 • Vancouver, BC
        </p>
      </div>

      <div className="relative z-10 mt-12 w-full max-w-md h-48 border-2 border-dashed border-[#d3b8a3] rounded-lg flex items-center justify-center bg-white/50 backdrop-blur-sm">
        <p className="absolute top-2 left-0 right-0 text-center text-[#6d6d6d] text-sm">
          Drag the hearts around or tap to add more!
        </p>

        <DraggableHearts />
      </div>
    </section>
  );
}
