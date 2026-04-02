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
  const [genres, setGenres] = useState<string[]>(DEFAULT_GENRES);

  useEffect(() => {
    getGenres().then((fetched) => {
      if (fetched.length > 0) setGenres(fetched);
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
