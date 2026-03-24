export interface FieldMapping {
  externalField: string;
  internalField: string;
  transformRule: string | null;
  isRequired: boolean;
}

export function getDefaultProductMappings(): FieldMapping[] {
  return [
    { externalField: 'ITEM_CODE', internalField: 'externalItemCode', transformRule: 'trim', isRequired: true },
    { externalField: 'ITEM_LONG_DESC', internalField: 'name', transformRule: 'trim', isRequired: true },
    { externalField: 'ITEM_SHORT_DESC', internalField: 'shortName', transformRule: 'trim', isRequired: false },
    { externalField: 'DEPT', internalField: 'dept', transformRule: 'toString', isRequired: false },
    { externalField: 'CLASS', internalField: 'classCode', transformRule: 'toString', isRequired: false },
    { externalField: 'SUBCLASS', internalField: 'subclass', transformRule: 'toString', isRequired: false },
    { externalField: 'STATUS', internalField: 'status', transformRule: 'oracleStatus', isRequired: false },
    { externalField: 'STANDARD_UOM', internalField: 'uom', transformRule: 'trim', isRequired: false },
  ];
}

export function getDefaultPriceMappings(): FieldMapping[] {
  return [
    { externalField: 'ITEM_CODE', internalField: 'externalItemCode', transformRule: 'trim', isRequired: true },
    { externalField: 'LOCATION_ID', internalField: 'locationId', transformRule: 'toString', isRequired: true },
    { externalField: 'UNIT_RETAIL', internalField: 'unitRetail', transformRule: 'toDecimal', isRequired: true },
    { externalField: 'SELLING_UNIT_RETAIL', internalField: 'sellingUnitRetail', transformRule: 'toDecimal', isRequired: false },
    { externalField: 'SELLING_UOM', internalField: 'sellingUom', transformRule: 'trim', isRequired: false },
  ];
}

export function applyTransform(value: any, rule: string | null): any {
  if (value === null || value === undefined) return null;

  switch (rule) {
    case 'trim':
      return typeof value === 'string' ? value.trim() : String(value).trim();
    case 'uppercase':
      return String(value).trim().toUpperCase();
    case 'lowercase':
      return String(value).trim().toLowerCase();
    case 'toString':
      return String(value).trim();
    case 'toNumber':
      return Number(value) || 0;
    case 'toDecimal':
      return parseFloat(String(value)) || 0;
    case 'toBoolean':
      return ['Y', 'y', '1', 'true', 'TRUE'].includes(String(value).trim());
    case 'oracleStatus':
      return String(value).trim().toUpperCase() === 'A' ? 'active' : 'inactive';
    case 'dateFormat':
      return value instanceof Date ? value : new Date(value);
    default:
      return value;
  }
}

export function mapRecord(
  sourceRecord: Record<string, any>,
  mappings: FieldMapping[]
): { mapped: Record<string, any>; errors: string[] } {
  const mapped: Record<string, any> = {};
  const errors: string[] = [];

  for (const mapping of mappings) {
    const rawValue = sourceRecord[mapping.externalField];

    if (mapping.isRequired && (rawValue === null || rawValue === undefined || rawValue === '')) {
      errors.push(`Required field ${mapping.externalField} is missing or empty`);
      continue;
    }

    if (rawValue !== null && rawValue !== undefined) {
      mapped[mapping.internalField] = applyTransform(rawValue, mapping.transformRule);
    }
  }

  return { mapped, errors };
}

export function mapRecords(
  records: Record<string, any>[],
  mappings: FieldMapping[]
): { results: Record<string, any>[]; totalErrors: number; errorSamples: string[] } {
  const results: Record<string, any>[] = [];
  let totalErrors = 0;
  const errorSamples: string[] = [];

  for (const record of records) {
    const { mapped, errors } = mapRecord(record, mappings);

    if (errors.length > 0) {
      totalErrors += errors.length;
      if (errorSamples.length < 10) {
        const itemCode = record.ITEM_CODE || 'unknown';
        errorSamples.push(`[${itemCode}] ${errors.join('; ')}`);
      }
    }

    // Only include records that have at least the required fields
    const hasRequired = mappings
      .filter((m) => m.isRequired)
      .every((m) => mapped[m.internalField] !== undefined && mapped[m.internalField] !== null);

    if (hasRequired) {
      results.push(mapped);
    }
  }

  return { results, totalErrors, errorSamples };
}
