import { Image as ImageIcon, Video } from "lucide-react";

export default function ProductTable({ products }) {

  return (
    <div className="bg-white rounded-xl overflow-hidden border">

      <table className="w-full text-md">

        <thead className="bg-gray-200">
          <tr className="text-left">

            <th className="px-4 py-3"></th>
            <th className="px-6 py-3 font-normal">Product Name</th>
            <th className="px-6 py-3 font-normal">Brand</th>
            <th className="px-6 py-3 font-normal">Category</th>
            <th className="px-6 py-3 font-normal">SubCategory</th>
            <th className="px-6 py-3 font-normal">Image</th>
            <th className="px-6 py-3 font-normal">Video</th>
            <th className="px-6 py-3 font-normal">Current Price</th>
            <th className="px-6 py-3 font-normal">Offer Price</th>
            <th className="px-6 py-3 font-normal">Offer Name</th>

          </tr>
        </thead>

        <tbody className="text-gray-700">

          {products.map((product) => {

            const variant = product.variants?.[0];

            const images = variant?.variant_media?.filter(
              (m) => m.media_type === "image"
            );

            const videos = variant?.variant_media?.filter(
              (m) => m.media_type === "video"
            );

            const price = variant?.price;

            return (

              <tr
                key={product.id}
                className="border-t border-gray-200 hover:bg-gray-50"
              >

                <td className="px-4 py-4">
                  <input type="checkbox" />
                </td>

                <td className="px-6 py-4 font-medium">
                  {product.name}
                </td>

                <td className="px-6 py-4">
                  {product.brand || "—"}
                </td>

                <td className="px-6 py-4">
                  {product.category}
                </td>

                <td className="px-6 py-4">
                  {product.subcategory}
                </td>

                {/* Images */}
                <td className="px-6 py-4 flex gap-1">

                  {images?.slice(0,5).map((img) => (
                    <img
                      key={img.id}
                      src={img.media_url}
                      className="w-6 h-6 rounded object-cover border"
                    />
                  ))}

                  <ImageIcon size={14} className="text-gray-400 ml-1" />

                </td>

                {/* Videos */}
                <td className="px-6 py-4 flex gap-1">

                  {videos?.length > 0
                    ? videos.map((vid) => (
                        <Video
                          key={vid.id}
                          size={16}
                          className="text-gray-500"
                        />
                      ))
                    : "—"}

                </td>

                  <td className="px-6 py-4">
                  -
                </td>

                <td className="px-6 py-4">
                  ${price}
                </td>

                <td className="px-6 py-4">
                  ${price ? price - 100 : "—"}
                </td>

                <td className="px-6 py-4">
                  Weekend Sale
                </td>

              </tr>

            );
          })}

        </tbody>

      </table>

    </div>
  );
}