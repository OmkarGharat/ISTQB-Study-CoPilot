
export interface Question {
  question: string;
  options: string[];
  answer: string;
}

export type QuizMode = 'topic' | 'mock';

export interface UserAnswer {
  questionIndex: number;
  answer: string;
  isCorrect: boolean;
}

export interface Quiz {
    questions: Question[];
    userAnswers: UserAnswer[];
    score: number;
    mode: QuizMode;
}

export interface StudyGuide {
    terminologies: {
        term: string;
        definition: string;
    }[];
    cheatSheet: string;
}

export type AppState = 'home' | 'loading' | 'quiz' | 'results' | 'studyGuide' | 'qna';
