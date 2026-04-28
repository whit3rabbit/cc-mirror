import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { BinaryPatcherUpdateStep } from '../../src/core/variant-builder/update-steps/BinaryPatcherUpdateStep.js';
import type { UpdateContext } from '../../src/core/variant-builder/types.js';
import { cleanup, makeTempDir } from '../helpers/index.js';

const makeExecutableStub = (filePath: string, marker: string): void => {
  fs.writeFileSync(filePath, `#!/usr/bin/env bash\necho "${marker}"\n`, { mode: 0o755 });
};

const createContext = (rootDir: string): UpdateContext => {
  const name = 'alpha';
  const variantDir = path.join(rootDir, name);
  const configDir = path.join(variantDir, 'config');
  const tweakDir = path.join(variantDir, 'tweakcc');
  const nativeDir = path.join(variantDir, 'native');
  const binaryPath = path.join(nativeDir, process.platform === 'win32' ? 'claude.exe' : 'claude');

  fs.mkdirSync(configDir, { recursive: true });
  fs.mkdirSync(tweakDir, { recursive: true });
  fs.mkdirSync(nativeDir, { recursive: true });
  makeExecutableStub(binaryPath, 'patched');

  return {
    name,
    opts: { settingsOnly: true },
    meta: {
      name,
      provider: 'zai',
      createdAt: new Date().toISOString(),
      claudeOrig: 'native:2.1.119',
      binaryPath,
      configDir,
      tweakDir,
      nativeDir,
      nativePlatform: 'darwin-arm64',
      brand: 'zai',
    },
    paths: {
      resolvedRoot: rootDir,
      resolvedBin: undefined,
      variantDir,
      nativeDir,
      unpackedDir: path.join(variantDir, 'unpacked'),
    },
    prefs: {
      resolvedClaudeVersion: 'latest',
      promptPackPreference: true,
      promptPackEnabled: true,
      skillInstallEnabled: false,
      shellEnvEnabled: false,
      skillUpdateEnabled: false,
      commandStdio: 'pipe',
    },
    state: {
      notes: [],
      tweakResult: null,
      brandKey: 'zai',
    },
    report: () => {},
    isAsync: false,
  };
};

test(
  'settings-only BinaryPatcherUpdateStep restores pristine cache before applying patches',
  { skip: process.platform === 'win32' },
  () => {
    const rootDir = makeTempDir('update-settings-tweak-');
    try {
      const ctx = createContext(rootDir);
      let restored = false;
      let patched = false;

      new BinaryPatcherUpdateStep({
        restorePristineBinary: (params) => {
          restored = true;
          assert.equal(params.binaryPath, ctx.meta.binaryPath);
          assert.equal(params.resolvedVersion, '2.1.119');
          assert.equal(params.platform, 'darwin-arm64');
          makeExecutableStub(params.binaryPath, 'pristine');
          return { restored: true, cachePath: '/cache/claude' };
        },
        applyPatches: ({ binaryPath }) => {
          patched = true;
          assert.equal(restored, true, 'restore should happen before patch');
          assert.match(fs.readFileSync(binaryPath, 'utf8'), /pristine/);
          return {
            ok: true,
            bytesChanged: 0,
            resigned: false,
            missingPromptKeys: [],
            codesignSkipped: false,
          };
        },
      }).execute(ctx);

      assert.equal(restored, true);
      assert.equal(patched, true);
      assert.equal(ctx.state.tweakResult?.status, 0);
    } finally {
      cleanup(rootDir);
    }
  }
);

test('settings-only BinaryPatcherUpdateStep skips safely when pristine cache is missing', () => {
  const rootDir = makeTempDir('update-settings-tweak-');
  try {
    const ctx = createContext(rootDir);
    let patched = false;

    new BinaryPatcherUpdateStep({
      restorePristineBinary: () => ({
        restored: false,
        reason: 'cache-missing',
        cachePath: '/missing/claude',
      }),
      applyPatches: () => {
        patched = true;
        throw new Error('applyPatches should not be called without pristine cache');
      },
    }).execute(ctx);

    assert.equal(patched, false);
    assert.equal(ctx.state.tweakResult?.status, 1);
    assert.match(ctx.state.tweakResult?.stderr ?? '', /Settings-only tweak skipped/);
    assert.ok(ctx.state.notes.some((note) => note.includes('/missing/claude')));
  } finally {
    cleanup(rootDir);
  }
});
