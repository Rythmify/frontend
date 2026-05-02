import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";


const BAR_COUNT = 24;

const barHeights = [
  30, 55, 75, 45, 90, 60, 40, 80, 50, 70, 35, 95,
  65, 48, 85, 55, 72, 38, 62, 88, 42, 78, 52, 68,
];

const NOTES = ["♩", "♪", "♫", "♬"];

const floatingNotes = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  note: NOTES[i % NOTES.length],
  x: 10 + (i * 11) % 80,
  delay: i * 0.6,
  duration: 4 + (i % 3),
}));

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 text-center overflow-hidden relative">
      {/* Floating musical notes */}
      {floatingNotes.map((n) => (
        <motion.span
          key={n.id}
          className="absolute text-2xl select-none pointer-events-none"
          style={{ left: `${n.x}%`, color: "#ff5500", opacity: 0 }}
          animate={{
            y: [0, -120, -240],
            opacity: [0, 0.35, 0],
            rotate: [0, n.id % 2 === 0 ? 15 : -15, 0],
          }}
          transition={{
            duration: n.duration,
            delay: n.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
          initial={{ y: 0, bottom: "8%" }}
        >
          {n.note}
        </motion.span>
      ))}

      {/* Waveform bars — flat/dead */}
      <div className="flex items-end gap-[3px] h-16 mb-8">
        {Array.from({ length: BAR_COUNT }, (_, i) => (
          <motion.div
            key={i}
            className="w-[5px] rounded-full bg-[#fff]"
            initial={{ height: barHeights[i] * 0.64 }}
            animate={{ height: [barHeights[i] * 0.64, 4, 4] }}
            transition={{
              duration: 0.6,
              delay: i * 0.04,
              ease: "easeIn",
              times: [0, 0.6, 1],
            }}
            style={{ opacity: 0.7 - (i % 3) * 0.1 }}
          />
        ))}
      </div>

      {/* 404 */}
      <motion.h1
        className="font-black text-[clamp(3rem,15vw,11rem)] leading-none tracking-tighter select-none"
        style={{ fontFamily: "'Barlow Condensed', sans-serif", color: "#fff" }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        404
      </motion.h1>

      {/* Title */}
      <motion.p
        className="text-white text-xl font-semibold mt-2 mb-1"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        This track doesn't exist
      </motion.p>

      {/* Subtitle */}
      <motion.p
        className="text-text-secondary text-sm max-w-xs"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.4 }}
      >
        The page you're looking for got lost somewhere in the noise. Let's get
        you back on beat.
      </motion.p>

      {/* Buttons */}
      <motion.div
        className="flex gap-3 mt-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <button
          onClick={() => navigate("/")}
          className="px-5 py-2.5 bg-[#ff5500] text-white text-sm font-bold rounded-sm hover:bg-[#e64a00] transition-colors"
        >
          Go home
        </button>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 border border-[#444] text-white text-sm font-bold rounded-sm hover:border-text-secondary transition-colors"
        >
          Go back
        </button>
      </motion.div>
    </div>
  );
}
