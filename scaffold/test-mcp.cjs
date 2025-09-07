#!/usr/bin/env node

// 简单的MCP客户端测试脚本
const { spawn } = require('child_process');
const path = require('path');

// 启动MCP服务器
const serverPath = path.join(__dirname, 'dist', 'server.js');
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'inherit']
});

let responseData = '';
let messageCount = 0;

// 监听服务器响应
server.stdout.on('data', (data) => {
  const responses = data.toString().trim().split('\n');
  
  responses.forEach(response => {
    if (response.trim()) {
      try {
        const parsed = JSON.parse(response);
        console.log(`\n=== 服务器响应 ${++messageCount} ===`);
        console.log(JSON.stringify(parsed, null, 2));
        
        // 如果是工具列表响应，显示可用工具
        if (parsed.result && parsed.result.tools) {
          console.log('\n可用工具:');
          parsed.result.tools.forEach(tool => {
            console.log(`- ${tool.name}: ${tool.description}`);
          });
        }
        
        // 如果是工具调用响应，显示结果
        if (parsed.result && parsed.result.content) {
          console.log('\n转换结果:');
          parsed.result.content.forEach(content => {
            console.log(content.text);
          });
        }
      } catch (e) {
        console.log('原始响应:', response);
      }
    }
  });
});

if (server.stderr) {
  server.stderr.on('data', (data) => {
    console.error('服务器错误输出:', data.toString());
  });
}

// 发送初始化请求
const initRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {
      tools: {}
    },
    clientInfo: {
      name: 'test-client',
      version: '1.0.0'
    }
  }
};

console.log('=== 发送初始化请求 ===');
console.log(JSON.stringify(initRequest, null, 2));
server.stdin.write(JSON.stringify(initRequest) + '\n');

// 等待响应后发送工具列表请求
setTimeout(() => {
  const toolsRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {}
  };
  
  console.log('\n=== 发送工具列表请求 ===');
  console.log(JSON.stringify(toolsRequest, null, 2));
  server.stdin.write(JSON.stringify(toolsRequest) + '\n');
}, 1000);

// 测试文档转换工具
setTimeout(() => {
  const convertRequest = {
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'convert_document',
      arguments: {
        sourceFormat: 'txt',
        targetFormat: 'html',
        content: '这是一个测试文档\n\n包含多行内容。',
        filename: 'test.txt'
      }
    }
  };
  
  console.log('\n=== 发送文档转换请求 ===');
  console.log(JSON.stringify(convertRequest, null, 2));
  server.stdin.write(JSON.stringify(convertRequest) + '\n');
}, 2000);

// 8秒后关闭测试
setTimeout(() => {
  console.log('\n=== 测试完成，关闭服务器 ===');
  server.kill();
  process.exit(0);
}, 8000);

server.on('error', (error) => {
  console.error('服务器启动错误:', error);
});

server.on('exit', (code) => {
  console.log(`\n服务器退出，退出代码: ${code}`);
});