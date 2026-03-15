import { useState } from "react";

// ─── Types ────────────────────────────────────────────────
interface ArtistTool {
  id: number;
  label: string;
  icon: string;
}

// ─── Data ─────────────────────────────────────────────────
const primaryTools: ArtistTool[] = [
  { id: 1, label: "Amplify", icon: "fa-bolt" },
  { id: 2, label: "Replace", icon: "fa-rotate" },
  { id: 3, label: "Distribute", icon: "fa-globe" },
  { id: 4, label: "Master", icon: "fa-sliders" },
];

const secondaryTools: ArtistTool[] = [
  { id: 5, label: "Monetize", icon: "fa-circle-dollar-to-slot" },
  { id: 6, label: "Spotlight", icon: "fa-wand-sparkles" },
  { id: 7, label: "Top fans", icon: "fa-users" },
  { id: 8, label: "Comments", icon: "fa-comments" },
];

// ─── Styles ───────────────────────────────────────────────
const styles = {
  wrapper: `
    flex flex-col gap-3
    w-full
  `,
  header: `
    flex items-center justify-between
    border-b border-zinc-700
    pb-2

  `,
  title: `
    text-white text-xs font-bold
    tracking-widest uppercase
  `,
  collapseIcon: `
    text-white text-sm
    transition-transform duration-200
    cursor-pointer
  `,
  toolsGrid: `
    grid grid-cols-4 
  `,
  toolButton: `
   group
  flex flex-col justify-between
  border border-zinc-600
  rounded-md p-4
  h-20
  w-20
  transition-colors duration-200
  relative
  overflow-hidden
`,
  toolIcon: `
    text-white text-lg
  `,
  toolLabel: `
    text-white text-[12px]
    text-center
    px-1 w-full
    transition-colors duration-200
  `,
  plusBadge: `
    absolute top-1 right-1
  w-3 h-3
  rounded-full
  bg-zinc-500
  flex items-center justify-center
  text-white text-[10px] 
  `,
  ctaButton: `
    w-full
    bg-purple-700 hover:bg-purple-600
    text-white text-xs
    rounded-md py-2 px-3
    flex items-center gap-2
    transition-colors duration-200
  `,
};

// ─── Component ────────────────────────────────────────────
const ArtistToolsCard = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.header}>
        <h3 className={styles.title}>Artist Tools</h3>
        <i
          className={`fa-solid fa-chevron-down ${styles.collapseIcon} ${isOpen ? "rotate-180" : ""}`}
          onClick={() => setIsOpen(!isOpen)}
        ></i>
      </div>

      {/* Always visible — Row 1 */}
      <div className={styles.toolsGrid}>
        {primaryTools.map((tool) => (
          <button key={tool.id} className={styles.toolButton}>
            <span className={styles.plusBadge}>+</span>
            <div className="flex justify-center w-full">
              <i className={`fa-solid ${tool.icon} ${styles.toolIcon}`}></i>
            </div>
            <div
              className={`${styles.toolLabel} group-hover:bg-purple-700 w-full`}
            >
              <span className="group-hover:hidden block w-full text-center">
                {tool.label}
              </span>
              <span className="hidden group-hover:block w-full text-center">
                Upgrade
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Collapsible — Row 2 + CTA */}
      {isOpen && (
        <>
          <div className={styles.toolsGrid}>
            {secondaryTools.map((tool) => (
              <button key={tool.id} className={styles.toolButton}>
                <span className={styles.plusBadge}>+</span>
                <div className="flex justify-center w-full">
                  <i className={`fa-solid ${tool.icon} ${styles.toolIcon}`}></i>
                </div>
                <div
                  className={`${styles.toolLabel} group-hover:bg-purple-700 w-full`}
                >
                  <span className="group-hover:hidden block w-full text-center">
                    {tool.label}
                  </span>
                  <span className="hidden group-hover:block w-full text-center">
                    Upgrade
                  </span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
      <button className={styles.ctaButton}>
        <i className="fa-solid fa-circle-plus text-sm"></i>
        <span>Unlock Artist tools from EGP 29.99/month.</span>
      </button>
    </div>
  );
};

export default ArtistToolsCard;
