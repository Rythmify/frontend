import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSubscriptionPlans,
  checkoutSubscription,
} from "@/services/api/upload/subscription.service";
import HeroSection from "../../components/Premium/HeroSection";
import PricingCards from "../../components/Premium/PricingCards";
import CompareTable from "../../components/Premium/CompareTable";

export default function PlanPage() {
  const navigate = useNavigate();
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  async function handleGetStarted() {
    setIsStarting(true);
    setStartError(null);
    try {
      const plans = await getSubscriptionPlans();
      const premium = plans.find((p) => p.name === "premium");
      if (!premium) throw new Error("Premium plan not found.");
      const { transaction_id } = await checkoutSubscription(premium.subscription_plan_id);
      sessionStorage.setItem("pending_transaction_id", transaction_id);
      navigate("/creator/payment", { state: { transaction_id } });
    } catch (err: any) {
      const code = err.response?.data?.error?.code;
      if (code === "SUBSCRIPTION_CHECKOUT_PENDING") {
        const stored = sessionStorage.getItem("pending_transaction_id");
        if (stored) {
          navigate("/creator/payment", { state: { transaction_id: stored } });
          return;
        }
        setStartError("You already have a pending checkout. Please complete your payment.");
      } else {
        setStartError(
          err.response?.data?.error?.message ??
          err.response?.data?.message ??
          err.message ??
          "Something went wrong. Please try again.",
        );
      }
    } finally {
      setIsStarting(false);
    }
  }

  const ctaProps = {
    onGetStarted: handleGetStarted,
    isStarting,
    disabled: false,
  };

  return (
    <main className="min-h-screen bg-white font-sans">
      {startError && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 flex items-center justify-between rounded-sm bg-[#FB2C36]/10 border border-[#FB2C36]/30 px-4 py-3 shadow-lg min-w-[320px] max-w-[90vw]">
          <span className="text-sm font-bold text-[#FB2C36]">{startError}</span>
          <button
            type="button"
            onClick={() => setStartError(null)}
            className="ml-4 shrink-0 text-[#FB2C36] opacity-60 hover:opacity-100 text-lg leading-none cursor-pointer"
          >
            ×
          </button>
        </div>
      )}
      <HeroSection {...ctaProps} />
      <PricingCards {...ctaProps} startError={null} />
      <CompareTable {...ctaProps} />
    </main>
  );
}
