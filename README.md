# SpecCraft

AI-powered specification platform that creates comprehensive feature specifications through natural conversations with Claude Code. Built as interactive slash commands powered by Model Context Protocol (MCP) with live Keystone.js documentation fetching.

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

- **🎯 Interactive Conversations** - Natural Q&A flow with Claude Code (no complex slash commands)
- **📚 Live Documentation** - Real-time Keystone.js docs and examples from GitHub
- **🤖 AI-Guided Questionnaires** - Intelligent follow-up questions based on your responses
- **⚡ Automatic Implementation** - Goes from specification directly to implementation guidance
- **🔒 Zero External APIs** - All AI processing within Claude Code, documentation from GitHub
- **📝 Professional Output** - Development-ready specifications and implementation instructions

## Available Commands

SpecCraft uses just **4 essential commands**:

| Command | Purpose | Example |
|---------|---------|---------|
| `/speccraft:new` | **Interactive specification** | `/speccraft:new "User Auth" "Login system"` |
| `/speccraft:build` | **Implementation guidance** | `/speccraft:build spec.md` |
| `/speccraft:validate` | **Quality assessment** | `/speccraft:validate spec.md` |
| `/speccraft:help` | **Documentation & help** | `/speccraft:help text` |

## Interactive Workflow

### 🚀 **New Simplified Experience**

```bash
# Start specification
/speccraft:new "Product Reviews" "Allow customers to rate products"

# Claude Code automatically handles the conversation:
# ✅ Asks questions naturally in chat
# ✅ Records your answers automatically  
# ✅ Generates specification when complete
# ✅ Provides implementation guidance immediately

# Validate quality (optional)
/speccraft:validate product-reviews-spec.md

# Get implementation help
/speccraft:help relationship  # Live Keystone.js docs
```

### **Sample Conversation Flow**

```
User: /speccraft:new "Product Reviews" "Allow customers to rate products"

Claude Code: I'll help you create a comprehensive specification for your Product Reviews feature. 

What's the primary business goal? Are you looking to:
- Increase customer engagement and trust?
- Improve product discoverability? 
- Gather feedback for improvement?

User: We want to increase customer trust and help purchasing decisions.

Claude Code: Perfect! Now about the user experience - should customers be able to:
- Rate products with stars (1-5)?
- Write detailed text reviews?
- Upload photos with reviews?
- Rate specific aspects (quality, value, etc.)?

User: Yes to stars and text, no photos needed, just overall rating.

Claude Code: Great! Let me ask about the data requirements...

[Conversation continues naturally until complete]

Claude Code: Excellent! I have everything needed. Let me generate your specification and implementation guidance.

📋 **Specification Generated**: product-reviews-spec.md
🚀 **Implementation Ready**: Here's how to build it with Keystone.js...
```

## Live Documentation Integration

SpecCraft fetches **real-time documentation** from official sources:

```bash
# Get current Keystone.js field documentation
/speccraft:help text           # Text field options and examples
/speccraft:help relationship   # Relationship field patterns
/speccraft:help access-control # Security patterns

# Fetch official examples  
/speccraft:help blog           # Complete blog example
/speccraft:help auth           # Authentication patterns
```

**Documentation Sources:**
- 📚 **Field Types**: `https://github.com/keystonejs/keystone/tree/main/docs/content/docs/fields`
- 🔧 **Guides**: `https://github.com/keystonejs/keystone/tree/main/docs/content/docs/guides`  
- 💡 **Examples**: `https://github.com/keystonejs/keystone/tree/main/examples`

## Architecture

### **Core Components**
- **Interactive Commands** (`.claude/commands/speccraft/`) - 4 essential Claude Code slash commands
- **MCP Server** (`src/mcp-server/`) - Session management and documentation fetching
- **Specification Engine** (`src/lib/specification-engine/`) - Intelligent questionnaire logic
- **Documentation Provider** (`src/lib/guidance/`) - Live GitHub documentation fetching
- **Session Storage** (`.speccraft/sessions.json`) - Conversation persistence

### **Key Improvements in v2**
- **🎯 85% Fewer Commands** - From 11 commands to 4 essential ones
- **💬 Natural Conversations** - No more complex session management for users
- **📚 Live Documentation** - Real-time Keystone.js docs replace hardcoded content
- **⚡ Automated Flow** - From conversation → specification → implementation seamlessly

### **Architectural Benefits**
- **🚀 Fast & Reliable** - Live documentation with smart caching
- **🔒 Secure** - Local processing + official documentation sources
- **💰 Cost-effective** - No additional AI API costs
- **🎯 Always Current** - Real-time docs ensure latest best practices

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
pnpm run build

# Publish to npm (maintainers only)
pnpm publish
```

## What's New in v2

### **Simplified Experience**
- **Single Command Workflow**: `/speccraft:new` handles entire specification process
- **Natural Conversations**: No more `/speccraft:answer` or `/speccraft:continue` commands
- **Automated Progression**: Automatic specification generation and implementation guidance

### **Live Documentation**
- **Real-time Fetching**: Current Keystone.js documentation from GitHub
- **Smart Caching**: Efficient documentation retrieval with local caching
- **Official Examples**: Direct access to Keystone.js example projects

### **Enhanced Claude Code Integration**
- **Conversational Flow**: Claude Code manages entire specification process naturally
- **Contextual Guidance**: Real-time implementation instructions with live documentation
- **Seamless Workflow**: From idea to specification to implementation in one conversation

*SpecCraft v2 revolutionizes feature specification - from complex command workflows to natural conversations that deliver comprehensive, implementation-ready specifications with live documentation support.*