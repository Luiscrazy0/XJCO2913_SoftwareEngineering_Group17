import { defineConfig } from '@prisma/cli'

export default defineConfig({
  client: {
    // 这里 Prisma Client 会使用 DATABASE_URL 作为默认连接
    // 如果要硬编码，也可以写成 'postgresql://kk:password@localhost:5432/scooter_db'
    datasource: {
      adapter: process.env.DATABASE_URL,
    },
  },
})