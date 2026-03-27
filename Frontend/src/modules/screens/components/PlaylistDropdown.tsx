type Props = {
  selectedPlaylists: any[];
  showDropdown: boolean;
  setShowDropdown: any;
};

export default function PlaylistDropdown({
  selectedPlaylists,
  showDropdown,
  setShowDropdown,
}: Props) {
  return (
    <div className="relative">
      <div
        onClick={() => setShowDropdown(!showDropdown)}
        className="input flex justify-between bg-white cursor-pointer"
      >
        {selectedPlaylists.length
          ? selectedPlaylists.map((p) => p.name).join(", ")
          : "Select Playlist"}
      </div>
    </div>
  );
}