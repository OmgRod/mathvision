
export interface Step {
  title: string;
  math: string;
  diagramSvg?: string;
}

export interface MathPart {
  partId: string; // e.g., "1", "2a", "Part B"
  title?: string;
  finalAnswer: string;
  explanation: string;
  steps: Step[];
}

export interface MathResult {
  parts: MathPart[];
  overallExplanation?: string;
  mainDiagramSvg?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  correctSteps: Step[];
  finalAnswer: string;
  diagramSvg?: string;
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
