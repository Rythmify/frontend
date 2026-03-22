import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import Profile from "./Profile";
import { updateMe } from "@/services/auth.service";

const MONTH_MAP: Record<string, string> = {
  January: "01", February: "02", March: "03", April: "04",
  May: "05", June: "06", July: "07", August: "08",
  September: "09", October: "10", November: "11", December: "12",
};

export default function CompleteProfilePage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();

  async function handleContinue(data: {
    displayName: string;
    dateOfBirth: { month: string; day: string; year: string };
    gender: string;
  }) {
    const { month, day, year } = data.dateOfBirth;
    const dob = `${year}-${MONTH_MAP[month]}-${String(day).padStart(2, "0")}`;

    const updated = await updateMe({
      display_name: data.displayName,
      gender: data.gender.toLowerCase(),
      date_of_birth: dob,
    });

    if (user) setUser({ ...user, displayName: updated.data.display_name });
    navigate("/discover");
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)] px-4">
      <div className="w-full max-w-md bg-bg-secondary rounded-xl p-8 flex flex-col gap-6">
        <Profile
          email={user?.email ?? ""}
          onBack={() => navigate("/signin")}
          onContinue={handleContinue}
        />
      </div>
    </div>
  );
}
