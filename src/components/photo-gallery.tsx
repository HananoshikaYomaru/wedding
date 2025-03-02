import { useState, useCallback, useEffect } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import "./photo-gallery.css";

type Photo = {
  src: string;
  description?: string;
  /**
   * if no alt is provided, the description will be used as the alt text
   */
  alt?: string;
};

// public/gallery/2023-halloween.JPG
// public/gallery/2024-christmas.jpeg
// public/gallery/2024-halloween.jpeg
// public/gallery/2024-manlung-bd.jpeg
// public/gallery/2024-winter.jpeg
// public/gallery/blue-pink.JPG
// public/gallery/bridge-fun.JPG
// public/gallery/bridge-hug.JPG
// public/gallery/bridge-selfie.JPG
// public/gallery/bridge-sidehead.JPG
// public/gallery/confess-book-of-love.JPG
// public/gallery/confess.JPG
// public/gallery/dingding-hongkong.JPG
// public/gallery/disney.jpg
// public/gallery/go-steady.jpeg
// public/gallery/graduation.jpg
// public/gallery/hong-kong-sunset.jpg
// public/gallery/hongkong-seashore.jpg
// public/gallery/japan-bridge.JPG
// public/gallery/natalie-bd.JPG
// public/gallery/northern-light.jpeg
// public/gallery/propose-hug.JPG
// public/gallery/propose-success.JPG
// public/gallery/propose.jpg
// public/gallery/riding-horse.jpeg
// public/gallery/ring.jpeg
// public/gallery/triple-date.JPG
// public/gallery/vancouver-sakura.JPG

const photos: Photo[] = [
  {
    src: `${import.meta.env.BASE_URL}/gallery/propose.jpg`,
  },
  {
    src: `${import.meta.env.BASE_URL}/gallery/propose-hug.JPG`,
  },
  {
    src: `${import.meta.env.BASE_URL}/gallery/propose-success.JPG`,
  },
  {
    src: `${import.meta.env.BASE_URL}/gallery/blue-pink.JPG`,
  },
  {
    src: `${import.meta.env.BASE_URL}/gallery/bridge-fun.JPG`,
  },
  {
    src: `${import.meta.env.BASE_URL}/gallery/bridge-hug.JPG`,
  },
  {
    src: `${import.meta.env.BASE_URL}/gallery/2023-halloween.JPG`,
    description: "Having fun in Halloween 2023 with Vancouver campus ministry",
  },
  {
    src: `${import.meta.env.BASE_URL}/gallery/2024-christmas.jpeg`,
    description: "Vandusen Garden Christmas 2024",
  },
  {
    src: `${import.meta.env.BASE_URL}/gallery/2024-halloween.jpeg`,
    description: "Halloween 2024 with Vancouver campus ministry",
  },
  {
    src: `${import.meta.env.BASE_URL}/gallery/2024-manlung-bd.jpeg`,
    description: "Man Lung's birthday 2024",
  },
  {
    src: `${import.meta.env.BASE_URL}/gallery/2024-winter.jpeg`,
    description: "We are playing snow in Winter 2024",
  },

  {
    src: `${import.meta.env.BASE_URL}/gallery/bridge-selfie.JPG`,
  },
  {
    src: `${import.meta.env.BASE_URL}/gallery/bridge-sidehead.JPG`,
  },
  {
    src: `${import.meta.env.BASE_URL}/gallery/confess-book-of-love.JPG`,
  },
  {
    src: `${import.meta.env.BASE_URL}/gallery/confess.JPG`,
  },
  {
    src: `${import.meta.env.BASE_URL}/gallery/dingding-hongkong.JPG`,
  },
  {
    src: `${import.meta.env.BASE_URL}/gallery/disney.jpg`,
  },
  {
    src: `${import.meta.env.BASE_URL}/gallery/go-steady.jpeg`,
  },
  {
    src: `${import.meta.env.BASE_URL}/gallery/graduation.jpg`,
  },
  {
    src: `${import.meta.env.BASE_URL}/gallery/hong-kong-sunset.jpg`,
  },
  {
    src: `${import.meta.env.BASE_URL}/gallery/hongkong-seashore.jpg`,
  },
  {
    src: `${import.meta.env.BASE_URL}/gallery/japan-bridge.JPG`,
  },
  {
    src: `${import.meta.env.BASE_URL}/gallery/natalie-bd.JPG`,
  },
  {
    src: `${import.meta.env.BASE_URL}/gallery/northern-light.jpeg`,
  },

  {
    src: `${import.meta.env.BASE_URL}/gallery/riding-horse.jpeg`,
  },
  {
    src: `${import.meta.env.BASE_URL}/gallery/ring.jpeg`,
  },
  {
    src: `${import.meta.env.BASE_URL}/gallery/triple-date.JPG`,
  },
  {
    src: `${import.meta.env.BASE_URL}/gallery/vancouver-sakura.JPG`,
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
  const handlePrevious = useCallback(() => {
    setSelectedImage(selectedImage > 0 ? selectedImage - 1 : null);
  }, [setSelectedImage, selectedImage]);

  const handleNext = useCallback(() => {
    setSelectedImage(
      selectedImage < photos.length - 1 ? selectedImage + 1 : null,
    );
  }, [setSelectedImage, selectedImage, photos.length]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") setSelectedImage(null);
    },
    [handlePrevious, handleNext, setSelectedImage],
  );

  // Add event listener for keyboard navigation
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="lightbox">
      <button
        className="lightbox-close-button"
        onClick={() => setSelectedImage(null)}
        aria-label="Close lightbox"
      >
        <X size={32} />
      </button>

      <div className="lightbox-container">
        <TransformWrapper
          initialScale={0.5}
          minScale={0.2}
          maxScale={3}
          centerOnInit
          wheel={{ wheelDisabled: false, step: 15 }}
          doubleClick={{ disabled: false }}
          panning={{ disabled: false }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <div className="lightbox-image-container">
                <TransformComponent>
                  <img
                    src={photos[selectedImage].src || "/placeholder.svg"}
                    alt={photos[selectedImage].alt}
                    style={{
                      maxHeight: "100%",
                      maxWidth: "100%",
                      objectFit: "contain",
                    }}
                  />
                </TransformComponent>
              </div>
              <div className="zoom-controls">
                <button
                  onClick={() => zoomIn()}
                  className="zoom-button"
                  type="button"
                >
                  <ZoomIn size={20} />
                </button>
                <button
                  onClick={() => zoomOut()}
                  className="zoom-button"
                  type="button"
                >
                  <ZoomOut size={20} />
                </button>
                <button
                  onClick={() => resetTransform()}
                  className="zoom-button"
                  type="button"
                >
                  <RotateCw size={20} />
                </button>
                <button
                  className="lightbox-nav-button"
                  onClick={handlePrevious}
                  disabled={selectedImage === 0}
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  className="lightbox-nav-button"
                  onClick={handleNext}
                  disabled={selectedImage === photos.length - 1}
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </>
          )}
        </TransformWrapper>

        <p className="lightbox-description">
          {photos[selectedImage].description}
        </p>
      </div>
    </div>
  );
};

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  return (
    <div className="pagination">
      <button
        className="pagination-button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft size={16} />
      </button>

      <span className="pagination-current">
        {currentPage} / {totalPages}
      </span>

      <button
        className="pagination-button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default function PhotoGallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const photosPerPage = 6;

  // Calculate total pages
  const totalPages = Math.ceil(photos.length / photosPerPage);

  // Get current photos
  const indexOfLastPhoto = currentPage * photosPerPage;
  const indexOfFirstPhoto = indexOfLastPhoto - photosPerPage;
  const currentPhotos = photos.slice(indexOfFirstPhoto, indexOfLastPhoto);

  // Change page
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <section className="photo-gallery-section">
      <div className="photo-gallery-container">
        <h2 className="photo-gallery-title">Our Journey Together</h2>

        <div className="photo-gallery-grid">
          {currentPhotos.map((photo, index) => (
            <div
              key={index}
              className="photo-item"
              onClick={() => setSelectedImage(indexOfFirstPhoto + index)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setSelectedImage(indexOfFirstPhoto + index);
                }
              }}
              role="button"
              aria-label={photo.alt ? `View ${photo.alt}` : photo.description}
            >
              <img
                src={photo.src || `${import.meta.env.BASE_URL}/placeholder.svg`}
                alt={photo.alt}
                className="photo-image object-cover w-full h-full"
              />
              <div className="photo-overlay">
                <p className="photo-view-text">View Photo</p>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}

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
