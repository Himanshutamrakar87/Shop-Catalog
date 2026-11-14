import { isStockAlertStatus, isDiscontinuedStatus } from '../data/mockData';

/**
 * Normalize status labels for clean CSV backup & external review
 */
function normalizeExportStatus(status) {
  if (isStockAlertStatus(status)) return 'Out of Stock';
  if (isDiscontinuedStatus(status)) return 'Discontinued';
  return 'In Stock';
}

/**
 * Format ISO timestamp into readable YYYY-MM-DD HH:mm (or empty string if invalid)
 */
function formatCsvDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toISOString();
}

/**
 * Escape a cell value according to RFC 4180 CSV rules
 * and guard against spreadsheet formula injection on string values.
 */
function escapeCsvCell(rawValue) {
  if (rawValue === null || rawValue === undefined) return '';
  let str = String(rawValue);

  // Guard text cells starting with formula prefixes (=, @, tab, cr)
  if (/^[=@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Wrap in double-quotes if value contains commas, quotes, newlines, or leading/trailing spaces
  if (/[",\r\n]/.test(str) || str !== str.trim()) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Build CSV string from an array of product objects.
 * Includes UTF-8 BOM so Excel / Google Sheets preserve ₹ and Unicode characters.
 */
export function buildProductsCsv(products = []) {
  const headers = [
    'Product Code',
    'Product Name',
    'Category',
    'Category Code',
    'Sub-Category',
    'Brand',
    'Material',
    'Size / Capacity',
    'Purchase Price (INR)',
    'Purchase Unit',
    'Status',
    'Special Details',
    'Image 1 URL',
    'Image 2 URL',
    'Created At',
    'Updated At',
  ];

  const rows = (Array.isArray(products) ? products : []).map((product) => {
    const image1 = product.images?.[0] || product.image1 || '';
    const image2 = product.images?.[1] || product.image2 || '';

    const cells = [
      product.productCode || product.code || '',
      product.productName || product.name || '',
      product.categoryName || product.category || '',
      product.categoryCode || '',
      product.subCategory || '',
      product.brand || '',
      product.material || '',
      product.sizeCapacity || product.sizeOrCapacity || '',
      product.purchasePrice !== undefined && product.purchasePrice !== null
        ? Number(product.purchasePrice)
        : 0,
      product.purchaseUnit || product.purchase_unit || 'Piece',
      normalizeExportStatus(product.status),
      product.specialDetails || '',
      image1,
      image2,
      formatCsvDate(product.createdAt || product.created_at),
      formatCsvDate(product.updatedAt || product.updated_at),
    ];

    return cells.map(escapeCsvCell).join(',');
  });

  // UTF-8 BOM + CRLF line endings for universal Excel/LibreOffice/Google Sheets compatibility
  return '\uFEFF' + [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
}

/**
 * Trigger a browser download of the product catalogue CSV file.
 * Returns { count, filename } for user feedback.
 */
export function exportProductsToCsv(products = [], { scope = 'all' } = {}) {
  const list = Array.isArray(products) ? products : [];
  const csvContent = buildProductsCsv(list);

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const suffix = scope === 'filtered' ? 'filtered' : 'backup';
  const filename = `rbb-catalogue-${suffix}-${yyyy}-${mm}-${dd}.csv`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Defer revocation slightly so the browser completes initiating the download
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);

  return { count: list.length, filename };
}
