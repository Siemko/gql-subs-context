import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "database";

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getHello() {
    await this.prisma.message.create({
      data: {
        text: "Hello world",
      },
    });
    return await this.prisma.message.count();
  }
}
