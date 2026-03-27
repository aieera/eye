export default function PlaylistExpanded({
  expandedPlaylist,
  playlistProducts,
  scheduleEnabled,
  setScheduleEnabled,
  startDate,
  setStartDate,
  startTime,
  setStartTime,
  endDate,
  setEndDate,
  endTime,
  setEndTime,
  setAddedPlaylists,
  setSelectedPlaylists,
  setExpandedPlaylist,
  setShowDropdown,
}: any) {
  if (!expandedPlaylist) return null;

  return (
    <div className="mt-4 space-y-4">

      {/* Schedule */}
      <div>
        <p className="text-sm font-medium mb-2">Schedule Playlist</p>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={scheduleEnabled}
            onChange={() => setScheduleEnabled(!scheduleEnabled)}
          />
          Set Date & Time
        </label>

        {scheduleEnabled && (
          <div className="grid grid-cols-2 gap-4 mt-2">

            <div className="flex gap-2">
              <input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} className="input"/>
              <input type="time" value={startTime} onChange={(e)=>setStartTime(e.target.value)} className="input"/>
            </div>

            <div className="flex gap-2">
              <input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} className="input"/>
              <input type="time" value={endTime} onChange={(e)=>setEndTime(e.target.value)} className="input"/>
            </div>

          </div>
        )}
      </div>

      {/* Products */}
      <div>
        <p className="text-sm font-medium mb-2">Products</p>

        <div className="flex gap-3 overflow-x-auto">
          {playlistProducts.map((product: any) => {
            const image =
              product?.variants?.[0]?.variant_media?.[0]?.media_url;

            return (
              <div key={product.id} className="relative w-28">
                <img src={image} className="w-28 h-20 object-cover rounded-lg" />
                <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-1 py-0.5">
                  {product.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3">

        <button
          onClick={() => setExpandedPlaylist(null)}
          className="px-4 py-2 border rounded-lg text-sm"
        >
          Cancel
        </button>

        <button
          onClick={() => {
            if (!expandedPlaylist) return;

            const newPlaylist = {
              ...expandedPlaylist,
              startDate,
              startTime,
              endDate,
              endTime,
            };

            setAddedPlaylists((prev: any) => {
              const exists = prev.find((p: any) => p.id === expandedPlaylist.id);
              if (exists) return prev;
              return [...prev, newPlaylist];
            });

            setSelectedPlaylists((prev: any) => {
              const exists = prev.find((p: any) => p.id === expandedPlaylist.id);
              if (exists) return prev;
              return [...prev, expandedPlaylist];
            });

            setExpandedPlaylist(null);
            setShowDropdown(false);
          }}
          className="px-4 py-2 bg-black text-white rounded-lg text-sm"
        >
          Add Playlist
        </button>

      </div>

    </div>
  );
}