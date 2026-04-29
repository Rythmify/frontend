import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import heroBackground from "../../assets/hero-background-image-speakers.svg";
import { getSubscriptionPlans } from "@/services/api/upload/subscription.service";

interface PremiumPromoModalProps {
  onClose: () => void;
}

export default function PremiumPromoModal({ onClose }: PremiumPromoModalProps) {
  const navigate = useNavigate();
  const [price, setPrice] = useState<string | null>(null);

  useEffect(() => {
    getSubscriptionPlans()
      .then((plans) => {
        const premium = plans.find((p) => p.name === "premium");
        if (premium) setPrice(premium.price);
      })
      .catch(() => {});
  }, []);

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.65)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "relative",
          width: 420,
          borderRadius: 20,
          overflow: "hidden",
          background: "#111111",
          boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero image positioned on right, fading in */}
        <img
          src={heroBackground}
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            height: "100%",
            width: "80%",
            objectFit: "contain",
            objectPosition: "right center",
            pointerEvents: "none",
            userSelect: "none",
            maskImage:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 30%, black 75%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 30%, black 75%)",
          }}
        />

        {/* Dark gradient so left-side text stays readable */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, #111111 38%, rgba(17,17,17,0.6) 60%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1, padding: "32px 28px" }}>
          {/* Close */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 12,
              right: 16,
              background: "none",
              border: "none",
              fontSize: 22,
              cursor: "pointer",
              color: "rgba(255,255,255,0.5)",
              lineHeight: 1,
            }}
            aria-label="Close"
          >
            ×
          </button>

          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2,
              color: "#cfb25d",
              marginBottom: 8,
              textTransform: "uppercase",
            }}
          >
            Rythmify Premium
          </p>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: "#fff",
              margin: "0 0 8px",
              lineHeight: 1.1,
            }}
          >
            Reach more listeners.
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.6)",
              marginBottom: 20,
            }}
          >
            Elevate your experience with premium features
            <br />
            you deserve.
          </p>
          <p
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: "#cfb25d",
              marginBottom: 24,
            }}
          >
            {price ? `EGP ${price}` : "EGP 29.99"}{" "}
            <span
              style={{
                fontSize: 13,
                fontWeight: 400,
                color: "rgba(255,255,255,0.4)",
              }}
            >
              / month
            </span>
          </p>

          <button
            onClick={() => {
              onClose();
              navigate("/premium");
            }}
            style={{
              width: "100%",
              padding: "12px 0",
              background: "#fff",
              color: "#000",
              border: "none",
              borderRadius: 999,
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              marginBottom: 8,
            }}
          >
            Get Premium
          </button>
          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: "8px 0",
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.35)",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
