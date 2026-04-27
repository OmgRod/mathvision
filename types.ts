
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

export interface LessonSection {
  title: string;
  content: string; // Markdown
  diagramSvg?: string;
}

export interface LessonQuestion {
  question: string;
  correctAnswer: string;
  explanation: string;
}

export interface Lesson {
  topic: string;
  sections: LessonSection[];
  checkpoints: LessonQuestion[];
}

export interface ProcessingState {
  isProcessing: boolean;
  error: string | null;
  result: MathResult | null;
}
