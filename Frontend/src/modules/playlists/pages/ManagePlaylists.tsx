import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  useCreatePlaylistMutation,
  useUpdatePlaylistMutation,
  useGetPlaylistByIdQuery
} from "../api/playlistApi";
import { useGetProductsQuery } from "@/modules/products/api/productApi";

export default function ManagePlaylists() {

  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  const { data: products = [] } = useGetProductsQuery();
  const { data: playlistData } = useGetPlaylistByIdQuery(id!, { skip: !id });

  const [createPlaylist] = useCreatePlaylistMutation();
  const [updatePlaylist] = useUpdatePlaylistMutation();

  const [name, setName] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  useEffect(() => {
    if (playlistData) {
      setName(playlistData.name);
      setSelectedProducts(playlistData.products);
    }
  }, [playlistData]);

  const toggleProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        name,
        products: selectedProducts,
        createdAt: new Date().toISOString().split("T")[0],
        playlistId: "PL-" + Math.floor(100 + Math.random() * 900),
      };

      if (id) {
        await updatePlaylist({ id, ...payload });
        toast({ title: "Playlist updated" });
      } else {
        await createPlaylist(payload);
        toast({ title: "Playlist created" });
      }

      navigate("/playlists");

    } catch {
      toast({ title: "Error saving playlist" });
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">
          {id ? "Edit Playlist" : "Create Playlist"}
        </h1>
        <p className="text-sm text-gray-500">
          Playlists / {id ? "Edit" : "Create"}
        </p>
      </div>

      {/* FORM */}
      <div className="bg-gray-200 p-6 rounded-xl space-y-4">

        {/* NAME */}
        <div>
          <label className="text-sm">Playlist Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-9 border rounded-lg px-3 text-sm"
          />
        </div>

        {/* PRODUCTS */}
        <div>
          <p className="font-medium mb-2">Select Products</p>

          <div className="grid grid-cols-4 gap-4">

            {products.map((product: any) => {

              const image =
                product?.variants?.[0]?.variant_media?.[0]?.media_url;

              const selected = selectedProducts.includes(product.id);

              return (
                <div
                  key={product.id}
                  onClick={() => toggleProduct(product.id)}
                  className={`cursor-pointer border rounded-lg p-2 ${selected ? "border-purple-600 bg-purple-50" : ""
                    }`}
                >

                  <img
                    src={image}
                    className="w-full h-24 object-cover rounded"
                  />

                  <p className="text-xs mt-1">{product.name}</p>

                </div>
              );
            })}

          </div>
        </div>

        {/* SELECTED PREVIEW */}
        <div>
          <p className="font-medium mb-2">Selected Products</p>

          <div className="flex gap-3 overflow-x-auto">

            {selectedProducts.map((id) => {
              const product = products.find((p: any) => p.id === id);
              const image =
                product?.variants?.[0]?.variant_media?.[0]?.media_url;

              return (
                <img
                  key={id}
                  src={image}
                  className="w-20 h-16 object-cover rounded"
                />
              );
            })}

          </div>
        </div>

      </div>

      {/* BUTTONS */}
      <div className="flex justify-end gap-3">

        <button
          onClick={() => navigate("/playlists")}
          className="px-4 py-2 border rounded-lg"
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-black text-white rounded-lg"
        >
          Save Playlist
        </button>

      </div>

    </div>
  );
}