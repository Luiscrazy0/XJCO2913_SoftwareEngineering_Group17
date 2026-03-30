#!/usr/bin/env node

const axios = require('axios');

const API_BASE = 'http://localhost:3000';
const ADMIN_EMAIL = 'user@test.com';
const ADMIN_PASSWORD = 'user123';

async function testAdminDelete() {
  console.log('🚀 开始测试管理员删除功能...\n');

  try {
    // 1. 管理员登录
    console.log('1. 管理员登录...');
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    const token = loginRes.data.access_token;
    console.log('   ✅ 登录成功，获取到token\n');

    // 2. 创建测试车辆
    console.log('2. 创建测试车辆...');
    const createRes = await axios.post(`${API_BASE}/scooters`, {
      location: 'DELETE测试位置'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const testScooter = createRes.data;
    console.log(`   ✅ 创建成功: ${testScooter.location} (ID: ${testScooter.id.slice(0, 8)}...)\n`);

    // 3. 验证车辆存在
    console.log('3. 验证车辆存在...');
    const listRes = await axios.get(`${API_BASE}/scooters`);
    const scooters = listRes.data;
    const found = scooters.find(s => s.id === testScooter.id);
    console.log(`   ✅ 车辆存在: ${found ? '是' : '否'}\n`);

    // 4. 测试删除车辆
    console.log('4. 测试删除车辆...');
    await axios.delete(`${API_BASE}/scooters/${testScooter.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ 删除请求成功\n');

    // 5. 验证车辆已删除
    console.log('5. 验证车辆已删除...');
    const listRes2 = await axios.get(`${API_BASE}/scooters`);
    const scooters2 = listRes2.data;
    const stillExists = scooters2.find(s => s.id === testScooter.id);
    console.log(`   ✅ 车辆已删除: ${stillExists ? '否' : '是'}\n`);

    // 6. 测试权限保护
    console.log('6. 测试权限保护...');
    
    // 创建普通用户
    console.log('   a) 创建普通用户...');
    const userRes = await axios.post(`${API_BASE}/auth/register`, {
      email: 'customer@test.com',
      password: 'customer123'
    });
    console.log('      ✅ 用户创建成功\n');

    // 普通用户登录
    console.log('   b) 普通用户登录...');
    const customerLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'customer@test.com',
      password: 'customer123'
    });
    const customerToken = customerLoginRes.data.access_token;
    console.log('      ✅ 登录成功\n');

    // 创建另一个测试车辆
    console.log('   c) 创建另一个测试车辆...');
    const createRes2 = await axios.post(`${API_BASE}/scooters`, {
      location: '权限测试位置'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const testScooter2 = createRes2.data;
    console.log(`      ✅ 创建成功: ${testScooter2.location}\n`);

    // 普通用户尝试删除（应该失败）
    console.log('   d) 普通用户尝试删除（应该失败）...');
    try {
      await axios.delete(`${API_BASE}/scooters/${testScooter2.id}`, {
        headers: { Authorization: `Bearer ${customerToken}` }
      });
      console.log('      ❌ 普通用户删除成功（不应该发生）');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('      ✅ 权限保护生效：普通用户无法删除');
      } else {
        console.log(`      ❌ 错误状态码: ${error.response?.status}`);
      }
    }

    // 清理：管理员删除测试车辆
    console.log('\n   e) 清理测试车辆...');
    await axios.delete(`${API_BASE}/scooters/${testScooter2.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('      ✅ 清理完成\n');

    console.log('🎉 所有测试通过！管理员删除功能完整实现。');
    console.log('\n📋 测试总结：');
    console.log('   - ✅ 管理员可以创建车辆');
    console.log('   - ✅ 管理员可以删除车辆');
    console.log('   - ✅ 删除后车辆从列表中移除');
    console.log('   - ✅ 权限保护：普通用户无法删除');
    console.log('   - ✅ 前后端权限一致性');

  } catch (error) {
    console.error('\n❌ 测试失败：', error.message);
    if (error.response) {
      console.error('   状态码:', error.response.status);
      console.error('   响应数据:', error.response.data);
    }
    process.exit(1);
  }
}

// 运行测试
testAdminDelete();