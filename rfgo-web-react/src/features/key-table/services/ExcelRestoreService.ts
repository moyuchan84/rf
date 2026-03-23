import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { type PhotoKey } from '../../master-data/types';

export class ExcelRestoreService {
  static async downloadBinaryFromApi(id: number, tableName: string, revNo: number) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9999';
    const response = await fetch(`${baseUrl}/download/photo-key/${id}`);

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    const blob = await response.blob();
    saveAs(blob, `${tableName}_Rev${revNo}.xlsx`);
  }

  static async exportToExcel(photoKey: PhotoKey) {
    if (!photoKey.workbookData) {
      throw new Error('No workbook data available for export');
    }

    const workbook = new ExcelJS.Workbook();
    const data = photoKey.workbookData;

    for (const wsData of data.Worksheets || []) {
      const sanitizedName = wsData.SheetName === 'History' ? 'History_Data' : wsData.SheetName;
      const sheet = workbook.addWorksheet(sanitizedName);
      
      // 1. Restore Meta Information
      if (wsData.MetaInfo && wsData.MetaOrigin) {
        let r = wsData.MetaOrigin.Row || 1;
        const c = wsData.MetaOrigin.Col || 1;
        
        for (const [key, value] of Object.entries(wsData.MetaInfo)) {
          const cell = sheet.getRow(r).getCell(c);
          const output = key.startsWith('#') ? String(value) : `${key}: ${value}`;
          cell.value = output;
          
          cell.font = { bold: true, size: 10, color: { argb: 'FF1E293B' } };
          r++;
        }
      }

      // 2. Restore Data Table
      const headerRow = wsData.DataOrigin?.Row || 1;
      const tableStartCol = wsData.DataOrigin?.Col || 1;

      // Headers
      if (wsData.Columns) {
        wsData.Columns.forEach((col: any, idx: number) => {
          const cell = sheet.getRow(headerRow).getCell(tableStartCol + idx);
          cell.value = col.Name;
          
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF1F5F9' }
          };
          cell.font = { bold: true, size: 11 };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      }

      // Data Rows
      if (wsData.TableData && wsData.Columns) {
        wsData.TableData.forEach((rowData: any, rowIdx: number) => {
          wsData.Columns.forEach((col: any, colIdx: number) => {
            if (rowData[col.Key] !== undefined) {
              const cell = sheet.getRow(headerRow + 1 + rowIdx).getCell(tableStartCol + colIdx);
              cell.value = rowData[col.Key];
              cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
              };
            }
          });
        });
      }

      sheet.columns.forEach(column => {
        column.width = 15;
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${photoKey.tableName}_Rev${photoKey.revNo}.xlsx`);
  }
}
