/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import FlashcardMode from './components/FlashcardApp';
import QuizMode from './components/QuizMode';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

function AppContent() {
  const [mode, setMode] = useState<'flashcard' | 'quiz'>('flashcard');
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[#f5f5f0] dark:bg-[#121212] text-[#1a1a1a] dark:text-[#f5f5f0] font-sans flex flex-col items-center justify-center p-4 transition-colors duration-300">
      <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10">
        <h1 className="text-2xl font-serif font-bold text-[#5A5A40] dark:text-[#D4D4B8]">99 Names of Allah</h1>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-white dark:bg-[#1e1e1e] text-[#5A5A40] dark:text-[#D4D4B8] shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </header>

      {mode === 'flashcard' ? (
        <FlashcardMode onSwitchMode={() => setMode('quiz')} />
      ) : (
        <QuizMode onBack={() => setMode('flashcard')} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
