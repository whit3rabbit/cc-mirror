import type { TweakccConfig, Theme } from './types.js';
import { DEFAULT_THEMES } from './defaultThemes.js';
import { buildBrandMiscConfig } from './miscDefaults.js';
import { buildDiffPalette } from './diffPalette.js';
import { formatUserMessage, getUserLabel } from './userLabel.js';

/**
 * Cerebras blocked tools - none.
 * Cerebras is reached via CCRouter, which is a transparent proxy and does not
 * server-inject tools the way Z.ai does.
 */
export const CEREBRAS_BLOCKED_TOOLS: string[] = [];

type Rgb = { r: number; g: number; b: number };

const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value)));

const hexToRgb = (hex: string): Rgb => {
  const normalized = hex.replace('#', '').trim();
  if (normalized.length === 3) {
    const [r, g, b] = normalized.split('');
    return {
      r: clamp(parseInt(r + r, 16)),
      g: clamp(parseInt(g + g, 16)),
      b: clamp(parseInt(b + b, 16)),
    };
  }
  if (normalized.length !== 6) {
    throw new Error(`Unsupported hex color: ${hex}`);
  }
  return {
    r: clamp(parseInt(normalized.slice(0, 2), 16)),
    g: clamp(parseInt(normalized.slice(2, 4), 16)),
    b: clamp(parseInt(normalized.slice(4, 6), 16)),
  };
};

const rgb = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${r},${g},${b})`;
};

const mix = (hexA: string, hexB: string, weight: number) => {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const w = Math.max(0, Math.min(1, weight));
  return `rgb(${clamp(a.r + (b.r - a.r) * w)},${clamp(a.g + (b.g - a.g) * w)},${clamp(a.b + (b.b - a.b) * w)})`;
};

const lighten = (hex: string, weight: number) => mix(hex, '#ffffff', weight);

// Copper/amber palette evokes Cerebras's wafer-scale silicon imagery.
const palette = {
  base: '#0d0a08',
  surface: '#1a1410',
  panel: '#241c14',
  border: '#3a2c1c',
  borderStrong: '#5c4422',
  text: '#f5ede0',
  textMuted: '#dcc9a8',
  textDim: '#a08868',
  copper: '#cc6600',
  copperSoft: '#e8842a',
  copperDeep: '#8b4513',
  amber: '#ffa500',
  amberSoft: '#ffb84d',
  amberDeep: '#b8860b',
  green: '#5fb25f',
  red: '#d65f4d',
  yellow: '#e6a532',
  rust: '#a64a1f',
};

const theme: Theme = {
  name: 'Cerebras Copper',
  id: 'dark',
  colors: {
    autoAccept: rgb(palette.amber),
    bashBorder: rgb(palette.copper),
    claude: rgb(palette.copper),
    claudeShimmer: rgb(palette.copperSoft),
    claudeBlue_FOR_SYSTEM_SPINNER: rgb(palette.amber),
    claudeBlueShimmer_FOR_SYSTEM_SPINNER: rgb(palette.amberSoft),
    permission: rgb(palette.amber),
    permissionShimmer: rgb(palette.amberSoft),
    planMode: rgb(palette.green),
    ide: rgb(palette.amberSoft),
    promptBorder: rgb(palette.border),
    promptBorderShimmer: rgb(palette.borderStrong),
    text: rgb(palette.text),
    inverseText: rgb(palette.base),
    inactive: rgb(palette.textDim),
    subtle: rgb(palette.border),
    suggestion: rgb(palette.amberSoft),
    remember: rgb(palette.copper),
    background: rgb(palette.base),
    success: rgb(palette.green),
    error: rgb(palette.red),
    warning: rgb(palette.yellow),
    warningShimmer: rgb(palette.amberSoft),
    ...buildDiffPalette(),
    red_FOR_SUBAGENTS_ONLY: rgb(palette.red),
    blue_FOR_SUBAGENTS_ONLY: rgb(palette.copperDeep),
    green_FOR_SUBAGENTS_ONLY: rgb(palette.green),
    yellow_FOR_SUBAGENTS_ONLY: rgb(palette.yellow),
    purple_FOR_SUBAGENTS_ONLY: rgb(palette.rust),
    orange_FOR_SUBAGENTS_ONLY: rgb(palette.copper),
    pink_FOR_SUBAGENTS_ONLY: rgb(palette.amberSoft),
    cyan_FOR_SUBAGENTS_ONLY: rgb(palette.amberDeep),
    professionalBlue: rgb(palette.copperDeep),
    rainbow_red: rgb(palette.red),
    rainbow_orange: rgb(palette.copper),
    rainbow_yellow: rgb(palette.yellow),
    rainbow_green: rgb(palette.green),
    rainbow_blue: rgb(palette.amber),
    rainbow_indigo: rgb(palette.copperDeep),
    rainbow_violet: rgb(palette.rust),
    rainbow_red_shimmer: lighten(palette.red, 0.35),
    rainbow_orange_shimmer: lighten(palette.copper, 0.35),
    rainbow_yellow_shimmer: lighten(palette.yellow, 0.25),
    rainbow_green_shimmer: lighten(palette.green, 0.35),
    rainbow_blue_shimmer: lighten(palette.amber, 0.35),
    rainbow_indigo_shimmer: lighten(palette.copperDeep, 0.35),
    rainbow_violet_shimmer: lighten(palette.rust, 0.35),
    clawd_body: rgb(palette.copper),
    clawd_background: rgb(palette.base),
    userMessageBackground: mix(palette.panel, palette.copper, 0.15),
    bashMessageBackgroundColor: mix(palette.panel, palette.copper, 0.08),
    memoryBackgroundColor: mix(palette.panel, palette.amber, 0.12),
    rate_limit_fill: rgb(palette.copper),
    rate_limit_empty: rgb(palette.borderStrong),
  },
};

export const buildCerebrasTweakccConfig = (): TweakccConfig => ({
  ccVersion: '',
  ccInstallationPath: null,
  lastModified: new Date().toISOString(),
  changesApplied: false,
  hidePiebaldAnnouncement: true,
  settings: {
    themes: [theme, ...DEFAULT_THEMES.filter((t) => t.id !== theme.id)],
    thinkingVerbs: {
      format: '{}... ',
      verbs: [
        'Streaming',
        'Wafer-scaling',
        'Vectorizing',
        'Surging',
        'Cascading',
        'Inferring',
        'Computing',
        'Routing',
        'Parallelizing',
        'Accelerating',
        'Crunching',
        'Distributing',
        'Cooking',
        'Forging',
        'Hammering',
        'Smelting',
      ],
    },
    thinkingStyle: {
      updateInterval: 110,
      phases: ['▢', '▣', '▢', '▣'],
      reverseMirror: false,
    },
    userMessageDisplay: {
      format: formatUserMessage(getUserLabel()),
      styling: ['bold'],
      foregroundColor: 'default',
      backgroundColor: 'default',
      borderStyle: 'topBottomBold',
      borderColor: rgb(palette.copper),
      paddingX: 1,
      paddingY: 0,
      fitBoxToContent: true,
    },
    inputBox: {
      removeBorder: true,
    },
    misc: buildBrandMiscConfig(),
    claudeMdAltNames: null,
  },
});
