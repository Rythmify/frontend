import { useRef, useState, useEffect } from "react";

// ─── Props ────────────────────────────────────────────────
interface HorizontalCarouselProps {
  title: string;
  children: React.ReactNode;
}

// ─── Styles ───────────────────────────────────────────────
const styles = {
  wrapper: `
    flex flex-col gap-3
    w-full
  `,
  title: `
    text-white font-bold
    text-base sm:text-lg
    text-left
  `,
  scrollWrapper: `
  relative
  w-full
`,
  arrowButton: `
  absolute top-[55%] -translate-y-1/1
  z-10
  w-8 h-8 shrink-0
  rounded-full
  bg-gray-800
  flex items-center justify-center
  text-gray-200
  hover:text-gray-500
  transition-colors duration-200
  disabled:opacity-0
  disabled:cursor-default
`,
  arrowLeft: `
  left-6 -translate-x-1/2
`,
  arrowRight: `
  right-6 translate-x-1/2
`,
  scrollContainer: `
  flex gap-3
  overflow-x-auto
  scroll-smooth
  [&::-webkit-scrollbar]:hidden
`,
};

// ─── Component ────────────────────────────────────────────
const HorizontalCarousel = ({ title, children }: HorizontalCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [nudgeClass, setNudgeClass] = useState("");

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;
    setAtStart(container.scrollLeft === 0);
    setAtEnd(
      container.scrollLeft + container.clientWidth >= container.scrollWidth - 1,
    );
  };

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" });
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    setAtEnd(
      container.scrollLeft + container.clientWidth >= container.scrollWidth - 1,
    );
  }, []);

  const handleNudge = (direction: "left" | "right") => {
    setNudgeClass(direction === "right" ? "nudge-right" : "nudge-left");
    setTimeout(() => setNudgeClass(""), 400);
  };

  return (
    <div className={styles.wrapper}>
      {/* Title */}
      <h2 className={styles.title}>{title}</h2>

      {/* Scroll Area + Arrows */}
      <div className={styles.scrollWrapper}>
        {/* Left Arrow */}
        <button
          className={`${styles.arrowButton} ${styles.arrowLeft}`}
          onClick={scrollLeft}
          disabled={atStart}
          onMouseEnter={() => handleNudge("left")}
        >
          <i className="fa-solid fa-chevron-left text-sm"></i>
        </button>

        {/* Scrollable Row */}
        <div
          ref={scrollRef}
          className={`${styles.scrollContainer} ${nudgeClass}`}
          onScroll={handleScroll}
        >
          {children}
        </div>

        {/* Right Arrow */}
        <button
          className={`${styles.arrowButton} ${styles.arrowRight}`}
          onClick={scrollRight}
          disabled={atEnd}
          onMouseEnter={() => handleNudge("right")}
        >
          <i className="fa-solid fa-chevron-right text-sm"></i>
        </button>
      </div>
    </div>
  );
};

export default HorizontalCarousel;
