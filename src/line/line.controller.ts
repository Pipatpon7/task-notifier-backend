import { Controller, Post, Body, Headers } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('line')
export class LineController {
  constructor(private prisma: PrismaService) {}

  @Post('webhook')
  async handleWebhook(@Body() body: Record<string, any>) {
    const events: any[] = body['events'] || [];

    for (const event of events) {
      if (event['type'] === 'follow') {
        const lineUserId = event['source']?.['userId'];
        if (typeof lineUserId === 'string') {
          await this.handleFollow(lineUserId);
        }
      }
    }

    return { status: 'ok' };
  }

  private async handleFollow(lineUserId: string) {
    const existing = await this.prisma.user.findFirst({
      where: { lineUserId },
    });

    if (!existing) {
      console.log(`New LINE follower: ${lineUserId}`);
    }
  }
}
