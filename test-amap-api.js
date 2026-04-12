#!/usr/bin/env node

/**
 * 高德地图API后端集成测试脚本
 * 测试后端代理功能是否正常工作
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const TEST_COORDINATES = {
  shanghai: '121.4737,31.2304',
  beijing: '116.397428,39.90923',
  guangzhou: '113.264385,23.129112',
};

async function testApiEndpoint(endpoint, method = 'GET', data = null) {
  try {
    const url = `${BASE_URL}${endpoint}`;
    console.log(`\n🔍 测试端点: ${method} ${url}`);
    
    let response;
    if (method === 'GET') {
      response = await axios.get(url);
    } else if (method === 'POST') {
      response = await axios.post(url, data);
    }
    
    console.log(`✅ 状态码: ${response.status}`);
    console.log(`📊 响应数据:`, JSON.stringify(response.data, null, 2));
    
    return { success: true, data: response.data };
  } catch (error) {
    console.log(`❌ 请求失败: ${error.message}`);
    if (error.response) {
      console.log(`  状态码: ${error.response.status}`);
      console.log(`  错误信息:`, JSON.stringify(error.response.data, null, 2));
    }
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 开始高德地图API后端集成测试');
  console.log('='.repeat(60));
  
  // 测试1: 服务状态
  console.log('\n📋 测试1: 服务状态检查');
  await testApiEndpoint('/amap/status');
  
  // 测试2: 验证API Key
  console.log('\n📋 测试2: API Key验证');
  await testApiEndpoint('/amap/validate-key');
  
  // 测试3: 逆地理编码（坐标转地址）
  console.log('\n📋 测试3: 逆地理编码（上海坐标）');
  await testApiEndpoint(`/amap/regeocode?longitude=121.4737&latitude=31.2304`);
  
  // 测试4: 地理编码（地址转坐标）
  console.log('\n📋 测试4: 地理编码（北京市）');
  await testApiEndpoint('/amap/geocode?address=北京市');
  
  // 测试5: 距离计算
  console.log('\n📋 测试5: 距离计算（上海到北京）');
  await testApiEndpoint(`/amap/distance?origin=${TEST_COORDINATES.shanghai}&destination=${TEST_COORDINATES.beijing}&type=0`);
  
  // 测试6: 批量距离计算
  console.log('\n📋 测试6: 批量距离计算');
  const batchData = {
    origins: [TEST_COORDINATES.shanghai, TEST_COORDINATES.beijing],
    destination: TEST_COORDINATES.guangzhou,
    type: 0
  };
  await testApiEndpoint('/amap/distances', 'POST', batchData);
  
  // 测试7: 输入提示
  console.log('\n📋 测试7: 输入提示（搜索建议）');
  await testApiEndpoint('/amap/input-tips?keywords=上海');
  
  // 测试8: 用户到站点距离计算
  console.log('\n📋 测试8: 用户到站点距离计算');
  const stations = JSON.stringify([TEST_COORDINATES.shanghai, TEST_COORDINATES.beijing]);
  await testApiEndpoint(`/amap/user-to-stations?userLocation=${TEST_COORDINATES.guangzhou}&stations=${encodeURIComponent(stations)}&type=0`);
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 测试完成！');
  console.log('\n📝 注意事项:');
  console.log('1. 确保后端服务正在运行 (npm run start:dev)');
  console.log('2. 确保在.env文件中配置了高德地图Web API Key');
  console.log('3. 如果API Key未配置，部分测试会失败，这是正常现象');
  console.log('4. 实际使用时需要申请真实的高德地图API Key');
}

// 运行测试
runTests().catch(error => {
  console.error('测试运行失败:', error);
  process.exit(1);
});