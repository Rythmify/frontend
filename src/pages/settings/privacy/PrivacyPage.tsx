import { useState, useEffect, useCallback, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  getPrivacySettings,
  updatePrivacySettings,
  type PrivacySettings,
} from "@/services/settings.service";
import { getBlockedUsers } from "@/services/user.service";
import { unblockUser } from "@/services/api/messaging/conversationApi";
import type { UserSummary } from "@/services/user.service";

type BlockedUser = UserSummary & {
  user_id?: string;
};

const getBlockedUserId = (user: BlockedUser) => user.id || user.user_id || "";

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div
      onClick={onChange}
      className={`relative h-6 w-12 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
        checked ? "bg-[var(--color-accent)]" : "bg-[var(--color-input-bg)]"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform duration-200 ${
          checked ? "translate-x-7" : "translate-x-1"
        }`}
      />
    </div>
  );
}

function SettingRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-8">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-[var(--color-text-hover)]">
          {label}
        </span>
        {description && (
          <p className="max-w-2xl text-xs leading-relaxed text-[var(--color-text)]">
            {description}
          </p>
        )}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h5 className="mb-4 font-semibold text-[var(--color-text-hover)]">
      {children}
    </h5>
  );
}

function BlockedUserRow({
  user,
  onUnblock,
}: {
  user: BlockedUser;
  onUnblock: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const profilePath = user.username ? `/${user.username}` : null;
  const userId = getBlockedUserId(user);

  const handleUnblock = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      await unblockUser(userId);
      const refreshed = await getBlockedUsers();
      const stillBlocked = refreshed.items.some((blockedUser) =>
        getBlockedUserId(blockedUser as BlockedUser) === userId,
      );
      if (!stillBlocked) {
        onUnblock(userId);
      }
    } catch {
      // Keep the row visible if the API call fails.
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between border-b border-[var(--color-border)] py-3 last:border-0">
      {profilePath ? (
        <Link to={profilePath} className="flex items-center gap-3 group">
          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-[var(--color-input-bg)]">
            {user.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={user.display_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-bold text-[var(--color-text)]">
                {user.display_name?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
          </div>
          <span className="text-sm font-semibold text-[var(--color-text-hover)] transition-colors group-hover:text-white">
            {user.display_name}
          </span>
        </Link>
      ) : (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-[var(--color-input-bg)]">
            {user.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={user.display_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-bold text-[var(--color-text)]">
                {user.display_name?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
          </div>
          <span className="text-sm font-semibold text-[var(--color-text-hover)]">
            {user.display_name}
          </span>
        </div>
      )}

      <button
        onClick={handleUnblock}
        disabled={loading}
        className="flex items-center gap-3 rounded-[var(--radius-sm)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:opacity-50"
      >
        <i className="fa-solid fa-ban text-xs w-4" />
        {loading ? "Unblocking..." : "Unblock"}
      </button>
    </div>
  );
}

export default function PrivacyPage() {
  const [settings, setSettings] = useState<PrivacySettings>({
    is_private: false,
    receive_messages_from_anyone: true,
    show_activities_in_discovery: true,
    show_as_top_fan: true,
    show_top_fans_on_tracks: true,
  });
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);

  useEffect(() => {
    getPrivacySettings()
      .then((data) => {
        if (data) {
          setSettings(data);
        }
      })
      .catch(() => {});
    getBlockedUsers()
      .then((res) => {
        setBlockedUsers(
          res.items.map((item) => ({
            ...item,
            id: item.id || (item as BlockedUser).user_id || "",
          })),
        );
      })
      .catch(() => {});
  }, []);

  const toggle = useCallback(
    async (key: keyof PrivacySettings) => {
      const next = !settings[key];
      setSettings((prev) => ({ ...prev, [key]: next }));

      try {
        const updated = await updatePrivacySettings({ [key]: next });
        if (updated) {
          setSettings(updated);
        }
      } catch {
        setSettings((prev) => ({ ...prev, [key]: !next }));
      }
    },
    [settings],
  );

  const handleUnblock = (userId: string) => {
    setBlockedUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  return (
    <div className="max-w-3xl flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <SectionTitle>Privacy settings</SectionTitle>
        <SettingRow
          label="Receive messages from anyone"
          description="For your safety, we recommend only allowing messages from people you follow. Turning this on will allow anyone to send you messages."
          checked={settings.receive_messages_from_anyone}
          onChange={() => toggle("receive_messages_from_anyone")}
        />
        <SettingRow
          label="Show my activities in social discovery playlists and modules"
          description="Your Likes, Reactions and other engagement may be shown to other users in discovery features such as 'Liked By' playlists or update feeds. Turning this off won't hide your Likes on your profile or tracks."
          checked={settings.show_activities_in_discovery}
          onChange={() => toggle("show_activities_in_discovery")}
        />
        <SettingRow
          label="Show when I'm a First or Top Fan"
          description="Appear in public Top Fans and First Fans lists"
          checked={settings.show_as_top_fan}
          onChange={() => toggle("show_as_top_fan")}
        />
        <SettingRow
          label="Show First and Top Fans for my tracks"
          description="Your First and Top Fans will appear on your tracks"
          checked={settings.show_top_fans_on_tracks}
          onChange={() => toggle("show_top_fans_on_tracks")}
        />
      </div>

      <div>
        <SectionTitle>Blocked users</SectionTitle>
        {blockedUsers.length === 0 ? (
          <p className="text-sm text-[var(--color-text-hover)]">
            You have not blocked any users.
          </p>
        ) : (
          <div>
            {blockedUsers.map((user) => (
              <BlockedUserRow
                key={getBlockedUserId(user)}
                user={user}
                onUnblock={handleUnblock}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <SectionTitle>Cookies</SectionTitle>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-text-hover)]">
            Manage your cookie preferences
          </span>
          <button
            data-testid="settings-privacy-cookie-manager-button"
            className="rounded-[var(--radius-sm)] bg-[var(--color-input-bg)] px-4 py-2 text-sm text-[var(--color-text-hover)] transition-all duration-150 hover:brightness-110"
          >
            Open Cookie Manager
          </button>
        </div>
      </div>
    </div>
  );
}
