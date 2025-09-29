# SpecCraft Platform Specification

## Executive Summary

SpecCraft is an intelligent specification-driven development platform that integrates with Claude Code to streamline feature implementation. The platform has evolved from a template-based code generator to an intelligent guidance system that provides real-time documentation and implementation assistance.

**Version**: 2.0  
**Architecture**: MCP (Model Context Protocol) Server + Claude Code Integration  
**Primary Focus**: Guidance-driven development with live documentation fetching

## Core Philosophy

### From Templates to Guidance
SpecCraft v2 represents a fundamental shift from static code generation to dynamic, intelligent guidance:

- **Before**: Generate template files based on specifications
- **Now**: Guide Claude Code with real-time documentation and best practices
- **Benefit**: More flexible, maintainable, and up-to-date implementations

### Intelligent Documentation Integration
Instead of hardcoded examples, SpecCraft dynamically fetches the latest documentation and examples from official Keystone.js repositories, ensuring implementations always use current best practices.

## System Architecture

### MCP Server Components

```
SpecCraft MCP Server
├── Specification Engine
│   ├── Interactive Questionnaire System
│   ├── AI-Powered Follow-up Questions
│   └── Markdown Specification Generation
├── Documentation Provider
│   ├── Live GitHub Documentation Fetching
│   ├── Intelligent Topic Mapping
│   └── Smart Caching System
├── Project Generator
│   ├── Keystone.js Project Creation
│   ├── o8u-starter Template Integration
│   └── Current Directory Support
└── Guidance Provider
    ├── Implementation Instructions
    ├── Best Practice Recommendations
    └── Framework-Specific Patterns
```

### Claude Code Integration

SpecCraft integrates seamlessly with Claude Code through 4 essential slash commands:

1. **`/speccraft:new`** - Interactive specification creation
2. **`/speccraft:build`** - Intelligent project creation and implementation guidance
3. **`/speccraft:validate`** - AI-powered specification validation
4. **`/speccraft:help`** - Live documentation lookup

## Key Features

### 1. Interactive Specification Creation
- **Guided Questionnaire**: AI-driven question flow based on feature type
- **Intelligent Follow-ups**: Context-aware additional questions
- **Markdown Generation**: Structured specification output
- **Session Management**: Persistent conversation state

### 2. Live Documentation Integration
- **GitHub Integration**: Real-time fetching from Keystone.js official docs
- **Topic Mapping**: Intelligent handling of plurals, synonyms, and variations
- **Smart Caching**: Performance optimization with intelligent cache management
- **Error Handling**: Graceful fallback when documentation is unavailable

### 3. Intelligent Project Creation
- **Framework Detection**: Automatic project type identification
- **Template Integration**: o8u-starter Keystone.js template
- **Current Directory Support**: Project creation without subfolders
- **File Conflict Handling**: Safe cloning to existing directories

### 4. Guidance-Driven Development
- **Implementation Instructions**: Step-by-step guidance for Claude Code
- **Best Practice Integration**: Real-time access to official patterns
- **Framework-Specific Guidance**: Tailored instructions based on project type
- **Progressive Enhancement**: Build on existing projects intelligently

## Technical Implementation

### Documentation Provider
```typescript
class KeystoneDocumentationProvider {
  private async fetchFromGitHub(docPath: string, topic: string): Promise<DocumentationLookup | null> {
    const url = `${this.KEYSTONE_DOCS_BASE}/${docPath}.md`;
    const response = await fetch(url);
    return this.parseMarkdownToDocumentation(content, topic, url);
  }
  
  // Intelligent topic mapping with plurals and synonyms
  private topicMappings = {
    'relationships': 'fields/relationship', // Handle plural
    'auth': 'guides/access-control',       // Handle synonym
    // ... 30+ mappings
  };
}
```

### Project Generator
```typescript
class KeystoneProjectGenerator {
  async generateProject(config: KeystoneProjectConfig): Promise<string> {
    // Handle current directory creation
    if (projectPath === '.' || path.resolve(projectPath) === process.cwd()) {
      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'speccraft-'));
      await this.cloneToDirectory(tempProjectPath);
      await this.copyDirectoryContents(tempProjectPath, '.');
    }
  }
}
```

### Specification Engine
```typescript
class QuestionnaireEngine {
  async processAnswer(sessionId: string, answer: any): Promise<QuestionnaireResponse> {
    const session = this.getSession(sessionId);
    const nextQuestion = await this.generateFollowUpQuestion(session, answer);
    
    if (this.isComplete(session)) {
      return this.generateCompletionInstructions(sessionId);
    }
    
    return { question: nextQuestion, progress: this.calculateProgress(session) };
  }
}
```

## Workflow Integration

### New Project Creation Workflow
1. **User**: Runs `/speccraft:new "Blog Management System" "A system for managing blog posts and authors"`
2. **SpecCraft**: Initiates interactive questionnaire
3. **Claude Code**: Asks follow-up questions based on AI analysis
4. **User**: Provides answers through conversation
5. **SpecCraft**: Generates comprehensive specification
6. **User**: Validates with `/speccraft:validate spec.md`
7. **User**: Implements with `/speccraft:build spec.md`
8. **Claude Code**: Receives implementation guidance and executes

### Existing Project Enhancement Workflow
1. **SpecCraft**: Detects existing project type (Keystone, Next.js, React)
2. **Analysis**: Examines current architecture and dependencies
3. **Integration Guidance**: Provides framework-specific implementation instructions
4. **Live Documentation**: Fetches relevant patterns for the existing stack
5. **Claude Code**: Implements feature following established project patterns

## Error Handling & Resilience

### Graceful Degradation
- **Documentation Unavailable**: Fallback to cached content or helpful alternatives
- **Network Issues**: Intelligent retry with exponential backoff
- **Malformed Responses**: Safe error responses instead of tool failures
- **Git Clone Failures**: Detailed error messages with resolution steps

### API Error Prevention
- **Tool Response Validation**: Ensure all MCP tools return valid responses
- **Error Boundaries**: Catch and handle errors at appropriate levels
- **Fallback Content**: Provide useful alternatives when primary sources fail

## Performance Optimizations

### Smart Caching
```typescript
class DocumentationCache {
  private documentationCache = new Map<string, DocumentationLookup>();
  
  async lookup(topic: string): Promise<DocumentationLookup | null> {
    if (this.documentationCache.has(topic)) {
      return this.documentationCache.get(topic)!;
    }
    // Fetch and cache...
  }
}
```

### Efficient Template Handling
- **Temporary Directory Cloning**: Avoid conflicts in existing directories
- **Selective File Copying**: Skip unnecessary files (.git, etc.)
- **Stream Processing**: Handle large files efficiently

## Future Enhancements

### Planned Features
1. **Multi-Framework Support**: Expand beyond Keystone.js to Next.js, React, etc.
2. **Custom Templates**: User-defined project templates
3. **Version Management**: Handle different framework versions intelligently
4. **Team Collaboration**: Shared specifications and templates
5. **Integration Ecosystem**: Connect with more development tools

### Scalability Considerations
- **Distributed Caching**: Redis integration for team environments
- **API Rate Limiting**: Intelligent GitHub API usage optimization
- **Load Balancing**: Multiple MCP server instances
- **Monitoring**: Comprehensive observability and metrics

## Security & Compliance

### Data Protection
- **No Sensitive Data Storage**: Specifications contain only architectural information
- **Temporary File Cleanup**: Automatic cleanup of temporary directories
- **Network Security**: HTTPS-only communication with external APIs
- **Input Validation**: Comprehensive sanitization of user inputs

### Access Control
- **Local Execution**: MCP server runs locally for security
- **No External Dependencies**: Core functionality works offline
- **Audit Trail**: Comprehensive logging of all operations

## Configuration Management

### Environment Variables
```bash
SPECCRAFT_CACHE_TTL=3600          # Documentation cache TTL
SPECCRAFT_GITHUB_TOKEN=optional   # For higher API limits
SPECCRAFT_LOG_LEVEL=info          # Logging verbosity
```

### Claude Code Integration
```json
{
  "mcpServers": {
    "speccraft": {
      "command": "/usr/local/bin/speccraft-mcp-server",
      "args": [],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

## Quality Assurance

### Testing Strategy
- **Unit Tests**: Core functionality and edge cases
- **Integration Tests**: MCP server communication
- **End-to-End Tests**: Complete workflow validation
- **Performance Tests**: Documentation fetching and caching
- **Security Tests**: Input validation and sanitization

### Code Quality
- **TypeScript**: Full type safety throughout codebase
- **ESLint**: Consistent code style and best practices
- **Prettier**: Automated code formatting
- **Vitest**: Modern testing framework with excellent performance

## Deployment & Distribution

### Installation Methods
1. **NPM Package**: `pnpm install -g @opensaas/speccraft`
2. **Claude Code Integration**: Automatic MCP server setup
3. **Docker Support**: Containerized deployment for teams
4. **Development Mode**: Local development with hot reloading

### System Requirements
- **Node.js**: 18+ (ESM support required)
- **Memory**: 512MB minimum for documentation caching
- **Storage**: 100MB for templates and cache
- **Network**: Internet access for live documentation fetching

## Success Metrics

### User Experience
- **Time to First Implementation**: < 5 minutes from specification to running code
- **Documentation Accuracy**: Always current (real-time GitHub fetching)
- **Error Rate**: < 1% tool failures with graceful degradation
- **User Satisfaction**: Simplified workflow from 11 to 4 commands

### Technical Performance
- **Cache Hit Rate**: > 80% for documentation lookups
- **API Response Time**: < 2 seconds for specification generation
- **Build Success Rate**: > 95% for new project creation
- **Memory Usage**: < 100MB baseline, < 500MB peak

## Conclusion

SpecCraft v2 represents a fundamental evolution in specification-driven development, moving from rigid templates to intelligent, adaptive guidance. By integrating live documentation fetching, intelligent project detection, and seamless Claude Code integration, SpecCraft enables developers to implement features faster and more accurately than ever before.

The platform's focus on guidance over generation ensures that implementations remain flexible, maintainable, and aligned with current best practices, while the simplified command structure reduces cognitive load and improves developer experience.

---

**Last Updated**: September 2024  
**Specification Version**: 2.0  
**Implementation Status**: Production Ready