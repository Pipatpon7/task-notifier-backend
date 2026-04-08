import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async getTasks(userId: number) {
    return this.prisma.task.findMany({
      where: { userId },
      orderBy: { dueDate: 'asc' },
    });
  }

  async createTask(
    userId: number,
    title: string,
    description: string,
    dueDate: Date,
    notifyBefore: number,
  ) {
    return this.prisma.task.create({
      data: {
        title,
        description,
        dueDate,
        notifyBefore,
        userId,
      },
    });
  }

  async updateTask(
    taskId: number,
    userId: number,
    data: {
      title?: string;
      description?: string;
      dueDate?: Date;
      notifyBefore?: number;
    },
  ) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new NotFoundException('ไม่พบงานนี้');
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data,
    });
  }

  async deleteTask(taskId: number, userId: number) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new NotFoundException('ไม่พบงานนี้');
    }
    return this.prisma.task.delete({
      where: { id: taskId },
    });
  }
}
