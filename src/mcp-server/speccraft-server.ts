import fs from "fs/promises";
import path from "path";
import {
  QuestionnaireEngine,
  LLMQuestioner,
  createNewQuestionnaire,
  createSpecificationFromSession,
  type QuestionnaireSession,
} from "../lib/specification-engine/index.js";
import {
  SpecificationReader,
  KeystoneProjectGenerator,
  type ParsedSpecification,
} from "../lib/code-generation/index.js";
import {
  KeystoneGuidanceProvider,
  type KeystoneGuidance,
} from "../lib/guidance/keystone-guidance.js";
import { KeystoneDocumentationProvider } from "../lib/guidance/documentation-provider.js";

interface SessionStorage {
  [sessionId: string]: QuestionnaireSession;
}

export class SpecCraftMCPServer {
  private sessions: SessionStorage = {};
  private llmQuestioner: LLMQuestioner;
  private storageDir: string;
  private guidanceProvider: KeystoneGuidanceProvider;
  private docProvider: KeystoneDocumentationProvider;

  constructor() {
    // Initialize LLM questioner (now simplified for Claude Code integration)
    this.llmQuestioner = new LLMQuestioner({
      maxFollowUpQuestions: 3,
    });

    // Initialize guidance providers
    this.guidanceProvider = new KeystoneGuidanceProvider();
    this.docProvider = new KeystoneDocumentationProvider();

    // Storage directory for persistence
    this.storageDir = path.join(process.cwd(), ".speccraft");
    this.initializeStorage();
  }

  private async initializeStorage() {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
      await this.loadSessions();
    } catch (error) {
      console.error("Failed to initialize storage:", error);
    }
  }

  private async saveSessions() {
    try {
      const sessionsFile = path.join(this.storageDir, "sessions.json");
      await fs.writeFile(sessionsFile, JSON.stringify(this.sessions, null, 2));
    } catch (error) {
      console.error("Failed to save sessions:", error);
    }
  }

  private async loadSessions() {
    try {
      const sessionsFile = path.join(this.storageDir, "sessions.json");
      const data = await fs.readFile(sessionsFile, "utf-8");
      this.sessions = JSON.parse(data);
    } catch (error) {
      // File doesn't exist or is invalid, start with empty sessions
      this.sessions = {};
    }
  }

  private async getNextSpecNumber(): Promise<string> {
    const specsDir = path.join(process.cwd(), "specs");

    try {
      await fs.mkdir(specsDir, { recursive: true });
      const entries = await fs.readdir(specsDir, { withFileTypes: true });

      // Find existing numbered directories
      const existingNumbers = entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .filter((name) => /^\d{3}_/.test(name))
        .map((name) => parseInt(name.substring(0, 3), 10))
        .filter((num) => !isNaN(num));

      const nextNumber =
        existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
      return String(nextNumber).padStart(3, "0");
    } catch (error) {
      console.error("Failed to determine next spec number:", error);
      return "001";
    }
  }

  async createNewSpecification({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) {
    const engine = createNewQuestionnaire(title, description);
    const session = engine.getSession();

    // Store session
    this.sessions[session.id] = session;
    await this.saveSessions();

    const currentQuestion = engine.getCurrentQuestion();
    const progress = engine.getProgress();

    return {
      content: [
        {
          type: "text",
          text: `🚀 **SpecCraft Session Started: ${title}**

**Session ID**: \`${session.id}\`
**Description**: ${description}
**Progress**: ${progress.current}/${progress.total} questions

---

## 🤖 **CLAUDE CODE: INTERACTIVE MODE**

I've started a specification session for "${title}". Now continue the conversation naturally with the user - no slash commands needed!

**First Question** (${currentQuestion?.category}):
${currentQuestion?.text}

**Instructions for Claude Code**:
1. **Ask this question naturally** in your response to the user
2. **Wait for their answer** in regular conversation
3. **When they respond**, call \`spec_answer\` with session ID "${session.id}" and their response
4. **Continue asking** the next questions returned by the system
5. **Keep it conversational** - no need to mention session IDs or commands to the user

**Remember**: Handle this as a natural conversation. The user doesn't need to know about the underlying session management.`,
        },
      ],
    };
  }

  async continueSpecification({ sessionId }: { sessionId: string }) {
    const session = this.sessions[sessionId];
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const engine = QuestionnaireEngine.fromSession(session);
    const currentQuestion = engine.getCurrentQuestion();
    const progress = engine.getProgress();

    if (engine.isComplete()) {
      return {
        content: [
          {
            type: "text",
            text: `✅ **Session Complete!**

**Feature**: ${session.featureTitle}
**Session ID**: \`${sessionId}\`
**Status**: Ready for specification generation

All questions have been answered. Generate the specification with:
\`/spec-generate ${sessionId}\`

Or validate completeness with AI:
\`/spec-validate-session ${sessionId}\``,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `📝 **Continuing SpecCraft Session**

**Feature**: ${session.featureTitle}
**Session ID**: \`${sessionId}\`
**Progress**: ${progress.current}/${progress.total} (${progress.percentage}%)

---

**Current Question** (${currentQuestion?.category}):
${currentQuestion?.text}

**Type**: ${currentQuestion?.type}
**Required**: ${currentQuestion?.required ? "Yes" : "No"}

To answer this question, use:
\`/spec-answer ${sessionId} "your answer here"\``,
        },
      ],
    };
  }

  async answerQuestion({
    sessionId,
    answer,
  }: {
    sessionId: string;
    answer: string | boolean | string[];
  }) {
    const session = this.sessions[sessionId];
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const engine = QuestionnaireEngine.fromSession(session);
    const currentQuestion = engine.getCurrentQuestion();

    if (!currentQuestion) {
      throw new Error("No current question to answer");
    }

    // Answer the question
    engine.answerCurrentQuestion(answer);

    // Update stored session
    this.sessions[sessionId] = engine.getSession();
    await this.saveSessions();

    const nextQuestion = engine.getCurrentQuestion();
    const progress = engine.getProgress();
    const isComplete = engine.isComplete();

    if (isComplete) {
      return {
        content: [
          {
            type: "text",
            text: `🎉 **Specification Complete!**

**Session**: ${sessionId}
**Final Progress**: ${progress.current}/${progress.total} questions answered

---

## 🤖 **CLAUDE CODE: SPECIFICATION READY**

Perfect! I have all the information needed to create a comprehensive specification for this feature.

**Instructions for Claude Code**:
1. **Tell the user** the specification gathering is complete
2. **Automatically call** \`spec_generate\` with session ID "${sessionId}" to create the specification
3. **Present the generated specification** to the user
4. **Recommend validation** with \`/speccraft:validate <spec-path>\`
5. **Then recommend build** with \`/speccraft:build <spec-path>\` once they're satisfied

**Remember**: Stop after generating the specification. Let the user validate and choose when to build.`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `✅ **Question Answered**

**Progress**: ${progress.current}/${progress.total} questions (${progress.percentage}%)

---

## 🤖 **CLAUDE CODE: CONTINUE CONVERSATION**

Great! Continue the conversation naturally with the user.

**Next Question** (${nextQuestion?.category}):
${nextQuestion?.text}

**Instructions for Claude Code**:
1. **Ask this question naturally** in your response to the user
2. **Wait for their answer** in regular conversation
3. **When they respond**, call \`spec_answer\` with session ID "${sessionId}" and their response
4. **Keep it conversational** - no need to mention session management

**Remember**: Keep the conversation flowing naturally!`,
        },
      ],
    };
  }

  async generateSpecification({ sessionId }: { sessionId: string }) {
    const session = this.sessions[sessionId];
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const engine = QuestionnaireEngine.fromSession(session);
    if (!engine.isComplete()) {
      const progress = engine.getProgress();
      throw new Error(
        `Session is not complete (${progress.percentage}% done). Continue answering questions first.`,
      );
    }

    const result = createSpecificationFromSession(session);

    // Create numbered spec directory
    const specNumber = await this.getNextSpecNumber();
    const featureName = session.featureTitle.toLowerCase().replace(/\s+/g, "_");
    const specDirName = `${specNumber}_${featureName}`;
    const specDir = path.join(process.cwd(), "specs", specDirName);

    // Create directory
    await fs.mkdir(specDir, { recursive: true });

    // Determine output path
    const specFileName = `${featureName}_spec.md`;
    const fullPath = path.join(specDir, specFileName);

    // Write specification to file
    await fs.writeFile(fullPath, result.markdown);

    return {
      content: [
        {
          type: "text",
          text: `📄 **Specification Generated!**

**Feature**: ${session.featureTitle}
**Directory**: \`${specDirName}\`
**File**: \`${fullPath}\`
**Completion**: ${result.completionPercentage}%

**Specification Preview**:
\`\`\`markdown
${result.markdown.substring(0, 500)}...
\`\`\`

The complete specification has been saved to: \`./specs/${specDirName}/${specFileName}\`

**Next Steps**:
1. **Review**: Check the specification file at \`./specs/${specDirName}/${specFileName}\`
2. **Validate**: Use \`/speccraft:validate ./specs/${specDirName}/${specFileName}\` to check quality
3. **Implement**: When ready, use \`/speccraft:build ./specs/${specDirName}/${specFileName}\` to start implementation

**Validation helps ensure** your specification is complete before beginning development!`,
        },
      ],
    };
  }

  async validateSpecification({
    filePath,
    sessionId,
  }: {
    filePath: string;
    sessionId?: string;
  }) {
    try {
      // Read the specification file
      const specContent = await fs.readFile(filePath, "utf-8");

      // Get session context if provided
      let session: QuestionnaireSession | undefined;
      if (sessionId && this.sessions[sessionId]) {
        session = this.sessions[sessionId];
      }

      // Generate validation prompt for Claude to analyze
      const validationPrompt =
        this.llmQuestioner.generateCompletenessValidationPrompt({
          featureTitle: session?.featureTitle || "Unknown Feature",
          featureDescription: session?.featureDescription || "",
          responses: session?.responses || [],
        });

      return {
        content: [
          {
            type: "text",
            text: `🔍 **Specification Validation**

**File**: \`${filePath}\`

**Specification Content**:
\`\`\`markdown
${specContent}
\`\`\`

---

${validationPrompt}

---

**Next Steps Based on Analysis**:
- If validation shows gaps, continue with more questions
- If comprehensive, proceed with: \`/code-from-spec ${filePath}\`
- Generate additional specifications as needed`,
          },
        ],
      };
    } catch (error) {
      throw new Error(
        `Failed to validate specification: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async getSessionStatus({ sessionId }: { sessionId: string }) {
    const session = this.sessions[sessionId];
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const engine = QuestionnaireEngine.fromSession(session);
    const progress = engine.getProgress();
    const currentQuestion = engine.getCurrentQuestion();

    const responsesSummary = session.responses
      .map(
        (r) =>
          `- ${r.questionId}: ${Array.isArray(r.value) ? r.value.join(", ") : String(r.value)}`,
      )
      .join("\n");

    return {
      content: [
        {
          type: "text",
          text: `📊 **Session Status**

**Feature**: ${session.featureTitle}
**Description**: ${session.featureDescription}
**Session ID**: \`${sessionId}\`
**Created**: ${new Date(session.createdAt).toLocaleString()}
**Updated**: ${new Date(session.updatedAt).toLocaleString()}

**Progress**: ${progress.current}/${progress.total} (${progress.percentage}%)
**Status**: ${engine.isComplete() ? "✅ Complete" : "📝 In Progress"}

${currentQuestion ? `**Current Question**: ${currentQuestion.text}` : ""}

**Responses So Far**:
${responsesSummary || "None yet"}

**Available Actions**:
- Continue: \`/spec-continue ${sessionId}\`
- Generate: \`/spec-generate ${sessionId}\` ${!engine.isComplete() ? "(complete first)" : ""}
- Follow-up: \`/spec-follow-up ${sessionId}\``,
        },
      ],
    };
  }

  async listSessions() {
    const sessionList = Object.values(this.sessions);

    if (sessionList.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `📝 **No Active Sessions**

No specification sessions found. Start a new one with:
\`/spec-new "Feature Title" "Feature description"\``,
          },
        ],
      };
    }

    const sessionSummaries = sessionList
      .map((session) => {
        const engine = QuestionnaireEngine.fromSession(session);
        const progress = engine.getProgress();
        return `- \`${session.id}\`: ${session.featureTitle} (${progress.percentage}% complete)`;
      })
      .join("\n");

    return {
      content: [
        {
          type: "text",
          text: `📝 **Active SpecCraft Sessions**

${sessionSummaries}

**Actions**:
- Continue session: \`/spec-continue <session-id>\`
- Get status: \`/spec-status <session-id>\`
- Generate spec: \`/spec-generate <session-id>\``,
        },
      ],
    };
  }

  async generateFollowUpQuestions({ sessionId }: { sessionId: string }) {
    const session = this.sessions[sessionId];
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (session.responses.length === 0) {
      throw new Error("No responses yet. Answer some questions first.");
    }

    const lastResponse = session.responses[session.responses.length - 1];

    const prompt = this.llmQuestioner.generateFollowUpQuestionsPrompt({
      featureTitle: session.featureTitle,
      featureDescription: session.featureDescription,
      responses: session.responses,
      lastResponse,
    });

    return {
      content: [
        {
          type: "text",
          text: `🤖 **AI-Generated Follow-up Questions**

${prompt}

---

**Note**: After reviewing the analysis above, you can:
- Continue with standard questions: \`/spec-continue ${sessionId}\`
- Consider the insights when answering future questions
- Generate specification when ready: \`/spec-generate ${sessionId}\``,
        },
      ],
    };
  }

  async createKeystoneProject({
    specPath,
    projectName,
    outputPath,
  }: {
    specPath: string;
    projectName?: string;
    outputPath?: string;
  }) {
    try {
      const reader = new SpecificationReader();
      const specification = await reader.readSpecification(specPath);

      const finalProjectName =
        projectName ||
        specification.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-");
      const finalOutputPath = outputPath || process.cwd();

      const generator = new KeystoneProjectGenerator();
      const projectPath = await generator.generateProject({
        projectName: finalProjectName,
        outputPath: finalOutputPath,
        specification,
      });

      return {
        content: [
          {
            type: "text",
            text: `🎉 **Keystone Project Created!**

**Feature**: ${specification.title}
**Project**: ${finalProjectName}
**Location**: \`${projectPath}\`

**Generated Structure**:
- ✅ Cloned o8u-starter template
- ✅ Updated package.json and README
- ✅ Generated Keystone schema
- ✅ Created implementation notes
- ✅ Copied original specification

**Next Steps**:
1. \`pnpm install\`
2. Set up environment variables
3. Review \`schema.ts\` and customize
4. Follow \`docs/IMPLEMENTATION.md\`

**Key Files**:
- \`schema.ts\` - Database models
- \`docs/IMPLEMENTATION.md\` - Development roadmap
- \`${specPath}\` - Original spec

Ready to start development! 🚀`,
          },
        ],
      };
    } catch (error) {
      throw new Error(
        `Failed to create Keystone project: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }


  async analyzeSpecification({ specPath }: { specPath: string }) {
    try {
      const reader = new SpecificationReader();
      const specification = await reader.readSpecification(specPath);

      const complexity = this.calculateComplexity(specification);
      const recommendations = this.generateRecommendations(specification);

      return {
        content: [
          {
            type: "text",
            text: `🔍 **Specification Analysis**

**Feature**: ${specification.title}
**Description**: ${specification.description}

**Complexity Assessment**: ${complexity.level} (${complexity.score}/10)
${complexity.factors.map((factor) => `- ${factor}`).join("\n")}

**Implementation Breakdown**:
- **Core Features**: ${specification.functionalRequirements.coreFeatures.length} features
- **User Workflows**: ${specification.functionalRequirements.userWorkflows.length} workflows
- **Technical Requirements**: ${specification.technicalSpecifications.architecture.length} architectural items
- **UI Components**: ${specification.uiRequirements.interfaces.length} interface elements
- **Integrations**: ${specification.technicalSpecifications.integrations.length} external integrations

**Development Recommendations**:
${recommendations.map((rec) => `- ${rec}`).join("\n")}

**Estimated Timeline**: ${complexity.estimatedDays} days
**Team Size**: ${complexity.recommendedTeamSize} developers

**Available Actions**:
- Create new Keystone project: \`/speccraft:keystone-project "${specPath}"\`
- Generate code for existing project: \`/speccraft:generate-code "${specPath}"\``,
          },
        ],
      };
    } catch (error) {
      throw new Error(
        `Failed to analyze specification: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private calculateComplexity(spec: ParsedSpecification): {
    level: string;
    score: number;
    factors: string[];
    estimatedDays: number;
    recommendedTeamSize: number;
  } {
    let score = 0;
    const factors: string[] = [];

    // Core features complexity
    const coreFeatures = spec.functionalRequirements.coreFeatures.length;
    if (coreFeatures > 10) {
      score += 3;
      factors.push(`High number of core features (${coreFeatures})`);
    } else if (coreFeatures > 5) {
      score += 2;
      factors.push(`Moderate number of core features (${coreFeatures})`);
    } else {
      score += 1;
      factors.push(`Simple feature set (${coreFeatures})`);
    }

    // Integrations complexity
    const integrations = spec.technicalSpecifications.integrations.length;
    if (integrations > 5) {
      score += 3;
      factors.push(`Many external integrations (${integrations})`);
    } else if (integrations > 2) {
      score += 2;
      factors.push(`Some external integrations (${integrations})`);
    }

    // UI complexity
    const uiComponents = spec.uiRequirements.interfaces.length;
    if (uiComponents > 15) {
      score += 2;
      factors.push(`Complex UI requirements (${uiComponents} components)`);
    } else if (uiComponents > 8) {
      score += 1;
      factors.push(`Moderate UI complexity (${uiComponents} components)`);
    }

    // Business rules complexity
    const businessRules = spec.functionalRequirements.businessRules.length;
    if (businessRules > 8) {
      score += 2;
      factors.push(`Complex business logic (${businessRules} rules)`);
    }

    const level =
      score <= 3
        ? "Simple"
        : score <= 6
          ? "Moderate"
          : score <= 8
            ? "Complex"
            : "Very Complex";
    const estimatedDays = Math.ceil(score * 2.5 + coreFeatures * 1.5);
    const recommendedTeamSize = score <= 4 ? 1 : score <= 7 ? 2 : 3;

    return { level, score, factors, estimatedDays, recommendedTeamSize };
  }

  private generateRecommendations(spec: ParsedSpecification): string[] {
    const recommendations: string[] = [];

    if (spec.functionalRequirements.coreFeatures.length > 8) {
      recommendations.push(
        "Consider breaking into multiple development phases",
      );
    }

    if (spec.technicalSpecifications.integrations.length > 3) {
      recommendations.push("Plan integration testing strategy early");
      recommendations.push("Consider using API mocking for development");
    }

    if (spec.uiRequirements.interfaces.length > 10) {
      recommendations.push("Create a component library first");
      recommendations.push("Design system planning recommended");
    }

    if (spec.functionalRequirements.businessRules.length > 5) {
      recommendations.push("Implement comprehensive unit testing");
      recommendations.push("Consider rule engine for complex business logic");
    }

    if (spec.technicalSpecifications.security.length > 0) {
      recommendations.push("Security review before deployment");
    }

    if (recommendations.length === 0) {
      recommendations.push("Straightforward implementation expected");
      recommendations.push("Start with MVP and iterate");
    }

    return recommendations;
  }

  async buildFromSpecification({
    specPath,
    projectName,
    outputPath,
  }: {
    specPath: string;
    projectName?: string;
    outputPath?: string;
  }) {
    try {
      const reader = new SpecificationReader();
      const specification = await reader.readSpecification(specPath);

      const workingDirectory = outputPath || process.cwd();
      const projectType = await this.detectProjectType(workingDirectory);

      if (projectType === "empty" || projectType === "unknown") {
        // Create new Keystone project
        const finalProjectName =
          projectName ||
          specification.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-");
        const generator = new KeystoneProjectGenerator();
        const projectPath = await generator.generateProject({
          projectName: ".", // Use current directory instead of creating subfolder
          outputPath: workingDirectory,
          specification,
        });

        // Generate implementation guidance
        const guidance =
          this.guidanceProvider.generateImplementationGuidance(specification);

        return {
          content: [
            {
              type: "text",
              text: `🎉 **New Keystone Project Created!**

**Decision**: No existing project detected - created new Keystone.js application
**Feature**: ${specification.title}
**Location**: Current directory (\`${workingDirectory}\`)

**Generated Structure**:
- ✅ Cloned o8u-starter template
- ✅ Updated package.json and README
- ✅ Created implementation roadmap
- ✅ Copied original specification

---

## 🚀 **CLAUDE CODE: IMPLEMENT THIS FEATURE NOW**

**IMMEDIATE NEXT STEPS - Execute these commands:**

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Use the SpecCraft MCP tools to get implementation details:**
   - Use \`/spec-fetch-docs fields/text\` to understand field types
   - Use \`/spec-fetch-docs guides/schemas\` for schema patterns
   - Use \`/spec-fetch-example blog\` for reference implementations

4. **Implement the schema in \`schema.ts\`:**
   - Read the specification in \`./SPECIFICATION.md\`
   - Replace the basic schema with entities from the specification
   - Follow Keystone.js field type patterns

5. **Key Implementation Areas:**
${this.formatImplementationInstructions(guidance, specification)}

6. **Test the implementation:**
   \`\`\`bash
   npm run dev
   \`\`\`

**Remember**: Use the SpecCraft MCP tools (\`/spec-fetch-docs\` and \`/spec-fetch-example\`) whenever you need specific Keystone.js documentation during implementation.

Ready to start implementation! 🚀`,
            },
          ],
        };
      } else {
        // Provide guidance for existing project
        const guidance =
          this.guidanceProvider.generateImplementationGuidance(specification);

        return {
          content: [
            {
              type: "text",
              text: `🎯 **Implementation Guidance for Existing ${projectType.toUpperCase()} Project**

**Decision**: Detected existing ${projectType} project - providing implementation guidance
**Feature**: ${specification.title}
**Target**: \`${workingDirectory}\`

---

## 🚀 **CLAUDE CODE: IMPLEMENT THIS FEATURE NOW**

**IMMEDIATE NEXT STEPS:**

1. **Analyze the existing project structure:**
   - Read package.json to understand current dependencies
   - Examine existing schema files (schema.ts, schema.js)
   - Review current entities and relationships

2. **Use SpecCraft MCP tools for implementation guidance:**
   - Use \`/spec-fetch-docs guides/schemas\` for schema patterns
   - Use \`/spec-fetch-docs fields/\` for specific field types
   - Use \`/spec-fetch-example blog\` for reference implementations

3. **Implementation Steps:**
${this.formatImplementationSteps(projectType, specification)}

4. **Key Implementation Areas:**
${this.formatImplementationInstructions(guidance, specification)}

5. **Test the implementation:**
   \`\`\`bash
   npm run dev
   \`\`\`

**Remember**: Use the SpecCraft MCP tools (\`/spec-fetch-docs\` and \`/spec-fetch-example\`) whenever you need specific ${projectType} documentation during implementation.

Ready to implement! ⚡`,
            },
          ],
        };
      }
    } catch (error) {
      throw new Error(
        `Failed to build from specification: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async detectProjectType(
    directory: string,
  ): Promise<"keystone" | "nextjs" | "react" | "empty" | "unknown"> {
    try {
      // Check if directory is empty or nearly empty
      const entries = await fs.readdir(directory);
      const nonHiddenEntries = entries.filter(
        (entry) => !entry.startsWith("."),
      );

      if (nonHiddenEntries.length === 0) {
        return "empty";
      }

      // Check for package.json
      const packageJsonPath = path.join(directory, "package.json");
      if (!(await this.fileExists(packageJsonPath))) {
        return "empty";
      }

      const packageContent = await fs.readFile(packageJsonPath, "utf-8");
      const packageJson = JSON.parse(packageContent);

      const dependencies = {
        ...(packageJson.dependencies || {}),
        ...(packageJson.devDependencies || {}),
      };

      // Detect project type based on dependencies
      if (
        dependencies["@keystone-6/core"] ||
        dependencies["@keystone-next/keystone"]
      ) {
        return "keystone";
      }

      if (dependencies["next"]) {
        return "nextjs";
      }

      if (dependencies["react"] && !dependencies["next"]) {
        return "react";
      }

      return "unknown";
    } catch (error) {
      return "empty";
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private generateIntegrationInstructions(
    projectType: string,
    spec: ParsedSpecification,
  ): string {
    const featureName = spec.title.toLowerCase().replace(/\s+/g, "_");

    switch (projectType) {
      case "keystone":
        return `- Import schema: Add \`${this.pascalCase(featureName)}\` to your main \`schema.ts\`
- Admin UI: Generated admin components in \`admin/components/\`
- API hooks: Business logic hooks in \`api/${featureName}Hooks.ts\``;

      case "nextjs":
        return `- Add page route: Import component in your routing structure
- API endpoints: Generated in \`pages/api/${featureName}/\`
- Components: Available in \`components/${featureName}/\``;

      case "react":
        return `- Import component: Add to your component library
- Custom hooks: Available in \`src/hooks/use${this.pascalCase(featureName)}.ts\`
- Types: Generated TypeScript definitions`;

      default:
        return `- Review generated files in the project structure
- Follow implementation plan in generated documentation
- Integrate according to your project patterns`;
    }
  }

  private formatKeystoneGuidance(guidance: KeystoneGuidance): string {
    const sections: string[] = [];

    // Schema guidance
    if (guidance.schemas.length > 0) {
      const schema = guidance.schemas[0];
      sections.push(`**Schema Structure**:
${schema.purpose}

**Recommended Fields**:
${schema.fields.map((field) => `- \`${field.name}\`: ${field.type} - ${field.purpose}`).join("\n")}

**Implementation Pattern**:
\`\`\`typescript
${schema.example}
\`\`\``);
    }

    // Key patterns
    if (guidance.patterns.length > 0) {
      sections.push(`**Implementation Patterns**:
${guidance.patterns.map((pattern) => `- **${pattern.name}**: ${pattern.description}`).join("\n")}`);
    }

    // Hook examples
    if (guidance.hooks.length > 0) {
      sections.push(`**Essential Hooks**:
${guidance.hooks
  .slice(0, 2)
  .map((hook) => `- **${hook.type}**: ${hook.purpose}`)
  .join("\n")}`);
    }

    return sections.join("\n\n");
  }

  private formatImplementationInstructions(
    guidance: KeystoneGuidance,
    specification: ParsedSpecification,
  ): string {
    const instructions: string[] = [];

    // Schema entities to implement
    if (guidance.schemas.length > 0) {
      instructions.push(`   **📋 Schema Entities to Create:**`);
      guidance.schemas.forEach((schema, index) => {
        const entityName =
          index === 0
            ? specification.title
            : `${specification.title}${index + 1}`;
        instructions.push(`   - **${entityName}**: ${schema.purpose}`);
        instructions.push(
          `     Fields: ${schema.fields.map((f) => f.name).join(", ")}`,
        );
      });
    }

    // Key relationships
    if (specification.functionalRequirements.userWorkflows.length > 0) {
      instructions.push(`   **🔗 Key Relationships:**`);
      instructions.push(
        `   - User → ${specification.title} (ownership/association)`,
      );
      instructions.push(
        `   - Implement workflow: ${specification.functionalRequirements.userWorkflows[0]}`,
      );
    }

    // Access control
    instructions.push(`   **🔒 Access Control:**`);
    instructions.push(`   - Implement role-based permissions`);
    instructions.push(`   - Secure admin interface access`);

    // Business logic
    if (specification.functionalRequirements.businessRules.length > 0) {
      instructions.push(`   **⚙️ Business Logic:**`);
      specification.functionalRequirements.businessRules
        .slice(0, 3)
        .forEach((rule) => {
          instructions.push(`   - ${rule}`);
        });
    }

    return instructions.join("\n");
  }

  private formatImplementationSteps(
    projectType: string,
    spec: ParsedSpecification,
  ): string {
    const featureName = spec.title;
    const steps: string[] = [];

    switch (projectType) {
      case "keystone":
        steps.push(
          `1. **Define Schema**: Create ${featureName} list in schema.ts`,
          `2. **Add Fields**: Implement ${spec.functionalRequirements.coreFeatures.length} core features as fields`,
          `3. **Set Up Relationships**: Connect to User and other relevant entities`,
          `4. **Configure Access Control**: Implement appropriate permissions`,
          `5. **Add Business Logic**: Use hooks for ${spec.functionalRequirements.businessRules.length} business rules`,
          `6. **Customize Admin UI**: Enhance the admin interface as needed`,
        );
        break;

      case "nextjs":
        steps.push(
          `1. **Create Pages**: Add routes for ${featureName} functionality`,
          `2. **API Routes**: Implement backend endpoints`,
          `3. **Components**: Build React components for UI`,
          `4. **State Management**: Add context or state handling`,
          `5. **Integration**: Connect components to API routes`,
        );
        break;

      case "react":
        steps.push(
          `1. **Create Components**: Build ${featureName} React components`,
          `2. **Custom Hooks**: Implement data fetching and state logic`,
          `3. **Type Definitions**: Add TypeScript interfaces`,
          `4. **Integration**: Connect to your existing architecture`,
        );
        break;

      default:
        steps.push(
          `1. **Plan Architecture**: Design how ${featureName} fits your system`,
          `2. **Create Modules**: Implement core functionality`,
          `3. **Add Tests**: Cover ${spec.functionalRequirements.coreFeatures.length} core features`,
          `4. **Documentation**: Document API and usage`,
        );
    }

    return steps.join("\n");
  }

  private formatFrameworkGuidance(
    projectType: string,
    spec: ParsedSpecification,
  ): string {
    const featureName = spec.title.replace(/\s+/g, "");

    switch (projectType) {
      case "nextjs":
        return `**Next.js Implementation Approach**:

**File Structure**:
- \`pages/${featureName.toLowerCase()}/index.tsx\` - Main feature page
- \`pages/api/${featureName.toLowerCase()}/\` - API endpoints
- \`components/${featureName}/\` - React components
- \`hooks/use${featureName}.ts\` - Custom hooks

**Key Patterns**:
- Use getServerSideProps for dynamic data
- Implement API routes for backend logic
- Create reusable components
- Add proper TypeScript types`;

      case "react":
        return `**React Implementation Approach**:

**Component Structure**:
- \`src/components/${featureName}/\` - Main components
- \`src/hooks/use${featureName}.ts\` - Custom hooks
- \`src/types/${featureName}.ts\` - TypeScript definitions

**Key Patterns**:
- Use custom hooks for data management
- Implement proper error boundaries
- Add loading and error states
- Follow your existing component patterns`;

      default:
        return `**General Implementation Notes**:
- Follow your existing project patterns
- Implement ${spec.functionalRequirements.coreFeatures.length} core features
- Add proper error handling
- Include comprehensive testing`;
    }
  }

  async lookupDocumentation({ topic }: { topic: string }) {
    try {
      const documentation = await this.docProvider.lookup(topic);

      if (!documentation) {
        const availableTopics = this.docProvider.getAllTopics();
        const suggestions = availableTopics
          .filter((t) => t.toLowerCase().includes(topic.toLowerCase()))
          .slice(0, 5);

        return {
          content: [
            {
              type: "text",
              text: `❓ **Documentation Not Found**

**Topic**: "${topic}"

${
  suggestions.length > 0
    ? `**Similar Topics**:
${suggestions.map((s) => `- \`${s}\``).join("\n")}

**Usage**: \`/speccraft:help <topic>\``
    : "**Available Topics**:\nUse `/speccraft:help examples` to see all available documentation topics."
}

**Popular Topics**:
- \`text\` - Text field documentation
- \`relationship\` - Relationship field documentation
- \`user-owned\` - User-owned content pattern
- \`audit-trail\` - Audit trail implementation
- \`list-view\` - Admin list view customization

**Official Documentation**:
For the most up-to-date documentation, refer to:
- [Keystone.js Docs](https://github.com/keystonejs/keystone/tree/main/docs/content/docs)
- [Keystone.js Examples](https://github.com/keystonejs/keystone/tree/main/examples)

**Claude Code Integration**:
Ask me to "look up the latest Keystone.js documentation for ${topic}" and I'll fetch it from the official sources.`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `📚 **${documentation.topic}**

${documentation.content}

**Examples**:
${documentation.examples
  .map(
    (example) => `\`\`\`typescript
${example}
\`\`\``,
  )
  .join("\n\n")}

${
  documentation.relatedTopics.length > 0
    ? `**Related Topics**:
${documentation.relatedTopics.map((topic) => `- \`/speccraft:help ${topic}\``).join("\n")}`
    : ""
}

**Official Resources**:
For the latest documentation and examples:
- [Keystone.js Field Types](https://github.com/keystonejs/keystone/tree/main/docs/content/docs/fields)
- [Keystone.js Examples](https://github.com/keystonejs/keystone/tree/main/examples)

**Need More Help?**:
Ask Claude Code to "fetch the latest Keystone.js documentation for ${topic}" to get the most current information from the official sources.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ **Documentation Lookup Error**

Sorry, I encountered an error while looking up documentation for "${topic}".

**Error**: ${error instanceof Error ? error.message : String(error)}

**Fallback Options**:
- Try \`/speccraft:help text\` for text field documentation
- Try \`/speccraft:help relationship\` for relationship documentation  
- Ask Claude Code to "fetch the latest Keystone.js documentation for ${topic}"

**Available Topics**:
${this.docProvider.getAllTopics().slice(0, 10).map(t => `- \`${t}\``).join('\n')}`,
          },
        ],
      };
    }
  }

  async fetchKeystoneDocumentation({
    docPath,
    section,
  }: {
    docPath: string;
    section?: string;
  }) {
    try {
      const documentation = await this.docProvider.fetchFromGitHub(
        docPath,
        docPath,
      );

      if (!documentation) {
        return {
          content: [
            {
              type: "text",
              text: `❌ **Documentation Not Found**

**Document Path**: ${docPath}
**Error**: Unable to fetch documentation from Keystone.js repository

**Possible Reasons**:
- Document path may not exist
- Network connectivity issues
- GitHub API rate limiting

**Suggested Actions**:
1. Check if the document path is correct
2. Try alternative paths like:
   - \`fields/text\` for text field documentation
   - \`guides/schema\` for schema guides
   - \`guides/access-control\` for access control
3. Retry the request after a moment`,
            },
          ],
        };
      }

      let content = documentation.content;

      // If a specific section is requested, try to extract it
      if (section) {
        const sectionRegex = new RegExp(
          `#{1,6}\\s*${section}[\\s\\S]*?(?=#{1,6}|$)`,
          "i",
        );
        const sectionMatch = content.match(sectionRegex);
        if (sectionMatch) {
          content = sectionMatch[0];
        }
      }

      return {
        content: [
          {
            type: "text",
            text: `📚 **Keystone.js Documentation: ${documentation.topic}**

${section ? `**Section**: ${section}\n\n` : ""}**Source**: ${documentation.source}

---

${content}

${
  documentation.examples.length > 0
    ? `

**Code Examples**:
${documentation.examples
  .map(
    (example, i) => `
**Example ${i + 1}**:
\`\`\`
${example}
\`\`\`
`,
  )
  .join("\n")}`
    : ""
}

${
  documentation.relatedTopics.length > 0
    ? `

**Related Topics**: ${documentation.relatedTopics.join(", ")}`
    : ""
}

**Alternative Sources**:
If the main docs are insufficient, also check:
- Examples: https://github.com/keystonejs/keystone/tree/main/examples
- API Docs: https://github.com/keystonejs/keystone/tree/main/docs/content/docs/apis

**Integration**: Use the fetched documentation to write current, accurate Keystone.js code.`,
          },
        ],
      };
    } catch (error) {
      throw new Error(
        `Failed to provide documentation URL: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async fetchKeystoneExample({
    exampleName,
    filePath,
  }: {
    exampleName: string;
    filePath?: string;
  }) {
    try {
      const examplePath = filePath ? `${exampleName}/${filePath}` : exampleName;
      const example = await this.docProvider.getExample(exampleName, filePath);

      if (!example) {
        return {
          content: [
            {
              type: "text",
              text: `❌ **Example Not Found**

**Example**: ${exampleName}
${filePath ? `**File**: ${filePath}` : ""}
**Error**: Unable to fetch example from Keystone.js repository

**Available Examples**:
- \`blog\` - Basic blog with posts and authors
- \`ecommerce\` - E-commerce with products and orders
- \`auth\` - Authentication and user management
- \`custom-field\` - Custom field implementations
- \`roles\` - Role-based access control
- \`extend-graphql-schema\` - GraphQL schema extensions

**Suggested Actions**:
1. Check if the example name is correct
2. For specific files, try: \`schema.ts\`, \`keystone.ts\`, or \`auth.ts\`
3. Browse the examples at: https://github.com/keystonejs/keystone/tree/main/examples`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `🔍 **Keystone.js Example: ${example.topic}**

**Source**: ${example.source}

---

${example.content}

**Implementation Notes**:
- Use this as a reference for implementation patterns
- Adapt the code to match your specification requirements
- Pay attention to field types, relationships, and access control patterns
- Consider the project structure and organization

**Next Steps**:
1. Analyze the patterns used in this example
2. Extract relevant code snippets for your feature
3. Adapt the implementation to your specification
4. Test the implementation thoroughly
- \`custom-admin-ui\` - Admin UI customizations
- \`access-control\` - Access control patterns
- \`hooks\` - Hook implementations
- \`document-field\` - Rich text content
- \`rest-api\` - REST API setup

**Common Files to Check**:
- \`schema.ts\` - Schema definitions
- \`keystone.ts\` - Main configuration
- \`auth.ts\` - Authentication setup
- \`access.ts\` - Access control rules
- \`admin/\` - Custom admin components

**Integration**: Use the example code as a reference for implementing similar functionality in your project.`,
          },
        ],
      };
    } catch (error) {
      throw new Error(
        `Failed to provide example URL: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private pascalCase(str: string): string {
    return str
      .replace(/(?:^|\s|_)(\w)/g, (_, char) => char.toUpperCase())
      .replace(/[\s_]/g, "");
  }
}
