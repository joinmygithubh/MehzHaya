import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiZoomIn, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const ProductImageZoom = ({ images = [], activeIndex = 0, onSelectIndex, alt = "Product Image", discount = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(activeIndex);
  const imgRef = useRef(null);

  const currentImg = images[activeIndex]?.url || images[activeIndex] || "/placeholder.jpg";
  const lightboxImg = images[lightboxIndex]?.url || images[lightboxIndex] || currentImg;

  const handleMouseMove = (e) => {
    if (!imgRef.current) return;
    const { left, top, width, height } = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const nextLightbox = (e) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % images.length);
  };

  const prevLightbox = (e) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleKeyDown = (e) => {
    if (!lightboxOpen) return;
    if (e.key === "ArrowRight") nextLightbox();
    if (e.key === "ArrowLeft") prevLightbox();
    if (e.key === "Escape") setLightboxOpen(false);
  };

  return (
    <>
      <div className="relative flex flex-col-reverse gap-3 lg:flex-row">
        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-y-auto max-h-[500px] scrollbar-thin">
            {images.map((img, i) => {
              const url = typeof img === "string" ? img : img.url;
              return (
                <button
                  key={i}
                  onClick={() => onSelectIndex(i)}
                  className={`relative aspect-[3/4] w-16 sm:w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    activeIndex === i ? "border-gold scale-95 shadow-md" : "border-sand/60 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={url} alt={`${alt} ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              );
            })}
          </div>
        )}

        {/* Main Image Container */}
        <div
          ref={imgRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onMouseMove={handleMouseMove}
          onClick={() => openLightbox(activeIndex)}
          className="group relative flex-1 cursor-zoom-in overflow-hidden rounded-xl bg-champagne/60 border border-sand/70 shadow-soft select-none"
        >
          <img
            src={currentImg}
            alt={alt}
            className="aspect-[3/4] w-full object-cover transition-opacity duration-200"
          />

          {/* Hover Zoom Lens Overlay (Desktop) */}
          {isHovered && (
            <div
              className="pointer-events-none absolute inset-0 hidden lg:block bg-no-repeat transition-opacity duration-200"
              style={{
                backgroundImage: `url(${currentImg})`,
                backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
                backgroundSize: "220%",
              }}
            />
          )}

          {/* Discount Badge */}
          {discount > 0 && (
            <span className="absolute left-4 top-4 z-10 rounded-full border border-terracotta bg-ivory/95 px-3 py-1 text-xs font-semibold text-terracotta uppercase tracking-wider shadow-xs">
              -{discount}% OFF
            </span>
          )}

          {/* Zoom Hint */}
          <div className="absolute right-4 bottom-4 z-10 flex items-center gap-1.5 rounded-full bg-espresso/70 px-3 py-1.5 text-xs text-ivory backdrop-blur-xs transition-opacity group-hover:bg-gold group-hover:text-espresso">
            <FiZoomIn size={14} /> Click to expand
          </div>
        </div>
      </div>

      {/* Full Screen Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/90 backdrop-blur-md p-4 outline-none"
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute right-5 top-5 z-50 rounded-full bg-ivory/20 p-2.5 text-ivory hover:bg-gold hover:text-espresso transition"
              aria-label="Close fullscreen view"
            >
              <FiX size={24} />
            </button>

            {/* Previous Image */}
            {images.length > 1 && (
              <button
                onClick={prevLightbox}
                className="absolute left-4 z-50 rounded-full bg-ivory/20 p-3 text-ivory hover:bg-gold hover:text-espresso transition"
                aria-label="Previous image"
              >
                <FiChevronLeft size={24} />
              </button>
            )}

            {/* Main Lightbox Image */}
            <motion.div
              key={lightboxIndex}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative max-h-[88vh] max-w-[90vw] overflow-hidden rounded-2xl shadow-2xl"
            >
              <img
                src={lightboxImg}
                alt={`${alt} enlarged`}
                className="max-h-[85vh] max-w-[85vw] object-contain"
              />
            </motion.div>

            {/* Next Image */}
            {images.length > 1 && (
              <button
                onClick={nextLightbox}
                className="absolute right-4 z-50 rounded-full bg-ivory/20 p-3 text-ivory hover:bg-gold hover:text-espresso transition"
                aria-label="Next image"
              >
                <FiChevronRight size={24} />
              </button>
            )}

            {/* Lightbox Footer Thumbnail Bar */}
            {images.length > 1 && (
              <div className="absolute bottom-5 z-50 flex gap-2 overflow-x-auto rounded-full bg-espresso/60 p-2 backdrop-blur-md">
                {images.map((img, idx) => {
                  const url = typeof img === "string" ? img : img.url;
                  return (
                    <button
                      key={idx}
                      onClick={() => setLightboxIndex(idx)}
                      className={`h-12 w-12 overflow-hidden rounded-full border-2 transition ${
                        lightboxIndex === idx ? "border-gold scale-110" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={url} alt="thumbnail" className="h-full w-full object-cover" />
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductImageZoom;
