import { useParams } from "react-router-dom";
import { useGetFieldMappingsQuery } from "../api/ingestionApi";
import { Badge } from "@/components/ui/badge";

const TRANSFORM_OPTIONS = ["trim", "uppercase", "lowercase", "toString", "toNumber", "toDecimal", "toBoolean", "oracleStatus", "dateFormat"];

export default function FieldMapping() {
  const { id } = useParams();
  const { data: res, isLoading } = useGetFieldMappingsQuery(id as string, { skip: !id });
  const mappings = res?.data;

  const renderTable = (title: string, items: any[]) => (
    <div className="rounded-xl border border-border/60 overflow-hidden">
      <div className="bg-muted/40 px-4 py-3 flex items-center justify-between border-b border-border/40">
        <h3 className="text-sm font-medium">{title}</h3>
        {mappings?.isDefault && <Badge variant="secondary">Using defaults</Badge>}
      </div>
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr className="text-left">
            <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Oracle Field</th>
            <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Internal Field</th>
            <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Transform</th>
            <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Required</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40 bg-card">
          {items.map((m: any, i: number) => (
            <tr key={m.id || i} className="hover:bg-muted/20 transition-colors">
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{m.externalField}</td>
              <td className="px-4 py-3 font-mono text-xs">{m.internalField}</td>
              <td className="px-4 py-3">
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">{m.transformRule || "none"}</span>
              </td>
              <td className="px-4 py-3">
                {m.isRequired ? <Badge variant="default" className="text-xs">Required</Badge> : <span className="text-muted-foreground text-xs">Optional</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Field Mappings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Data Sync / Mappings</p>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-border/60 bg-card p-12 text-center"><p className="text-muted-foreground text-sm">Loading...</p></div>
      ) : mappings ? (
        <div className="space-y-6">
          {renderTable("Product Mappings (Oracle ITEMS → Products)", mappings.product)}
          {renderTable("Price Mappings (Oracle ITEM_LOC → Product Prices)", mappings.price)}
        </div>
      ) : null}
    </div>
  );
}
