import { useState, useEffect } from "react";
import HorizontalCarousel from "./HorizontalCarousel";
import UserCard from "@/components/UI/UserCard/UserCard";
import { getSuggestedUsers } from "@/services/api/discover.service";
import { mapSuggestedUserToUser } from "@/services/api/discover.mapper";
import { mockSuggestedUsers } from "@/services/mocks/discover";
import type { User } from "@/types/user";

const NewCrewForYou = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    getSuggestedUsers()
      .then((res) => setUsers(res.data.map(mapSuggestedUserToUser)))
      .catch(() => setUsers(mockSuggestedUsers));
  }, []);

  const items = users.length ? users : mockSuggestedUsers;

  return (
    <div data-test="section-new-crew-for-you">
      <HorizontalCarousel title="New crew, suggested for you">
        {items.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </HorizontalCarousel>
    </div>
  );
};

export default NewCrewForYou;
