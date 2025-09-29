import { QuestionnaireEngine } from './questionnaire-engine';
import { MarkdownGenerator } from './markdown-generator';
import { QuestionnaireSession, SpecificationTemplate } from './types';

export interface SpecificationResult {
  markdown: string;
  template: SpecificationTemplate;
  session: QuestionnaireSession;
  isComplete: boolean;
  completionPercentage: number;
}

export function createSpecificationFromSession(
  session: QuestionnaireSession
): SpecificationResult {
  const engine = QuestionnaireEngine.fromSession(session);
  const generator = new MarkdownGenerator(session.responses);
  
  const progress = engine.getProgress();
  const isComplete = engine.isComplete();
  
  return {
    markdown: generator.generateMarkdown(session.featureTitle),
    template: generator.generateSpecificationTemplate(),
    session: engine.getSession(),
    isComplete,
    completionPercentage: progress.percentage,
  };
}

export function createNewQuestionnaire(
  featureTitle: string,
  featureDescription: string
): QuestionnaireEngine {
  return new QuestionnaireEngine(featureTitle, featureDescription);
}

export function validateSpecificationCompleteness(
  session: QuestionnaireSession
): { isValid: boolean; missingRequiredQuestions: string[] } {
  const engine = QuestionnaireEngine.fromSession(session);
  const missingQuestions = engine.getUnansweredRequiredQuestions();
  
  return {
    isValid: missingQuestions.length === 0,
    missingRequiredQuestions: missingQuestions.map(q => q.text),
  };
}