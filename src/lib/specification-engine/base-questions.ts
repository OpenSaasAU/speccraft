import { Question } from './types';

export const baseQuestions: Question[] = [
  // Overview Questions
  {
    id: 'feature-overview',
    text: 'Provide a detailed overview of what this feature should accomplish and why it\'s needed.',
    type: 'textarea',
    required: true,
    category: 'overview',
    order: 1,
  },
  {
    id: 'target-users',
    text: 'Who are the primary users of this feature? Describe the user personas.',
    type: 'textarea',
    required: true,
    category: 'overview',
    order: 2,
  },
  {
    id: 'business-value',
    text: 'What business value or problem does this feature solve?',
    type: 'textarea',
    required: true,
    category: 'overview',
    order: 3,
  },

  // Functional Requirements
  {
    id: 'core-functionality',
    text: 'What are the core functions this feature must perform? List each major capability.',
    type: 'textarea',
    required: true,
    category: 'functional',
    order: 10,
  },
  {
    id: 'user-interactions',
    text: 'How will users interact with this feature? Describe the user journey step by step.',
    type: 'textarea',
    required: true,
    category: 'functional',
    order: 11,
  },
  {
    id: 'data-requirements',
    text: 'What data does this feature need to collect, process, or display?',
    type: 'textarea',
    required: true,
    category: 'functional',
    order: 12,
  },
  {
    id: 'integrations-needed',
    text: 'Does this feature need to integrate with any external services, APIs, or existing systems?',
    type: 'textarea',
    required: false,
    category: 'functional',
    order: 13,
  },

  // UI/UX Requirements
  {
    id: 'ui-requirements',
    text: 'Describe the user interface requirements. What should users see and how should it be organized?',
    type: 'textarea',
    required: true,
    category: 'ui_ux',
    order: 20,
  },
  {
    id: 'responsive-design',
    text: 'Does this feature need to work on mobile devices?',
    type: 'boolean',
    required: true,
    category: 'ui_ux',
    order: 21,
  },
  {
    id: 'accessibility-requirements',
    text: 'Are there specific accessibility requirements for this feature?',
    type: 'textarea',
    required: false,
    category: 'ui_ux',
    order: 22,
  },

  // Technical Constraints
  {
    id: 'performance-requirements',
    text: 'Are there specific performance requirements (load time, response time, etc.)?',
    type: 'textarea',
    required: false,
    category: 'performance',
    order: 30,
  },
  {
    id: 'scalability-needs',
    text: 'How many users should this feature support? Any specific scalability requirements?',
    type: 'textarea',
    required: false,
    category: 'performance',
    order: 31,
  },

  // Security & Privacy
  {
    id: 'sensitive-data',
    text: 'Does this feature handle sensitive or personal data?',
    type: 'boolean',
    required: true,
    category: 'security',
    order: 40,
  },
  {
    id: 'authentication-required',
    text: 'Does this feature require user authentication?',
    type: 'select',
    required: true,
    options: ['No authentication needed', 'Optional authentication', 'Required authentication', 'Admin-only access'],
    category: 'security',
    order: 41,
  },
  {
    id: 'security-requirements',
    text: 'What specific security requirements does this feature have?',
    type: 'textarea',
    required: false,
    dependsOn: {
      questionId: 'sensitive-data',
      value: true,
    },
    category: 'security',
    order: 42,
  },

  // Edge Cases & Error Handling
  {
    id: 'error-scenarios',
    text: 'What could go wrong with this feature? List potential error scenarios and how they should be handled.',
    type: 'textarea',
    required: true,
    category: 'technical',
    order: 50,
  },
  {
    id: 'validation-rules',
    text: 'What validation rules should be applied to user inputs?',
    type: 'textarea',
    required: false,
    category: 'technical',
    order: 51,
  },
  {
    id: 'edge-cases',
    text: 'What edge cases should be considered (empty states, maximum limits, unusual data, etc.)?',
    type: 'textarea',
    required: true,
    category: 'technical',
    order: 52,
  },

  // Dependencies & Constraints
  {
    id: 'feature-dependencies',
    text: 'Does this feature depend on other features being completed first?',
    type: 'textarea',
    required: false,
    category: 'technical',
    order: 60,
  },
  {
    id: 'timeline-constraints',
    text: 'Are there any timeline constraints or deadlines for this feature?',
    type: 'textarea',
    required: false,
    category: 'overview',
    order: 61,
  },
  {
    id: 'success-criteria',
    text: 'How will you know this feature is successful? What are the measurable success criteria?',
    type: 'textarea',
    required: true,
    category: 'overview',
    order: 62,
  },
];