import Dropdown from "../UI/Dropdown";
import { getGenres } from "@/services/api/upload/track.service";
import { useEffect, useState } from "react";

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
      .then((fetched) => setGenres(Array.isArray(fetched) ? fetched : []))
      .catch((err) => {
        console.error("Failed to fetch genres:", err);
        setGenres([]);
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
