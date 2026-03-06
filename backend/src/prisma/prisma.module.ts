// backend/src/prisma/prisma.module.ts
import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // 可选，如果希望在整个应用中自动可用
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // 导出给其他模块使用
})
export class PrismaModule {}