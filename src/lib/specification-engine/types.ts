export interface Question {
  id: string;
  text: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'boolean';
  required: boolean;
  options?: string[];
  dependsOn?: {
    questionId: string;
    value: string | boolean;
  };
  category: 'overview' | 'functional' | 'technical' | 'ui_ux' | 'performance' | 'security';
  order: number;
}

export interface QuestionResponse {
  questionId: string;
  value: string | boolean | string[];
  timestamp: Date;
}

export interface QuestionnaireSession {
  id: string;
  featureTitle: string;
  featureDescription: string;
  currentQuestionIndex: number;
  responses: QuestionResponse[];
  isComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SpecificationTemplate {
  overview: string;
  userStories: string[];
  functionalRequirements: string[];
  edgeCases: string[];
  uiUxRequirements: string[];
  technicalConstraints: string[];
  acceptanceCriteria: string[];
  dependencies: string[];
}