import React from "react";

interface Props {
  playlists: any[];
  products: any[];
}

export default function AddedPlaylists({ playlists, products }: Props) {

  const getImage = (playlist: any) => {

    if (!playlist.products || playlist.products.length === 0) return "";

    const firstProduct = products.find(
      (p: any) => p.id === playlist.products[0]
    );

    return firstProduct?.variants?.[0]?.variant_media?.[0]?.media_url || "";
  };
  return (
    <div>

      <p className="text-sm font-medium mb-3">
        Playlist added
      </p>

      <div className="grid grid-cols-4 gap-4">

        {playlists?.length > 0 && playlists.map((playlist: any, index: number) => {

          const image = getImage(playlist);

          return (
            <div
              key={playlist.id}
              className="bg-white rounded-xl border overflow-hidden shadow-sm"
            >

              <div className="relative">

                <img
                  src={image || "/placeholder.png"}
                  className="h-36 w-full object-cover"
                />

                <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Active
                </span>

              </div>

              <div className="p-3 text-sm">

                <p className="font-medium">
                  {playlist.name}
                </p>

                <p className="text-xs text-gray-500">
                  Order no : {index + 1}
                </p>

                <p className="text-xs text-gray-500">
                  {playlist.startTime} - {playlist.endTime}
                </p>

              </div>

            </div>
          );

        })}

      </div>

    </div>
  );
}