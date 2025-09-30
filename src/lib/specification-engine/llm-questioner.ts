import { QuestionResponse, Question } from "./types";

export interface LLMQuestionerConfig {
  maxFollowUpQuestions?: number;
}

export interface InferredAnswer {
  questionId: string;
  questionText: string;
  inferredValue: string | boolean | string[];
  confidence: number; // 0.0 to 1.0
  reasoning: string;
}

// Export types from schemas
export type {
  GeneratedQuestion,
  FollowUpQuestionsResponse,
  QuestionImprovementResponse,
  CompletenessAnalysis,
  SmartQuestionGeneration,
  SpecificationQuality,
} from "./llm-schemas";

export class LLMQuestioner {
  private config: LLMQuestionerConfig;

  constructor(config: LLMQuestionerConfig = {}) {
    this.config = {
      maxFollowUpQuestions: 3,
      ...config,
    };
  }

  private buildContextPrompt(
    featureTitle: string,
    featureDescription: string,
    responses: QuestionResponse[],
  ): string {
    let prompt = `You are SpecCraft, an AI assistant that helps create detailed software feature specifications through intelligent questioning.

Current Feature:
Title: ${featureTitle}
Description: ${featureDescription}

Current Responses:`;

    responses.forEach((response) => {
      let value = response.value;
      if (Array.isArray(value)) {
        value = value.join(", ");
      }
      prompt += `\n- ${response.questionId}: ${value}`;
    });

    return prompt;
  }

  public generateFollowUpQuestionsPrompt({
    featureTitle,
    featureDescription,
    responses,
    lastResponse,
  }: {
    featureTitle: string;
    featureDescription: string;
    responses: QuestionResponse[];
    lastResponse: QuestionResponse;
  }): string {
    const contextPrompt = this.buildContextPrompt(
      featureTitle,
      featureDescription,
      responses,
    );

    return `${contextPrompt}

The user just answered: ${lastResponse.questionId} = ${lastResponse.value}

Based on this answer and the overall context, suggest up to ${this.config.maxFollowUpQuestions} intelligent follow-up questions that would help create a more detailed and comprehensive specification.

Focus on:
1. Clarifying ambiguous or vague responses
2. Uncovering edge cases the user might not have considered
3. Exploring technical implications
4. Understanding user experience details
5. Identifying potential integration points

Format your response as a numbered list of questions with brief reasoning for each. Only suggest questions that are directly relevant and would add significant value to the specification. If no meaningful follow-up questions are needed, explain why the current responses are sufficient.`;
  }

  public generateQuestionImprovementPrompt(
    questionText: string,
    questionType: string,
    questionCategory: string,
    context: {
      featureTitle: string;
      featureDescription: string;
      responses: QuestionResponse[];
    },
  ): string {
    const contextPrompt = this.buildContextPrompt(
      context.featureTitle,
      context.featureDescription,
      context.responses,
    );

    return `${contextPrompt}

Current Question: ${questionText}
Question Type: ${questionType}
Category: ${questionCategory}

Analyze this question in the context of the feature and current responses. Suggest improvements to make it:
1. More specific and actionable
2. Better at uncovering important details
3. Clearer and easier to understand
4. More relevant to software development

Provide your analysis including whether the question needs improvement and your reasoning.`;
  }

  public generateCompletenessValidationPrompt({
    featureTitle,
    featureDescription,
    responses,
  }: {
    featureTitle: string;
    featureDescription: string;
    responses: QuestionResponse[];
  }): string {
    const contextPrompt = this.buildContextPrompt(
      featureTitle,
      featureDescription,
      responses,
    );

    return `${contextPrompt}

Analyze this feature specification for completeness. Consider:
1. Are all critical aspects covered? (functionality, UI/UX, performance, security, edge cases)
2. Are there any obvious gaps in requirements?
3. Would a developer have enough information to implement this feature?
4. Are there missing technical considerations?

Provide a comprehensive analysis including:
- Estimated completion percentage
- Missing areas that need attention
- Critical gaps that must be addressed
- Suggested questions to fill the gaps
- Overall assessment summary

Be conservative - only mark as complete if it's truly comprehensive and ready for development.`;
  }

  public generateContextualQuestionsPrompt({
    featureTitle,
    featureDescription,
    responses,
  }: {
    featureTitle: string;
    featureDescription: string;
    responses: QuestionResponse[];
  }): string {
    const contextPrompt = this.buildContextPrompt(
      featureTitle,
      featureDescription,
      responses,
    );

    return `${contextPrompt}

Based on the feature context and current responses, generate smart contextual questions that would significantly improve the specification quality. Consider the type of feature, target users, and technical complexity.

Focus on generating questions that are specifically relevant to this feature type and would uncover important details that generic questions might miss.

Format your response with:
- Priority level (high/medium/low)
- List of contextual questions with reasoning
- Overall assessment of why these questions matter`;
  }

  public generateQualityAssessmentPrompt({
    featureTitle,
    featureDescription,
    responses,
    markdownSpec,
  }: {
    featureTitle: string;
    featureDescription: string;
    responses: QuestionResponse[];
    markdownSpec: string;
  }): string {
    const contextPrompt = this.buildContextPrompt(
      featureTitle,
      featureDescription,
      responses,
    );

    return `${contextPrompt}

Generated Specification:
${markdownSpec}

Assess the quality of this specification across multiple dimensions:
- Clarity: How clear and understandable is the specification?
- Completeness: How comprehensive and thorough is it?
- Specificity: How specific and actionable are the requirements?
- Implementability: How ready is this for development?

Provide your assessment including:
- Overall quality score (0-100)
- Individual scores for each dimension
- Key strengths of the specification
- Areas for improvement or weaknesses
- Specific recommendations for enhancement
- Whether it's ready for development or needs more work`;
  }

  public generateAnswerInferencePrompt({
    featureTitle,
    featureDescription,
    responses,
    nextQuestion,
  }: {
    featureTitle: string;
    featureDescription: string;
    responses: QuestionResponse[];
    nextQuestion: Question;
  }): string {
    const contextPrompt = this.buildContextPrompt(
      featureTitle,
      featureDescription,
      responses,
    );

    let questionDetails = `Next Question ID: ${nextQuestion.id}
Question Text: ${nextQuestion.text}
Question Type: ${nextQuestion.type}
Required: ${nextQuestion.required}`;

    if (nextQuestion.options) {
      questionDetails += `\nValid Options: ${nextQuestion.options.join(", ")}`;
    }

    return `${contextPrompt}

${questionDetails}

Your task: Analyze whether you can confidently infer the answer to this question based on:
1. The feature title and description
2. The user's previous responses
3. Logical dependencies and implications

CRITICAL RULES:
- Only suggest an answer if you are 90%+ confident it's correct
- Consider the question type and valid options (if applicable)
- Do NOT make assumptions - only infer from explicit information
- For boolean questions, only suggest if the answer is clearly implied
- For select/multiselect, only suggest from the valid options provided
- Explain your reasoning clearly

If you CAN infer an answer with high confidence, respond with:
CONFIDENCE: [0.0-1.0 score]
INFERRED_ANSWER: [the answer value]
REASONING: [clear explanation of why this inference is justified]

If you CANNOT confidently infer the answer, respond with:
CONFIDENCE: 0.0
REASONING: [explain why the answer requires user input]

Remember: It's better to ask the user than to make incorrect assumptions. Only infer when truly certain.`;
  }
}
