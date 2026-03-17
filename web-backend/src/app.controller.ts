import { Controller, Get, Param, Res, StreamableFile } from '@nestjs/common';
import { AppService } from './app.service';
import { RequestsService } from './requests/requests.service';
import type { Response } from 'express';
import * as ExcelJS from 'exceljs';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly requestsService: RequestsService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('download/photo-key/:id')
  async downloadPhotoKey(@Param('id') id: string, @Res() res: Response) {
    const photoKeyId = parseInt(id);
    const photoKey = await this.requestsService.findPhotoKeyById(photoKeyId);
    
    if (!photoKey || !photoKey.workbookData) {
      return res.status(404).send('PhotoKey not found or no data available');
    }

    const workbook = new ExcelJS.Workbook();
    const data = photoKey.workbookData as any;

    for (const wsData of data.Worksheets || []) {
      const sanitizedName = wsData.SheetName === 'History' ? 'History_Data' : wsData.SheetName;
      const sheet = workbook.addWorksheet(sanitizedName);
      
      // 1. MetaInfo Restoration
      if (wsData.MetaInfo) {
        let r = wsData.MetaOrigin?.Row || 1;
        const c = wsData.MetaOrigin?.Col || 1;
        for (const [key, value] of Object.entries(wsData.MetaInfo)) {
          const output = key.startsWith('#') ? String(value) : `${key}: ${value}`;
          sheet.getRow(r).getCell(c).value = output;
          r++;
        }
      }

      // 2. Data Table Restoration
      const headerRow = wsData.DataOrigin?.Row || (wsData.MetaOrigin?.Row ? wsData.MetaOrigin.Row + Object.keys(wsData.MetaInfo || {}).length + 1 : 1);
      const tableStartCol = wsData.DataOrigin?.Col || 1;

      // Headers
      (wsData.Columns || []).forEach((col: any, idx: number) => {
        sheet.getRow(headerRow).getCell(tableStartCol + idx).value = col.Name;
      });

      // Data Rows
      (wsData.TableData || []).forEach((rowData: any, rowIdx: number) => {
        (wsData.Columns || []).forEach((col: any, colIdx: number) => {
          if (rowData[col.Key] !== undefined) {
            sheet.getRow(headerRow + 1 + rowIdx).getCell(tableStartCol + colIdx).value = rowData[col.Key];
          }
        });
      });
    }

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${encodeURIComponent(photoKey.tableName + '_Rev' + photoKey.revNo + '.xlsx')}`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }
}
