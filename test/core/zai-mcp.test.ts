/**
 * Tests for ensureZaiMcpServers — registers the four official Z.ai MCP servers
 * (web-search-prime, web-reader, zread, zai-mcp-server) in .claude.json.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ensureZaiMcpServers } from '../../src/core/claude-config.js';
import { cleanup, makeTempDir } from '../helpers/index.js';

type ClaudeConfigShape = {
  mcpServers?: Record<
    string,
    {
      type?: 'http' | 'stdio' | 'sse';
      command?: string;
      args?: string[];
      env?: Record<string, string>;
      url?: string;
      headers?: Record<string, string>;
    }
  >;
};

const readClaudeConfig = (configDir: string): ClaudeConfigShape =>
  JSON.parse(fs.readFileSync(path.join(configDir, '.claude.json'), 'utf8'));

const writeSettingsApiKey = (configDir: string, key: string) => {
  fs.writeFileSync(path.join(configDir, 'settings.json'), JSON.stringify({ env: { ANTHROPIC_API_KEY: key } }), 'utf8');
};

test('ensureZaiMcpServers writes all four servers when .claude.json is empty', () => {
  const dir = makeTempDir();
  try {
    const changed = ensureZaiMcpServers(dir, 'zai-test-key-abc123');
    assert.equal(changed, true);

    const config = readClaudeConfig(dir);
    const servers = config.mcpServers ?? {};
    assert.deepEqual(Object.keys(servers).sort(), ['web-reader', 'web-search-prime', 'zai-mcp-server', 'zread']);

    // HTTP transports
    for (const name of ['web-search-prime', 'web-reader', 'zread'] as const) {
      const server = servers[name];
      assert.equal(server.type, 'http', `${name} should use http type`);
      assert.match(server.url ?? '', /^https:\/\/api\.z\.ai\/api\/mcp\//);
      assert.deepEqual(server.headers, { Authorization: 'Bearer zai-test-key-abc123' });
    }

    // stdio transport
    const stdio = servers['zai-mcp-server'];
    assert.equal(stdio.type, 'stdio');
    assert.equal(stdio.command, 'npx');
    assert.deepEqual(stdio.args, ['-y', '@z_ai/mcp-server']);
    assert.deepEqual(stdio.env, { Z_AI_API_KEY: 'zai-test-key-abc123', Z_AI_MODE: 'ZAI' });
  } finally {
    cleanup(dir);
  }
});

test('ensureZaiMcpServers is idempotent on a second call', () => {
  const dir = makeTempDir();
  try {
    assert.equal(ensureZaiMcpServers(dir, 'k1'), true);
    const after1 = fs.readFileSync(path.join(dir, '.claude.json'), 'utf8');

    assert.equal(ensureZaiMcpServers(dir, 'k1'), false);
    const after2 = fs.readFileSync(path.join(dir, '.claude.json'), 'utf8');

    assert.equal(after1, after2, 'second call should not modify the file');
  } finally {
    cleanup(dir);
  }
});

test('ensureZaiMcpServers preserves an existing user-added MCP server', () => {
  const dir = makeTempDir();
  try {
    const userServer = {
      command: 'node',
      args: ['./my-mcp.js'],
    };
    fs.writeFileSync(
      path.join(dir, '.claude.json'),
      JSON.stringify({ mcpServers: { 'user-mcp': userServer } }),
      'utf8'
    );

    assert.equal(ensureZaiMcpServers(dir, 'k1'), true);

    const config = readClaudeConfig(dir);
    const servers = config.mcpServers ?? {};
    assert.deepEqual(servers['user-mcp'], userServer, 'user server must be preserved');
    assert.ok(servers['web-search-prime'], 'zai server should be added alongside');
  } finally {
    cleanup(dir);
  }
});

test('ensureZaiMcpServers falls back to placeholder when no key resolvable', () => {
  const dir = makeTempDir();
  try {
    assert.equal(ensureZaiMcpServers(dir, null), true);

    const config = readClaudeConfig(dir);
    const headers = config.mcpServers!['web-reader'].headers ?? {};
    assert.deepEqual(headers, { Authorization: 'Bearer Enter your API key' });
    assert.equal(config.mcpServers!['zai-mcp-server'].env?.Z_AI_API_KEY, 'Enter your API key');
  } finally {
    cleanup(dir);
  }
});

test('ensureZaiMcpServers reads API key from settings.json when none passed', () => {
  const dir = makeTempDir();
  try {
    writeSettingsApiKey(dir, 'from-settings-xyz');

    assert.equal(ensureZaiMcpServers(dir), true);

    const config = readClaudeConfig(dir);
    assert.deepEqual(config.mcpServers!['web-search-prime'].headers, { Authorization: 'Bearer from-settings-xyz' });
    assert.equal(config.mcpServers!['zai-mcp-server'].env?.Z_AI_API_KEY, 'from-settings-xyz');
  } finally {
    cleanup(dir);
  }
});
