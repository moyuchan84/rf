import { Injectable } from '@nestjs/common';
import * as _ from 'lodash';

export interface DiffRow {
  status: 'unchanged' | 'added' | 'removed' | 'modified';
  data: any;
  baseData?: any;
  changedFields?: string[];
}

export interface SheetDiff {
  sheetName: string;
  status: 'unchanged' | 'added' | 'removed' | 'modified';
  diffRows?: DiffRow[];
}

@Injectable()
export class DiffService {
  compareWorkbooks(baseData: any, targetData: any): SheetDiff[] {
    const baseSheets = baseData?.Worksheets || [];
    const targetSheets = targetData?.Worksheets || [];

    const results: SheetDiff[] = [];

    // Map base sheets for easy lookup
    const baseSheetMap = new Map(baseSheets.map((s: any) => [s.SheetName, s]));
    const targetSheetNames = new Set(targetSheets.map((s: any) => s.SheetName));

    // Check base sheets (Unchanged, Removed, Modified)
    for (const baseSheet of baseSheets) {
      const targetSheet = targetSheets.find((s: any) => s.SheetName === baseSheet.SheetName);
      
      if (!targetSheet) {
        results.push({
          sheetName: baseSheet.SheetName,
          status: 'removed',
        });
        continue;
      }

      const diffRows = this.compareSheets(baseSheet, targetSheet);
      const isModified = diffRows.some(row => row.status !== 'unchanged');

      results.push({
        sheetName: baseSheet.SheetName,
        status: isModified ? 'modified' : 'unchanged',
        diffRows,
      });
    }

    // Check for added sheets
    for (const targetSheet of targetSheets) {
      if (!baseSheetMap.has(targetSheet.SheetName)) {
        results.push({
          sheetName: targetSheet.SheetName,
          status: 'added',
        });
      }
    }

    return results;
  }

  private compareSheets(baseSheet: any, targetSheet: any): DiffRow[] {
    const baseRows = baseSheet.TableData || [];
    const targetRows = targetSheet.TableData || [];
    const columns = baseSheet.Columns || [];

    // Try to find a unique key for matching. 
    // Usually 'col_0' or 'KEY_ID' or 'REV'.
    // We'll look for 'KEY_ID' or fallback to 'col_0' or index.
    const keyCol = columns.find((c: any) => c.Name === 'KEY_ID' || c.Name === 'ID' || c.Name === 'REV') || columns[0];
    const keyAttr = keyCol?.Key || 'col_0';

    const baseRowMap = new Map(baseRows.map((r: any) => [r[keyAttr], r]));
    const targetRowMap = new Map(targetRows.map((r: any) => [r[keyAttr], r]));

    const diffRows: DiffRow[] = [];
    const visitedTargetKeys = new Set<any>();

    // Iterate through base rows
    for (const baseRow of baseRows) {
      const key = baseRow[keyAttr];
      const targetRow = targetRowMap.get(key);

      if (!targetRow) {
        diffRows.push({ status: 'removed', data: baseRow });
      } else {
        visitedTargetKeys.add(key);
        const isModified = !_.isEqual(baseRow, targetRow);
        
        if (isModified) {
          const changedFields: string[] = [];
          // Identify which columns changed
          for (const col of columns) {
            if (!_.isEqual(baseRow[col.Key], targetRow[col.Key])) {
              changedFields.push(col.Key);
            }
          }
          // Also check target specific columns if any (unlikely in this schema)
          
          diffRows.push({ 
            status: 'modified', 
            data: targetRow, 
            baseData: baseRow, 
            changedFields 
          });
        } else {
          diffRows.push({ status: 'unchanged', data: baseRow });
        }
      }
    }

    // Add remaining target rows (Added)
    for (const targetRow of targetRows) {
      const key = targetRow[keyAttr];
      if (!visitedTargetKeys.has(key)) {
        diffRows.push({ status: 'added', data: targetRow });
      }
    }

    return diffRows;
  }
}
