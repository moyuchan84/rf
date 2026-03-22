import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { EmployeeDto } from '../../employee/interface/dto/employee.dto';
import { CreateUserMailGroupInput } from '../interface/dto/mail.dto';

@Injectable()
export class MailingService {
  constructor(private prisma: PrismaService) {}

  async getUserGroups(userId: string) {
    return this.prisma.userMailGroup.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createUserGroup(userId: string, input: CreateUserMailGroupInput) {
    return this.prisma.userMailGroup.create({
      data: {
        userId,
        groupName: input.groupName,
        members: input.members as any,
      },
    });
  }

  async updateUserGroup(id: number, userId: string, input: CreateUserMailGroupInput) {
    return this.prisma.userMailGroup.update({
      where: { id, userId },
      data: {
        groupName: input.groupName,
        members: input.members as any,
      },
    });
  }

  async deleteUserGroup(id: number, userId: string) {
    return this.prisma.userMailGroup.delete({
      where: { id, userId },
    });
  }

  async getSystemDefault(category: string) {
    return this.prisma.systemDefaultMailer.findUnique({
      where: { category },
    });
  }

  async updateSystemDefault(category: string, recipients: EmployeeDto[]) {
    return this.prisma.systemDefaultMailer.upsert({
      where: { category },
      update: { recipients: recipients as any },
      create: {
        category,
        recipients: recipients as any,
      },
    });
  }

  async getAllSystemDefaults() {
    return this.prisma.systemDefaultMailer.findMany();
  }
}
