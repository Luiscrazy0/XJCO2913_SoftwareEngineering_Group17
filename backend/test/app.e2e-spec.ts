import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  const mockPrismaService = {
    // 未来如果要测具体的增删改查，可以在这里加假数据
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService) // 拦截真实的数据库服务
      .useValue(mockPrismaService) // 换成我们写的空壳服务
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // 记得测试跑完后关闭服务器，释放资源
  afterAll(async () => {
    await app.close();
  });

  it('/ (GET) - 应该返回 Hello World!', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
