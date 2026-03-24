import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateKeyDesignInput, UpdateKeyDesignInput } from './key-design.dto';

@Injectable()
export class KeyDesignService {
  constructor(private prisma: PrismaService) {}

  private transformKeyDesign(design: any) {
    if (!design) return null;
    const { processPlanMaps, ...rest } = design;
    return {
      ...rest,
      processPlans: processPlanMaps?.map((map) => map.processPlan) || [],
    };
  }

  async findAll(search?: string, keyType?: string, processPlanId?: number) {
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (keyType) {
      where.keyType = { contains: keyType, mode: 'insensitive' };
    }

    if (processPlanId) {
      where.processPlanMaps = {
        some: { processPlanId },
      };
    }

    const designs = await this.prisma.keyDesign.findMany({
      where,
      include: {
        processPlanMaps: {
          include: { processPlan: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return designs.map((d) => this.transformKeyDesign(d));
  }

  async findOne(id: number) {
    const design = await this.prisma.keyDesign.findUnique({
      where: { id },
      include: {
        processPlanMaps: {
          include: { processPlan: true },
        },
      },
    });
    if (!design) throw new NotFoundException(`KeyDesign with ID ${id} not found`);
    return this.transformKeyDesign(design);
  }

  async create(input: CreateKeyDesignInput) {
    const { processPlanIds, ...data } = input;
    const design = await this.prisma.keyDesign.create({
      data: {
        ...data,
        processPlanMaps: {
          create: processPlanIds.map((id) => ({ processPlanId: id })),
        },
      },
      include: {
        processPlanMaps: {
          include: { processPlan: true },
        },
      },
    });
    return this.transformKeyDesign(design);
  }

  async update(id: number, input: UpdateKeyDesignInput) {
    const { processPlanIds, ...data } = input;

    return this.prisma.$transaction(async (tx) => {
      if (processPlanIds) {
        // 기존 매핑 삭제
        await tx.keyDesignProcessPlanMap.deleteMany({
          where: { keyDesignId: id },
        });

        // 새 매핑 생성
        if (processPlanIds.length > 0) {
          await tx.keyDesignProcessPlanMap.createMany({
            data: processPlanIds.map((ppId) => ({
              keyDesignId: id,
              processPlanId: ppId,
            })),
          });
        }
      }

      const design = await tx.keyDesign.update({
        where: { id },
        data: data,
        include: {
          processPlanMaps: {
            include: { processPlan: true },
          },
        },
      });

      return this.transformKeyDesign(design);
    });
  }

  async remove(id: number) {
    return this.prisma.keyDesign.delete({
      where: { id },
    });
  }
}
