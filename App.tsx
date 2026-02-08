
import React, { useState, useCallback, useMemo } from 'react';
import type { Question, QuizMode, AppState, Quiz, UserAnswer, StudyGuide } from './types';
import { generateQuestions, extractTextFromPdf, getTutorExplanation, generateStudyGuide } from './services/aiService';
import { Loader, QuizCard, ResultsCard, UploadIcon, BrainIcon, DocumentIcon, ChecklistIcon, StudyGuideDisplay, PdfIcon, WordIcon, QnaCard } from './components/ui';

// Declare global variables from CDNs
declare const jspdf: any;
declare const html2canvas: any;
declare const htmlToDocx: any;
declare const saveAs: any;

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>('home');
    const [error, setError] = useState<string | null>(null);

    // Input state
    const [text, setText] = useState<string>('');
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [inputType, setInputType] = useState<'text' | 'pdf'>('text');
    
    // Quiz state
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [qnaQuestions, setQnaQuestions] = useState<Question[] | null>(null);

    // Study Guide state
    const [studyGuide, setStudyGuide] = useState<StudyGuide | null>(null);

    // Tutor state
    const [tutorResponses, setTutorResponses] = useState<Record<number, string>>({});
    const [tutorLoading, setTutorLoading] = useState<number | null>(null);
    const [isExporting, setIsExporting] = useState<boolean>(false);

    const getContext = async (): Promise<string> => {
        let context = '';
        if (inputType === 'text') {
            if (text.trim().length < 200) {
                throw new Error("Please provide at least 200 characters of text for a quality result.");
            }
            context = text;
        } else if (inputType === 'pdf' && pdfFile) {
            context = await extractTextFromPdf(pdfFile);
            if (context.trim().length < 200) {
                throw new Error("Extracted PDF text is too short (less than 200 characters).");
            }
        } else {
            throw new Error("Please provide input text or a PDF file.");
        }
        return context;
    }

    const handleGenerateStudyGuide = useCallback(async () => {
        setAppState('loading');
        setError(null);
        setStudyGuide(null);
        try {
            const context = await getContext();
            const guide = await generateStudyGuide(context);
            if (!guide || guide.terminologies.length === 0) {
                 throw new Error("Could not generate a study guide. The text might not contain enough key information.");
            }
            setStudyGuide(guide);
            setAppState('studyGuide');
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
            setAppState('home');
        }
    }, [inputType, text, pdfFile]);

    const handleGenerateQnA = useCallback(async () => {
        setAppState('loading');
        setError(null);
        setQnaQuestions(null);
        try {
            const context = await getContext();
            const questions = await generateQuestions(context, 'default');
            if (questions.length === 0) {
                throw new Error("Could not generate questions. The text might be too short or not relevant enough.");
            }
            setQnaQuestions(questions);
            setAppState('qna');
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
            setAppState('home');
        }
    }, [inputType, text, pdfFile]);


    const handleStartQuiz = useCallback(async (mode: QuizMode) => {
        setAppState('loading');
        setError(null);
        setQuiz(null);
        try {
            const context = await getContext();
            const questions = await generateQuestions(context, mode);
            if (questions.length === 0) {
                throw new Error("Could not generate questions. The text might be too short or not relevant enough for an ISTQB quiz.");
            }
            
            setQuiz({ questions, userAnswers: [], score: 0, mode });
            setCurrentQuestionIndex(0);
            setSelectedOption(null);
            setTutorResponses({});
            setAppState('quiz');

        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
            setAppState('home');
        }
    }, [inputType, text, pdfFile]);

    const handleAnswerQuestion = () => {
        if (!quiz || selectedOption === null) return;

        const currentQuestion = quiz.questions[currentQuestionIndex];
        const isCorrect = selectedOption === currentQuestion.answer;

        const updatedAnswers = [...quiz.userAnswers, {
            questionIndex: currentQuestionIndex,
            answer: selectedOption,
            isCorrect,
        }];

        setQuiz({ ...quiz, userAnswers: updatedAnswers });

        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(null);
        } else {
            const finalScore = updatedAnswers.filter(a => a.isCorrect).length;
            setQuiz({ ...quiz, userAnswers: updatedAnswers, score: finalScore });
            setAppState('results');
        }
    };
    
    const handleAskTutor = async (question: Question, query: string) => {
        const questionIndex = quiz?.questions.findIndex(q => q.question === question.question) ?? -1;
        if(questionIndex === -1) return;

        setTutorLoading(questionIndex);
        try {
            const explanation = await getTutorExplanation(question, query);
            setTutorResponses(prev => ({...prev, [questionIndex]: explanation}));
        } catch(err: any) {
             setTutorResponses(prev => ({...prev, [questionIndex]: `Sorry, the tutor could not respond. ${err.message}`}));
        } finally {
            setTutorLoading(null);
        }
    };

    const handleRestart = () => {
        setAppState('home');
        setQuiz(null);
        setError(null);
        setStudyGuide(null);
        setQnaQuestions(null);
    };

    const handleExportPdf = async () => {
        const resultsContainer = document.getElementById('results-container');
        if (!resultsContainer) return;
        setIsExporting(true);
        setError(null);

        try {
            const { jsPDF } = jspdf;
            const pdf = new jsPDF('p', 'pt', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const margin = 40;
            let yPos = margin;

            // Add summary first
            const summaryEl = resultsContainer.querySelector('#results-summary') as HTMLElement;
            if (summaryEl) {
                 const summaryCanvas = await html2canvas(summaryEl, { scale: 2 });
                 const summaryImgData = summaryCanvas.toDataURL('image/png');
                 const summaryImgProps = pdf.getImageProperties(summaryImgData);
                 const summaryPdfHeight = (summaryImgProps.height * (pdfWidth - margin * 2)) / summaryImgProps.width;
                 pdf.addImage(summaryImgData, 'PNG', margin, yPos, pdfWidth - margin * 2, summaryPdfHeight);
                 yPos += summaryPdfHeight + 20;
            }

            const cards = resultsContainer.querySelectorAll('.results-card-for-export');
            
            for (let i = 0; i < cards.length; i++) {
                const card = cards[i] as HTMLElement;
                const canvas = await html2canvas(card, { scale: 2 });
                const imgData = canvas.toDataURL('image/png');
                const imgProps = pdf.getImageProperties(imgData);
                const pdfHeight = (imgProps.height * (pdfWidth - margin * 2)) / imgProps.width;

                if (yPos + pdfHeight > pdf.internal.pageSize.getHeight() - margin) {
                    pdf.addPage();
                    yPos = margin;
                }

                pdf.addImage(imgData, 'PNG', margin, yPos, pdfWidth - margin * 2, pdfHeight);
                yPos += pdfHeight + 15;
            }
            
            pdf.save('istqb-quiz-results.pdf');

        } catch (err) {
            console.error(err);
            setError("Failed to export PDF. There might be an issue with the content.");
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportWord = async () => {
        if (!quiz) return;
        setIsExporting(true);
        setError(null);
        
        try {
            const scorePercentage = Math.round((quiz.score / quiz.questions.length) * 100);
            
            let contentHtml = `
                <div style="font-family: Arial, sans-serif; font-size: 12pt;">
                    <h1>ISTQB Quiz Results</h1>
                    <p style="font-size: 16pt; font-weight: bold;">
                        Final Score: ${scorePercentage}% (${quiz.score} out of ${quiz.questions.length})
                    </p>
                    <hr />
            `;

            quiz.questions.forEach((q, i) => {
                const userAnswer = quiz.userAnswers.find(a => a.questionIndex === i);
                if (!userAnswer) return;

                contentHtml += `<div style="margin-bottom: 20px; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">`;
                contentHtml += `<p><strong>Question ${i + 1}:</strong> ${q.question}</p>`;
                contentHtml += '<ul>';
                q.options.forEach(opt => {
                     let style = 'list-style-type: none; margin-left: 0; padding: 5px;';
                     if (opt === q.answer) {
                         style += 'background-color: #d4edda; color: #155724;'; // Green for correct
                     } else if (opt === userAnswer.answer) {
                         style += 'background-color: #f8d7da; color: #721c24;'; // Red for incorrect user answer
                     }
                     contentHtml += `<li style="${style}">${opt}</li>`;
                });
                contentHtml += '</ul>';
                contentHtml += `
                    <p><strong>Your Answer:</strong> ${userAnswer.answer} (${userAnswer.isCorrect ? 'Correct' : 'Incorrect'})</p>
                    <p><strong>Correct Answer:</strong> ${q.answer}</p>
                `;
                contentHtml += `</div>`;
            });

            contentHtml += `</div>`;

            const fileBlob = await htmlToDocx(contentHtml, null, {
                font: 'Arial',
                fontSize: '12pt',
            });
            saveAs(fileBlob, 'istqb-quiz-results.doc');

        } catch (err) {
            console.error(err);
            setError("Failed to export Word document.");
        } finally {
            setIsExporting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setPdfFile(e.target.files[0]);
            setError(null);
        }
    };

    const isInputReady = useMemo(() => {
        if (inputType === 'text') return text.trim().length > 0;
        if (inputType === 'pdf') return !!pdfFile;
        return false;
    }, [inputType, text, pdfFile]);

    const renderContent = () => {
        switch (appState) {
            case 'loading':
                return <Loader text="Your content is being generated..."/>;
            case 'studyGuide':
                if (!studyGuide) return null;
                return (
                    <div className="w-full">
                        <StudyGuideDisplay guide={studyGuide} />
                         <div className="mt-8 text-center">
                             <button onClick={handleRestart} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition">
                                Back to Home
                            </button>
                        </div>
                    </div>
                );
             case 'qna':
                if (!qnaQuestions) return null;
                return (
                    <div className="w-full">
                         <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Generated Questions & Answers</h2>
                            <p className="text-slate-500 dark:text-slate-400">Review the questions and the correct answers below.</p>
                        </div>
                        <div className="space-y-6">
                           {qnaQuestions.map((q, i) => (
                                <QnaCard key={i} question={q} index={i} />
                           ))}
                        </div>
                         <div className="mt-8 text-center">
                             <button onClick={handleRestart} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition">
                                Back to Home
                            </button>
                        </div>
                    </div>
                );
            case 'quiz':
                if (!quiz) return null;
                const currentQuestion = quiz.questions[currentQuestionIndex];
                return (
                    <div className="w-full">
                         <div className="mb-4">
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}></div>
                            </div>
                        </div>
                        <QuizCard 
                            question={currentQuestion}
                            index={currentQuestionIndex}
                            total={quiz.questions.length}
                            selectedOption={selectedOption}
                            onOptionSelect={setSelectedOption}
                        />
                        <div className="mt-6 text-center">
                            <button
                                onClick={handleAnswerQuestion}
                                disabled={!selectedOption}
                                className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transform transition-transform duration-200 hover:scale-105"
                            >
                                {currentQuestionIndex === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                            </button>
                        </div>
                    </div>
                );
            case 'results':
                if (!quiz) return null;
                const scorePercentage = Math.round((quiz.score / quiz.questions.length) * 100);
                return (
                    <div className="w-full animate-fade-in">
                        <div id="results-container">
                            <div id="results-summary" className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md text-center mb-8">
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Quiz Complete!</h2>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">You scored:</p>
                                <p className={`text-6xl font-bold my-4 ${scorePercentage >= 70 ? 'text-green-500' : 'text-amber-500'}`}>
                                    {scorePercentage}%
                                </p>
                                <p className="text-slate-600 dark:text-slate-300">{quiz.score} out of {quiz.questions.length} correct</p>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 text-center">Review Your Answers</h3>
                            <div className="space-y-6">
                                {quiz.questions.map((q, i) => {
                                    const userAnswer = quiz.userAnswers.find(a => a.questionIndex === i);
                                    if(!userAnswer) return null;
                                    return (
                                        <ResultsCard
                                            key={i}
                                            index={i}
                                            question={q}
                                            userAnswer={userAnswer.answer}
                                            isCorrect={userAnswer.isCorrect}
                                            onAskTutor={handleAskTutor}
                                            tutorResponse={tutorResponses[i] || null}
                                            isTutorLoading={tutorLoading === i}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 text-center space-y-4">
                            <div className="flex justify-center items-center gap-4">
                               <button onClick={handleExportPdf} disabled={isExporting} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-slate-400 transition">
                                   <PdfIcon className="w-5 h-5"/>
                                   {isExporting ? 'Exporting...' : 'Export PDF'}
                                </button>
                                <button onClick={handleExportWord} disabled={isExporting} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition">
                                    <WordIcon className="w-5 h-5"/>
                                    {isExporting ? 'Exporting...' : 'Export Word'}
                                </button>
                            </div>
                            <button onClick={handleRestart} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition">
                                Start a New Session
                            </button>
                        </div>
                    </div>
                );
            case 'home':
            default:
                return (
                    <div className="w-full">
                        <div className="w-full bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                            <div className="flex border-b border-slate-200 dark:border-slate-700 mb-4">
                               <button onClick={() => setInputType('text')} className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${inputType === 'text' ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Paste Text</button>
                               <button onClick={() => setInputType('pdf')} className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${inputType === 'pdf' ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Upload PDF</button>
                            </div>
                            {inputType === 'text' ? (
                                <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste your study material here..." className="w-full h-48 p-3 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-700 dark:text-slate-300" />
                            ) : (
                                <label htmlFor="pdf-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadIcon className="w-10 h-10 mb-3 text-slate-400" />
                                        <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">{pdfFile ? <span className="font-semibold text-indigo-600">{pdfFile.name}</span> : <><span className="font-semibold">Click to upload</span> or drag and drop</>}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">PDF (MAX. 5MB)</p>
                                    </div>
                                    <input id="pdf-upload" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                                </label>
                            )}
                        </div>
                        {error && <div className="mt-4 text-center text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-md">{error}</div>}
                        <div className="mt-6 text-center">
                            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-4">Choose your study mode:</h3>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button onClick={handleGenerateStudyGuide} disabled={!isInputReady} className="flex flex-col items-center justify-center gap-2 p-4 bg-sky-600 text-white font-bold rounded-lg shadow-lg hover:bg-sky-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105 h-32">
                                    <BrainIcon className="w-8 h-8"/>
                                    <span>Topic Deep Dive</span>
                                    <span className="text-xs font-normal">Generate Study Guide</span>
                                </button>
                                <button onClick={handleGenerateQnA} disabled={!isInputReady} className="flex flex-col items-center justify-center gap-2 p-4 bg-teal-600 text-white font-bold rounded-lg shadow-lg hover:bg-teal-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105 h-32">
                                    <ChecklistIcon className="w-8 h-8"/>
                                    <span>Generate Q&amp;A</span>
                                    <span className="text-xs font-normal">For Quick Review</span>
                                </button>
                                <button onClick={() => handleStartQuiz('mock')} disabled={!isInputReady} className="flex flex-col items-center justify-center gap-2 p-4 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105 h-32">
                                    <DocumentIcon className="w-8 h-8"/>
                                    <span>Mock Exam</span>
                                    <span className="text-xs font-normal">Simulate the Real Test</span>
                                </button>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
            <main className="container mx-auto px-4 py-8 max-w-3xl">
                <header className="text-center p-4 mb-8">
                    <h1 className="text-4xl font-bold text-slate-800 dark:text-white">ISTQB Study Co-Pilot</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Your interactive partner for exam preparation.</p>
                </header>
                {renderContent()}
            </main>
        </div>
    );
};

export default App;
