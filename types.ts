
export interface Step {
  title: string;
  math: string;
}

export interface MathResult {
  finalAnswer: string;
  explanation: string;
  steps: Step[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  correctSteps: Step[];
  finalAnswer: string;
}

export interface QuizFeedback {
  isCorrect: boolean;
  message: string;
  improvement?: string;
}

export interface ProcessingState {
  isProcessing: boolean;
  error: string | null;
  result: MathResult | null;
}
