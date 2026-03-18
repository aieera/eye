import { useDeleteBrandMutation } from "../api/brandApi";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function BrandTable({ brands }) {

  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteBrand] = useDeleteBrandMutation();

  const handleDelete = async (id) => {

    if (!confirm("Delete this brand?")) return;

    try {

      await deleteBrand(id).unwrap();

      toast({
        title: "Brand deleted"
      });

    } catch {

      toast({
        title: "Error deleting brand"
      });

    }
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden border">

      <table className="w-full text-md">

        <thead className="bg-gray-200">
          <tr className="text-left">

            <th className="px-6 py-3 font-normal">Name</th>
            <th className="px-6 py-3 font-normal">Logo Url</th>
            <th className="px-6 py-3 font-normal">Offer</th>
            <th className="px-6 py-3 font-normal">Status</th>
            <th className="px-6 py-3 font-normal">Action</th>

          </tr>
        </thead>

        <tbody className="text-gray-700">

          {brands.map((brand) => (
            <tr
              key={brand.id}
              className="border-t border-gray-200 hover:bg-gray-50"
            >

              <td className="px-6 py-4">{brand.name}</td>

              <td className="px-6 py-4">
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="h-8"
                />
              </td>

              <td className="px-6 py-4">
                {brand.offer}
              </td>

              <td className="px-6 py-4">
                {brand.offerStatus}
              </td>

              <td className="px-6 py-4 flex gap-3">

                <button
                  onClick={() => navigate(`/brands/${brand.id}`)}
                  className="hover:text-purple-700"
                >
                  ✏️
                </button>

                <button
                  onClick={() => handleDelete(brand.id)}
                  className="hover:text-red-500"
                >
                  🗑
                </button>

              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}