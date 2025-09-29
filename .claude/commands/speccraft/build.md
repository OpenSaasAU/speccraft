---
description: Build code from specification - intelligently creates new project or adds to existing
mcp_server: "speccraft"
args:
  - name: spec_path
    description: Path to the specification markdown file
    required: true
  - name: project_name
    description: Name for new project (optional)
    required: false
---

# Build from Specification

**🚀 For Claude Code: This command provides implementation instructions and guidance, then directs you to implement the feature using live documentation from SpecCraft MCP tools.**

Intelligently analyzes your project context and provides implementation guidance. Creates new Keystone.js projects when needed or guides implementation in existing projects.

## Usage

```
/speccraft:build <spec-path> [project-name]
```

## Examples

```
/speccraft:build ./specs/001_user_management/user_management_spec.md
```

```
/speccraft:build ./my-spec.md "my-awesome-app"
```

```
/speccraft:build ./feature-spec.md
```

## How It Works

### Intelligent Detection & Implementation Instructions

The build command analyzes your current directory and provides Claude Code with clear implementation instructions:

#### 🆕 **New Project Creation**
**When**: No existing project detected (empty directory or no package.json)
**Action**:
1. Creates a complete Keystone.js project using the [o8u-starter](https://github.com/OpenSaasAU/o8u-starter) template in the current folder
2. **Provides Claude Code with step-by-step implementation instructions**
3. Directs Claude Code to use `/spec-fetch-docs` and `/spec-fetch-example` for live documentation

**What Claude Code Receives**:
- Direct commands to execute (`pnpm install`)
- Specific implementation areas (schema entities, relationships, business logic)
- Instructions to fetch live Keystone.js documentation using MCP tools
- Testing commands to validate implementation

#### ⚡ **Feature Addition to Existing Projects**
**When**: Existing project detected (finds package.json with framework dependencies)
**Action**:
1. Analyzes existing project structure
2. **Provides Claude Code with integration instructions**
3. Guides implementation using current project patterns

**Supported Frameworks**:
- **Keystone.js**: Schema extensions, admin components, list hooks
- **Next.js**: App Router, React components
- **React**: Components, custom hooks, TypeScript types
- **Generic**: Implementation plans and base modules

## Implementation Flow

### New Project Creation
After running the build command, Claude Code receives:

```
🚀 CLAUDE CODE: IMPLEMENT THIS FEATURE NOW

IMMEDIATE NEXT STEPS - Execute these commands:

1. Install dependencies:
   pnpm install

2. Use the SpecCraft MCP tools to get implementation details:
   - Use /spec-fetch-docs fields/text to understand field types
   - Use /spec-fetch-docs guides/schemas for schema patterns
   - Use /spec-fetch-example blog for reference implementations

3. Implement the the feature spec:
   - Read the specification in $1
   - Replace basic schema with entities from the specification
   - Follow Keystone.js field type patterns

4. Key Implementation Areas:
   📋 Schema Entities to Create
   🔗 Key Relationships
   🔒 Access Control
   ⚙️ Business Logic

5. Test the implementation:
   pnpm run dev
```

### Existing Project Enhancement
For existing projects, Claude Code receives:

```
🚀 CLAUDE CODE: IMPLEMENT THIS FEATURE NOW

IMMEDIATE NEXT STEPS:

1. Analyze the existing project structure
2. Read the feature specification in $1
2. Use SpecCraft MCP tools for implementation guidance
3. Implementation steps based on detected framework
4. Key implementation areas specific to the feature
5. Test commands
```

## Key MCP Tools for Implementation

The build command directs Claude Code to use these SpecCraft MCP tools:

### Documentation Fetching
- **`/spec-fetch-docs <doc-path>`**: Fetch live Keystone.js documentation
  - Examples: `fields/text`, `guides/schemas`, `guides/access-control`
- **`/spec-fetch-example <example-name>`**: Fetch official Keystone.js examples
  - Examples: `blog`, `ecommerce`, `auth`

### Integration Guidance
- **Schema Integration**: Live documentation on adding models to existing schemas
- **Field Types**: Current documentation on all available Keystone field types
- **Access Control**: Latest security patterns and implementation examples
- **Business Logic**: Hook patterns and examples from official repository

## Decision Logic

```mermaid
flowchart TD
    A[Run /speccraft:build] --> B{Check Directory}
    B -->|Empty or No package.json| C[Create New Keystone Project]
    B -->|Has package.json| D{Detect Framework}
    D -->|@keystone-6/core| E[Provide Keystone Implementation Instructions]
    D -->|next| F[Provide Next.js Implementation Instructions]
    D -->|react| G[Provide React Implementation Instructions]
    D -->|other/unknown| H[Provide Generic Implementation Instructions]

    C --> I[📋 Implementation Instructions + Project Setup]
    E --> J[📋 Framework-Specific Implementation Instructions]
    F --> J
    G --> J
    H --> J
```

## Benefits

### 🧠 **Smart Decision Making**
- No need to choose between project types
- Automatic framework detection
- Context-aware implementation guidance

### 🚀 **Rapid Development**
- New projects ready for immediate implementation
- Clear step-by-step instructions for Claude Code
- Live documentation fetching during implementation

### 🎯 **Specification-Driven Implementation**
- All implementation based on your requirements
- Clear, actionable guidance for Claude Code
- Maintains feature traceability

### 🔧 **Live Documentation Integration**
- Access to latest Keystone.js documentation
- Official examples from Keystone repository
- Real-time implementation patterns and best practices

## Advanced Usage

### Custom Project Name
```
/speccraft:build ./spec.md "custom-project-name"
```

### Building in Subdirectory
```
cd features/
/speccraft:build ../specs/001_feature/spec.md
```

## For Claude Code Users

This command is designed to work seamlessly with Claude Code's implementation capabilities:

1. **Provides clear, actionable instructions** instead of generated code
2. **Directs you to use MCP tools** for live documentation fetching
3. **Gives specific implementation areas** to focus on
4. **Includes testing commands** to validate your work

The combination of SpecCraft guidance + Claude Code implementation + live documentation fetching creates a powerful development workflow! 🎯
