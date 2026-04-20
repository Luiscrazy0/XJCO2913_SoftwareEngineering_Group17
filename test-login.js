const { execSync } = require('child_process');

console.log('=== 测试登录功能 ===\n');

// 检查数据库迁移状态
console.log('1. 检查数据库迁移状态:');
try {
  const status = execSync('cd backend && npx prisma migrate status', { encoding: 'utf8' });
  console.log(status);
} catch (error) {
  console.error('错误:', error.message);
}

// 检查Prisma客户端生成
console.log('\n2. 检查Prisma客户端生成:');
try {
  execSync('cd backend && npx prisma generate', { encoding: 'utf8' });
  console.log('✅ Prisma客户端已重新生成');
} catch (error) {
  console.error('错误:', error.message);
}

// 运行认证测试
console.log('\n3. 运行认证相关测试:');
try {
  const testOutput = execSync('cd backend && npm test -- src/modules/auth 2>&1', { encoding: 'utf8' });
  if (testOutput.includes('PASS') || testOutput.includes('Test Suites:') && testOutput.includes('passed')) {
    console.log('✅ 认证测试通过');
  } else {
    console.log('测试输出:', testOutput);
  }
} catch (error) {
  console.error('测试错误:', error.message);
}

console.log('\n=== 测试完成 ===');
console.log('如果以上步骤都成功，登录功能应该可以正常工作。');
console.log('启动后端服务: cd backend && npm run start:dev');
console.log('Swagger文档: http://localhost:3000/api');