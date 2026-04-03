import HorizontalCarousel from "./HorizontalCarousel";
import UserCard from "@/components/UI/UserCard";
import { mockSuggestedUsers } from "@/services/mocks/discover";
import type { User } from "@/types/user";

interface NewCrewForYouProps {
  users?: User[];
}
// ─── Component ────────────────────────────────────────────
const NewCrewForYou = ({ users }: NewCrewForYouProps) => {
  const displayUsers = users ?? mockSuggestedUsers;
  return (
    <HorizontalCarousel title="New crew, suggested for you">
      {displayUsers.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </HorizontalCarousel>
  );
};

export default NewCrewForYou;
