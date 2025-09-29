# SpecCraft

AI-powered specification platform that guides users through creating comprehensive feature specifications using LLM-driven questionnaires. Built as Claude Code slash commands powered by Model Context Protocol (MCP).

## Quick Setup

```bash
# One-line installation
npx @opensaas/speccraft install

# Start using immediately in Claude Code
/speccraft:new "Shopping Cart" "Add items to cart and checkout"
```

## Alternative Installation

```bash
# Manual installation via Claude CLI
npx @opensaas/speccraft start  # to get the server path
claude mcp add speccraft -- node /path/to/server
```

## Features

- **8 Claude Code slash commands** (`/speccraft:new`, `/speccraft:continue`, etc.)
- **AI-guided questionnaires** with 20+ comprehensive questions
- **Claude-powered analysis** - Uses Claude directly for smart insights and validation
- **Professional markdown generation** ready for development
- **Zero external API calls** - All AI processing happens within Claude Code
- **Session management** with persistent storage
- **Lightweight package** - Minimal dependencies, maximum efficiency

## Available Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `/speccraft:new` | Start new specification | `/speccraft:new "User Auth" "Login system"` |
| `/speccraft:continue` | Resume session | `/speccraft:continue session_123` |
| `/speccraft:answer` | Answer question | `/speccraft:answer session_123 "Email and password"` |
| `/speccraft:generate` | Create specification | `/speccraft:generate session_123` |
| `/speccraft:validate` | Validate quality | `/speccraft:validate spec.md` |
| `/speccraft:status` | Check progress | `/speccraft:status session_123` |
| `/speccraft:list` | List sessions | `/speccraft:list` |
| `/speccraft:follow-up` | AI enhancement | `/speccraft:follow-up session_123` |

## Workflow Example

1. **Start**: `/speccraft:new "Shopping Cart" "Add items to cart and checkout"`
2. **Answer**: `/speccraft:answer session_123 "Users can add products, modify quantities..."`
3. **Enhance**: `/speccraft:follow-up session_123` (AI suggests additional questions)
4. **Generate**: `/speccraft:generate session_123` (creates `shopping-cart-spec.md`)
5. **Validate**: `/speccraft:validate shopping-cart-spec.md` (AI quality assessment)

## Architecture

- **Slash Commands** (`.claude/commands/speccraft/`) - Claude Code interface
- **MCP Server** (`src/mcp-server/`) - Command processing and session management
- **Specification Engine** (`src/lib/specification-engine/`) - Core questionnaire logic
- **Claude Integration** - Direct AI analysis within Claude Code (no external APIs)
- **Session Storage** (`.speccraft/sessions.json`) - Persistent session data

### Key Architectural Benefits

- **🚀 Fast & Reliable** - No external API dependencies or network calls
- **🔒 Secure** - All processing happens locally within Claude Code
- **💰 Cost-effective** - No additional AI API costs
- **🎯 Smart** - Leverages Claude's full context and reasoning capabilities

## Development

```bash
# Clone and setup
git clone https://github.com/opensaas/speccraft.git
cd speccraft
pnpm install

# Build MCP server
pnpm run build

# Test locally
npx . install

# Remove from Claude Code (if needed)
npx @opensaas/speccraft uninstall
```

## Package Management

```bash
# Build for publishing
npm run build

# Publish to npm (maintainers only)
npm publish
```

*SpecCraft transforms the way you create specifications - from ad-hoc documentation to comprehensive, AI-enhanced requirements that guide successful development.*
