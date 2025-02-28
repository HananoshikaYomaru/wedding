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
      >
        <X size={32} />
      </button>

      <div className="lightbox-container">
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={4}
          centerOnInit
          wheel={{ wheelDisabled: false }}
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
                <button onClick={() => zoomIn()} className="zoom-button">
                  <ZoomIn size={20} />
                </button>
                <button onClick={() => zoomOut()} className="zoom-button">
                  <ZoomOut size={20} />
                </button>
                <button
                  onClick={() => resetTransform()}
                  className="zoom-button"
                >
                  <RotateCw size={20} />
                </button>
              </div>
            </>
          )}
        </TransformWrapper>

        <p className="lightbox-description">
          {photos[selectedImage].description}
        </p>

        <div className="lightbox-controls">
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
            >
              <img
                src={photo.src || `${import.meta.env.BASE_URL}/placeholder.svg`}
                alt={photo.alt}
                className="photo-image"
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
