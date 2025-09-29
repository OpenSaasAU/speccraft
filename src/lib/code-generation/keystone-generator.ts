import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import type { ParsedSpecification } from './spec-reader.js';

export interface KeystoneProjectConfig {
  projectName: string;
  outputPath: string;
  specification: ParsedSpecification;
}

export class KeystoneProjectGenerator {
  private readonly starterRepoUrl = 'https://github.com/OpenSaasAU/o8u-starter.git';

  async generateProject(config: KeystoneProjectConfig): Promise<string> {
    const { projectName, outputPath, specification } = config;
    const projectPath = path.join(outputPath, projectName);

    try {
      // Clone the starter template
      await this.cloneStarterTemplate(projectPath);
      
      // Customize the project based on specification
      await this.customizeProject(projectPath, specification);
      
      // Generate additional files based on spec
      await this.generateSpecificFiles(projectPath, specification);
      
      return projectPath;
    } catch (error) {
      throw new Error(`Failed to generate Keystone project: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async cloneStarterTemplate(projectPath: string): Promise<void> {
    const fs = await import('fs/promises');
    const os = await import('os');
    
    // If projectPath is current directory ".", we need special handling
    if (projectPath === '.' || path.resolve(projectPath) === process.cwd()) {
      // Clone to a temporary directory first
      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'speccraft-'));
      const tempProjectPath = path.join(tempDir, 'starter');
      
      try {
        // Clone to temp directory
        await this.cloneToDirectory(tempProjectPath);
        
        // Copy contents to current directory
        await this.copyDirectoryContents(tempProjectPath, '.');
        
        // Clean up temp directory
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (error) {
        // Clean up temp directory on error
        await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
        throw error;
      }
    } else {
      // Normal clone to specified directory
      await this.cloneToDirectory(projectPath);
    }
  }

  private async cloneToDirectory(targetPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const git = spawn('git', ['clone', this.starterRepoUrl, targetPath], {
        stdio: 'pipe'
      });

      let stderr = '';
      git.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      git.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Git clone failed with code ${code}. Error: ${stderr}`));
        }
      });

      git.on('error', (error) => {
        reject(new Error(`Git clone error: ${error.message}`));
      });
    });
  }

  private async copyDirectoryContents(sourceDir: string, targetDir: string): Promise<void> {
    const fs = await import('fs/promises');
    
    const entries = await fs.readdir(sourceDir, { withFileTypes: true });
    
    for (const entry of entries) {
      // Skip .git directory when copying
      if (entry.name === '.git') {
        continue;
      }
      
      const sourcePath = path.join(sourceDir, entry.name);
      const targetPath = path.join(targetDir, entry.name);
      
      if (entry.isDirectory()) {
        await fs.mkdir(targetPath, { recursive: true });
        await this.copyDirectoryContents(sourcePath, targetPath);
      } else {
        await fs.copyFile(sourcePath, targetPath);
      }
    }
  }

  private async customizeProject(projectPath: string, spec: ParsedSpecification): Promise<void> {
    // Update package.json
    await this.updatePackageJson(projectPath, spec);
    
    // Update README
    await this.updateReadme(projectPath, spec);
    
    // Generate schema based on specification
    await this.generateSchema(projectPath, spec);
    
    // Remove .git directory to start fresh
    await this.removeGitDirectory(projectPath);
  }

  private async updatePackageJson(projectPath: string, spec: ParsedSpecification): Promise<void> {
    const packageJsonPath = path.join(projectPath, 'package.json');
    
    try {
      const packageContent = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageContent);
      
      // Update project metadata
      packageJson.name = spec.title.toLowerCase().replace(/\s+/g, '-');
      packageJson.description = spec.description;
      packageJson.version = '1.0.0';
      
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    } catch (error) {
      console.warn('Could not update package.json:', error);
    }
  }

  private async updateReadme(projectPath: string, spec: ParsedSpecification): Promise<void> {
    const readmePath = path.join(projectPath, 'README.md');
    
    const readmeContent = `# ${spec.title}

${spec.description}

## Business Value

${spec.featureOverview.businessValue}

## Target Users

${spec.featureOverview.targetUsers}

## Core Features

${spec.functionalRequirements.coreFeatures.map(feature => `- ${feature}`).join('\n')}

## Technical Architecture

${spec.technicalSpecifications.architecture.map(item => `- ${item}`).join('\n')}

## Development Setup

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Set up environment variables:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

3. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

4. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Specification

This project was generated from a SpecCraft specification. See the original spec for detailed requirements and implementation guidelines.

## Next Steps

${spec.implementation.guidelines.map(guideline => `- ${guideline}`).join('\n')}

---

Generated with [SpecCraft](https://github.com/opensaas/speccraft) 🎯
`;

    await fs.writeFile(readmePath, readmeContent);
  }

  private async generateSchema(projectPath: string, spec: ParsedSpecification): Promise<void> {
    // This is a simplified schema generation
    // In a real implementation, you'd parse the functional requirements 
    // to generate proper Keystone schema definitions
    
    const schemaPath = path.join(projectPath, 'schema.ts');
    
    const schemaContent = `import { list } from '@keystone-6/core';
import { text, relationship, password, timestamp, select } from '@keystone-6/core/fields';
import { document } from '@keystone-6/fields-document';

// Generated schema based on SpecCraft specification
// Feature: ${spec.title}

export const lists = {
  // User management (from starter template)
  User: list({
    fields: {
      name: text({ validation: { isRequired: true } }),
      email: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
      password: password({ validation: { isRequired: true } }),
      role: select({
        options: [
          { label: 'Admin', value: 'admin' },
          { label: 'User', value: 'user' },
        ],
        defaultValue: 'user',
      }),
      createdAt: timestamp({ defaultValue: { kind: 'now' } }),
    },
  }),
  
  // TODO: Add your domain-specific models here based on the specification
  // Core features identified:
  ${spec.functionalRequirements.coreFeatures.map(feature => `  // - ${feature}`).join('\n')}
  
  // Example model (customize based on your specification):
  // ExampleModel: list({
  //   fields: {
  //     title: text({ validation: { isRequired: true } }),
  //     description: text({ ui: { displayMode: 'textarea' } }),
  //     content: document({
  //       formatting: true,
  //       layouts: [
  //         [1, 1],
  //         [1, 1, 1],
  //       ],
  //       links: true,
  //       dividers: true,
  //     }),
  //     author: relationship({ ref: 'User', many: false }),
  //     createdAt: timestamp({ defaultValue: { kind: 'now' } }),
  //   },
  // }),
};
`;

    await fs.writeFile(schemaPath, schemaContent);
  }

  private async generateSpecificFiles(projectPath: string, spec: ParsedSpecification): Promise<void> {
    // Create a specs directory and copy the original specification
    const specsDir = path.join(projectPath, 'docs', 'specs');
    await fs.mkdir(specsDir, { recursive: true });
    
    const specPath = path.join(specsDir, 'feature-specification.md');
    await fs.writeFile(specPath, spec.rawContent);
    
    // Generate implementation notes
    const implementationNotes = `# Implementation Notes

## Generated Project Structure

This Keystone.js project was generated from a SpecCraft specification.

### Key Components to Implement

#### Core Features
${spec.functionalRequirements.coreFeatures.map(feature => `- [ ] ${feature}`).join('\n')}

#### User Workflows
${spec.functionalRequirements.userWorkflows.map(workflow => `- [ ] ${workflow}`).join('\n')}

#### Technical Requirements
${spec.technicalSpecifications.architecture.map(req => `- [ ] ${req}`).join('\n')}

#### UI Components Needed
${spec.uiRequirements.interfaces.map(ui => `- [ ] ${ui}`).join('\n')}

### Development Guidelines

${spec.implementation.guidelines.map(guideline => `- ${guideline}`).join('\n')}

### Testing Strategy

${spec.implementation.testing.map(test => `- ${test}`).join('\n')}

---

**Next Steps:**
1. Review and customize the generated schema.ts file
2. Implement the core features listed above
3. Create UI components based on the specification
4. Set up testing according to the testing strategy
5. Follow the deployment guidelines when ready

**Specification Reference:**
See the original specification file for the complete specification.
`;

    const notesPath = path.join(projectPath, 'docs', 'IMPLEMENTATION.md');
    await fs.writeFile(notesPath, implementationNotes);
  }

  private async removeGitDirectory(projectPath: string): Promise<void> {
    try {
      await fs.rm(path.join(projectPath, '.git'), { recursive: true, force: true });
    } catch (error) {
      // Ignore if .git doesn't exist
    }
  }
}