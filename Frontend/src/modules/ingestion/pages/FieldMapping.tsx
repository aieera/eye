import { useParams } from "react-router-dom";
import { useGetFieldMappingsQuery } from "../api/ingestionApi";
import { Badge } from "@/components/ui/badge";

const TRANSFORM_OPTIONS = ["trim", "uppercase", "lowercase", "toString", "toNumber", "toDecimal", "toBoolean", "oracleStatus", "dateFormat"];

export default function FieldMapping() {
  const { id } = useParams();
  const { data: res, isLoading } = useGetFieldMappingsQuery(id as string, { skip: !id });
  const mappings = res?.data;

  const renderTable = (title: string, items: any[]) => (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="bg-gray-100 px-4 py-3 flex items-center justify-between">
        <h3 className="font-semibold text-sm">{title}</h3>
        {mappings?.isDefault && <Badge variant="secondary">Using defaults</Badge>}
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="text-left">
            <th className="px-4 py-2 font-normal">Oracle Field</th>
            <th className="px-4 py-2 font-normal">Internal Field</th>
            <th className="px-4 py-2 font-normal">Transform</th>
            <th className="px-4 py-2 font-normal">Required</th>
          </tr>
        </thead>
        <tbody>
          {items.map((m: any, i: number) => (
            <tr key={m.id || i} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2 font-mono text-xs">{m.externalField}</td>
              <td className="px-4 py-2 font-mono text-xs">{m.internalField}</td>
              <td className="px-4 py-2">
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{m.transformRule || "none"}</span>
              </td>
              <td className="px-4 py-2">
                {m.isRequired ? <Badge variant="default" className="text-xs">Required</Badge> : <span className="text-gray-400 text-xs">Optional</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Field Mappings</h1>
        <p className="text-sm text-gray-500">Data Sync / Mappings</p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border p-12 text-center"><p className="text-gray-500">Loading...</p></div>
      ) : mappings ? (
        <div className="space-y-6">
          {renderTable("Product Mappings (Oracle ITEMS → Products)", mappings.product)}
          {renderTable("Price Mappings (Oracle ITEM_LOC → Product Prices)", mappings.price)}
        </div>
      ) : null}
    </div>
  );
}
