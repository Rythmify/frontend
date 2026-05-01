// ─── Styles ───────────────────────────────────────────────
const styles = {
  wrapper: `flex flex-col gap-6`,
  // Go Mobile Section
  goMobileContainer: `flex flex-col gap-3 w-full`,
  title: `text-xs font-semibold text-left text-text-hover`,
  buttonRow: `flex items-center gap-3 flex-wrap`,
  storeButton: `inline-flex transition-transform duration-200 hover:scale-[1.02] hover:opacity-90`,
  storeBadge: `h-auto w-[135px] sm:w-[145px] max-w-full`,
  // Footer Section
  footerContainer: `flex flex-col gap-2 w-full`,
  footerLinks: `flex flex-wrap gap-x-1 gap-y-1 text-xs text-text-secondary`,
  linkWrapper: `flex items-center gap-1`,
  link: `cursor-pointer hover:underline hover:text-text`,
  separator: ``,
  languageContainer: `text-xs text-left text-text-secondary`,
  languageButton: `text-[#2196F3] hover:underline`,
};

const APP_STORE_URL =
  "https://apps.apple.com/us/app/soundcloud-the-music-you-love/id336353151";
const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.soundcloud.android&hl=us";

interface GoMobileSectionProps {
  showFooter?: boolean;
}

const GoMobileSection = ({ showFooter = true }: GoMobileSectionProps) => {
  return (
    <div className={styles.wrapper}>
      {/* Go Mobile */}
      <div className={styles.goMobileContainer}>
        <span className={styles.title}>GO MOBILE</span>

        <div className={styles.buttonRow}>
          {/* App Store */}
          <a
            data-test="app-store-button"
            href={APP_STORE_URL}
            target="_blank"
            rel="noreferrer"
            className={styles.storeButton}
          >
            <img
              src="/images/app_store.png"
              alt="Download on the App Store"
              className={styles.storeBadge}
            />
          </a>

          {/* Google Play */}
          <a
            data-test="google-play-button"
            href={GOOGLE_PLAY_URL}
            target="_blank"
            rel="noreferrer"
            className={styles.storeButton}
          >
            <img
              src="/images/google_store.png"
              alt="Get it on Google Play"
              className={styles.storeBadge}
            />
          </a>
        </div>
      </div>

      {/* Footer */}
      {showFooter && (
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
            <button
              data-test="language-button"
              className={styles.languageButton}
            >
              English (US)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoMobileSection;
