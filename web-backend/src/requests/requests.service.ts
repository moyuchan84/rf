import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateRequestItemInput, UpdateRequestItemInput } from './requests.dto';
import { AssignUserInput, UpdateStepInput } from './workflow.dto';

@Injectable()
export class RequestsService {
  constructor(private prisma: PrismaService) {}

  async createRequestItem(input: CreateRequestItemInput) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.requestItem.create({
        data: input,
      });

      // Initialize default 4 steps
      const steps = [
        { stepOrder: 1, stepName: 'ReferenceTable' },
        { stepOrder: 2, stepName: 'KeyTableSetup' },
        { stepOrder: 3, stepName: 'RequestSubmission' },
        { stepOrder: 4, stepName: 'GDSPath' },
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
}
