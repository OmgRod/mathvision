
import { PRACTICE_TOPICS, MathTopic } from './constants';
import { getUserProfile } from './userService';

export interface ExamPath {
  id: string;
  name: string;
  description: string;
  topics: string[]; // List of topic names
  icon: string;
  color: string;
}

const EXAM_METADATA = [
  {
    id: 'aqa-further-maths',
    name: 'AQA GCSE Further Maths',
    tag: 'AQA GCSE Further Maths',
    description: 'Level 2 Certificate preparation. Advanced algebra, matrices, and calculus for high-achieving GCSE students.',
    icon: 'GraduationCap',
    color: 'indigo'
  },
  {
    id: 'sat-math',
    name: 'SAT Math Mastery',
    tag: 'SAT Math',
    description: 'Comprehensive preparation for the SAT Mathematics section, covering heart of algebra, problem solving, and advanced math.',
    icon: 'GraduationCap',
    color: 'indigo'
  },
  {
    id: 'ap-calculus-ab',
    name: 'AP Calculus AB Track',
    tag: 'AP Calculus AB',
    description: 'Master the core concepts of differential and integral calculus required for the AP Calculus AB exam.',
    icon: 'Zap',
    color: 'amber'
  },
  {
    id: 'gcse-higher',
    name: 'GCSE Maths Higher',
    tag: 'GCSE Maths Higher',
    description: 'Targeting Grade 7-9 in the GCSE Higher tier. Includes advanced circle theorems, vectors, and quadratic inequalities.',
    icon: 'Target',
    color: 'emerald'
  },
  {
    id: '11-plus-prep',
    name: '11+ / Primary Excellence',
    tag: '11+ / Primary Excellence',
    description: 'Prepare for 11+ entrance exams with focus on mental arithmetic, word problems, and logical reasoning.',
    icon: 'GraduationCap',
    color: 'amber'
  },
  {
    id: '13-plus-entrance',
    name: '13+ / Scholarship Track',
    tag: '13+ / Scholarship Track',
    description: 'Common Entrance and Scholarship level preparation for senior school entry.',
    icon: 'Target',
    color: 'emerald'
  },
  {
    id: 'a-level-further',
    name: 'A-Level Further Maths',
    tag: 'A-Level Further Maths',
    description: 'Deep dive into complex numbers, matrices, and abstract mathematical structures.',
    icon: 'Zap',
    color: 'indigo'
  },
  {
    id: 'uni-foundation',
    name: 'University STEM Foundation',
    tag: 'University STEM Foundation',
    description: 'Bridging the gap between school and university for Engineering and Physical Sciences.',
    icon: 'Award',
    color: 'amber'
  }
];

export const EXAM_PATHS: ExamPath[] = EXAM_METADATA.map(meta => ({
  id: meta.id,
  name: meta.name,
  description: meta.description,
  icon: meta.icon,
  color: meta.color,
  topics: PRACTICE_TOPICS
    .filter(t => t.exams?.includes(meta.tag))
    .map(t => t.name)
}));

export interface ExamProgress {
  pathId: string;
  completedTopics: string[];
  percentComplete: number;
  isUnlocked: boolean;
}

export const getExamPathsProgress = (): ExamProgress[] => {
  const profile = getUserProfile();
  const allCompleted = new Set([...profile.completedTopics, ...profile.masteredLessons]);

  return EXAM_PATHS.map(path => {
    const pathCompleted = path.topics.filter(topic => allCompleted.has(topic));
    const percent = path.topics.length > 0 
      ? Math.round((pathCompleted.length / path.topics.length) * 100)
      : 0;
    
    return {
      pathId: path.id,
      completedTopics: pathCompleted,
      percentComplete: percent,
      isUnlocked: percent === 100
    };
  });
};

export const getPathById = (id: string) => EXAM_PATHS.find(p => p.id === id);
