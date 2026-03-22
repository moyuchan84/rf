import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { EmployeeDto } from '../../employee/interface/dto/employee.dto';

export type WatcherType = 'REQUESTER' | 'ASSIGNEE' | 'WORKER' | 'SUBSCRIBER';

export interface WatcherInfo extends EmployeeDto {
  type: WatcherType;
}

@Injectable()
export class WatcherService {
  constructor(private prisma: PrismaService) {}

  private getClient(tx?: any) {
    return tx || this.prisma;
  }

  async getWatchers(requestId: number, tx?: any): Promise<WatcherInfo[]> {
    const watcherRecord = await this.getClient(tx).requestWatcher.findUnique({
      where: { requestId },
    });

    if (!watcherRecord) return [];
    return (watcherRecord.watchers as any) as WatcherInfo[];
  }

  async addWatcher(requestId: number, watcher: EmployeeDto, type: WatcherType, tx?: any) {
    const existingWatchers = await this.getWatchers(requestId, tx);
    
    // Check if already exists
    const alreadyExists = existingWatchers.some(
      (w) => w.epId === watcher.epId || w.emailAddress === watcher.emailAddress
    );

    if (alreadyExists) return;

    const newWatcher: WatcherInfo = { ...watcher, type };
    const updatedWatchers = [...existingWatchers, newWatcher];

    await this.getClient(tx).requestWatcher.upsert({
      where: { requestId },
      update: { watchers: updatedWatchers as any },
      create: {
        requestId,
        watchers: updatedWatchers as any,
      },
    });
  }

  async getMergedRecipients(requestId: number, category: string = 'REQUEST_NOTIFICATION', tx?: any): Promise<EmployeeDto[]> {
    // 1. Get Watchers from Request
    const watchers = await this.getWatchers(requestId, tx);
    
    // 2. Get System Default Mailers
    const systemDefault = await this.getClient(tx).systemDefaultMailer.findUnique({
      where: { category },
    });
    
    const defaultRecipients = systemDefault ? (systemDefault.recipients as any as EmployeeDto[]) : [];
    
    // 3. Merge and Deduplicate
    const merged = [...watchers, ...defaultRecipients];
    const uniqueMap = new Map<string, EmployeeDto>();
    
    merged.forEach((r) => {
      const key = r.epId || r.emailAddress;
      if (key && !uniqueMap.has(key)) {
        uniqueMap.set(key, r);
      }
    });

    return Array.from(uniqueMap.values());
  }

  async initWatchers(requestId: number, initialWatchers: EmployeeDto[], tx?: any) {
    // 1. Get System Default recipients for REQUEST_NOTIFICATION
    const systemDefault = await this.getClient(tx).systemDefaultMailer.findUnique({
      where: { category: 'REQUEST_NOTIFICATION' },
    });
    const defaultRecipients = systemDefault ? (systemDefault.recipients as any as EmployeeDto[]) : [];

    // 2. Merge initial watchers (Subscribers) and system defaults
    const uniqueMap = new Map<string, WatcherInfo>();

    // Add initial watchers as SUBSCRIBERs
    initialWatchers.forEach(w => {
      const key = w.epId || w.emailAddress;
      if (key) uniqueMap.set(key, { ...w, type: 'SUBSCRIBER' });
    });

    // Add system defaults as SUBSCRIBERs (don't overwrite if already there)
    defaultRecipients.forEach(w => {
      const key = w.epId || w.emailAddress;
      if (key && !uniqueMap.has(key)) {
        uniqueMap.set(key, { ...w, type: 'SUBSCRIBER' });
      }
    });

    const watchers = Array.from(uniqueMap.values());
    
    await this.getClient(tx).requestWatcher.upsert({
      where: { requestId },
      update: { watchers: watchers as any },
      create: {
        requestId,
        watchers: watchers as any,
      },
    });
  }
}
