import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import Profile from "./Profile";
import { updateMe, updateMeAccount, getMe } from "@/services/auth.service";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? "";

const MONTH_MAP: Record<string, string> = {
  January: "01", February: "02", March: "03", April: "04",
  May: "05", June: "06", July: "07", August: "08",
  September: "09", October: "10", November: "11", December: "12",
};

export default function CompleteProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuthStore();

  const email: string = location.state?.email ?? "";
  const googleDisplayName: string = location.state?.displayName ?? "";

  async function handleContinue(data: {
    displayName: string;
    dateOfBirth: { month: string; day: string; year: string };
    gender: string;
  }) {
    const { month, day, year } = data.dateOfBirth;
    const dob = `${year}-${MONTH_MAP[month]}-${String(day).padStart(2, "0")}`;

    await updateMe({ display_name: data.displayName });
    await updateMeAccount({
      gender: data.gender.toLowerCase(),
      date_of_birth: dob,
    });

    const me = await getMe();
    setUser({
      id: me.data.id,
      username: me.data.username,
      displayName: me.data.display_name,
      firstName: (me.data as any).first_name ?? "",
      lastName: (me.data as any).last_name ?? "",
      bio: (me.data as any).bio ?? "",
      email: me.data.email,
      role: me.data.role,
      isPro: false,
      avatar: me.data.profile_picture,
      coverUrl: me.data.cover_photo,
      city: me.data.city,
      country: me.data.country,
      links: [],
      following_ids: [],
    });

    navigate("/discover");
  }

  return (
    <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY}>
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] px-4">
        <div className="w-full max-w-md bg-bg-secondary rounded-xl p-8 flex flex-col gap-6">
          <Profile
            email={email}
            defaultDisplayName={googleDisplayName}
            onBack={() => navigate("/signin")}
            onContinue={handleContinue}
          />
        </div>
      </div>
    </GoogleReCaptchaProvider>
  );
}
