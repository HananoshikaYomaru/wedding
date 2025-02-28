import { useState } from "react";
import { X } from "lucide-react";
import "react-photo-album/masonry.css";

type Photo = {
  src: string;
  description: string;
  alt: string;
};

// https://app1.sharemyimage.com/2025/01/08/1FEEEABB-9EF6-46DA-9AC8-7ABCAA681D33_4_5005_c.jpeg
// https://app1.sharemyimage.com/2025/01/08/1FE052E4-EFEB-4AE7-95D0-5315F76A95D4_4_5005_c.jpeg
// https://app1.sharemyimage.com/2025/01/08/1F521EE7-1FFE-4A13-A7E4-2AE5FBBAA7BF_4_5005_c.jpeg
// https://app1.sharemyimage.com/2025/01/08/1F6BBE3F-3FCE-4908-879E-906624E34D96_4_5005_c.jpeg
// https://app1.sharemyimage.com/2025/01/08/1E565CC3-6A69-4E01-A811-47A6F5BD8E72_4_5005_c.jpeg
// https://app1.sharemyimage.com/2025/01/08/1AE6B095-5318-4524-B643-3002F2E55031_4_5005_c.jpeg

const photos: Photo[] = [
  {
    src: `https://app1.sharemyimage.com/2025/01/08/1FEEEABB-9EF6-46DA-9AC8-7ABCAA681D33_4_5005_c.jpeg`,
    description: "Couple photo 1",
    alt: "Couple photo 1",
  },
  {
    src: `https://app1.sharemyimage.com/2025/01/08/1FE052E4-EFEB-4AE7-95D0-5315F76A95D4_4_5005_c.jpeg`,
    description: "Couple photo 2",
    alt: "Couple photo 2",
  },
  {
    src: `https://app1.sharemyimage.com/2025/01/08/1F521EE7-1FFE-4A13-A7E4-2AE5FBBAA7BF_4_5005_c.jpeg`,
    description: "Couple photo 3",
    alt: "Couple photo 3",
  },
  {
    src: `https://app1.sharemyimage.com/2025/01/08/1F6BBE3F-3FCE-4908-879E-906624E34D96_4_5005_c.jpeg`,
    description: "Couple photo 4",
    alt: "Couple photo 4",
  },
  {
    src: `https://app1.sharemyimage.com/2025/01/08/1E565CC3-6A69-4E01-A811-47A6F5BD8E72_4_5005_c.jpeg`,
    description: "Couple photo 5",
    alt: "Couple photo 5",
  },
  {
    src: `https://app1.sharemyimage.com/2025/01/08/1AE6B095-5318-4524-B643-3002F2E55031_4_5005_c.jpeg`,
    description: "Couple photo 6",
    alt: "Couple photo 6",
  },
];

const Lightbox = ({
  photos,
  selectedImage,
  setSelectedImage,
}: {
  photos: Photo[];
  selectedImage: number;
  setSelectedImage: (index: number | null) => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <button
        className="absolute top-4 right-4 text-white hover:text-gray-300"
        onClick={() => setSelectedImage(null)}
      >
        <X size={32} />
      </button>

      <div className="flex flex-col items-center justify-center">
        <div className="relative w-full max-w-3xl max-h-[80vh] aspect-[3/4]">
          <img
            src={photos[selectedImage].src || "/placeholder.svg"}
            alt={photos[selectedImage].alt}
            className="object-contain h-full"
          />
        </div>
        <p className="text-white text-lg font-medium  transition-opacity duration-300">
          {photos[selectedImage].description}
        </p>
      </div>
    </div>
  );
};

export default function PhotoGallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  return (
    <section className="py-20 px-4 z-[5] bg-white">
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
                src={photo.src || `${import.meta.env.BASE_URL}/placeholder.svg`}
                alt={photo.alt}
                className="object-cover transition-transform duration-300 group-hover:scale-110 h-full"
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
          <Lightbox
            photos={photos}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
          />
        )}
      </div>
    </section>
  );
}
