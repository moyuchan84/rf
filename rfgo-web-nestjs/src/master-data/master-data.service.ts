import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  CreateProcessPlanInput,
  CreateBeolOptionInput,
  CreateProductInput,
  UpdateProductInput,
} from './master-data.dto';

@Injectable()
export class MasterDataService {
  constructor(private prisma: PrismaService) {}

  // ProcessPlan
  async findAllProcessPlans() {
    const results = await this.prisma.processPlan.findMany({
      include: {
        beolGroups: {
          include: {
            beolOptions: {
              include: {
                products: {
                  include: { 
                    metaInfo: true,
                    requests: true
                  },
                },
              },
            },
          },
        },
        keyDesignMaps: {
          include: { keyDesign: true }
        },
      },
      orderBy: { designRule: 'asc' },
    });
    
    // Flatten beolGroups.beolOptions into a single beolOptions array for the UI
    const transformed = results.map(pp => ({
      id: pp.id,
      designRule: pp.designRule,
      createdAt: pp.createdAt,
      updatedAt: pp.updatedAt,
      keyDesigns: pp.keyDesignMaps.map(m => m.keyDesign),
      beolOptions: pp.beolGroups.flatMap(bg => bg.beolOptions.map(bo => ({
        ...bo,
        beolGroup: { id: bg.id, groupName: bg.groupName } // Keep group info for internal ref
      })))
    }));

    return transformed;
  }

  async createProcessPlan(input: CreateProcessPlanInput) {
    return this.prisma.processPlan.create({
      data: input,
    });
  }

  async deleteProcessPlan(id: number) {
    return this.prisma.processPlan.delete({ where: { id } });
  }

  // BeolGroup (Internal use or if explicit management needed)
  async createBeolGroup(input: { groupName: string; processPlanId: number }) {
    return this.prisma.beolGroup.create({
      data: input,
    });
  }

  async deleteBeolGroup(id: number) {
    return this.prisma.beolGroup.delete({ where: { id } });
  }

  // BeolOption
  async createBeolOption(input: CreateBeolOptionInput) {
    let { beolGroupId, processPlanId, optionName } = input;

    // Internal Logic: Always ensure BeolGroup exists based on prefix
    if (processPlanId && !beolGroupId) {
      const prefix = optionName.split('_')[0];
      const group = await this.prisma.beolGroup.findFirst({
        where: { groupName: prefix, processPlanId },
      });

      if (group) {
        beolGroupId = group.id;
      } else {
        const newGroup = await this.prisma.beolGroup.create({
          data: { groupName: prefix, processPlanId },
        });
        beolGroupId = newGroup.id;
      }
    }

    return this.prisma.beolOption.create({
      data: {
        optionName,
        beolGroupId,
      },
      include: { products: true },
    });
  }

  async deleteBeolOption(id: number) {
    return this.prisma.beolOption.delete({ where: { id } });
  }

  // Product
  async createProduct(input: CreateProductInput) {
    const { metaInfo, ...productData } = input;
    return this.prisma.product.create({
      data: {
        ...productData,
        metaInfo: metaInfo ? { create: metaInfo } : undefined,
      },
      include: { metaInfo: true },
    });
  }

  async updateProduct(id: number, input: UpdateProductInput) {
    const { metaInfo, ...productData } = input;
    return this.prisma.product.update({
      where: { id },
      data: {
        ...productData,
        metaInfo: metaInfo
          ? {
              upsert: {
                create: metaInfo,
                update: metaInfo,
              },
            }
          : undefined,
      },
      include: { metaInfo: true },
    });
  }

  async deleteProduct(id: number) {
    return this.prisma.product.delete({ where: { id } });
  }

  // N7MaskBeol lookups
  async getUniqueProcessGroups() {
    const results = await this.prisma.n7MaskBeol.findMany({
      distinct: ['n7processGrp'],
      select: { n7processGrp: true },
      where: { n7processGrp: { not: null } },
      orderBy: { n7processGrp: 'asc' },
    });
    return results.map(r => r.n7processGrp);
  }

  async getUniqueBeols(processGrp: string) {
    const results = await this.prisma.n7MaskBeol.findMany({
      distinct: ['n7beol'],
      select: { n7beol: true },
      where: { 
        n7processGrp: processGrp,
        n7beol: { not: null }
      },
      orderBy: { n7beol: 'asc' },
    });
    return results.map(r => r.n7beol);
  }
}
