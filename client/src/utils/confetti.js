/**
 * Lightweight, dependency-free confetti burst (gold & emerald).
 */
const confetti = () => {
  if (typeof document === "undefined") return;
  const colors = ["#d4af37", "#064e3b", "#f5f5dc", "#e6c75a"];
  const count = 80;
  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden";
  document.body.appendChild(container);

  for (let i = 0; i < count; i++) {
    const piece = document.createElement("div");
    const size = Math.random() * 8 + 4;
    piece.style.cssText = `position:absolute;width:${size}px;height:${size}px;background:${
      colors[Math.floor(Math.random() * colors.length)]
    };left:${Math.random() * 100}%;top:-20px;opacity:1;border-radius:${
      Math.random() > 0.5 ? "50%" : "0"
    };`;
    container.appendChild(piece);

    const fall = piece.animate(
      [
        { transform: `translateY(0) rotate(0deg)`, opacity: 1 },
        {
          transform: `translateY(100vh) rotate(${Math.random() * 720}deg)`,
          opacity: 0,
        },
      ],
      {
        duration: 2000 + Math.random() * 1500,
        easing: "cubic-bezier(0.2,0.6,0.4,1)",
      }
    );
    fall.onfinish = () => piece.remove();
  }

  setTimeout(() => container.remove(), 4000);
};

export default confetti;
