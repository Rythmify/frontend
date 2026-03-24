import Dropdown from "../../../components/UI/Dropdown";

const genres = [
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
