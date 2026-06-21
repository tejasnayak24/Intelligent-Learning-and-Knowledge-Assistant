import { useState } from 'react';
import Sidebar from '../components/Sidebar';

export default function Quiz() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleGenerateQuiz = () => {
    setIsGenerating(true);
    setQuestions(null);
    setQuizFinished(false);
    setCurrentIdx(0);
    setScore(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);

    console.log('Requesting quiz payload from backend: POST /quiz');

    // Mock API processing delay
    setTimeout(() => {
      setQuestions([
        {
          question: 'Which of the following process states defines a process that has been loaded into main memory and is waiting to be assigned to a CPU core?',
          options: ['New', 'Ready', 'Running', 'Waiting'],
          correctAnswer: 'Ready'
        },
        {
          question: 'What type of overhead is directly introduced when an operating system saves the state of a running process and restores the state of another?',
          options: ['Thrashing', 'Context Switching Overhead', 'Segmentation Fault', 'Pipeline Stall'],
          correctAnswer: 'Context Switching Overhead'
        },
        {
          question: 'Which scheduling infrastructure data unit is responsible for storing program counters, register sets, and memory boundaries for an active process?',
          options: ['FCFS Block', 'TLB Cache', 'PCB (Process Control Block)', 'Inverted Page Table'],
          correctAnswer: 'PCB (Process Control Block)'
        }
      ]);
      setIsGenerating(false);
    }, 1200);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted) return;
    
    setIsAnswerSubmitted(true);
    if (selectedOption === questions[currentIdx].correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/40 px-6 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <span className="text-xl">❓</span>
            <div>
              <h2 className="text-sm font-semibold text-white">Interactive Assessment Engine</h2>
              <p className="text-xs text-slate-400">Test your mastery with instantly generated context quizzes</p>
            </div>
          </div>
        </header>

        {/* Evaluation Frame */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left panel Control Status */}
          <div className="w-80 border-r border-slate-800/60 p-6 flex flex-col justify-between bg-slate-900/10">
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Active Reference</span>
                <p className="text-sm font-medium text-slate-200 truncate">Operating_Systems_Notes.pdf</p>
              </div>

              {questions && !quizFinished && (
                <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Metrics Terminal</span>
                  <p className="text-sm text-slate-300">Progress: <span className="text-white font-semibold">{currentIdx + 1} / {questions.length}</span></p>
                  <p className="text-sm text-slate-300 mt-1">Running Score: <span className="text-indigo-400 font-semibold">{score}</span></p>
                </div>
              )}
            </div>

            <button
              onClick={handleGenerateQuiz}
              disabled={isGenerating}
              className={`w-full py-3 px-4 rounded-xl text-sm font-medium transition-all shadow-md cursor-pointer ${
                isGenerating
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/10'
              }`}
            >
              {isGenerating ? 'Analyzing Taxonomy...' : questions ? 'Restart Quiz' : 'Generate Smart Quiz'}
            </button>
          </div>

          {/* Right Panel Main Workspace Area */}
          <div className="flex-1 overflow-y-auto p-8 bg-slate-950/40 flex items-center justify-center">
            {isGenerating ? (
              /* Processing View State */
              <div className="flex flex-col items-center space-y-4">
                <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-sm text-slate-400">Isolating critical facts and writing multiple choice matrices...</p>
              </div>
            ) : quizFinished ? (
              /* Score Metrics Completion Card View */
              <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center shadow-xl space-y-6 animate-fadeIn">
                <div className="text-5xl">🏆</div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Assessment Complete!</h3>
                  <p className="text-sm text-slate-400 mt-1">Review your absolute processing efficiency score</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl inline-block px-8">
                  <span className="text-4xl font-extrabold text-indigo-400">{score}</span>
                  <span className="text-slate-500 text-lg"> / {questions.length}</span>
                </div>
                <p className="text-xs text-slate-500">
                  {score === questions.length ? 'Flawless recall! Context thoroughly retained.' : 'Good push! Generate another configuration set to target weak gaps.'}
                </p>
                <button
                  onClick={handleGenerateQuiz}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Generate New Quiz Set
                </button>
              </div>
            ) : questions ? (
              /* Live Quiz Question View Card */
              <div className="w-full max-w-2xl bg-slate-900 border border-slate-800/60 p-8 rounded-2xl shadow-xl flex flex-col justify-between min-h-[400px] animate-fadeIn">
                <div className="space-y-6">
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block">Question {currentIdx + 1}</span>
                  <h2 className="text-base font-medium text-slate-100 leading-relaxed">
                    {questions[currentIdx].question}
                  </h2>

                  {/* Options Dynamic Stack */}
                  <div className="grid grid-cols-1 gap-3">
                    {questions[currentIdx].options.map((option, idx) => {
                      const isSelected = selectedOption === option;
                      const isCorrect = option === questions[currentIdx].correctAnswer;
                      
                      let optionStyle = 'border-slate-800 bg-slate-950/50 hover:bg-slate-950 text-slate-300';
                      
                      if (isSelected) {
                        optionStyle = 'border-indigo-500 bg-indigo-500/10 text-indigo-400';
                      }
                      
                      if (isAnswerSubmitted) {
                        if (isCorrect) {
                          optionStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-semibold';
                        } else if (isSelected) {
                          optionStyle = 'border-red-500 bg-red-500/10 text-red-400';
                        } else {
                          optionStyle = 'border-slate-800 bg-slate-950/20 text-slate-600 cursor-not-allowed';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={isAnswerSubmitted}
                          onClick={() => setSelectedOption(option)}
                          className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-center justify-between ${optionStyle} ${!isAnswerSubmitted && 'cursor-pointer'}`}
                        >
                          <span>{option}</span>
                          {isAnswerSubmitted && isCorrect && <span className="text-emerald-400 text-xs">✓ Correct</span>}
                          {isAnswerSubmitted && isSelected && !isCorrect && <span className="text-red-400 text-xs">✕ Incorrect</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submittal Execution Control Footer */}
                <div className="pt-6 border-t border-slate-800/60 mt-8 flex justify-end">
                  {!isAnswerSubmitted ? (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={selectedOption === null}
                      className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                        selectedOption !== null
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-md'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Check Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-all cursor-pointer border border-slate-700"
                    >
                      {currentIdx + 1 === questions.length ? 'Finish Evaluation →' : 'Next Question →'}
                    </button>
                  )}
                </div>

              </div>
            ) : (
              /* Initial Empty Prompt State */
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800/80 rounded-2xl p-8 text-center max-w-xl">
                <span className="text-4xl mb-3">❓</span>
                <h4 className="text-base font-semibold text-slate-200">No Assessment Active</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Click the initialization button to prompt the engine to compile a multiple choice challenge from your document content.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}