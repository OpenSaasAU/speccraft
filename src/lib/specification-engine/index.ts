// Export main classes and types
export { QuestionnaireEngine } from './questionnaire-engine';
export { MarkdownGenerator } from './markdown-generator';
export { LLMQuestioner } from './llm-questioner';
export { baseQuestions } from './base-questions';

// Export types
export type {
  Question,
  QuestionResponse,
  QuestionnaireSession,
  SpecificationTemplate,
} from './types';

export type {
  LLMQuestionerConfig,
  GeneratedQuestion,
  FollowUpQuestionsResponse,
  QuestionImprovementResponse,
  CompletenessAnalysis,
  SmartQuestionGeneration,
  SpecificationQuality,
} from './llm-questioner';

export type {
  QuestionType,
  QuestionCategory,
  Question as SchemaQuestion,
} from './llm-schemas';

// Export convenience functions
export { 
  createSpecificationFromSession,
  createNewQuestionnaire,
  validateSpecificationCompleteness,
} from './specification-factory';