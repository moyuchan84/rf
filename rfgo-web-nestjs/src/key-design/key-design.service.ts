import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateKeyDesignInput, UpdateKeyDesignInput } from './key-design.dto';

@Injectable()
export class KeyDesignService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.keyDesign.findMany({
      include: { processPlans: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const design = await this.prisma.keyDesign.findUnique({
      where: { id },
      include: { processPlans: true },
    });
    if (!design) throw new NotFoundException(`KeyDesign with ID ${id} not found`);
    return design;
  }

  async create(input: CreateKeyDesignInput) {
    const { processPlanIds, ...data } = input;
    return this.prisma.keyDesign.create({
      data: {
        ...data,
        processPlans: {
          connect: processPlanIds.map((id) => ({ id })),
        },
      },
      include: { processPlans: true },
    });
  }

  async update(id: number, input: UpdateKeyDesignInput) {
    const { processPlanIds, ...data } = input;
    
    const updateData: any = { ...data };
    
    if (processPlanIds) {
      updateData.processPlans = {
        set: processPlanIds.map((id) => ({ id })),
      };
    }

    return this.prisma.keyDesign.update({
      where: { id },
      data: updateData,
      include: { processPlans: true },
    });
  }

  async remove(id: number) {
    return this.prisma.keyDesign.delete({
      where: { id },
    });
  }
}
