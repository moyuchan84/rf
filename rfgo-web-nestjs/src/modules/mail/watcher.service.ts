// src/modules/mail/watcher.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { EmployeeDto } from '../../common/dto/employee-search.dto';

export type WatcherType = 'REQUESTER' | 'ASSIGNEE' | 'WORKER' | 'SUBSCRIBER';

export interface WatcherInfo extends EmployeeDto {
  type: WatcherType;
}

@Injectable()
export class WatcherService {
  constructor(private prisma: PrismaService) {}

  async getWatchers(requestId: number): Promise<WatcherInfo[]> {
    const watcherRecord = await this.prisma.requestWatcher.findUnique({
      where: { requestId },
    });

    if (!watcherRecord) return [];
    return (watcherRecord.watchers as any) as WatcherInfo[];
  }

  async addWatcher(requestId: number, watcher: EmployeeDto, type: WatcherType) {
    const existingWatchers = await this.getWatchers(requestId);
    
    // Check if already exists
    const alreadyExists = existingWatchers.some(
      (w) => w.epId === watcher.epId || w.emailAddress === watcher.emailAddress
    );

    if (alreadyExists) return;

    const newWatcher: WatcherInfo = { ...watcher, type };
    const updatedWatchers = [...existingWatchers, newWatcher];

    await this.prisma.requestWatcher.upsert({
      where: { requestId },
      update: { watchers: updatedWatchers as any },
      create: {
        requestId,
        watchers: updatedWatchers as any,
      },
    });
  }

  async getMergedRecipients(requestId: number, category: string = 'PHOTO_DEFAULT'): Promise<EmployeeDto[]> {
    // 1. Get Watchers from Request
    const watchers = await this.getWatchers(requestId);
    
    // 2. Get System Default Mailers
    const systemDefault = await this.prisma.systemDefaultMailer.findUnique({
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

  async initWatchers(requestId: number, initialWatchers: EmployeeDto[]) {
    const watchers: WatcherInfo[] = initialWatchers.map(w => ({ ...w, type: 'SUBSCRIBER' }));
    
    await this.prisma.requestWatcher.upsert({
      where: { requestId },
      update: { watchers: watchers as any },
      create: {
        requestId,
        watchers: watchers as any,
      },
    });
  }
}
