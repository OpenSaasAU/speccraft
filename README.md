# SpecCraft

**Specification-driven development for AI coding agents.** An experiment in how documentation, quickstarts, and best practices should be delivered in a world where AI agents write code.

SpecCraft creates comprehensive feature specifications through natural conversations with Claude Code, then generates opinionated Next.js + KeystoneJS applications with embedded architectural guidance.

## The Problem

**Current State**: Developers (and AI agents) struggle with:
- **Single-prompt complexity** - Attempting to build features with vague requirements
- **Documentation fragmentation** - Scattered across multiple sites, often outdated
- **Pattern inconsistency** - Every project reinvents the wheel
- **Lost knowledge** - Critical decisions buried in chat histories or Slack threads
- **Template decay** - Static boilerplates become outdated quickly

**The Insight**: In a world of AI coding agents, the bottleneck isn't writing code—it's **communicating intent** and **ensuring consistency**.

## The Solution

SpecCraft introduces **specification-as-source-of-truth** combined with **opinionated, self-documenting architectures**:

1. **📋 Interactive Specification Creation** - AI-guided questionnaires that extract comprehensive requirements
2. **🏗️ Opinionated Architecture** - Battle-tested patterns from production apps (not theoretical examples)
3. **📚 Live Documentation** - Real-time docs from official sources, not static snapshots
4. **🤖 AI-Native Design** - Every output optimized for AI agent consumption
5. **💡 Self-Documenting Projects** - Generated `CLAUDE.md` files embed architectural patterns directly in the codebase

## Quick Start

```bash
# One-line installation
npx @opensaas/speccraft install

# Start creating specifications
/speccraft:new "Shopping Cart" "Add items to cart and checkout"
```

## The SpecCraft Approach

### Stage 1: Specification-Driven Requirements ✅

Instead of single prompts like "build a blog", SpecCraft asks:
- Who are your users? What are their goals?
- What workflows need to be supported?
- What are the edge cases and error scenarios?
- What security requirements exist?
- How does this integrate with existing systems?

**Output**: A comprehensive markdown specification that serves as:
- Source of truth for features
- Version-controlled documentation
- Input for AI code generation
- Reference for human developers

### Stage 2: Opinionated Implementation ✅

SpecCraft doesn't generate generic templates—it provides **battle-tested architecture** from real production apps:

**Reference Architecture**: [on-the-hill-drama-club](https://github.com/borisno2/on-the-hill-drama-club)
- **Next.js 15** with App Router
- **KeystoneJS 6** embedded via `getContext()` (NOT as separate server)
- **NextAuth 5** for authentication
- **Neon PostgreSQL** with serverless adapter
- **Server Actions** for mutations (no custom GraphQL resolvers)
- **Type-safe GraphQL** with gql.tada

**Key Innovation**: Generated projects include `CLAUDE.md`—a comprehensive guide that embeds:
- Critical architectural patterns
- Working code examples
- Common workflows
- Troubleshooting guides
- Links to relevant documentation

This means AI agents (and developers) always have context-aware guidance when working in the project.

### Stage 3: Deployment Orchestration 📋 (Planned)

Automated deployment to Vercel + Neon with:
- Environment variable management
- Database migration execution
- Health checks and monitoring

## Available Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `/speccraft:new` | **Create specification interactively** | `/speccraft:new "User Auth" "Login with OAuth"` |
| `/speccraft:build` | **Generate project with architecture** | `/speccraft:build spec.md` |
| `/speccraft:validate` | **AI quality assessment** | `/speccraft:validate spec.md` |
| `/speccraft:help` | **Live Keystone.js documentation** | `/speccraft:help relationship` |

## The SpecCraft Difference

### Traditional Approach:
```
User: "Build a user authentication system"
AI: "Here's some generic code..."
→ Missing edge cases
→ Inconsistent patterns
→ No architectural guidance
→ Patterns become outdated
```

### SpecCraft Approach:
```
User: /speccraft:new "User Authentication" "Login with email and OAuth"

AI: [Asks 21 intelligent questions about users, security, workflows, etc.]

→ Comprehensive 5-page specification
→ Battle-tested Next.js + Keystone architecture
→ CLAUDE.md with embedded patterns and examples
→ Live documentation from official sources
→ Type-safe, production-ready code guidance
```

## Key Innovations

### 1. **Smart Answer Inference** 🔮

After collecting context, SpecCraft can intelligently suggest answers:

```
You: "This is a user profile dashboard"

Q: Does this feature require authentication?
💡 Based on "user profile dashboard", I'm 95% confident this needs
   authentication because it's personal user data.

Accept? [Yes / No]
```

Reduces 21 questions to ~12-15 for most features while maintaining quality.

### 2. **Live Documentation Integration** 📚

Instead of static templates, SpecCraft fetches real-time documentation:

```bash
/speccraft:help relationship  # Latest Keystone.js relationship patterns
/speccraft:help auth          # Current authentication examples
/speccraft:help access-control # Security best practices
```

Sources:
- Official Keystone.js docs from GitHub
- Real example projects
- Current best practices

### 3. **Self-Documenting Architecture** 📖

Every generated project includes `CLAUDE.md`:

```markdown
# Your Feature - Development Guide

## Critical Patterns
❌ NEVER run Keystone as separate server
✅ ALWAYS use getContext()
✅ ALWAYS use Server Actions (not custom resolvers)

## Common Tasks
### Adding a New Schema
1. Create src/keystone/lists/YourList.ts
2. [Complete example with working code]

### Creating a Server Action
1. Create src/app/actions/yourAction.ts
2. [Complete example with type safety]

## Troubleshooting
### "getContext is not a function"
- Check src/keystone/context/index.ts exists
- [Specific solution steps]
```

This means:
- ✅ AI agents always have architectural context
- ✅ New developers understand patterns immediately
- ✅ Consistency maintained across codebase
- ✅ Knowledge preserved, not buried in chat logs

### 4. **Opinionated Architecture from Production** 🏗️

Not theoretical—actual patterns from production SaaS applications:

**Key Decisions:**
- Embed Keystone via `getContext()` (not separate server)
- Use Next.js Server Actions for mutations
- Type-safe GraphQL with gql.tada
- Neon serverless PostgreSQL for Vercel
- NextAuth 5 synced with Keystone users

**Why This Matters:**
- Patterns are proven at scale
- Best practices are enforced
- Security is built-in
- Performance is optimized

## The Experiment

SpecCraft is an **experiment in AI-native development tooling**:

**Hypothesis**: In a world of AI coding agents, the most valuable assets are:
1. **Clear specifications** (not vague prompts)
2. **Opinionated architectures** (not infinite flexibility)
3. **Embedded knowledge** (not external docs)
4. **Live documentation** (not static snapshots)
5. **Self-documenting code** (not separate wikis)

**Questions We're Exploring:**
- Can AI-guided questionnaires produce better specifications than human-written ones?
- Should documentation live IN the codebase rather than external sites?
- Are opinionated architectures better than flexible templates for AI agents?
- Can inference reduce cognitive load while maintaining quality?
- How should best practices be communicated to AI agents?

## Real-World Impact

### Before SpecCraft:
- 📝 Vague specifications → Missing edge cases
- 🔀 Inconsistent patterns → Technical debt
- 📚 Scattered docs → Outdated information
- 🤔 Trial-and-error → Wasted time

### After SpecCraft:
- 📋 Comprehensive specs → Complete requirements
- 🏗️ Battle-tested patterns → Production-ready code
- 📖 Embedded guidance → Always current
- 🚀 Clear path → Immediate productivity

## Architecture

### Core Components

```
speccraft/
├── .claude/commands/speccraft/   # 4 slash commands for Claude Code
├── src/
│   ├── mcp-server/               # MCP server (session management)
│   ├── lib/
│   │   ├── specification-engine/ # AI questionnaire system
│   │   └── guidance/             # Architecture guidance + CLAUDE.md generation
│   └── keystone/                 # Keystone schema and context
└── generated-projects/
    └── your-project/
        ├── CLAUDE.md             # Embedded architectural guide
        ├── SPECIFICATION.md      # Feature specification
        └── src/                  # Opinionated Next.js + Keystone app
```

### Technology Stack

- **MCP Server**: Model Context Protocol for Claude Code integration
- **AI Questionnaires**: Intelligent follow-up questions based on responses
- **Live Documentation**: Real-time fetching from GitHub
- **Smart Caching**: Efficient documentation retrieval
- **Answer Inference**: 90%+ confidence threshold for suggestions

## Key Features

### ✨ Intelligent Question Flow
- 21 comprehensive questions across 6 categories
- Visual progress bars (████████░░░░ 8/21)
- Smart answer inference (reduces to ~12-15 questions)
- Category preview upfront

### 🏗️ Opinionated Architecture
- Production-tested patterns from real apps
- Complete Next.js + Keystone setup
- NextAuth integration (when auth detected)
- Neon serverless PostgreSQL
- Type-safe GraphQL with gql.tada

### 📚 Live Documentation
- Real-time Keystone.js docs from GitHub
- Official examples and patterns
- Smart topic mapping (handles plurals, synonyms)
- Efficient caching with error handling

### 📖 Self-Documenting Projects
- `CLAUDE.md` embedded in every project
- Critical patterns with examples
- Common workflows and troubleshooting
- Architecture decisions explained

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

# Remove from Claude Code
npx @opensaas/speccraft uninstall
```

## What's New in v3

### **Smart Answer Inference** 🔮
- Automatically suggests answers with 90%+ confidence
- Reduces questionnaire from 21 to ~12-15 questions
- Transparent reasoning shown to user
- User maintains full control

### **Opinionated Architecture** 🏗️
- Complete Next.js + Keystone + NextAuth setup
- Production patterns from on-the-hill-drama-club
- Critical DO/DON'T patterns embedded
- Smart auth detection from specifications

### **CLAUDE.md Generation** 📖
- Comprehensive architectural guide in every project
- Working code examples for common tasks
- Troubleshooting guides specific to the stack
- Self-documenting, always accessible

### **Visual Progress** 📊
- Progress bars throughout questionnaire
- Category overview before starting
- Real-time completion tracking

## Contributing

This is an **open experiment**. We're exploring:
- How should AI agents receive documentation?
- What makes a specification "good enough" for AI code generation?
- How opinionated should architectures be?
- What patterns work best for AI + human collaboration?

Contributions, experiments, and feedback welcome!

## License

MIT

---

**SpecCraft**: Teaching AI agents to build better by teaching them to ask better questions first.

*An experiment by OpenSaas in specification-driven AI development.*