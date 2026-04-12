import Dropdown from "../UI/Dropdown";
import { getGenres } from "@/services/api/upload/track.service";
import { useEffect, useState } from "react";

const DEFAULT_GENRES = [
  "Alternative Rock",
  "Ambient",
  "Classical",
  "Country",
  "Dance & EDM",
  "Dancehall",
  "Deep House",
  "Disco",
  "Drum & Bass",
  "Electronic",
  "Hip-hop & Rap",
  "House",
  "Jazz & Blues",
  "Latin",
  "Metal",
  "Piano",
  "Pop",
  "R&B & Soul",
  "Reggae",
  "Reggaeton",
  "Rock",
  "Soundtrack",
  "Techno",
  "Trance",
  "World",
];

const GenreDropdown = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (g: string) => void;
}) => {
  const [genres, setGenres] = useState<string[]>([]);
  useEffect(() => {
    getGenres()
      .then((fetched) => {
        if (Array.isArray(fetched) && fetched.length > 0) {
          const genreNames = fetched.map((g: any) => g.name);
          setGenres(genreNames);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch genres:", err);
      });
  }, []);

  return (
    <div data-test="genre-dropdown">
      <Dropdown
        label="Genre"
        value={value}
        options={genres}
        onChange={onChange}
        placeholder="Add or search for genre"
        headerText="All music genres"
      />
    </div>
  );
};

export default GenreDropdown;
