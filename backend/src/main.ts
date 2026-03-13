import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Scooter API')
    .setDescription('Scooter rental system API')
    .setVersion('1.0')
    .build();

  // Swagger：启用
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // 全局管道：启用
  await app.listen(process.env.PORT ?? 3000);

  
  async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
      new ValidationPipe({
        // 验证规则
        whitelist: true,              // 自动删除多余字段
        forbidNonWhitelisted: true,   // 多余字段直接报错
        transform: true               // 自动类型转换
      })
    );

    await app.listen(3000);
  }
}

bootstrap();