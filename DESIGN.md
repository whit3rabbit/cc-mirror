# cc-mirror Design

## Goals

- Create multiple isolated Claude Code variants, each with its own config + session store.
- Provide a **full-screen TUI** for discovery, creation, and management.
- Support unlimited providers with editable templates.
- Keep any global Claude Code install untouched.

## Architecture

```
  .-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-.
  |          ~/.cc-mirror/<variant>        |
  '-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-'
   |-- native/           # native Claude Code binary
   |   '-- claude        # (or claude.exe on Windows)
   |-- config/           # CLAUDE_CONFIG_DIR
   |   |-- settings.json # env overrides (API keys, model mappings, tool denies)
   |   '-- .claude.json  # API-key approvals + onboarding + MCP server seeds
   |-- tweakcc/          # tweakcc-compatible config
   |   '-- config.json   # brand preset + theme config
   |-- unpacked/         # macOS node-runtime fallback when Mach-O cannot grow
   '-- variant.json      # metadata

  wrapper -> <bin-dir>/<variant>
```

Wrappers are installed into `<bin-dir>/<variant>` (configurable).
Default `<bin-dir>` is `~/.local/bin` on macOS/Linux and `~/.cc-mirror/bin` on Windows.

## Core Components

- `src/providers/index.ts`: provider templates and env defaults
- `src/brands/`: tweakcc brand presets (optional UI skins)
- `src/core/`: file ops, in-repo binary patching, variant CRUD (split by concern)
- `src/cli/index.ts`: CLI entrypoint, launches TUI when interactive
- `src/tui/`: Ink-based TUI wizard (components + app + entrypoint)
- `src/core/binary-patcher/`: self-contained tweakcc-compatible theme and prompt overlay patcher

## TUI Flow

- **Home**: create, manage, update-all, doctor
- **Quick setup**:
  - provider template
  - API key
  - model overrides (optional)
  - variant name (optional)
  - native install + tweakcc
- **Create wizard** (advanced):
  - provider template
  - brand preset (optional)
  - variant name
  - base URL
  - API key
  - model overrides
  - root + bin dirs
  - tweakcc toggle
  - provider prompt pack toggle
  - dev-browser skill install toggle
  - optional env overrides
  - summary + confirm
- **Manage**:
  - list variants
  - update / remove
- **Doctor**:
  - sanity report for binaries + wrappers

## Updating Binaries

- `cc-mirror update` rebuilds the `native/` + `tweakcc/` directories (preserving config, tasks, skills, approvals), then re-downloads the native binary and reapplies cc-mirror's in-repo patcher for a clean upgrade.

## Maintenance Checklist

- Update all variants after Claude Code upgrades: `cc-mirror update`
- Update a single variant: `cc-mirror update <name>`
- Reapply patches without reinstalling Claude Code: `cc-mirror apply <name>`
- Reapply or change brand preset without reinstalling Claude Code: `cc-mirror tweak <name> --brand zai`
- Adjust API keys/base URL: edit `~/.cc-mirror/<variant>/config/settings.json`
- Opt out of prompt packs: `--no-prompt-pack`
- Refresh local tweakcc reference sources: `scripts/vendor-tweakcc.sh --force`
- Download local system prompt references: `scripts/vendor-system-prompts.sh --force`

## Provider Extensibility

Provider templates are plain TS objects; add new providers by extending `src/providers/index.ts`.

## Auth Handling

When an API key is supplied, cc-mirror writes `ANTHROPIC_API_KEY` into the variant config
so Claude Code recognizes API-key auth during onboarding.

Wrappers also load `settings.json` env vars at launch, ensuring onboarding sees API-key auth
before Claude Code applies config env internally.

For Z.ai variants, cc-mirror also sets `Z_AI_API_KEY` to the same value by default (used by `zai-cli`), unless the user overrides it via extra env. Quick/TUI flows can also write it into the shell profile (opt out with `--no-shell-env`).

cc-mirror also stores the **last 20 characters** of the API key in
`~/.cc-mirror/<variant>/config/.claude.json` under `customApiKeyResponses.approved` so Claude Code
skips the OAuth login screen in interactive mode.

Brand presets stamp the user label for the chat banner from `CLAUDE_CODE_USER_LABEL` (fallback: OS username).

Auth token providers (OpenRouter, Vercel, Ollama, NanoGPT, GatewayZ) use `ANTHROPIC_AUTH_TOKEN`. Some also set `ANTHROPIC_API_KEY` when the provider accepts either header.

MiniMax variants seed a default MCP server entry in `~/.cc-mirror/<variant>/config/.claude.json` so the coding-plan MCP is ready once you add your API key.

Z.ai and MiniMax variants add deny lists for known server-side MCP tools in `~/.cc-mirror/<variant>/config/settings.json` under `permissions.deny`, pushing the model toward provider-native tools (e.g., `zai-cli` for Z.ai, MiniMax MCP for MiniMax).

Prompt packs (provider overlays) are injected directly into the bundled `cli.js` prompt strings by `src/core/binary-patcher/prompts.ts`; on macOS, the same patch is applied to the unpacked entry JS used by the node-runtime fallback.

The self-contained patcher intentionally supports cc-mirror's managed surface only: brand themes and provider prompt overlays. Other upstream tweakcc features (toolsets, input highlighters, statusline tweaks, model selector patches, etc.) are not applied unless they are explicitly ported into `src/core/binary-patcher/`.

## Brand Presets

Brand presets are optional tweakcc configurations written into `~/.cc-mirror/<variant>/tweakcc/config.json`.
Presets are provider-aware (e.g., `zai` auto-selects the Z.ai Carbon skin, `minimax` selects MiniMax Pulse) but can be overridden via `--brand`.

## Install (Native Binary)

cc-mirror downloads the native Claude Code binary into `~/.cc-mirror/<variant>/native/claude` (or `claude.exe` on Windows).
By default, variants track the `latest` channel. Use `--claude-version stable` to track stable, or pin a specific version with `--claude-version 2.1.37`.
