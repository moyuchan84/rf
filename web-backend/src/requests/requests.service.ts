import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateRequestItemInput, UpdateRequestItemInput } from './requests.dto';

@Injectable()
export class RequestsService {
  constructor(private prisma: PrismaService) {}

  async createRequestItem(input: CreateRequestItemInput) {
    return this.prisma.requestItem.create({
      data: input,
    });
  }

  async updateRequestItem(id: number, input: UpdateRequestItemInput) {
    return this.prisma.requestItem.update({
      where: { id },
      data: input,
    });
  }

  async deleteRequestItem(id: number) {
    return this.prisma.requestItem.delete({ where: { id } });
  }

  async findRequestItemsByProduct(productId: number) {
    return this.prisma.requestItem.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
