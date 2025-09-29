import fs from 'fs/promises';
import path from 'path';
import type { ParsedSpecification } from './spec-reader.js';

export interface FeatureGenerationConfig {
  targetDirectory: string;
  specification: ParsedSpecification;
  framework?: 'keystone' | 'nextjs' | 'react' | 'auto';
}

export interface GeneratedFile {
  path: string;
  content: string;
  type: 'component' | 'schema' | 'api' | 'test' | 'doc';
}

export class FeatureGenerator {
  async generateFeature(config: FeatureGenerationConfig): Promise<GeneratedFile[]> {
    const { targetDirectory, specification, framework = 'auto' } = config;
    
    try {
      const detectedFramework = framework === 'auto' 
        ? await this.detectFramework(targetDirectory)
        : framework;
      
      const generatedFiles: GeneratedFile[] = [];
      
      // Generate based on detected framework
      switch (detectedFramework) {
        case 'keystone':
          generatedFiles.push(...await this.generateKeystoneFeatures(targetDirectory, specification));
          break;
        case 'nextjs':
          generatedFiles.push(...await this.generateNextJSFeatures(targetDirectory, specification));
          break;
        case 'react':
          generatedFiles.push(...await this.generateReactFeatures(targetDirectory, specification));
          break;
        default:
          generatedFiles.push(...await this.generateGenericFeatures(targetDirectory, specification));
      }
      
      // Write all files
      for (const file of generatedFiles) {
        await this.writeFile(file);
      }
      
      return generatedFiles;
    } catch (error) {
      throw new Error(`Failed to generate feature: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async detectFramework(targetDirectory: string): Promise<string> {
    try {
      const packageJsonPath = path.join(targetDirectory, 'package.json');
      const packageContent = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageContent);
      
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };
      
      if (dependencies['@keystone-6/core']) return 'keystone';
      if (dependencies['next']) return 'nextjs';
      if (dependencies['react']) return 'react';
      
      return 'generic';
    } catch (error) {
      return 'generic';
    }
  }

  private async generateKeystoneFeatures(targetDirectory: string, spec: ParsedSpecification): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];
    const featureName = this.sanitizeFeatureName(spec.title);
    
    // Generate schema extension
    files.push({
      path: path.join(targetDirectory, 'schemas', `${featureName}.ts`),
      content: this.generateKeystoneSchema(spec),
      type: 'schema'
    });
    
    // Generate admin UI customizations
    files.push({
      path: path.join(targetDirectory, 'admin', 'components', `${featureName}Components.tsx`),
      content: this.generateKeystoneAdminComponents(spec),
      type: 'component'
    });
    
    // Generate API hooks if needed
    if (spec.technicalSpecifications.integrations.length > 0) {
      files.push({
        path: path.join(targetDirectory, 'api', `${featureName}Hooks.ts`),
        content: this.generateKeystoneHooks(spec),
        type: 'api'
      });
    }
    
    return files;
  }

  private async generateNextJSFeatures(targetDirectory: string, spec: ParsedSpecification): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];
    const featureName = this.sanitizeFeatureName(spec.title);
    
    // Generate page components
    files.push({
      path: path.join(targetDirectory, 'pages', featureName, 'index.tsx'),
      content: this.generateNextJSPage(spec),
      type: 'component'
    });
    
    // Generate API routes
    files.push({
      path: path.join(targetDirectory, 'pages', 'api', featureName, 'index.ts'),
      content: this.generateNextJSAPI(spec),
      type: 'api'
    });
    
    // Generate components
    files.push({
      path: path.join(targetDirectory, 'components', featureName, `${featureName}Component.tsx`),
      content: this.generateReactComponent(spec),
      type: 'component'
    });
    
    return files;
  }

  private async generateReactFeatures(targetDirectory: string, spec: ParsedSpecification): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];
    const featureName = this.sanitizeFeatureName(spec.title);
    
    // Generate React components
    files.push({
      path: path.join(targetDirectory, 'src', 'components', featureName, `${featureName}.tsx`),
      content: this.generateReactComponent(spec),
      type: 'component'
    });
    
    // Generate hooks if needed
    files.push({
      path: path.join(targetDirectory, 'src', 'hooks', `use${featureName}.ts`),
      content: this.generateReactHook(spec),
      type: 'component'
    });
    
    return files;
  }

  private async generateGenericFeatures(targetDirectory: string, spec: ParsedSpecification): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];
    const featureName = this.sanitizeFeatureName(spec.title);
    
    // Generate implementation plan
    files.push({
      path: path.join(targetDirectory, 'docs', `${featureName}-implementation.md`),
      content: this.generateImplementationPlan(spec),
      type: 'doc'
    });
    
    // Generate basic structure files
    files.push({
      path: path.join(targetDirectory, 'src', featureName, 'index.js'),
      content: this.generateGenericModule(spec),
      type: 'component'
    });
    
    return files;
  }

  private generateKeystoneSchema(spec: ParsedSpecification): string {
    const featureName = this.sanitizeFeatureName(spec.title);
    
    return `import { list } from '@keystone-6/core';
import { text, relationship, timestamp, select, integer } from '@keystone-6/core/fields';

// ${spec.title} Schema
// Generated from SpecCraft specification

export const ${featureName} = list({
  fields: {
    title: text({ 
      validation: { isRequired: true },
      label: '${spec.title} Title'
    }),
    description: text({ 
      ui: { displayMode: 'textarea' },
      label: 'Description'
    }),
    
    // TODO: Add specific fields based on your requirements
    ${spec.functionalRequirements.coreFeatures.map(feature => `    // Field for: ${feature}`).join('\n')}
    
    // Standard fields
    createdBy: relationship({ 
      ref: 'User',
      hooks: {
        resolveInput: ({ context }) => {
          // Auto-assign current user
          return { connect: { id: context.session?.itemId } };
        },
      },
    }),
    createdAt: timestamp({ 
      defaultValue: { kind: 'now' },
      ui: { createView: { fieldMode: 'hidden' } }
    }),
    updatedAt: timestamp({ 
      hooks: {
        resolveInput: () => new Date(),
      },
    }),
  },
  
  ui: {
    label: '${spec.title}',
    plural: '${spec.title}s',
  },
  
  hooks: {
    // Add your business logic hooks here
    ${spec.functionalRequirements.businessRules.length > 0 ? `
    // Business rules to implement:
    ${spec.functionalRequirements.businessRules.map(rule => `    // - ${rule}`).join('\n')}
    ` : ''}
  },
});
`;
  }

  private generateKeystoneAdminComponents(spec: ParsedSpecification): string {
    const featureName = this.sanitizeFeatureName(spec.title);
    
    return `import React from 'react';
import { FieldProps } from '@keystone-6/core/types';

// Custom admin components for ${spec.title}
// Generated from SpecCraft specification

export const ${featureName}CustomField = ({ field, value, onChange, autoFocus }: FieldProps<any>) => {
  return (
    <div>
      {/* TODO: Implement custom field based on UI requirements */}
      {/* UI Requirements: */}
      ${spec.uiRequirements.interfaces.map(ui => `      {/* - ${ui} */}`).join('\n')}
    </div>
  );
};

export const ${featureName}Dashboard = () => {
  return (
    <div>
      <h2>${spec.title} Dashboard</h2>
      {/* TODO: Implement dashboard based on specification */}
      
      {/* Core Features to Display: */}
      ${spec.functionalRequirements.coreFeatures.map(feature => `      {/* - ${feature} */}`).join('\n')}
    </div>
  );
};
`;
  }

  private generateKeystoneHooks(spec: ParsedSpecification): string {
    const featureName = this.sanitizeFeatureName(spec.title);
    
    return `import type { KeystoneContext } from '@keystone-6/core/types';

// API hooks for ${spec.title}
// Generated from SpecCraft specification

export const ${featureName}Hooks = {
  // Integration hooks
  ${spec.technicalSpecifications.integrations.map(integration => `
  // ${integration}
  handle${this.pascalCase(integration.split(' ')[0])}Integration: async (context: KeystoneContext, data: any) => {
    // TODO: Implement ${integration}
  },`).join('')}
  
  // Business logic hooks
  ${spec.functionalRequirements.businessRules.map(rule => `
  // ${rule}
  validate${this.pascalCase(rule.split(' ')[0])}: async (data: any) => {
    // TODO: Implement validation for ${rule}
    return true;
  },`).join('')}
};
`;
  }

  private generateNextJSPage(spec: ParsedSpecification): string {
    const featureName = this.sanitizeFeatureName(spec.title);
    
    return `import React from 'react';
import Head from 'next/head';
import { ${this.pascalCase(featureName)}Component } from '../../components/${featureName}/${featureName}Component';

// ${spec.title} Page
// Generated from SpecCraft specification

export default function ${this.pascalCase(featureName)}Page() {
  return (
    <>
      <Head>
        <title>${spec.title}</title>
        <meta name="description" content="${spec.description}" />
      </Head>
      
      <main>
        <h1>${spec.title}</h1>
        <p>{spec.description}</p>
        
        <${this.pascalCase(featureName)}Component />
      </main>
    </>
  );
}

// TODO: Implement getServerSideProps or getStaticProps if needed
// Based on your technical requirements:
${spec.technicalSpecifications.architecture.map(req => `// - ${req}`).join('\n')}
`;
  }

  private generateNextJSAPI(spec: ParsedSpecification): string {
    return `import type { NextApiRequest, NextApiResponse } from 'next';

// ${spec.title} API Route
// Generated from SpecCraft specification

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      // TODO: Implement GET logic
      ${spec.functionalRequirements.coreFeatures.map(feature => `      // Handle: ${feature}`).join('\n')}
      res.status(200).json({ message: '${spec.title} API endpoint' });
      break;
      
    case 'POST':
      // TODO: Implement POST logic
      res.status(201).json({ message: 'Created' });
      break;
      
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(\`Method \${req.method} Not Allowed\`);
  }
}
`;
  }

  private generateReactComponent(spec: ParsedSpecification): string {
    const featureName = this.sanitizeFeatureName(spec.title);
    
    return `import React, { useState, useEffect } from 'react';

// ${spec.title} Component
// Generated from SpecCraft specification

interface ${this.pascalCase(featureName)}Props {
  // TODO: Define props based on your requirements
}

export const ${this.pascalCase(featureName)}Component: React.FC<${this.pascalCase(featureName)}Props> = (props) => {
  // TODO: Implement state management
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // TODO: Implement initialization logic
    ${spec.functionalRequirements.coreFeatures.map(feature => `    // Initialize: ${feature}`).join('\n')}
  }, []);

  // TODO: Implement event handlers
  ${spec.functionalRequirements.userWorkflows.map(workflow => `
  const handle${this.pascalCase(workflow.split(' ')[0])} = () => {
    // TODO: Implement ${workflow}
  };`).join('')}

  return (
    <div className="${featureName}-component">
      <h2>${spec.title}</h2>
      <p>${spec.description}</p>
      
      {/* TODO: Implement UI based on requirements */}
      ${spec.uiRequirements.interfaces.map(ui => `      {/* UI: ${ui} */}`).join('\n')}
      
      {loading && <div>Loading...</div>}
      
      {/* Core features to implement: */}
      ${spec.functionalRequirements.coreFeatures.map(feature => `      {/* Feature: ${feature} */}`).join('\n')}
    </div>
  );
};
`;
  }

  private generateReactHook(spec: ParsedSpecification): string {
    const featureName = this.sanitizeFeatureName(spec.title);
    
    return `import { useState, useEffect, useCallback } from 'react';

// ${spec.title} Hook
// Generated from SpecCraft specification

export const use${this.pascalCase(featureName)} = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TODO: Implement data fetching logic
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Implement API calls based on requirements
      ${spec.technicalSpecifications.integrations.map(integration => `      // Integration: ${integration}`).join('\n')}
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // TODO: Implement business logic methods
  ${spec.functionalRequirements.businessRules.map(rule => `
  const handle${this.pascalCase(rule.split(' ')[0])} = useCallback(() => {
    // TODO: Implement ${rule}
  }, []);`).join('')}

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    // Add your custom methods here
  };
};
`;
  }

  private generateImplementationPlan(spec: ParsedSpecification): string {
    return `# ${spec.title} - Implementation Plan

${spec.description}

## Overview

This document outlines the implementation plan for the ${spec.title} feature based on the SpecCraft specification.

## Core Features to Implement

${spec.functionalRequirements.coreFeatures.map((feature, index) => `${index + 1}. **${feature}**
   - [ ] Design implementation approach
   - [ ] Create necessary components/modules
   - [ ] Implement business logic
   - [ ] Add tests
   - [ ] Document usage`).join('\n\n')}

## User Workflows

${spec.functionalRequirements.userWorkflows.map((workflow, index) => `${index + 1}. **${workflow}**
   - [ ] Map user journey
   - [ ] Implement UI components
   - [ ] Add validation and error handling
   - [ ] Test user experience`).join('\n\n')}

## Technical Requirements

### Architecture
${spec.technicalSpecifications.architecture.map(req => `- [ ] ${req}`).join('\n')}

### Performance
${spec.technicalSpecifications.performance.map(req => `- [ ] ${req}`).join('\n')}

### Security
${spec.technicalSpecifications.security.map(req => `- [ ] ${req}`).join('\n')}

### Integrations
${spec.technicalSpecifications.integrations.map(req => `- [ ] ${req}`).join('\n')}

## UI/UX Requirements

### Interfaces
${spec.uiRequirements.interfaces.map(ui => `- [ ] ${ui}`).join('\n')}

### User Flows
${spec.uiRequirements.userFlows.map(flow => `- [ ] ${flow}`).join('\n')}

## Implementation Guidelines

${spec.implementation.guidelines.map(guideline => `- ${guideline}`).join('\n')}

## Testing Strategy

${spec.implementation.testing.map(test => `- [ ] ${test}`).join('\n')}

## Deployment Considerations

${spec.implementation.deployment.map(deploy => `- [ ] ${deploy}`).join('\n')}

---

**Generated with SpecCraft** 🎯
*This implementation plan was automatically generated from your specification. Customize it based on your specific project needs.*
`;
  }

  private generateGenericModule(spec: ParsedSpecification): string {
    const featureName = this.sanitizeFeatureName(spec.title);
    
    return `// ${spec.title} Module
// Generated from SpecCraft specification

/**
 * ${spec.description}
 */

class ${this.pascalCase(featureName)} {
  constructor() {
    // TODO: Initialize module
    ${spec.functionalRequirements.coreFeatures.map(feature => `    // Initialize: ${feature}`).join('\n')}
  }

  // TODO: Implement core methods
  ${spec.functionalRequirements.coreFeatures.map(feature => `
  /**
   * ${feature}
   */
  ${this.camelCase(feature)}() {
    // TODO: Implement ${feature}
  }`).join('')}

  // TODO: Implement business rules
  ${spec.functionalRequirements.businessRules.map(rule => `
  /**
   * ${rule}
   */
  validate${this.pascalCase(rule.split(' ')[0])}() {
    // TODO: Implement ${rule}
    return true;
  }`).join('')}
}

module.exports = ${this.pascalCase(featureName)};
`;
  }

  private async writeFile(file: GeneratedFile): Promise<void> {
    const dir = path.dirname(file.path);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(file.path, file.content);
  }

  private sanitizeFeatureName(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  private pascalCase(str: string): string {
    return str.replace(/(?:^|\s)(\w)/g, (_, char) => char.toUpperCase()).replace(/\s/g, '');
  }

  private camelCase(str: string): string {
    const pascal = this.pascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  }
}