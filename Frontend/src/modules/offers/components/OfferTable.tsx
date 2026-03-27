import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function OfferTable({ offers }) {


  return (
    <div className="bg-white rounded-xl overflow-hidden border">

      <table className="w-full text-md">

        <thead className="bg-gray-200">
          <tr className="text-left">

            <th className="px-6 py-3 font-normal">Name</th>
            <th className="px-6 py-3 font-normal">Offer Type</th>
            <th className="px-6 py-3 font-normal">Offer Value</th>
            <th className="px-6 py-3 font-normal">Offer Start Date</th>
            <th className="px-6 py-3 font-normal">Offer End Date</th>
            <th className="px-6 py-3 font-normal">Status</th>

          </tr>
        </thead>

        <tbody className="text-gray-700">

          {offers.map((offer) => (
            <tr
              key={offer.id}
              className="border-t border-gray-200 hover:bg-gray-50"
            >

              <td className="px-6 py-4">{offer.name}</td>

              <td className="px-6 py-4 capitalize">
                {offer.offerType}
              </td>

              <td className="px-6 py-4">
                {offer.offerType === "percentage"
                  ? `${offer.offerValue}%`
                  : `₹${offer.offerValue}`}
              </td>

              <td className="px-6 py-4">
                {offer.offerStartDate}
              </td>

              <td className="px-6 py-4">
                {offer.offerEndDate}
              </td>

              <td className="px-6 py-4">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    offer.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {offer.status}
                </span>
              </td>


            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}