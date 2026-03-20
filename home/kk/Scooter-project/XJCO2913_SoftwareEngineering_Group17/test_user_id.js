// 测试JWT token解析

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwM2Y1MjMwYi0zZmJlLTRlMGQtOTViZi0xYzE1YmRmYTU0MGIiLCJyb2xlIjoiQ1VTVE9NRVIiLCJpYXQiOjE3NzM5OTQ1MTYsImV4cCI6MTc3Mzk5ODExNn0.OND_wT9ty5REk0BSr48TJU8uaMrTYYv2G9eNBmjsRCE";

// 模拟前端的解析逻辑
const payloadBase64 = token.split('.')[1];
const payloadJson = atob(payloadBase64);
const payload = JSON.parse(payloadJson);

console.log("JWT Payload:", payload);
console.log("User ID (payload.sub):", payload.sub);
console.log("User ID type:", typeof payload.sub);
console.log("Is valid UUID?", /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.sub));

// 测试前端代码中的解析
console.log("\n=== 前端解析测试 ===");
const access_token = token;
const email = "test@example.com";
const user = {
  id: payload.sub,
  email: email,
  role: payload.role
};

console.log("Parsed user object:", user);
console.log("User ID for booking:", user.id);