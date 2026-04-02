import { useEffect, useState } from "react";
import type { Track } from "@/services/api/upload/track.service";
import {
  getMyPlaylists,
  addTrackToPlaylist,
} from "@/services/api/playlist/playlist.service";
import type { Playlist } from "@/services/api/playlist/playlist.service";

interface AddToPlaylistModalProps {
  trackId: number;
  onClose: () => void;
}

const AddToPlaylistModal = ({ trackId, onClose }: AddToPlaylistModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      Add to playlist modal
    </div>
  );
};
export default AddToPlaylistModal;
