/**
 * Export utilities for CSV, JSON, and other formats
 */

export interface ExportableData {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Convert data array to CSV string
 */
export function arrayToCSV(data: ExportableData[], headers?: string[]): string {
  if (data.length === 0) return '';

  // Use provided headers or extract from first row
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Escape and quote CSV values
  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    // If contains comma, quote, or newline, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  // Create CSV rows
  const headerRow = csvHeaders.map(escapeCSV).join(',');
  const dataRows = data.map(row =>
    csvHeaders.map(header => escapeCSV(row[header])).join(',')
  );

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Download data as CSV file
 */
export function downloadCSV(
  data: ExportableData[],
  filename: string,
  headers?: string[]
): void {
  const csv = arrayToCSV(data, headers);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download data as JSON file
 */
export function downloadJSON(data: any, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format date for CSV/export
 */
export function formatDateForExport(date: Date | number | string): string {
  const d = typeof date === 'number' ? new Date(date) : new Date(date);
  return d.toISOString();
}

/**
 * Format address for export (full address, not truncated)
 */
export function formatAddressForExport(address: string): string {
  return address;
}

/**
 * Format bigint/wei values for export (converted to readable format)
 */
export function formatWeiForExport(value: bigint | string, decimals: number = 18): string {
  const bigIntValue = typeof value === 'string' ? BigInt(value) : value;
  const divisor = BigInt(10 ** decimals);
  const wholePart = bigIntValue / divisor;
  const fractionalPart = bigIntValue % divisor;
  
  if (fractionalPart === BigInt(0)) {
    return wholePart.toString();
  }
  
  const fractionalString = fractionalPart.toString().padStart(decimals, '0');
  const trimmedFractional = fractionalString.replace(/0+$/, '');
  
  return `${wholePart}.${trimmedFractional}`;
}

