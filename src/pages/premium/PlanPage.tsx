import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSubscriptionPlans,
  checkoutSubscription,
  getMyTransactions,
} from "@/services/api/upload/subscription.service";
import HeroSection from "../../components/Premium/HeroSection";
import PricingCards from "../../components/Premium/PricingCards";
import CompareTable from "../../components/Premium/CompareTable";

export default function PlanPage() {
  const navigate = useNavigate();
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [monthlyPrice, setMonthlyPrice] = useState<number | null>(null);

  useEffect(() => {
    getSubscriptionPlans()
      .then((plans) => {
        const premium = plans.find((p) => p.name === "premium");
        if (premium) setMonthlyPrice(parseFloat(premium.price));
      })
      .catch(() => {});
  }, []);

  async function handleGetStarted() {
    setIsStarting(true);
    setStartError(null);
    try {
      const plans = await getSubscriptionPlans();
      const premium = plans.find((p) => p.name === "premium");
      if (!premium) throw new Error("Premium plan not found.");
      const { transaction_id } = await checkoutSubscription(premium.subscription_plan_id);
      navigate("/creator/payment", { state: { transaction_id } });
    } catch (err: any) {
      const code = err.response?.data?.error?.code;
      if (code === "SUBSCRIPTION_CHECKOUT_PENDING") {
        try {
          const transactions = await getMyTransactions();
          const pending = transactions.find((t) => t.payment_status === "pending");
          if (pending) {
            navigate("/creator/payment", { state: { transaction_id: pending.transaction_id, isPending: true } });
            return;
          }
        } catch {
          // fall through to error message
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
    <main data-test="premium-plan-page" className="min-h-screen bg-white font-sans">
      <button
        type="button"
        onClick={() => navigate("/subscriptions")}
        aria-label="Exit"
        data-test="premium-plan-exit"
        className="fixed top-5 right-6 z-50 flex items-center justify-center h-6 w-6 p-5 rounded-full bg-input-bg hover:bg-[#dcdcdc] text-text-upload dark:hover:bg-[#353535] transition-all duration-300 cursor-pointer"
      >
        <i className="fa-solid fa-xmark text-md" />
      </button>

      {startError && (
        <div data-test="premium-plan-error" className="fixed top-4 left-1/2 z-50 -translate-x-1/2 flex items-center justify-between rounded-sm bg-[#FB2C36]/10 border border-[#FB2C36]/30 px-4 py-3 shadow-lg min-w-[320px] max-w-[90vw]">
          <span className="text-sm font-bold text-[#FB2C36]">{startError}</span>
          <button
            type="button"
            onClick={() => setStartError(null)}
            data-test="premium-plan-error-close"
            className="ml-4 shrink-0 text-[#FB2C36] opacity-60 hover:opacity-100 text-lg leading-none cursor-pointer"
          >
            ×
          </button>
        </div>
      )}
      <HeroSection {...ctaProps} />
      <PricingCards {...ctaProps} startError={null} monthlyPrice={monthlyPrice} />
      <CompareTable {...ctaProps} monthlyPrice={monthlyPrice} />
    </main>
  );
}
