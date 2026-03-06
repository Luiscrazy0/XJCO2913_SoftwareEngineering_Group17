// backend/src/prisma/prisma.service.ts

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['query', 'error', 'warn', 'info'], 
      // 选择一个合适的 adapter
      // adapter: { sqlite: { storage: 'file' } }
      // 或者使用 accelerateUrl
      // accelerateUrl: 'https://prisma-accelerate.example.com'
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
