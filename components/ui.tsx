
import React from 'react';
import type { Question, StudyGuide } from '../types';

declare const marked: any;

export const Loader: React.FC<{text?: string}> = ({text = "Generating your quiz..."}) => (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-slate-500 dark:text-slate-400">{text}</p>
    </div>
);

export const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

export const BrainIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 8h6M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

export const ChecklistIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);


export const DocumentIcon: React.FC<{ className?: string }> = ({ className }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
);

export const PdfIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
);
export const WordIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
);


export const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
);

export const StudyGuideDisplay: React.FC<{ guide: StudyGuide }> = ({ guide }) => (
    <div className="w-full animate-fade-in space-y-8">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 border-b-2 border-indigo-500 pb-2">Key Terminologies</h2>
            <div className="space-y-4">
                {guide.terminologies.map((item, index) => (
                    <div key={index} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
                        <h3 className="font-semibold text-lg text-indigo-700 dark:text-indigo-400">{item.term}</h3>
                        <p className="text-slate-600 dark:text-slate-300 mt-1">{item.definition}</p>
                    </div>
                ))}
            </div>
        </div>
         <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 border-b-2 border-indigo-500 pb-2">Cheat Sheet</h2>
             <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
                <div className="prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: marked.parse(guide.cheatSheet) }} />
            </div>
        </div>
    </div>
);


interface QuestionCardProps {
    question: Question;
    index: number;
    total: number;
    selectedOption: string | null;
    onOptionSelect: (option: string) => void;
}

export const QuizCard: React.FC<QuestionCardProps> = ({ question, index, total, selectedOption, onOptionSelect }) => {
    const optionLetters = ['A', 'B', 'C', 'D'];

    return (
        <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 w-full animate-fade-in">
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2">Question {index + 1} of {total}</p>
            <p className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6">
                {question.question}
            </p>
            <div className="space-y-3">
                {question.options.map((option, i) => (
                     <label
                        key={i}
                        className={`flex items-center p-3 rounded-md transition-all duration-200 border cursor-pointer
                            ${ selectedOption === option
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/50 ring-2 ring-indigo-500'
                                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                    >
                        <input
                            type="radio"
                            name={`question-${index}`}
                            value={option}
                            checked={selectedOption === option}
                            onChange={() => onOptionSelect(option)}
                            className="hidden"
                        />
                        <span
                            className={`font-mono font-bold w-6 h-6 flex items-center justify-center rounded-full mr-4 text-sm
                                ${ selectedOption === option
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                                }`}
                        >
                            {optionLetters[i]}
                        </span>
                        <span className="text-slate-700 dark:text-slate-300 flex-1">{option}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

interface ResultsCardProps {
    question: Question;
    index: number;
    userAnswer: string;
    isCorrect: boolean;
    onAskTutor: (question: Question, query: string) => void;
    tutorResponse: string | null;
    isTutorLoading: boolean;
}

export const ResultsCard: React.FC<ResultsCardProps> = ({ question, index, userAnswer, isCorrect, onAskTutor, tutorResponse, isTutorLoading }) => {
    const [tutorQuery, setTutorQuery] = React.useState('');
    const [showTutor, setShowTutor] = React.useState(false);
    const optionLetters = ['A', 'B', 'C', 'D'];

    const handleTutorSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(tutorQuery.trim()){
            onAskTutor(question, tutorQuery);
        }
    }

    return (
        <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 w-full transform transition-transform duration-300 hover:scale-[1.01] animate-fade-in results-card-for-export">
            <p className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                <span className="font-bold mr-2">{index + 1}.</span>
                {question.question}
            </p>
            <div className="space-y-3">
                {question.options.map((option, i) => {
                    const isTheCorrectAnswer = option === question.answer;
                    const isTheUserAnswer = option === userAnswer;
                    let bgClass = 'bg-slate-50 dark:bg-slate-700/50';
                    if (isTheCorrectAnswer) {
                        bgClass = 'bg-green-100 dark:bg-green-900/50 border-l-4 border-green-500';
                    } else if (isTheUserAnswer && !isCorrect) {
                        bgClass = 'bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500';
                    }

                    return (
                        <div key={i} className={`flex items-center p-3 rounded-md transition-colors duration-200 ${bgClass}`}>
                            <span className={`font-mono font-bold w-6 h-6 flex items-center justify-center rounded-full mr-3 text-sm
                                ${isTheCorrectAnswer ? 'bg-green-500 text-white' : (isTheUserAnswer ? 'bg-red-500 text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300')}`}>
                                {optionLetters[i]}
                            </span>
                            <span className="text-slate-700 dark:text-slate-300">{option}</span>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                 <button onClick={() => setShowTutor(!showTutor)} className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    {showTutor ? 'Hide AI Tutor' : 'Ask AI Tutor for help'}
                 </button>
                 {showTutor && (
                    <div className="mt-3 animate-fade-in">
                        {tutorResponse && (
                             <div className="prose prose-sm dark:prose-invert max-w-none bg-slate-100 dark:bg-slate-700 p-4 rounded-md mb-3" dangerouslySetInnerHTML={{ __html: marked.parse(tutorResponse) }} />
                        )}
                        {isTutorLoading && <Loader text="Tutor is thinking..."/>}
                        <form onSubmit={handleTutorSubmit} className="flex items-center gap-2">
                             <input
                                type="text"
                                value={tutorQuery}
                                onChange={(e) => setTutorQuery(e.target.value)}
                                placeholder="e.g., Why is C the correct answer?"
                                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-700 dark:text-slate-300 text-sm"
                            />
                            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-slate-400 text-sm" disabled={isTutorLoading || !tutorQuery.trim()}>Ask</button>
                        </form>
                    </div>
                 )}
            </div>
        </div>
    );
};

export const QnaCard: React.FC<{ question: Question; index: number }> = ({ question, index }) => {
    const optionLetters = ['A', 'B', 'C', 'D'];

    return (
        <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 w-full animate-fade-in">
            <p className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                <span className="font-bold mr-2">{index + 1}.</span>
                {question.question}
            </p>
            <div className="space-y-3">
                {question.options.map((option, i) => {
                    const isTheCorrectAnswer = option === question.answer;
                    const bgClass = isTheCorrectAnswer
                        ? 'bg-green-100 dark:bg-green-900/50 border-l-4 border-green-500'
                        : 'bg-slate-50 dark:bg-slate-700/50';

                    return (
                        <div key={i} className={`flex items-center p-3 rounded-md transition-colors duration-200 ${bgClass}`}>
                            <span className={`font-mono font-bold w-6 h-6 flex items-center justify-center rounded-full mr-3 text-sm
                                ${isTheCorrectAnswer ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'}`}>
                                {optionLetters[i]}
                            </span>
                            <span className="text-slate-700 dark:text-slate-300">{option}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
