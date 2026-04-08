import { PlaylistComponent } from "@/components/playlist";
import { mockPlaylists } from "@/services/mocks/playlists";

/**
 * SetsPage – Search › Playlists tab
 * Renders a vertical list of PlaylistComponent components.
 * Mock data is used until the real API is wired up.
 */
export default function SetsPage() {
  return (
    <div
      data-test="sets-page"
      style={{ maxWidth: 860, margin: "0 auto", padding: "0 16px" }}
    >
      <p style={{ color: "#999", fontSize: 13, marginBottom: 8 }}>
        Found {mockPlaylists.length} playlists
      </p>

      {mockPlaylists.map((playlist) => (
        <PlaylistComponent
          key={playlist.id}
          playlist={playlist}
          onCopyLink={() => navigator.clipboard.writeText(window.location.href)}
          onEdit={() => console.log("edit", playlist.id)}
          onDelete={() => console.log("delete", playlist.id)}
        />
      ))}
    </div>
  );
}
