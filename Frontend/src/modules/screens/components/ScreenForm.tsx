import { Check, Copy } from "lucide-react";

type Props = {
  form: any;
  handleChange: (e: any) => void;
  copyCode: (code: string, id: string) => void;
  copiedId: string | null;
};

export default function ScreenForm({
  form,
  handleChange,
  copyCode,
  copiedId,
}: Props) {
  return (
    <div className="col-span-2 grid grid-cols-2 gap-4">

      {/* Screen Name */}
      <div>
        <label className="text-xs text-gray-600">
          Screen name
        </label>

        <input
          value={form.screenName}
          disabled
          className="w-full h-9 border rounded-lg px-3 bg-gray-100 text-sm"
        />
      </div>

      {/* Screen Code */}
      <div>
        <label className="text-xs text-gray-600">
          Screen code
        </label>

        <div className="flex">

          <input
            value={form.screenCode}
            disabled
            className="w-full h-9 border rounded-l-lg px-3 bg-gray-100 text-sm"
          />

          <button
            onClick={() => copyCode(form.screenCode, "code")}
            className="text-gray-400 px-3 shadow hover:text-black"
          >
            {copiedId === "code" ? (
              <Check size={16} className="text-green-600" />
            ) : (
              <Copy size={16} />
            )}
          </button>

        </div>
      </div>

      {/* Location */}
      <div>
        <label className="text-xs text-gray-600">
          Location name
        </label>

        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          className="w-full h-9 border rounded-lg px-3 text-sm"
        />
      </div>

      {/* Location ID */}
      <div>
        <label className="text-xs text-gray-600">
          Location ID
        </label>

        <input
          name="locationId"
          value={form.locationId}
          onChange={handleChange}
          className="w-full h-9 border rounded-lg px-3 text-sm"
        />
      </div>

      {/* Longitude */}
      <div>
        <label className="text-xs text-gray-600">
          Longitude
        </label>

        <input
          name="longitude"
          value={form.longitude}
          onChange={handleChange}
          className="w-full h-9 border rounded-lg px-3 text-sm"
        />
      </div>

      {/* Latitude */}
      <div>
        <label className="text-xs text-gray-600">
          Latitude
        </label>

        <input
          name="latitude"
          value={form.latitude}
          onChange={handleChange}
          className="w-full h-9 border rounded-lg px-3 text-sm"
        />
      </div>

      {/* Address */}
      <div className="col-span-2">
        <label className="text-xs text-gray-600">
          Address
        </label>

        <input
          name="address"
          value={form.address}
          onChange={handleChange}
          className="w-full h-9 border rounded-lg px-3 text-sm"
        />
      </div>

    </div>
  );
}