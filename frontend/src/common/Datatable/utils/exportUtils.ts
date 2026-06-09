import type { Column } from '../types/datatable.types';

/*------------- CSV Export Helper -------------*/

export function exportToCSV<T>(columns: Column<T>[], data: T[], fileName = 'export'): void {
  // Extract headers
  const headers = columns.map((col) => `"${col.label.replace(/"/g, '""')}"`).join(',');

  // Extract row values
  const rows = data.map((row) =>
    columns
      .map((col) => {
        // If there's a custom render, it might return a ReactNode. We will try to fall back to raw key value if it's not a primitive.
        const key = col.id as keyof T;
        const val = row[key];
        const stringVal = val !== null && val !== undefined ? String(val) : '';
        return `"${stringVal.replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  const csvContent = [headers, ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/*------------- PDF / Print Export Helper -------------*/

export function exportToPDF<T>(columns: Column<T>[], data: T[], title = 'Report'): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export to PDF');
    return;
  }

  // Generate HTML table structure for print preview
  const headersHtml = columns.map((col) => `<th>${col.label}</th>`).join('');
  const rowsHtml = data
    .map(
      (row) =>
        `<tr>${columns
          .map((col) => {
            const key = col.id as keyof T;
            const val = row[key];
            return `<td>${val !== null && val !== undefined ? String(val) : ''}</td>`;
          })
          .join('')}</tr>`
    )
    .join('');

  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: 'Inter', sans-serif;
            margin: 20px;
            color: #333;
          }
          h1 {
            text-align: center;
            color: #1a73e8;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
            color: #333;
            font-weight: 600;
          }
          tr:nth-child(even) {
            background-color: #fafafa;
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <table>
          <thead>
            <tr>${headersHtml}</tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <script>
          window.onload = function() {
            window.print();
            window.close();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
