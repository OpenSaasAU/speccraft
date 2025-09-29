---
description: Get help documentation and examples for Keystone.js implementation
mcp_server: "speccraft"
args:
  - name: topic
    description: Topic to get help for (field types, patterns, examples, etc.)
    required: true
---

# SpecCraft Help & Documentation

Get comprehensive help, documentation, and examples for implementing features with Keystone.js. This command provides real-time access to patterns, field types, and implementation guidance.

## Usage

```
/speccraft:help <topic>
```

## Popular Topics

### Field Types
```
/speccraft:help text
/speccraft:help relationship  
/speccraft:help select
/speccraft:help timestamp
/speccraft:help image
/speccraft:help checkbox
```

### Implementation Patterns
```
/speccraft:help user-owned
/speccraft:help role-based
/speccraft:help audit-trail
/speccraft:help soft-delete
```

### UI Customization
```
/speccraft:help list-view
/speccraft:help field-mode
/speccraft:help admin-ui
```

### Advanced Topics
```
/speccraft:help hooks
/speccraft:help access-control
/speccraft:help validation
/speccraft:help custom-fields
```

## Examples

### Get Field Documentation
```
/speccraft:help text
```
Returns complete documentation for text fields including:
- Configuration options
- Validation patterns
- Common use cases
- Code examples

### Learn Implementation Patterns
```
/speccraft:help user-owned
```
Provides comprehensive guidance for:
- User-owned content pattern
- Access control setup
- Schema structure
- Complete implementation

### Access Control Help
```
/speccraft:help role-based
```
Shows how to implement:
- Role-based permissions
- Hierarchical access
- Session handling
- Best practices

## What You Get

### 📚 **Comprehensive Documentation**
- Detailed explanations of concepts
- Configuration options and parameters
- When and why to use specific approaches

### 💡 **Working Code Examples**
- Copy-paste ready TypeScript code
- Real-world implementation patterns
- Best practices and conventions

### 🔗 **Related Topics**
- Links to connected concepts
- Suggested next steps
- Advanced usage patterns

### ⚡ **Context-Aware Guidance**
- Relevant to your current implementation
- Framework-specific recommendations
- Integration instructions

## Claude Code Integration

This help system integrates seamlessly with Claude Code's implementation capabilities:

1. **Get Documentation**: Use `/speccraft:help <topic>` to understand concepts
2. **Implement Code**: Ask Claude Code to implement based on the guidance
3. **Iterate**: Use help to refine and enhance your implementation

## Common Workflows

### Starting a New Feature
```
1. /speccraft:help user-owned          # Learn the pattern
2. "Create a user-owned Post schema"   # Ask Claude Code to implement
3. /speccraft:help hooks               # Add business logic
4. "Add audit trail to Post schema"   # Enhance implementation
```

### Enhancing Existing Code
```
1. /speccraft:help access-control      # Review security patterns
2. "Add role-based access to my schema" # Apply improvements
3. /speccraft:help list-view           # Optimize admin UI
```

### Debugging and Optimization
```
1. /speccraft:help validation          # Understand validation
2. /speccraft:help hooks               # Review hook usage
3. "Fix validation in my User schema"  # Apply fixes
```

## Quick Reference

| Topic | Description | Use Case |
|-------|-------------|----------|
| `text` | Text fields | Names, descriptions, content |
| `relationship` | Connections | User ownership, categories |
| `user-owned` | User content | Posts, profiles, documents |
| `audit-trail` | Change tracking | Who/when modified |
| `hooks` | Business logic | Validation, auto-assignment |
| `access-control` | Permissions | Security, privacy |

## Tips

- **Be Specific**: Use exact field names or pattern names for best results
- **Start Simple**: Begin with basic topics, then explore advanced concepts
- **Combine with Claude**: Use help for understanding, Claude Code for implementation
- **Iterate**: Reference help multiple times as your implementation evolves

Perfect for learning Keystone.js patterns and getting implementation guidance! 📚