# CC-MIRROR Documentation

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   ╭─────╮╭─────╮    ╭───╮╭───╮╭───╮╭───────╮╭───────╮╭───────╮╭───────╮     │
│   │ ╭───╯│ ╭───╯    │ ╭╮╯│ ╭─╯╰─╮ ││ ╭─╮ ╭─╯│ ╭─╮ ╭─╯│ ╭───╮ ││ ╭─╮ ╭─╯     │
│   │ │    │ │   ╭────│ ││ │ │  ╭─╯ ││ ╰─╯ │  │ ╰─╯ │  │ │   │ ││ ╰─╯ │       │
│   │ ╰───╮│ ╰───╯    │ ╰╯╭╯ ╰──╯ ╭─╯│ ╭─╮ │  │ ╭─╮ │  │ ╰───╯ ││ ╭─╮ │       │
│   ╰─────╯╰─────╯    ╰───╯╰──────╯  ╰─╯ ╰─╯  ╰─╯ ╰─╯  ╰───────╯╰─╯ ╰─╯       │
│                                                                              │
│   Create multiple isolated Claude Code variants with custom providers        │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 📚 Documentation Index

### ⚡ Getting Started

| Document                                | Description                           |
| --------------------------------------- | ------------------------------------- |
| [Quick Start](../README.md#quick-start) | Install and create your first variant |
| [CLI Options](../README.md#cli-options) | Commands, flags, and options          |

### 🤖 Features

| Document                                   | Description                          |
| ------------------------------------------ | ------------------------------------ |
| [Mirror Claude](features/mirror-claude.md) | Pure Claude Code with clean defaults |

### 🏗️ Architecture

| Document                             | Description                        |
| ------------------------------------ | ---------------------------------- |
| [Overview](architecture/overview.md) | How cc-mirror works under the hood |

### 🔧 Reference

| Document                          | Description         |
| --------------------------------- | ------------------- |
| [Tweakcc Guide](TWEAKCC-GUIDE.md) | Theme customization |

---

## 🗺️ Quick Navigation

```
docs/
├── README.md                 ← You are here
├── TWEAKCC-GUIDE.md           # 🔧 tweakcc integration notes
├── features/
│   └── mirror-claude.md       # 🪞 Pure Claude Code variant
└── architecture/
    └── overview.md            # 🏗️ System architecture
```

---

## 💡 Quick Links

- **New to cc-mirror?** Start with the [Quick Start](../README.md#quick-start)
- **Pure Claude experience?** Try [Mirror Claude](features/mirror-claude.md)
- **Adding a provider?** See [Provider System](architecture/provider-system.md)

---

## 📊 Provider Comparison

```
┌──────────────┬────────────────────┬──────────────┬────────────┐
│   Provider   │       Model        │  Auth Mode   │ Prompt Pack│
├──────────────┼────────────────────┼──────────────┼────────────┤
│ kimi         │ kimi-for-coding    │ API Key      │ ✗          │
│ minimax      │ MiniMax-M2.7       │ API Key      │ ✓ Full     │
│ zai          │ GLM-5/4.7/4.5-Air  │ API Key      │ ✓ Full     │
│ deepseek     │ DeepSeek V4        │ API Key      │ ✗          │
│ openrouter   │ You choose         │ Auth Token   │ ✗          │
│ vercel       │ Vercel gateway     │ Auth Token   │ ✗          │
│ ollama       │ Local + cloud      │ Auth Token   │ ✗          │
│ nanogpt      │ Anthropic compat   │ Auth Token   │ ✗          │
│ ccrouter     │ Local LLMs         │ Optional     │ ✗          │
│ mirror       │ Claude (native)    │ OAuth/Key    │ ✗ Pure     │
│ gatewayz     │ GatewayZ gateway   │ Auth Token   │ ✗          │
└──────────────┴────────────────────┴──────────────┴────────────┘
```

---

## 🔗 Provider Setup Links

| Provider     | Subscribe                                                     | Get Key/Token                                                    | Docs                                                             |
| ------------ | ------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| `kimi`       | https://www.kimi.com/code                                     | https://www.kimi.com/code/console                                | https://www.kimi.com/code/docs/en/more/third-party-agents.html   |
| `minimax`    | https://platform.minimax.io/subscribe/coding-plan             | https://platform.minimax.io/user-center/payment/coding-plan      | https://platform.minimax.io/docs                                 |
| `zai`        | https://z.ai/subscribe                                        | https://z.ai/manage-apikey/apikey-list                           | https://z.ai/docs                                                |
| `openrouter` | https://openrouter.ai/account                                 | https://openrouter.ai/keys                                       | https://openrouter.ai/docs                                       |
| `vercel`     | https://vercel.com/ai                                         | https://vercel.com/account/tokens                                | https://vercel.com/docs/ai-gateway                               |
| `ollama`     | https://ollama.com                                            | https://ollama.com                                               | https://docs.ollama.com/api/anthropic-compatibility              |
| `nanogpt`    | https://nano-gpt.com                                          | https://nano-gpt.com                                             | https://docs.nano-gpt.com/docs/anthropic-compatibility           |
| `ccrouter`   | https://github.com/musistudio/claude-code-router#installation | https://github.com/musistudio/claude-code-router#2-configuration | https://github.com/musistudio/claude-code-router#2-configuration |
| `gatewayz`   | https://gatewayz.ai                                           | https://gatewayz.ai                                              | https://docs.gatewayz.ai/docs/anthropic-compatibility            |

---

<p align="center">
  <strong>Created by <a href="https://github.com/numman-ali">Numman Ali</a></strong>
</p>
