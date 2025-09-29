import fs from 'fs/promises';
import path from 'path';

export interface ParsedSpecification {
  title: string;
  description: string;
  featureOverview: {
    businessValue: string;
    targetUsers: string;
    useCases: string[];
  };
  functionalRequirements: {
    coreFeatures: string[];
    userWorkflows: string[];
    businessRules: string[];
  };
  technicalSpecifications: {
    architecture: string[];
    performance: string[];
    security: string[];
    integrations: string[];
  };
  uiRequirements: {
    interfaces: string[];
    responsive: string[];
    accessibility: string[];
    userFlows: string[];
  };
  implementation: {
    guidelines: string[];
    testing: string[];
    deployment: string[];
  };
  rawContent: string;
}

export class SpecificationReader {
  async readSpecification(filePath: string): Promise<ParsedSpecification> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return this.parseSpecification(content, filePath);
    } catch (error) {
      throw new Error(`Failed to read specification: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private parseSpecification(content: string, filePath: string): ParsedSpecification {
    const lines = content.split('\n');
    
    // Extract title from first heading or filename
    const title = this.extractTitle(lines, filePath);
    const description = this.extractDescription(lines);
    
    return {
      title,
      description,
      featureOverview: this.extractFeatureOverview(content),
      functionalRequirements: this.extractFunctionalRequirements(content),
      technicalSpecifications: this.extractTechnicalSpecifications(content),
      uiRequirements: this.extractUIRequirements(content),
      implementation: this.extractImplementation(content),
      rawContent: content,
    };
  }

  private extractTitle(lines: string[], filePath: string): string {
    // Look for first # heading
    for (const line of lines) {
      const match = line.match(/^#\s+(.+)$/);
      if (match) {
        return match[1].trim();
      }
    }
    
    // Fallback to filename
    const filename = path.basename(filePath, path.extname(filePath));
    return filename.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  private extractDescription(lines: string[]): string {
    let foundTitle = false;
    for (const line of lines) {
      if (line.match(/^#\s+/)) {
        foundTitle = true;
        continue;
      }
      
      if (foundTitle && line.trim() && !line.match(/^#+\s/)) {
        return line.trim();
      }
    }
    
    return '';
  }

  private extractSection(content: string, sectionPattern: RegExp): string[] {
    const sections = content.split(/^#+\s/m);
    
    for (const section of sections) {
      if (sectionPattern.test(section)) {
        return this.extractListItems(section);
      }
    }
    
    return [];
  }

  private extractListItems(text: string): string[] {
    const items: string[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const match = line.match(/^[-*+]\s+(.+)$/);
      if (match) {
        items.push(match[1].trim());
      }
    }
    
    return items;
  }

  private extractFeatureOverview(content: string): ParsedSpecification['featureOverview'] {
    const businessValue = this.extractFieldValue(content, /business\s+value|objectives?/i);
    const targetUsers = this.extractFieldValue(content, /target\s+users?|users?/i);
    const useCases = this.extractSection(content, /use\s+cases?|scenarios?/i);
    
    return {
      businessValue,
      targetUsers,
      useCases,
    };
  }

  private extractFunctionalRequirements(content: string): ParsedSpecification['functionalRequirements'] {
    return {
      coreFeatures: this.extractSection(content, /functional\s+requirements?|core\s+features?/i),
      userWorkflows: this.extractSection(content, /user\s+workflows?|workflows?/i),
      businessRules: this.extractSection(content, /business\s+rules?|logic/i),
    };
  }

  private extractTechnicalSpecifications(content: string): ParsedSpecification['technicalSpecifications'] {
    return {
      architecture: this.extractSection(content, /technical\s+specifications?|architecture/i),
      performance: this.extractSection(content, /performance/i),
      security: this.extractSection(content, /security/i),
      integrations: this.extractSection(content, /integrations?/i),
    };
  }

  private extractUIRequirements(content: string): ParsedSpecification['uiRequirements'] {
    return {
      interfaces: this.extractSection(content, /ui|user\s+interface/i),
      responsive: this.extractSection(content, /responsive/i),
      accessibility: this.extractSection(content, /accessibility/i),
      userFlows: this.extractSection(content, /user\s+flows?|ux/i),
    };
  }

  private extractImplementation(content: string): ParsedSpecification['implementation'] {
    return {
      guidelines: this.extractSection(content, /implementation|development/i),
      testing: this.extractSection(content, /testing/i),
      deployment: this.extractSection(content, /deployment/i),
    };
  }

  private extractFieldValue(content: string, pattern: RegExp): string {
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (pattern.test(line)) {
        // Look for content in the next few lines
        for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
          const nextLine = lines[j].trim();
          if (nextLine && !nextLine.match(/^#+\s/) && !nextLine.match(/^[-*+]\s/)) {
            return nextLine;
          }
        }
      }
    }
    
    return '';
  }
}