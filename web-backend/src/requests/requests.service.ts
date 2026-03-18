import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateRequestItemInput, UpdateRequestItemInput } from './requests.dto';
import { AssignUserInput, UpdateStepInput } from './workflow.dto';
import { CreateStreamInfoInput, SaveRequestTablesInput } from './step-data.dto';

@Injectable()
export class RequestsService {
  constructor(private prisma: PrismaService) {}

  // Step Data Management
  async createStreamInfo(input: CreateStreamInfoInput) {
    return this.prisma.streamInfo.create({
      data: input,
    });
  }

  async findStreamInfosByProduct(productId: number) {
    return this.prisma.streamInfo.findMany({
      where: { productId },
      include: { request: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findStreamInfoByRequest(requestId: number) {
    return this.prisma.streamInfo.findMany({
      where: { requestId },
    });
  }

  async saveRequestTables(input: SaveRequestTablesInput) {
    const { requestId, photoKeyIds, type, productId, processPlanId, beolOptionId } = input;
    
    return this.prisma.$transaction(async (tx) => {
      // Delete existing mappings of this type for this request
      await tx.requestTableMap.deleteMany({
        where: { requestId, type },
      });

      // Create new mappings
      if (photoKeyIds.length > 0) {
        await tx.requestTableMap.createMany({
          data: photoKeyIds.map((photoKeyId) => ({
            requestId,
            photoKeyId,
            type,
            productId,
            processPlanId,
            beolOptionId,
          })),
        });
      }

      return tx.requestTableMap.findMany({
        where: { requestId, type },
        include: { photoKey: true },
      });
    });
  }

  async findRequestTables(requestId: number, type: string) {
    return this.prisma.requestTableMap.findMany({
      where: { requestId, type },
      include: { photoKey: true },
    });
  }

  async createRequestItem(input: CreateRequestItemInput) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.requestItem.create({
        data: input,
      });

      // Initialize default 5 steps
      const steps = [
        { stepOrder: 1, stepName: 'ReferenceTable' },
        { stepOrder: 2, stepName: 'KeyTableSetup' },
        { stepOrder: 3, stepName: 'RequestSubmission' },
        { stepOrder: 4, stepName: 'GDSPath' },
        { stepOrder: 5, stepName: 'StreamInfo' },
      ];

      await tx.requestStep.createMany({
        data: steps.map((s) => ({
          ...s,
          requestId: request.id,
          status: 'TODO',
        })),
      });

      return request;
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
      include: {
        assignees: true,
        steps: { orderBy: { stepOrder: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll() {
    return this.prisma.requestItem.findMany({
      include: {
        assignees: true,
        steps: { orderBy: { stepOrder: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.requestItem.findUnique({
      where: { id },
      include: {
        assignees: true,
        steps: { orderBy: { stepOrder: 'asc' } },
      },
    });
  }

  // Workflow Actions
  async assignUser(input: AssignUserInput) {
    return this.prisma.requestAssignee.create({
      data: input,
    });
  }

  async removeAssignee(id: number) {
    return this.prisma.requestAssignee.delete({ where: { id } });
  }

  async updateStep(input: UpdateStepInput) {
    const { stepId, ...data } = input;
    return this.prisma.requestStep.update({
      where: { id: stepId },
      data: {
        ...data,
        completedAt: data.status === 'DONE' ? new Date() : null,
      },
    });
  }

  async findPhotoKeys(filters: { productId?: number; beolOptionId?: number; processPlanId?: number }) {
    const where: any = {};
    if (filters.productId !== undefined) where.productId = filters.productId;
    if (filters.beolOptionId !== undefined) where.beolOptionId = filters.beolOptionId;
    if (filters.processPlanId !== undefined) where.processPlanId = filters.processPlanId;

    return this.prisma.photoKey.findMany({
      where,
      include: {
        product: true,
        processPlan: true,
        beolOption: true,
      },
      orderBy: { updateDate: 'desc' },
    });
  }

  async findPhotoKeyById(id: number) {
    return this.prisma.photoKey.findUnique({
      where: { id },
    });
  }
}
