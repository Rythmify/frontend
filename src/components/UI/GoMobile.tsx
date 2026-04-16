// ─── Styles ───────────────────────────────────────────────
const styles = {
  wrapper: `flex flex-col gap-6`,
  // Go Mobile Section
  goMobileContainer: `flex flex-col gap-3 w-full`,
  title: `text-xs font-semibold text-left text-white`,
  buttonRow: `flex gap-3`,
  storeButton: `
    flex items-center gap-2 px-1 py-1
    border border-white rounded-lg
    hover:opacity-70
  `,
  icon: `text-white text-xl`,
  textContainer: `flex flex-col items-start`,
  subtitle: `text-[8px] text-white`,
  storeName: `text-xs font-bold text-white`,
  // Footer Section
  footerContainer: `flex flex-col gap-2 w-full`,
  footerLinks: `flex flex-wrap gap-x-1 gap-y-1 text-xs text-text-secondary`,
  linkWrapper: `flex items-center gap-1`,
  link: `cursor-pointer hover:underline hover:text-text`,
  separator: ``,
  languageContainer: `text-xs text-left text-text-secondary`,
  languageButton: `text-[#2196F3] hover:underline`,
};

// ─── Component ────────────────────────────────────────────
const GoMobileSection = () => {
  return (
    <div className={styles.wrapper}>
      {/* Go Mobile */}
      <div className={styles.goMobileContainer}>
        <span className={styles.title}>GO MOBILE</span>

        <div className={styles.buttonRow}>
          {/* App Store */}
          <button data-test="app-store-button" className={styles.storeButton}>
            <i className={`fa-brands fa-apple ${styles.icon}`} />
            <div className={styles.textContainer}>
              <span className={styles.subtitle}>Download on the</span>
              <span className={styles.storeName}>App Store</span>
            </div>
          </button>

          {/* Google Play */}
          <button data-test="google-play-button" className={styles.storeButton}>
            <i className={`fa-brands fa-google-play ${styles.icon}`} />
            <div className={styles.textContainer}>
              <span className={styles.subtitle}>GET IT ON</span>
              <span className={styles.storeName}>Google Play</span>
            </div>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footerContainer}>
        <div className={styles.footerLinks}>
          {[
            "Legal",
            "Privacy",
            "Cookie Policy",
            "Cookie Manager",
            "Imprint",
            "Artist Resources",
            "Newsroom",
            "Charts",
            "Transparency Reports",
          ].map((link, i, arr) => (
            <span key={link} className={styles.linkWrapper}>
              <button
                data-test={`footer-${link.toLowerCase().replace(/\s+/g, "-")}`}
                className={styles.link}
              >
                {link}
              </button>
              {i < arr.length - 1 && (
                <span className={styles.separator}>·</span>
              )}
            </span>
          ))}
        </div>

        <div className={styles.languageContainer}>
          Language:{" "}
          <button data-test="language-button" className={styles.languageButton}>
            English (US)
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoMobileSection;
