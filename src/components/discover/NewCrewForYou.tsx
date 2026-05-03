import { useState, useEffect } from "react";
import HorizontalCarousel from "./HorizontalCarousel";
import UserCard from "@/components/UI/UserCard/UserCard";
import { getSuggestedUsers } from "@/services/api/discover.service";
import { mapSuggestedUserToUser } from "@/services/api/discover.mapper";
import type { User } from "@/types/user";

const NewCrewForYou = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    getSuggestedUsers()
      .then((res) => setUsers(res.data.map(mapSuggestedUserToUser)))
      .catch(() => {});
  }, []);

  const items = users;

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
