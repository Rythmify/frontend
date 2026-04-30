import { useState, useEffect } from "react";
import { getMyTracks, deleteTrack, type Track } from "@/services/api/upload/track.service";
import { EmptyState } from "@/components/artistpage/EmptyState";
import { TrackToolbar } from "@/components/artistpage/TrackToolbar";
import { TrackTable } from "@/components/artistpage/TrackTable";
import { MembershipBenefits } from "@/components/artistpage/MembershipBenefits";
import Spinner from "@/components/UI/Spinner";

type FilterMode = "Public" | "Private";

export default function ArtistsPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterMode>("Public");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getMyTracks()
      .then((res) => setTracks(res.data as unknown as Track[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleDeleteTrack(id: string) {
    await deleteTrack(id).catch(() => {});
    setTracks((prev) => prev.filter((t) => t.id !== id));
  }

  const filteredTracks = tracks.filter((t) => {
    const matchFilter =
      filter === "Public" ? t.is_public !== false : t.is_public === false;
    const matchSearch =
      !search || t.title.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  if (loading) return <Spinner />;

  return (
    <div className="pt-6" data-test="artists-page">
      {tracks.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <TrackToolbar
            search={search}
            onSearchChange={setSearch}
            filter={filter}
            onFilterChange={setFilter}
            trackCount={filteredTracks.length}
          />
          <TrackTable
            tracks={filteredTracks}
            filter={filter}
            onDeleteTrack={handleDeleteTrack}
          />
          <MembershipBenefits />
        </>
      )}
    </div>
  );
}
