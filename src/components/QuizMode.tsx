import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, RefreshCw, Trophy, Volume2, ArrowRight } from 'lucide-react';
import { namesOfAllah, NameOfAllah } from '../data/names';
import { generatePronunciation } from '../services/tts';

interface QuizModeProps {
  onBack: () => void;
}

type QuestionType = 'arabic-to-meaning' | 'meaning-to-arabic' | 'transliteration-to-meaning';

interface Question {
  target: NameOfAllah;
  options: NameOfAllah[];
  type: QuestionType;
}

export default function QuizMode({ onBack }: QuizModeProps) {
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'summary'>('setup');
  const [questionCount, setQuestionCount] = useState(10);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const generateQuestions = () => {
    const shuffled = [...namesOfAllah].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, questionCount);
    
    const newQuestions: Question[] = selected.map(target => {
      // Pick 3 distractors
      const distractors = namesOfAllah
        .filter(n => n.number !== target.number)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      
      const options = [...distractors, target].sort(() => 0.5 - Math.random());
      
      // Randomize question type for variety
      const types: QuestionType[] = ['arabic-to-meaning', 'meaning-to-arabic', 'transliteration-to-meaning'];
      const type = types[Math.floor(Math.random() * types.length)];

      return { target, options, type };
    });

    setQuestions(newQuestions);
    setGameState('playing');
    setCurrentQuestionIndex(0);
    setScore(0);
    setIsAnswerChecked(false);
    setSelectedOption(null);
  };

  const handleOptionSelect = (index: number) => {
    if (isAnswerChecked) return;
    setSelectedOption(index);
  };

  const checkAnswer = () => {
    if (selectedOption === null) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = currentQuestion.options[selectedOption].number === currentQuestion.target.number;
    
    if (isCorrect) {
      setScore(s => s + 1);
      // Play success sound or haptic feedback here if desired
    }
    
    setIsAnswerChecked(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setIsAnswerChecked(false);
      setSelectedOption(null);
      setAudioUrl(null);
    } else {
      setGameState('summary');
    }
  };

  const playAudio = async (text: string) => {
    try {
      let url = audioUrl;
      if (!url) {
        url = await generatePronunciation(text);
        setAudioUrl(url);
      }
      if (url) {
        new Audio(url).play();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (gameState === 'setup') {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-[#1e1e1e] rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-serif font-bold text-[#5A5A40] dark:text-[#D4D4B8] mb-6 text-center">Quiz Setup</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Number of Questions</label>
            <div className="grid grid-cols-3 gap-3">
              {[10, 20, 99].map(count => (
                <button
                  key={count}
                  onClick={() => setQuestionCount(count)}
                  className={`py-3 rounded-xl border-2 transition-all ${
                    questionCount === count 
                      ? 'border-[#5A5A40] dark:border-[#D4D4B8] bg-[#5A5A40]/10 dark:bg-[#D4D4B8]/10 text-[#5A5A40] dark:text-[#D4D4B8] font-bold' 
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-[#5A5A40]/50 dark:hover:border-[#D4D4B8]/50'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generateQuestions}
            className="w-full py-4 bg-[#5A5A40] dark:bg-[#D4D4B8] text-white dark:text-[#1a1a1a] rounded-xl font-bold text-lg shadow-lg hover:bg-[#4a4a35] dark:hover:bg-[#c4c4a8] transition-colors flex items-center justify-center gap-2"
          >
            Start Quiz <ArrowRight size={20} />
          </button>
          
          <button
            onClick={onBack}
            className="w-full py-3 text-gray-500 dark:text-gray-400 hover:text-[#5A5A40] dark:hover:text-[#D4D4B8] transition-colors"
          >
            Back to Flashcards
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'summary') {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="w-full max-w-md mx-auto p-8 bg-white dark:bg-[#1e1e1e] rounded-3xl shadow-xl text-center border border-gray-100 dark:border-gray-700">
        <div className="w-24 h-24 bg-[#5A5A40] dark:bg-[#D4D4B8] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Trophy size={40} className="text-white dark:text-[#1a1a1a]" />
        </div>
        
        <h2 className="text-3xl font-serif font-bold text-[#5A5A40] dark:text-[#D4D4B8] mb-2">Quiz Complete!</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">You scored</p>
        
        <div className="text-6xl font-bold text-[#1a1a1a] dark:text-[#f5f5f0] mb-2">{score} <span className="text-2xl text-gray-400 dark:text-gray-500">/ {questions.length}</span></div>
        <div className="text-xl font-medium text-[#5A5A40] dark:text-[#D4D4B8] mb-8">{percentage}% Correct</div>

        <div className="space-y-3">
          <button
            onClick={() => setGameState('setup')}
            className="w-full py-4 bg-[#5A5A40] dark:bg-[#D4D4B8] text-white dark:text-[#1a1a1a] rounded-xl font-bold shadow-lg hover:bg-[#4a4a35] dark:hover:bg-[#c4c4a8] transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw size={20} /> Play Again
          </button>
          <button
            onClick={onBack}
            className="w-full py-3 text-gray-500 dark:text-gray-400 hover:text-[#5A5A40] dark:hover:text-[#D4D4B8] transition-colors"
          >
            Back to Flashcards
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="text-gray-400 hover:text-[#5A5A40] dark:hover:text-[#D4D4B8]">Exit</button>
        <div className="text-[#5A5A40] dark:text-[#D4D4B8] font-medium">
          Question {currentQuestionIndex + 1} / {questions.length}
        </div>
        <div className="text-[#5A5A40] dark:text-[#D4D4B8] font-bold">Score: {score}</div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-8 overflow-hidden">
        <motion.div 
          className="h-full bg-[#5A5A40] dark:bg-[#D4D4B8]"
          initial={{ width: 0 }}
          animate={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl shadow-xl p-8 mb-6 text-center relative overflow-hidden border border-gray-100 dark:border-gray-700">
         <div className="absolute top-0 left-0 w-full h-2 bg-[#5A5A40]/20 dark:bg-[#D4D4B8]/20" />
         
         <div className="mb-2 text-sm uppercase tracking-widest text-gray-400 dark:text-gray-500 font-semibold">
           {currentQuestion.type === 'arabic-to-meaning' ? 'What is the meaning of?' : 
            currentQuestion.type === 'meaning-to-arabic' ? 'Which name means?' : 'Identify the name'}
         </div>

         <h3 className={`text-4xl font-bold text-[#1a1a1a] dark:text-[#f5f5f0] mb-4 ${currentQuestion.type !== 'meaning-to-arabic' ? 'font-arabic' : 'font-serif'}`}>
           {currentQuestion.type === 'arabic-to-meaning' ? currentQuestion.target.arabic :
            currentQuestion.type === 'meaning-to-arabic' ? currentQuestion.target.meaning :
            currentQuestion.target.transliteration}
         </h3>
         
         {currentQuestion.type !== 'meaning-to-arabic' && (
           <button 
             onClick={() => playAudio(currentQuestion.target.arabic)}
             className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-[#2a2a2a] rounded-full text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333] transition-colors"
           >
             <Volume2 size={14} /> Pronounce
           </button>
         )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-3">
        {currentQuestion.options.map((option, idx) => {
          let stateStyles = "bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-gray-700 hover:border-[#5A5A40]/50 dark:hover:border-[#D4D4B8]/50 text-[#1a1a1a] dark:text-[#f5f5f0]";
          
          if (isAnswerChecked) {
            if (option.number === currentQuestion.target.number) {
              stateStyles = "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-400";
            } else if (selectedOption === idx) {
              stateStyles = "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-400";
            } else {
              stateStyles = "bg-gray-50 dark:bg-[#2a2a2a] border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-600 opacity-50";
            }
          } else if (selectedOption === idx) {
            stateStyles = "bg-[#5A5A40]/5 dark:bg-[#D4D4B8]/5 border-[#5A5A40] dark:border-[#D4D4B8] text-[#5A5A40] dark:text-[#D4D4B8]";
          }

          return (
            <button
              key={idx}
              onClick={() => handleOptionSelect(idx)}
              disabled={isAnswerChecked}
              className={`p-4 rounded-xl border-2 text-left transition-all relative ${stateStyles}`}
            >
              <div className="flex justify-between items-center">
                <span className={`font-medium ${currentQuestion.type === 'meaning-to-arabic' ? 'font-arabic text-xl' : 'font-sans'}`}>
                  {currentQuestion.type === 'meaning-to-arabic' ? option.arabic : option.meaning}
                </span>
                {isAnswerChecked && option.number === currentQuestion.target.number && (
                  <Check size={20} className="text-green-600 dark:text-green-400" />
                )}
                {isAnswerChecked && selectedOption === idx && option.number !== currentQuestion.target.number && (
                  <X size={20} className="text-red-600 dark:text-red-400" />
                )}
              </div>
              {currentQuestion.type === 'meaning-to-arabic' && (
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{option.transliteration}</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Action Button */}
      <div className="mt-6 h-14">
        {selectedOption !== null && !isAnswerChecked && (
          <button
            onClick={checkAnswer}
            className="w-full h-full bg-[#5A5A40] dark:bg-[#D4D4B8] text-white dark:text-[#1a1a1a] rounded-xl font-bold shadow-lg hover:bg-[#4a4a35] dark:hover:bg-[#c4c4a8] transition-colors"
          >
            Check Answer
          </button>
        )}
        {isAnswerChecked && (
          <button
            onClick={nextQuestion}
            className="w-full h-full bg-[#1a1a1a] dark:bg-[#f5f5f0] text-white dark:text-[#1a1a1a] rounded-xl font-bold shadow-lg hover:bg-black dark:hover:bg-white transition-colors flex items-center justify-center gap-2"
          >
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'} <ArrowRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
