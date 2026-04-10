import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly lineAccessToken = 'a5e7cbd71004081b209e962ac92951da';

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkAndNotify() {
    this.logger.log('กำลังเช็คงานที่ใกล้ครบกำหนด...');

    const now = new Date();

    const tasks = await this.prisma.task.findMany({
      where: {
        isNotified: false,
      },
      include: {
        user: true,
      },
    });

    for (const task of tasks) {
      const dueDate = new Date(task.dueDate);
      const minutesLeft = Math.floor(
        (dueDate.getTime() - now.getTime()) / 1000 / 60,
      );
      const hoursLeft = Math.floor(minutesLeft / 60);
      const dayLeft = Math.floor(hoursLeft / 24);
      const isOneDayLeft = minutesLeft <= 1440 && minutesLeft > 1435;
      const isCustomTimeLeft =
        minutesLeft <= task.notifyBefore && minutesLeft > task.notifyBefore - 5;

      if ((isOneDayLeft || isCustomTimeLeft) && minutesLeft > 0) {
        let timeLeftText = '';
        if (dayLeft >= 1) {
          timeLeftText = `เหลืออีก ${dayLeft} วัน`;
        } else if (hoursLeft >= 1) {
          timeLeftText = `เหลืออีก ${hoursLeft} ชั่วโมง`;
        } else {
          timeLeftText = `เหลืออีก ${minutesLeft} นาที`;
        }

        if (task.user.lineUserId) {
          await this.sendLineNotify(
            task.user.lineUserId,
            `📌 แจ้งเตือน: งาน "${task.title}" ของ ${task.user.name}\n` +
              `⏰ ${timeLeftText}\n` +
              `📝 ${task.description || 'ไม่มีรายละเอียด'}`,
          );
        }

        await this.prisma.task.update({
          where: { id: task.id },
          data: { isNotified: true },
        });

        this.logger.log(`แจ้งเตือนงาน "${task.title}" เรียบร้อยแล้ว`);
      }
    }
  }

  private async sendLineNotify(to: string, message: string) {
    if (!to) {
      this.logger.warn('ไม่สามรถส่งแจ้งเตือนได้ เนื่องจากไม่มี LINE User ID');
      return;
    }
    try {
      await axios.post(
        'https://api.line.me/v2/bot/message/push',
        {
          to: to,
          messages: [{ type: 'text', text: message }],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.lineAccessToken}`,
          },
        },
      );
    } catch (error: unknown) {
      // ใช้ unknown แทน any เพื่อความปลอดภัย
      let errorMessage = 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ';

      if (axios.isAxiosError(error)) {
        // TypeScript จะรู้ทันทีว่า error ตรงนี้มีโครงสร้างแบบ AxiosError
        // เราเลยดึงค่าออกมาได้โดยไม่แดง
        const data = error.response?.data as { message?: string };
        errorMessage = data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      this.logger.error(`LINE API Error: ${errorMessage}`);
    }
  }
}
