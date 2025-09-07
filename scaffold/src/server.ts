#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import createServer from './index.js';

// 创建并启动服务器
const server = createServer({ 
  config: { 
    debug: false, 
    maxFileSize: 10 * 1024 * 1024 
  } 
});

// 启动服务器
const transport = new StdioServerTransport();
server.connect(transport).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// 优雅关闭
process.on('SIGINT', async () => {
  await server.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await server.close();
  process.exit(0);
});