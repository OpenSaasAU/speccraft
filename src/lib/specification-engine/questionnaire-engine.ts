import { Question, QuestionResponse, QuestionnaireSession } from './types';
import { baseQuestions } from './base-questions';

export class QuestionnaireEngine {
  private session: QuestionnaireSession;
  private questions: Question[];

  constructor(featureTitle: string, featureDescription: string, sessionId?: string) {
    this.questions = [...baseQuestions].sort((a, b) => a.order - b.order);
    this.session = {
      id: sessionId || this.generateId(),
      featureTitle,
      featureDescription,
      currentQuestionIndex: 0,
      responses: [],
      isComplete: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private generateId(): string {
    return `questionnaire_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public getCurrentQuestion(): Question | null {
    const availableQuestions = this.getAvailableQuestions();
    return availableQuestions[this.session.currentQuestionIndex] || null;
  }

  public getAvailableQuestions(): Question[] {
    return this.questions.filter(question => this.shouldAskQuestion(question));
  }

  private shouldAskQuestion(question: Question): boolean {
    // Check if question has a dependency
    if (question.dependsOn) {
      const dependencyResponse = this.session.responses.find(
        r => r.questionId === question.dependsOn!.questionId
      );
      
      if (!dependencyResponse) {
        return false; // Dependency not answered yet
      }
      
      return dependencyResponse.value === question.dependsOn.value;
    }
    
    return true;
  }

  public answerCurrentQuestion(value: string | boolean | string[]): void {
    const currentQuestion = this.getCurrentQuestion();
    if (!currentQuestion) {
      throw new Error('No current question to answer');
    }

    // Validate required questions
    if (currentQuestion.required && (!value || (Array.isArray(value) && value.length === 0))) {
      throw new Error('This question is required');
    }

    // Remove existing response for this question if it exists
    this.session.responses = this.session.responses.filter(
      r => r.questionId !== currentQuestion.id
    );

    // Add new response
    this.session.responses.push({
      questionId: currentQuestion.id,
      value,
      timestamp: new Date(),
    });

    // Move to next question
    this.session.currentQuestionIndex++;
    this.session.updatedAt = new Date();

    // Check if questionnaire is complete
    const availableQuestions = this.getAvailableQuestions();
    if (this.session.currentQuestionIndex >= availableQuestions.length) {
      this.session.isComplete = true;
    }
  }

  public goToPreviousQuestion(): boolean {
    if (this.session.currentQuestionIndex > 0) {
      this.session.currentQuestionIndex--;
      this.session.isComplete = false;
      this.session.updatedAt = new Date();
      return true;
    }
    return false;
  }

  public goToQuestion(questionId: string): boolean {
    const availableQuestions = this.getAvailableQuestions();
    const questionIndex = availableQuestions.findIndex(q => q.id === questionId);
    
    if (questionIndex !== -1) {
      this.session.currentQuestionIndex = questionIndex;
      this.session.isComplete = false;
      this.session.updatedAt = new Date();
      return true;
    }
    return false;
  }

  public getResponse(questionId: string): QuestionResponse | undefined {
    return this.session.responses.find(r => r.questionId === questionId);
  }

  public getAllResponses(): QuestionResponse[] {
    return [...this.session.responses];
  }

  public getProgress(): { current: number; total: number; percentage: number } {
    const availableQuestions = this.getAvailableQuestions();
    const answeredQuestions = this.session.responses.length;
    const total = availableQuestions.length;
    
    return {
      current: Math.min(answeredQuestions, total),
      total,
      percentage: total > 0 ? Math.round((Math.min(answeredQuestions, total) / total) * 100) : 0,
    };
  }

  public isComplete(): boolean {
    return this.session.isComplete;
  }

  public getSession(): QuestionnaireSession {
    return { ...this.session };
  }

  public static fromSession(session: QuestionnaireSession): QuestionnaireEngine {
    const engine = new QuestionnaireEngine(
      session.featureTitle,
      session.featureDescription,
      session.id
    );
    engine.session = { ...session };
    return engine;
  }

  public addDynamicQuestion(question: Question): void {
    // Insert question in the appropriate order
    const insertIndex = this.questions.findIndex(q => q.order > question.order);
    if (insertIndex === -1) {
      this.questions.push(question);
    } else {
      this.questions.splice(insertIndex, 0, question);
    }
    
    this.session.updatedAt = new Date();
  }

  public getUnansweredRequiredQuestions(): Question[] {
    const availableQuestions = this.getAvailableQuestions();
    const answeredQuestionIds = new Set(this.session.responses.map(r => r.questionId));
    
    return availableQuestions.filter(
      q => q.required && !answeredQuestionIds.has(q.id)
    );
  }
}