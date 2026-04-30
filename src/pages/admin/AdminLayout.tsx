import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Flag,
  Users,
  Music,
  LogOut,
  ChevronRight,
  Gavel,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useEffect } from "react";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true, testId: "nav-dashboard" },
  { to: "/admin/reports", label: "Reports & Appeals", icon: Flag, testId: "nav-reports" },
  { to: "/admin/users", label: "User Management", icon: Users, testId: "nav-users" },
  { to: "/admin/tracks", label: "Track Moderation", icon: Music, testId: "nav-tracks" },
];

const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/signin", { replace: true });
  };

  return (
    <div className="h-screen flex overflow-hidden bg-[#0a0a0a]">
      {/* Sidebar — sticky via h-screen on parent */}
      <aside className="w-72 flex-shrink-0 flex flex-col bg-[#111111] border-r border-white/5 overflow-y-auto">
        {/* Logo area */}
        <div className="px-6 py-7 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#ff5500] flex items-center justify-center shadow-lg shadow-[#ff5500]/30">
              <i className="fa-brands fa-soundcloud text-text-hover text-lg" />
            </div>
            <div>
              <p className="text-white font-bold text-base leading-none">Rythmify</p>
              <p className="text-[#ff5500] text-xs font-semibold mt-1 uppercase tracking-widest">
                Admin
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end, testId }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              data-test={testId}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-150 group ${
                  isActive
                    ? "bg-[#ff5500]/10 text-[#ff5500]"
                    : "text-[#999] hover:text-white hover:bg-white/5"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} className={isActive ? "text-[#ff5500]" : "text-current"} />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight size={16} className="text-[#ff5500] opacity-70" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: admin info + logout */}
        <div className="px-3 py-5 border-t border-white/5 space-y-1">
          <div className="px-4 py-3 rounded-lg bg-white/3">
            <p className="text-white text-sm font-semibold truncate">{user?.displayName ?? "Admin"}</p>
            <p className="text-[#666] text-sm truncate mt-0.5">{user?.email}</p>
          </div>
          <button
            data-test="btn-logout"
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-base text-[#999] hover:text-white hover:bg-white/5 transition-all duration-150"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 flex items-center px-8 border-b border-white/5 bg-[#0d0d0d] flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-[#555]">
            <Gavel size={15} />
            <span>Admin Control Panel</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#ff5500]/10 text-[#ff5500] text-sm font-semibold uppercase tracking-wide">
              Admin
            </span>
          </div>
        </header>

        {/* Page content — only this scrolls */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
