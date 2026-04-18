import { useRef, useState, useEffect } from "react";

// ─── Props ────────────────────────────────────────────────
interface HorizontalCarouselProps {
  title: string;
  children: React.ReactNode;
  "data-section"?: string;
  titleClassName?: string;
}

// ─── Styles ───────────────────────────────────────────────
const styles = {
  wrapper: `
    flex flex-col gap-3
    w-full
  `,
  title: `
    text-text-hover font-semibold
    text-xl sm:text-2xl
    text-left
  `,
  scrollWrapper: `
  relative
  w-full
`,
  arrowButton: `
  hidden sm:flex
  absolute top-[55%] -translate-y-1/1
  z-10
  w-8 h-8 shrink-0
  rounded-full
  bg-input-bg
  items-center justify-center
  text-text
  hover:text-text-muted
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
  flex gap-4 sm:gap-6 md:gap-8
  overflow-x-auto
  scroll-smooth
  [&::-webkit-scrollbar]:hidden
`,
};

// ─── Component ────────────────────────────────────────────
const HorizontalCarousel = ({
  title,
  children,
  "data-section": dataSection,
  titleClassName,
}: HorizontalCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [nudgeClass, setNudgeClass] = useState("");

  // Calculate scroll distance based on card width + gap
  const getScrollDistance = () => {
    if (!scrollRef.current) return 300;

    const container = scrollRef.current;
    const firstChild = container.firstElementChild as HTMLElement;

    if (!firstChild) return 300;

    // Get card width from the first child
    const cardWidth = firstChild.offsetWidth;

    // Gap is 32px (gap-8 = 2rem = 32px)
    const gap = 32;

    // Scroll 3 cards at a time (adjustable)
    const cardsToScroll = 3;

    // Total scroll distance = (card width + gap) * number of cards - last gap
    const scrollDistance = (cardWidth + gap) * cardsToScroll;

    return scrollDistance;
  };

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;
    setAtStart(container.scrollLeft === 0);
    setAtEnd(
      container.scrollLeft + container.clientWidth >= container.scrollWidth - 1,
    );
  };

  const scrollLeft = () => {
    const distance = getScrollDistance();
    scrollRef.current?.scrollBy({ left: -distance, behavior: "smooth" });
  };

  const scrollRight = () => {
    const distance = getScrollDistance();
    scrollRef.current?.scrollBy({ left: distance, behavior: "smooth" });
  };

  // Recheck arrow state whenever content changes (e.g. async data loads)
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const update = () => {
      setAtStart(container.scrollLeft === 0);
      setAtEnd(
        container.scrollLeft + container.clientWidth >= container.scrollWidth - 1,
      );
    };

    update();

    // ResizeObserver: fires on window/container resize
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(container);

    // MutationObserver: fires when async children are added/removed
    const mutationObserver = new MutationObserver(update);
    mutationObserver.observe(container, { childList: true, subtree: true });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  const handleNudge = (direction: "left" | "right") => {
    setNudgeClass(direction === "right" ? "nudge-right" : "nudge-left");
    setTimeout(() => setNudgeClass(""), 400);
  };

  return (
    <div
      className={styles.wrapper}
      data-test="carousel-wrapper"
      data-section={dataSection}
    >
      {/* Title */}
      <h2 className={titleClassName ?? styles.title} data-test="carousel-title">
        {title}
      </h2>

      {/* Scroll Area + Arrows */}
      <div className={styles.scrollWrapper}>
        {/* Left Arrow */}
        <button
          className={`${styles.arrowButton} ${styles.arrowLeft}`}
          onClick={scrollLeft}
          disabled={atStart}
          onMouseEnter={() => handleNudge("left")}
          data-test="button-carousel-left"
        >
          <i className="fa-solid fa-chevron-left text-sm"></i>
        </button>

        {/* Scrollable Row */}
        <div
          ref={scrollRef}
          className={`${styles.scrollContainer} ${nudgeClass}`}
          onScroll={handleScroll}
          data-test="carousel-scroll-container"
        >
          {children}
        </div>

        {/* Right Arrow */}
        <button
          className={`${styles.arrowButton} ${styles.arrowRight}`}
          onClick={scrollRight}
          disabled={atEnd}
          onMouseEnter={() => handleNudge("right")}
          data-test="button-carousel-right"
        >
          <i className="fa-solid fa-chevron-right text-sm"></i>
        </button>
      </div>
    </div>
  );
};

export default HorizontalCarousel;
