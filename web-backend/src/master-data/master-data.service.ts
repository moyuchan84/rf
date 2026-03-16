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
    return this.prisma.processPlan.findMany({
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
      orderBy: { designRule: 'asc' },
    });
  }

  async createProcessPlan(input: CreateProcessPlanInput) {
    return this.prisma.processPlan.create({
      data: input,
      include: { beolOptions: true },
    });
  }

  async deleteProcessPlan(id: number) {
    return this.prisma.processPlan.delete({ where: { id } });
  }

  // BeolOption
  async createBeolOption(input: CreateBeolOptionInput) {
    return this.prisma.beolOption.create({
      data: input,
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
}
