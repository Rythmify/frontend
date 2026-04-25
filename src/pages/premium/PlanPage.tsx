import HeroSection from "../../components/Premium/HeroSection";
import PricingCards from "../../components/Premium/PricingCards";
import CompareTable from "../../components/Premium/CompareTable";

export default function PlanPage() {
  return (
    <main className="min-h-screen bg-white font-sans">
      <HeroSection />
      <PricingCards />
      <CompareTable />
    </main>
  );
}
