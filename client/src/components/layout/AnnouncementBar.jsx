const ANNOUNCEMENTS = [
  { text: "Timeless Hijabs for the Modern You", separator: "✦" },
  { text: "Free Shipping on Orders Above ₹999", separator: "•" },
  { text: "Easy Returns & Exchanges", separator: "✦" },
  { text: "Premium Quality Islamic Wear", separator: "•" },
  { text: "New Arrivals Every Week", separator: "✦" },
];

const AnnouncementBar = () => {
  return (
    <div
      aria-label="Announcement Bar"
      className="relative z-40 h-11 bg-espresso text-ivory border-b border-gold/30 text-xs sm:text-sm font-medium overflow-hidden whitespace-nowrap select-none flex items-center shadow-2xs w-full"
      style={{ "--marquee-duration": "25s" }}
    >
      <style>{`
        @keyframes marqueeScroll {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .announcement-moving-track {
          display: flex;
          width: max-content;
          flex-shrink: 0;
          white-space: nowrap;
          will-change: transform;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          animation: marqueeScroll var(--marquee-duration, 25s) linear infinite;
        }
        .announcement-moving-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="w-full h-full flex items-center overflow-hidden relative">
        <div className="announcement-moving-track cursor-pointer items-center">
          {/* Track 1 */}
          <div className="flex items-center shrink-0">
            {ANNOUNCEMENTS.map((item, idx) => (
              <span key={`t1-${idx}`} className="inline-flex items-center whitespace-nowrap px-6 sm:px-10">
                <span className="text-gold mr-3 font-serif text-sm">{item.separator}</span>
                <span className="tracking-widest uppercase font-sans text-ivory/95 hover:text-gold transition-colors duration-300">
                  {item.text}
                </span>
              </span>
            ))}
          </div>

          {/* Track 2 (Duplicate for 100% seamless infinite loop) */}
          <div className="flex items-center shrink-0">
            {ANNOUNCEMENTS.map((item, idx) => (
              <span key={`t2-${idx}`} className="inline-flex items-center whitespace-nowrap px-6 sm:px-10">
                <span className="text-gold mr-3 font-serif text-sm">{item.separator}</span>
                <span className="tracking-widest uppercase font-sans text-ivory/95 hover:text-gold transition-colors duration-300">
                  {item.text}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
