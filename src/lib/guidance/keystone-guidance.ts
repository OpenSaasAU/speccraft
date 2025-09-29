import type { ParsedSpecification } from '../code-generation/spec-reader.js';

export interface KeystoneGuidance {
  schemas: SchemaGuidance[];
  hooks: HookGuidance[];
  adminUI: AdminUIGuidance[];
  accessControl: AccessControlGuidance[];
  examples: CodeExample[];
  patterns: ImplementationPattern[];
}

export interface SchemaGuidance {
  purpose: string;
  fields: FieldGuidance[];
  relationships: RelationshipGuidance[];
  example: string;
}

export interface FieldGuidance {
  name: string;
  type: string;
  purpose: string;
  validation?: string;
  example: string;
}

export interface RelationshipGuidance {
  field: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  target: string;
  purpose: string;
  example: string;
}

export interface HookGuidance {
  type: 'resolveInput' | 'validateInput' | 'beforeOperation' | 'afterOperation';
  purpose: string;
  when: string;
  example: string;
}

export interface AdminUIGuidance {
  component: string;
  purpose: string;
  when: string;
  example: string;
}

export interface AccessControlGuidance {
  operation: 'create' | 'read' | 'update' | 'delete';
  pattern: string;
  purpose: string;
  example: string;
}

export interface CodeExample {
  title: string;
  description: string;
  code: string;
  useCase: string;
}

export interface ImplementationPattern {
  name: string;
  description: string;
  when: string;
  steps: string[];
  example?: string;
}

export class KeystoneGuidanceProvider {
  generateImplementationGuidance(spec: ParsedSpecification): KeystoneGuidance {
    return {
      schemas: this.generateSchemaGuidance(spec),
      hooks: this.generateHookGuidance(spec),
      adminUI: this.generateAdminUIGuidance(spec),
      accessControl: this.generateAccessControlGuidance(spec),
      examples: this.getRelevantExamples(spec),
      patterns: this.getImplementationPatterns(spec),
    };
  }

  private generateSchemaGuidance(spec: ParsedSpecification): SchemaGuidance[] {
    const featureName = this.pascalCase(spec.title);
    
    return [{
      purpose: `Schema for ${spec.title} - ${spec.description}`,
      fields: this.inferFieldsFromSpec(spec),
      relationships: this.inferRelationshipsFromSpec(spec),
      example: `export const ${featureName} = list({
  fields: {
    // Add your fields here based on the specification requirements
    title: text({ validation: { isRequired: true } }),
    description: text({ ui: { displayMode: 'textarea' } }),
    
    // Relationships
    createdBy: relationship({ 
      ref: 'User',
      hooks: {
        resolveInput: ({ context }) => ({ connect: { id: context.session?.itemId } })
      }
    }),
    
    // Timestamps
    createdAt: timestamp({ defaultValue: { kind: 'now' } }),
    updatedAt: timestamp({ hooks: { resolveInput: () => new Date() } }),
  },
  
  ui: {
    label: '${spec.title}',
    labelField: 'title',
  },
  
  hooks: {
    // Add business logic hooks here
  },
});`
    }];
  }

  private generateHookGuidance(spec: ParsedSpecification): HookGuidance[] {
    const hooks: HookGuidance[] = [];
    
    // Auto-timestamp hook
    hooks.push({
      type: 'resolveInput',
      purpose: 'Automatically set updatedAt timestamp on every update',
      when: 'Use this pattern for audit trails and tracking changes',
      example: `hooks: {
  resolveInput: ({ resolvedData, operation }) => {
    if (operation === 'update') {
      resolvedData.updatedAt = new Date();
    }
    return resolvedData;
  },
}`
    });

    // Validation hook
    if (spec.functionalRequirements.businessRules.length > 0) {
      hooks.push({
        type: 'validateInput',
        purpose: 'Validate business rules before saving',
        when: 'Use this to enforce business logic and data integrity',
        example: `hooks: {
  validateInput: ({ resolvedData, addValidationError }) => {
    // Example business rule validation
    if (resolvedData.status === 'published' && !resolvedData.publishedAt) {
      addValidationError('Published items must have a publication date');
    }
  },
}`
      });
    }

    // Auto-assign user hook
    hooks.push({
      type: 'resolveInput',
      purpose: 'Automatically assign current user to new items',
      when: 'Use this pattern for user-owned content',
      example: `fields: {
  createdBy: relationship({ 
    ref: 'User',
    hooks: {
      resolveInput: ({ context, operation }) => {
        if (operation === 'create') {
          return { connect: { id: context.session?.itemId } };
        }
        return undefined; // Don't change on update
      }
    }
  }),
}`
    });

    return hooks;
  }

  private generateAdminUIGuidance(spec: ParsedSpecification): AdminUIGuidance[] {
    const guidance: AdminUIGuidance[] = [];

    // Custom field components
    if (spec.uiRequirements.interfaces.length > 0) {
      guidance.push({
        component: 'Custom Field Component',
        purpose: 'Create custom input components for complex fields',
        when: 'When default Keystone fields don\'t meet your UI requirements',
        example: `// admin/components/CustomField.tsx
import { FieldProps } from '@keystone-6/core/types';

export const CustomField = ({ field, value, onChange }: FieldProps<string>) => {
  return (
    <div>
      <label>{field.label}</label>
      <input 
        type="text"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
};

// In your schema:
fields: {
  customField: text({
    ui: {
      views: './admin/components/CustomField'
    }
  })
}`
      });
    }

    // List views
    guidance.push({
      component: 'Custom List View',
      purpose: 'Customize how items appear in the admin list',
      when: 'When you need custom formatting or actions in the admin',
      example: `ui: {
  listView: {
    initialColumns: ['title', 'status', 'createdAt'],
    defaultFieldMode: 'read',
    initialSort: { field: 'createdAt', direction: 'DESC' },
  },
}`
    });

    return guidance;
  }

  private generateAccessControlGuidance(spec: ParsedSpecification): AccessControlGuidance[] {
    const guidance: AccessControlGuidance[] = [];

    // Basic user-based access
    guidance.push({
      operation: 'create',
      pattern: 'User can create their own items',
      purpose: 'Allow authenticated users to create content',
      example: `access: {
  operation: {
    create: ({ session }) => !!session,
    query: () => true,
    update: ({ session, item }) => {
      if (!session) return false;
      return session.itemId === item.createdById;
    },
    delete: ({ session, item }) => {
      if (!session) return false;
      return session.itemId === item.createdById;
    },
  },
}`
    });

    // Role-based access
    guidance.push({
      operation: 'read',
      pattern: 'Role-based access control',
      purpose: 'Different permissions based on user roles',
      example: `access: {
  operation: {
    create: ({ session }) => session?.data.role === 'admin',
    query: ({ session }) => {
      if (!session) return false;
      if (session.data.role === 'admin') return true;
      return { createdBy: { id: { equals: session.itemId } } };
    },
  },
}`
    });

    return guidance;
  }

  private getRelevantExamples(spec: ParsedSpecification): CodeExample[] {
    const examples: CodeExample[] = [];

    // Basic CRUD example
    examples.push({
      title: 'Basic List with CRUD Operations',
      description: 'Standard pattern for most content types',
      useCase: 'Use this as a starting point for most features',
      code: `import { list } from '@keystone-6/core';
import { text, relationship, timestamp, select } from '@keystone-6/core/fields';

export const ${this.pascalCase(spec.title)} = list({
  fields: {
    title: text({ validation: { isRequired: true } }),
    description: text({ ui: { displayMode: 'textarea' } }),
    status: select({
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      defaultValue: 'draft',
    }),
    createdBy: relationship({ ref: 'User' }),
    createdAt: timestamp({ defaultValue: { kind: 'now' } }),
  },
  
  ui: {
    labelField: 'title',
  },
});`
    });

    // Authentication context example
    examples.push({
      title: 'Using Authentication Context',
      description: 'Access current user in hooks and access control',
      useCase: 'When you need to work with the currently logged-in user',
      code: `// In hooks or access control
({ context, session }) => {
  // Current user ID
  const userId = session?.itemId;
  
  // Current user data
  const userData = session?.data;
  
  // Query current user with relations
  const user = await context.query.User.findOne({
    where: { id: userId },
    query: 'id name email role { name }',
  });
  
  return user;
}`
    });

    // File upload example
    if (spec.uiRequirements.interfaces.some(ui => ui.toLowerCase().includes('upload') || ui.toLowerCase().includes('image'))) {
      examples.push({
        title: 'File Upload Field',
        description: 'Handle file and image uploads',
        useCase: 'For profile pictures, documents, or media content',
        code: `import { file, image } from '@keystone-6/core/fields';

fields: {
  avatar: image({ storage: 'my_images' }),
  document: file({ storage: 'my_files' }),
}

// In keystone.ts config:
storage: {
  my_images: {
    kind: 'local',
    type: 'image',
    storagePath: 'public/images',
    generateUrl: path => \`/images\${path}\`,
    serverRoute: {
      path: '/images',
    },
  },
}`
      });
    }

    return examples;
  }

  private getImplementationPatterns(spec: ParsedSpecification): ImplementationPattern[] {
    const patterns: ImplementationPattern[] = [];

    // User-owned content pattern
    patterns.push({
      name: 'User-Owned Content',
      description: 'Content that belongs to specific users with appropriate access control',
      when: 'When users create and manage their own content',
      steps: [
        'Add createdBy relationship field to User',
        'Set up resolveInput hook to auto-assign current user on create',
        'Configure access control to limit access to owners',
        'Add UI filtering to show only user\'s content'
      ],
      example: `// Full pattern implementation
export const UserContent = list({
  fields: {
    title: text({ validation: { isRequired: true } }),
    createdBy: relationship({ 
      ref: 'User',
      hooks: {
        resolveInput: ({ context, operation }) => {
          if (operation === 'create') {
            return { connect: { id: context.session?.itemId } };
          }
        }
      }
    }),
  },
  
  access: {
    operation: {
      create: ({ session }) => !!session,
      query: ({ session }) => session ? { createdBy: { id: { equals: session.itemId } } } : false,
      update: ({ session, item }) => session?.itemId === item.createdById,
      delete: ({ session, item }) => session?.itemId === item.createdById,
    },
  },
});`
    });

    // Status workflow pattern
    if (spec.functionalRequirements.userWorkflows.some(workflow => 
      workflow.toLowerCase().includes('approve') || 
      workflow.toLowerCase().includes('publish') ||
      workflow.toLowerCase().includes('status')
    )) {
      patterns.push({
        name: 'Status Workflow',
        description: 'Content that goes through approval or publication workflows',
        when: 'When content needs review, approval, or publication steps',
        steps: [
          'Add status field with appropriate options',
          'Set up hooks to validate status transitions',
          'Configure access control based on status',
          'Add timestamps for status changes'
        ],
      });
    }

    return patterns;
  }

  private inferFieldsFromSpec(spec: ParsedSpecification): FieldGuidance[] {
    const fields: FieldGuidance[] = [];
    
    // Always include basic fields
    fields.push({
      name: 'title',
      type: 'text',
      purpose: 'Human-readable name/title for the item',
      validation: 'isRequired: true',
      example: 'text({ validation: { isRequired: true } })'
    });

    fields.push({
      name: 'description',
      type: 'text',
      purpose: 'Detailed description of the item',
      example: 'text({ ui: { displayMode: "textarea" } })'
    });

    // Infer fields from UI requirements
    spec.uiRequirements.interfaces.forEach(ui => {
      if (ui.toLowerCase().includes('email')) {
        fields.push({
          name: 'email',
          type: 'text',
          purpose: 'Email address field',
          validation: 'isEmail: true',
          example: 'text({ validation: { isRequired: true }, isIndexed: "unique" })'
        });
      }
      
      if (ui.toLowerCase().includes('image') || ui.toLowerCase().includes('photo')) {
        fields.push({
          name: 'image',
          type: 'image',
          purpose: 'Image upload field',
          example: 'image({ storage: "my_images" })'
        });
      }
    });

    return fields;
  }

  private inferRelationshipsFromSpec(spec: ParsedSpecification): RelationshipGuidance[] {
    const relationships: RelationshipGuidance[] = [];
    
    // Always include user relationship
    relationships.push({
      field: 'createdBy',
      type: 'one-to-many',
      target: 'User',
      purpose: 'Track which user created this item',
      example: 'relationship({ ref: "User" })'
    });

    return relationships;
  }

  private pascalCase(str: string): string {
    return str.replace(/(?:^|\s)(\w)/g, (_, char) => char.toUpperCase()).replace(/\s/g, '');
  }
}