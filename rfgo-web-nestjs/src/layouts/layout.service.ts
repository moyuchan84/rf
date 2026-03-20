import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateLayoutInput, UpdateLayoutInput } from './layout.dto';

@Injectable()
export class LayoutsService {
  constructor(private prisma: PrismaService) {}

  async findByProduct(productId: number) {
    return this.prisma.reticleLayout.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.reticleLayout.findUnique({
      where: { id },
    });
  }

  async create(input: CreateLayoutInput) {
    return this.prisma.reticleLayout.create({
      data: {
        title: input.title,
        productId: input.productId,
        beolOptionId: input.beolOptionId,
        processPlanId: input.processPlanId,
        shotInfo: input.shotInfo,
        imageUrl: input.imageUrl,
        boundary: input.boundary,
        chips: input.chips,
        scribelanes: input.scribelanes,
        placements: input.placements,
        config: input.config,
      },
    });
  }

  async update(id: number, input: UpdateLayoutInput) {
    return this.prisma.reticleLayout.update({
      where: { id },
      data: {
        title: input.title,
        shotInfo: input.shotInfo,
        imageUrl: input.imageUrl,
        boundary: input.boundary,
        chips: input.chips,
        scribelanes: input.scribelanes,
        placements: input.placements,
        config: input.config,
      },
    });
  }

  async delete(id: number) {
    return this.prisma.reticleLayout.delete({
      where: { id },
    });
  }
}
