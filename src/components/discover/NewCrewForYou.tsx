import HorizontalCarousel from "./HorizontalCarousel";
import UserCard from "@/components/UI/UserCard";
import { mockSuggestedUsers } from "@/services/mocks/discover";

// ─── Component ────────────────────────────────────────────
const NewCrewForYou = () => {
  return (
    <HorizontalCarousel title="New crew, suggested for you">
      {mockSuggestedUsers.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </HorizontalCarousel>
  );
};

export default NewCrewForYou;
