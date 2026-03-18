import { useAuthStore } from "./stores/auth.store";

const DevAuthToggle = () => {
  const { isAuthenticated, login } = useAuthStore();

  const handleToggle = () => {
    if (isAuthenticated) {
      window.location.href = "/logout";
    } else {
      login(
        {
          id: "1",
          username: "nourabosaif04",
          displayName: "Nour Abosaif",
          firstName: "Nour",
          lastName: "Abosaif",
          bio: "Just a music lover sharing my vibes.",
          email: "nour@test.com",
          role: "artist",
          isPro: false,
          city: "Cairo",
          country: "Egypt",
          location: "Cairo, Egypt",
          following_ids: ["farah-medhat", "mariam-ramy"],
        },
        "fake-token-123",
      );
      window.location.href = "/";
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="fixed bottom-4 left-4 z-50 px-3 py-1 bg-accent text-white rounded-full text-sm"
    >
      {isAuthenticated ? "Logout (dev)" : "Login (dev)"}
    </button>
  );
};

export default DevAuthToggle;
