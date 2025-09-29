import { QuestionResponse, SpecificationTemplate } from "./types";

export class MarkdownGenerator {
  private responses: Map<string, QuestionResponse>;

  constructor(responses: QuestionResponse[]) {
    this.responses = new Map(responses.map((r) => [r.questionId, r]));
  }

  private getResponseValue(questionId: string): string {
    const response = this.responses.get(questionId);
    if (!response) return "";

    if (Array.isArray(response.value)) {
      return response.value.join(", ");
    }

    return String(response.value);
  }

  private formatSection(title: string, content: string): string {
    if (!content.trim()) return "";
    return `## ${title}\n\n${content.trim()}\n\n`;
  }

  private parseListItems(content: string): string[] {
    if (!content) return [];

    // Split by common delimiters and clean up
    const items = content
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .map((item) => item.replace(/^[-•*]\s*/, "")); // Remove existing bullet points

    return items;
  }

  private formatUserStories(): string {
    const targetUsers = this.getResponseValue("target-users");
    const coreFunction = this.getResponseValue("core-functionality");
    const businessValue = this.getResponseValue("business-value");

    if (!targetUsers && !coreFunction) return "";

    const stories: string[] = [];

    // Generate user stories from the responses
    if (targetUsers && coreFunction) {
      const userTypes = this.parseListItems(targetUsers);
      const functions = this.parseListItems(coreFunction);

      // Create user stories by combining user types with functions
      userTypes.forEach((userType) => {
        functions.forEach((func) => {
          stories.push(
            `As a ${userType.toLowerCase()}, I want ${func.toLowerCase()} so that ${businessValue || "I can achieve my goals"}.`,
          );
        });
      });
    }

    if (stories.length === 0 && coreFunction) {
      // Fallback: create basic user stories from core functionality
      const functions = this.parseListItems(coreFunction);
      functions.forEach((func) => {
        stories.push(
          `As a user, I want ${func.toLowerCase()} so that ${businessValue || "I can achieve my goals"}.`,
        );
      });
    }

    return stories.map((story) => `- ${story}`).join("\n");
  }

  private formatFunctionalRequirements(): string {
    const requirements: string[] = [];

    const coreFunction = this.getResponseValue("core-functionality");
    const userInteractions = this.getResponseValue("user-interactions");
    const dataRequirements = this.getResponseValue("data-requirements");
    const integrations = this.getResponseValue("integrations-needed");

    if (coreFunction) {
      const functions = this.parseListItems(coreFunction);
      requirements.push(
        ...functions.map((f) => `The system must ${f.toLowerCase()}`),
      );
    }

    if (userInteractions) {
      requirements.push(`User interaction flow: ${userInteractions}`);
    }

    if (dataRequirements) {
      requirements.push(`Data requirements: ${dataRequirements}`);
    }

    if (integrations) {
      requirements.push(`External integrations: ${integrations}`);
    }

    return requirements.map((req) => `- ${req}`).join("\n");
  }

  private formatEdgeCases(): string {
    const edgeCases: string[] = [];

    const errorScenarios = this.getResponseValue("error-scenarios");
    const edgeCasesList = this.getResponseValue("edge-cases");
    const validationRules = this.getResponseValue("validation-rules");

    if (errorScenarios) {
      const errors = this.parseListItems(errorScenarios);
      edgeCases.push(...errors.map((e) => `Error handling: ${e}`));
    }

    if (edgeCasesList) {
      const cases = this.parseListItems(edgeCasesList);
      edgeCases.push(...cases);
    }

    if (validationRules) {
      edgeCases.push(`Input validation: ${validationRules}`);
    }

    return edgeCases.map((edge) => `- ${edge}`).join("\n");
  }

  private formatUiUxRequirements(): string {
    const requirements: string[] = [];

    const uiRequirements = this.getResponseValue("ui-requirements");
    const responsiveDesign = this.getResponseValue("responsive-design");
    const accessibility = this.getResponseValue("accessibility-requirements");

    if (uiRequirements) {
      requirements.push(uiRequirements);
    }

    if (responsiveDesign === "true") {
      requirements.push("Must be responsive and work on mobile devices");
    }

    if (accessibility) {
      requirements.push(`Accessibility requirements: ${accessibility}`);
    }

    return requirements.join("\n\n");
  }

  private formatTechnicalConstraints(): string {
    const constraints: string[] = [];

    const performance = this.getResponseValue("performance-requirements");
    const scalability = this.getResponseValue("scalability-needs");
    const authentication = this.getResponseValue("authentication-required");
    const securityReqs = this.getResponseValue("security-requirements");

    if (performance) {
      constraints.push(`Performance: ${performance}`);
    }

    if (scalability) {
      constraints.push(`Scalability: ${scalability}`);
    }

    if (authentication && authentication !== "No authentication needed") {
      constraints.push(`Authentication: ${authentication}`);
    }

    if (securityReqs) {
      constraints.push(`Security: ${securityReqs}`);
    }

    return constraints.map((constraint) => `- ${constraint}`).join("\n");
  }

  private formatAcceptanceCriteria(): string {
    const criteria: string[] = [];

    const successCriteria = this.getResponseValue("success-criteria");
    const coreFunction = this.getResponseValue("core-functionality");

    if (successCriteria) {
      const success = this.parseListItems(successCriteria);
      criteria.push(...success.map((s) => `Success measure: ${s}`));
    }

    if (coreFunction) {
      const functions = this.parseListItems(coreFunction);
      criteria.push(
        ...functions.map((f) => `Feature must successfully ${f.toLowerCase()}`),
      );
    }

    // Add standard acceptance criteria
    criteria.push("All user stories must be implemented and tested");
    criteria.push(
      "Feature must pass all security and performance requirements",
    );
    criteria.push("User interface must be responsive and accessible");

    return criteria.map((criterion) => `- ${criterion}`).join("\n");
  }

  private formatDependencies(): string {
    const dependencies: string[] = [];

    const featureDeps = this.getResponseValue("feature-dependencies");
    const integrations = this.getResponseValue("integrations-needed");
    const timeline = this.getResponseValue("timeline-constraints");

    if (featureDeps) {
      dependencies.push(`Feature dependencies: ${featureDeps}`);
    }

    if (integrations) {
      dependencies.push(`External service dependencies: ${integrations}`);
    }

    if (timeline) {
      dependencies.push(`Timeline constraints: ${timeline}`);
    }

    return dependencies.map((dep) => `- ${dep}`).join("\n");
  }

  public generateMarkdown(featureTitle: string): string {
    const overview = this.getResponseValue("feature-overview");
    const userStories = this.formatUserStories();
    const functionalReqs = this.formatFunctionalRequirements();
    const edgeCases = this.formatEdgeCases();
    const uiUxReqs = this.formatUiUxRequirements();
    const technicalConstraints = this.formatTechnicalConstraints();
    const acceptanceCriteria = this.formatAcceptanceCriteria();
    const dependencies = this.formatDependencies();

    let markdown = `# Feature: ${featureTitle}\n\n`;

    markdown += this.formatSection("Overview", overview);
    markdown += this.formatSection("User Stories", userStories);
    markdown += this.formatSection("Functional Requirements", functionalReqs);
    markdown += this.formatSection("Edge Cases", edgeCases);
    markdown += this.formatSection("UI/UX Requirements", uiUxReqs);
    markdown += this.formatSection(
      "Technical Constraints",
      technicalConstraints,
    );
    markdown += this.formatSection("Acceptance Criteria", acceptanceCriteria);
    markdown += this.formatSection("Dependencies", dependencies);

    // Add metadata footer
    markdown += "---\n\n";
    markdown += `*Generated by SpecCraft on ${new Date().toISOString().split("T")[0]}*\n`;

    return markdown;
  }

  public generateSpecificationTemplate(): SpecificationTemplate {
    return {
      overview: this.getResponseValue("feature-overview"),
      userStories: this.formatUserStories()
        .split("\n")
        .filter((s) => s.trim()),
      functionalRequirements: this.formatFunctionalRequirements()
        .split("\n")
        .filter((s) => s.trim()),
      edgeCases: this.formatEdgeCases()
        .split("\n")
        .filter((s) => s.trim()),
      uiUxRequirements: [this.formatUiUxRequirements()].filter((s) => s.trim()),
      technicalConstraints: this.formatTechnicalConstraints()
        .split("\n")
        .filter((s) => s.trim()),
      acceptanceCriteria: this.formatAcceptanceCriteria()
        .split("\n")
        .filter((s) => s.trim()),
      dependencies: this.formatDependencies()
        .split("\n")
        .filter((s) => s.trim()),
    };
  }
}
