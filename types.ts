
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

export enum QuestionType {
  FREE_RESPONSE = 'FREE_RESPONSE',
  MCQ = 'MCQ',
  TRUE_FALSE = 'TRUE_FALSE'
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: QuestionType;
  correctSteps: Step[];
  finalAnswer: string;
  diagramSvg?: string;
  calculatorAllowed?: boolean;
  options?: string[];
}

export interface QuizFeedback {
  isCorrect: boolean;
  message: string;
  improvement?: string;
  isFinalAnswer?: boolean;
}

export interface LessonSection {
  title: string;
  content: string; // Markdown
  diagramSvg?: string;
}

export interface LessonQuestion {
  question: string;
  type: QuestionType;
  correctAnswer: string;
  explanation: string;
  calculatorAllowed?: boolean;
  options?: string[];
}

export interface Lesson {
  topic: string;
  description?: string;
  outline?: string[];
  sections: LessonSection[];
  checkpoints: LessonQuestion[];
}

export interface LessonHistoryData {
  lesson: Lesson;
  lastCheckpointIndex?: number;
  lessonLevel?: number;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  type: 'solution' | 'practice' | 'lesson';
  topic: string;
  data: any; // MathResult | QuizQuestion | Lesson | LessonHistoryData
}

export interface ProcessingState {
  isProcessing: boolean;
  error: string | null;
  result: MathResult | null;
}
