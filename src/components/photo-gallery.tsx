

import { useState } from "react";
import { X } from "lucide-react";

export default function PhotoGallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const photos = [
    { src: "/placeholder.svg?height=600&width=400", alt: "Couple photo 1" },
    { src: "/wedding/placeholder.svg?height=600&width=400", alt: "Couple photo 2" },
    { src: "/wedding/placeholder.svg?height=600&width=400", alt: "Couple photo 3" },
    { src: "/wedding/placeholder.svg?height=600&width=400", alt: "Couple photo 4" },
    { src: "/wedding/placeholder.svg?height=600&width=400", alt: "Couple photo 5" },
    { src: "/wedding/placeholder.svg?height=600&width=400", alt: "Couple photo 6" },
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-serif text-center text-[#3d3d3d] mb-16">
          Our Journey Together
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="aspect-[3/4] relative overflow-hidden rounded-lg cursor-pointer group"
              onClick={() => setSelectedImage(index)}
            >
              <img
                src={photo.src || "/wedding/placeholder.svg"}
                alt={photo.alt}
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black opacity-0 bg-opacity-50 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <p className="text-white text-lg font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  View Photo
                </p>
              </div>
            </div>
          ))}
        </div>

        {selectedImage !== null && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300"
              onClick={() => setSelectedImage(null)}
            >
              <X size={32} />
            </button>

            <div className="relative w-full max-w-3xl max-h-[80vh] aspect-[3/4]">
              <img
                src={photos[selectedImage].src || "/placeholder.svg"}
                alt={photos[selectedImage].alt}
          // fill 
                className="object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
