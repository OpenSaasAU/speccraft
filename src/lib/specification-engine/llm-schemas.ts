import { z } from 'zod';

// Question type schema
export const questionTypeSchema = z.enum(['text', 'textarea', 'select', 'multiselect', 'boolean']);

// Question category schema
export const questionCategorySchema = z.enum([
  'overview', 
  'functional', 
  'technical', 
  'ui_ux', 
  'performance', 
  'security'
]);

// Base question schema
export const questionSchema = z.object({
  id: z.string().min(1, 'Question ID is required'),
  text: z.string().min(10, 'Question text must be at least 10 characters'),
  type: questionTypeSchema,
  required: z.boolean().default(false),
  category: questionCategorySchema,
  order: z.number().min(1),
  options: z.array(z.string()).optional(),
  dependsOn: z.object({
    questionId: z.string(),
    value: z.union([z.string(), z.boolean()])
  }).optional()
});

// Generated question with reasoning
export const generatedQuestionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(10),
  type: questionTypeSchema,
  required: z.boolean().default(false),
  category: questionCategorySchema,
  reasoning: z.string().min(20, 'Reasoning must be at least 20 characters'),
  order: z.number().min(1).default(100)
});

// Follow-up questions response schema
export const followUpQuestionsSchema = z.object({
  questions: z.array(generatedQuestionSchema).max(5, 'Maximum 5 follow-up questions allowed')
});

// Question improvement response schema
export const questionImprovementSchema = z.object({
  improved: z.boolean(),
  improvedText: z.string().optional(),
  reasoning: z.string().optional()
});

// Specification completeness analysis schema
export const completenessAnalysisSchema = z.object({
  isComplete: z.boolean(),
  completionPercentage: z.number().min(0).max(100),
  missingAreas: z.array(z.string()),
  criticalGaps: z.array(z.string()),
  suggestedQuestions: z.array(generatedQuestionSchema).max(5),
  summary: z.string().min(50, 'Summary must be at least 50 characters')
});

// Smart question generation based on feature context
export const smartQuestionGenerationSchema = z.object({
  contextualQuestions: z.array(generatedQuestionSchema).max(3),
  priorityLevel: z.enum(['low', 'medium', 'high', 'critical']),
  reasoning: z.string().min(30)
});

// Specification quality assessment
export const specificationQualitySchema = z.object({
  overallScore: z.number().min(0).max(100),
  scores: z.object({
    clarity: z.number().min(0).max(100),
    completeness: z.number().min(0).max(100),
    specificity: z.number().min(0).max(100),
    implementability: z.number().min(0).max(100)
  }),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  recommendations: z.array(z.string()),
  readyForDevelopment: z.boolean()
});

// Export types inferred from schemas
export type QuestionType = z.infer<typeof questionTypeSchema>;
export type QuestionCategory = z.infer<typeof questionCategorySchema>;
export type Question = z.infer<typeof questionSchema>;
export type GeneratedQuestion = z.infer<typeof generatedQuestionSchema>;
export type FollowUpQuestionsResponse = z.infer<typeof followUpQuestionsSchema>;
export type QuestionImprovementResponse = z.infer<typeof questionImprovementSchema>;
export type CompletenessAnalysis = z.infer<typeof completenessAnalysisSchema>;
export type SmartQuestionGeneration = z.infer<typeof smartQuestionGenerationSchema>;
export type SpecificationQuality = z.infer<typeof specificationQualitySchema>;