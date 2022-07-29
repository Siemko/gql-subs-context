import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'database';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleCron() {
    console.log("Cron job running");
    console.log(await this.prisma.message.count());
  }
}
