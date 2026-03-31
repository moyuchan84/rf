import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { RequestsService } from './requests/requests.service';
import type { Response } from 'express';
import * as ExcelJS from 'exceljs';
import AdmZip from 'adm-zip';

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
    
    if (!photoKey) {
      return res.status(404).send('PhotoKey not found');
    }

    const fileName = photoKey.filename || `${photoKey.tableName}_Rev${photoKey.revNo}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${encodeURIComponent(fileName)}`,
    );

    // 1. Prioritize rawBinary from DB
    if (photoKey.rawBinary) {
      return res.send(photoKey.rawBinary);
    }

    // 2. Fallback to workbookData generation
    if (!photoKey.workbookData) {
      return res.status(404).send('No data available for download');
    }

    const buffer = await this.generateExcelBuffer(photoKey);
    return res.send(buffer);
  }

  @Get('download/photo-keys/bulk')
  async downloadPhotoKeysBulk(@Query('ids') ids: string, @Res() res: Response) {
    if (!ids) {
      return res.status(400).send('No IDs provided');
    }

    const idList = ids.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
    if (idList.length === 0) {
      return res.status(400).send('Invalid IDs provided');
    }

    const zip = new AdmZip();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const zipFileName = `PhotoKeys_Bulk_${timestamp}.zip`;

    for (const id of idList) {
      const photoKey = await this.requestsService.findPhotoKeyById(id);
      if (!photoKey) continue;

      const fileName = photoKey.filename || `${photoKey.tableName}_Rev${photoKey.revNo}.xlsx`;
      
      let fileBuffer: Buffer;
      if (photoKey.rawBinary) {
        fileBuffer = photoKey.rawBinary as Buffer;
      } else if (photoKey.workbookData) {
        fileBuffer = await this.generateExcelBuffer(photoKey);
      } else {
        continue;
      }

      zip.addFile(fileName, fileBuffer);
    }

    const zipBuffer = zip.toBuffer();

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${encodeURIComponent(zipFileName)}`,
    );
    
    return res.send(zipBuffer);
  }

  private async generateExcelBuffer(photoKey: any): Promise<Buffer> {
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

    return await workbook.xlsx.writeBuffer() as any;
  }
}
