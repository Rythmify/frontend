import { useNavigate } from "react-router-dom";

const SAMPLE_COMMENTS = [
  { text: "this is incredible 🔥", rotate: "rotate-2", top: "top-0", right: "right-8" },
  { text: "I need a 10hr version", rotate: "-rotate-1", top: "top-16", right: "right-2" },
  { text: "nah this is sick 🤯", rotate: "rotate-1", top: "top-32", right: "right-12" },
];

export default function ArtistsCommentsPage() {
  const navigate = useNavigate();

  return (
    <div className="pt-10 pb-20">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
        {/* Left: text */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 rounded-full bg-[#FFB800] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-3 h-3 text-black" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <span className="text-text-hover text-xs font-bold uppercase tracking-widest">
              Artist Pro
            </span>
          </div>

          <h1 className="text-white font-bold text-3xl sm:text-4xl leading-tight mb-5">
            Every comment in one place
          </h1>

          <p className="text-text text-sm leading-relaxed mb-8">
            With Artist Pro, you get access to Comments Hub which brings
            together every comment across all of your tracks, so you can easily
            see what fans are saying about you. Read, moderate and respond to
            your comments, all in one place.
          </p>

          <button
            type="button"
            onClick={() => navigate("/premium")}
            className="bg-bg-inverted text-bg font-bold text-sm px-6 py-3 rounded-full hover:opacity-85 transition-opacity cursor-pointer"
          >
            Get Premium
          </button>
          <span className="text-[13px] font-bold mx-4 text-text border border-[#444] rounded-xl px-2.5 py-0.5">
                Coming Soon
              </span>
        </div>

        {/* Right: comment bubbles */}
        <div className="shrink-0 relative w-72 h-48">
          {SAMPLE_COMMENTS.map(({ text, rotate, top, right }) => (
            <div
              key={text}
              className={`absolute ${top} ${right} ${rotate} bg-[#F4845F] text-white text-sm font-semibold px-4 py-2.5 rounded-2xl rounded-br-sm shadow-lg max-w-50`}
            >
              {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
