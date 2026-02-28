import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, ChevronLeft, ChevronRight, Shuffle, RotateCcw, Info, BookOpen, Sparkles, X } from 'lucide-react';
import { namesOfAllah, NameOfAllah } from '../data/names';
import { generatePronunciation } from '../services/tts';
import { generateDeepDive, DeepDiveContent } from '../services/content';
import ReactMarkdown from 'react-markdown';

interface FlashcardModeProps {
  onSwitchMode: (mode: 'quiz') => void;
}

export default function FlashcardMode({ onSwitchMode }: FlashcardModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>(Array.from({ length: 99 }, (_, i) => i));
  const [isShuffled, setIsShuffled] = useState(false);
  
  // Deep Dive State
  const [showDeepDive, setShowDeepDive] = useState(false);
  const [deepDiveContent, setDeepDiveContent] = useState<DeepDiveContent | null>(null);
  const [isLoadingDeepDive, setIsLoadingDeepDive] = useState(false);

  const currentName = namesOfAllah[shuffledIndices[currentIndex]];

  useEffect(() => {
    // Reset state when card changes
    setIsFlipped(false);
    setAudioUrl(null);
    setIsPlaying(false);
    setDeepDiveContent(null);
    setShowDeepDive(false);
  }, [currentIndex, shuffledIndices]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % 99);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + 99) % 99);
  };

  const toggleShuffle = () => {
    if (isShuffled) {
      const currentRealIndex = shuffledIndices[currentIndex];
      setShuffledIndices(Array.from({ length: 99 }, (_, i) => i));
      setCurrentIndex(currentRealIndex);
    } else {
      const newIndices = [...shuffledIndices].sort(() => Math.random() - 0.5);
      setShuffledIndices(newIndices);
      setCurrentIndex(0);
    }
    setIsShuffled(!isShuffled);
  };

  const playAudio = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) return;

    try {
      setIsPlaying(true);
      
      let url = audioUrl;
      if (!url) {
        url = await generatePronunciation(currentName.arabic);
        setAudioUrl(url);
      }

      if (url) {
        const audio = new Audio(url);
        audio.onended = () => setIsPlaying(false);
        audio.play();
      } else {
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Playback failed", error);
      setIsPlaying(false);
    }
  };

  const openDeepDive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeepDive(true);
    
    if (!deepDiveContent && !isLoadingDeepDive) {
      setIsLoadingDeepDive(true);
      const content = await generateDeepDive(currentName);
      setDeepDiveContent(content);
      setIsLoadingDeepDive(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto perspective-1000 relative">
      {/* Header Controls */}
      <div className="flex justify-between items-center mb-6 px-2">
        <div className="text-sm font-medium text-[#5A5A40]/70 dark:text-[#D4D4B8]/70">
          {currentIndex + 1} / 99
        </div>
        <button 
          onClick={() => onSwitchMode('quiz')}
          className="px-4 py-2 bg-white dark:bg-[#1e1e1e] rounded-full text-sm font-semibold text-[#5A5A40] dark:text-[#D4D4B8] shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] flex items-center gap-2 transition-colors"
        >
          <BookOpen size={16} /> Quiz Mode
        </button>
      </div>

      {/* Main Card */}
      <motion.div
        className="relative w-full aspect-[3/4] cursor-pointer preserve-3d transition-all duration-500 z-10"
        onClick={() => setIsFlipped(!isFlipped)}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front of Card */}
        <div className="absolute inset-0 w-full h-full backface-hidden">
          <div className="w-full h-full bg-white dark:bg-[#1e1e1e] rounded-3xl shadow-xl border border-[#e5e5e5] dark:border-[#333] flex flex-col items-center justify-center p-8 relative overflow-hidden transition-colors duration-300">
            <div className="absolute top-0 left-0 w-full h-2 bg-[#5A5A40]/20 dark:bg-[#D4D4B8]/20" />
            
            <div className="absolute top-6 right-6">
              <span className="font-mono text-xs text-[#5A5A40]/50 dark:text-[#D4D4B8]/50 border border-[#5A5A40]/20 dark:border-[#D4D4B8]/20 px-2 py-1 rounded-full">
                #{currentName.number}
              </span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-8">
              <h2 className="text-6xl md:text-7xl font-arabic text-[#1a1a1a] dark:text-[#f5f5f0] text-center leading-tight py-4" lang="ar">
                {currentName.arabic}
              </h2>
              <p className="text-xl font-medium text-[#5A5A40] dark:text-[#D4D4B8] tracking-wide">
                {currentName.transliteration}
              </p>
            </div>

            <div className="mt-auto w-full flex justify-center pb-4 gap-4">
              <button
                onClick={playAudio}
                className={`p-4 rounded-full transition-all duration-300 ${
                  isPlaying 
                    ? 'bg-[#5A5A40] dark:bg-[#D4D4B8] text-white dark:text-[#1a1a1a] shadow-lg scale-110' 
                    : 'bg-[#f5f5f0] dark:bg-[#2a2a2a] text-[#5A5A40] dark:text-[#D4D4B8] hover:bg-[#e5e5e5] dark:hover:bg-[#333]'
                }`}
                title="Play Pronunciation"
              >
                <Volume2 size={24} className={isPlaying ? 'animate-pulse' : ''} />
              </button>
            </div>
            
            <div className="absolute bottom-4 text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-widest">
              Tap to flip
            </div>
          </div>
        </div>

        {/* Back of Card */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <div className="w-full h-full bg-[#1a1a1a] dark:bg-[#000000] text-[#f5f5f0] rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 relative overflow-hidden border border-transparent dark:border-[#333]">
            <div className="absolute top-0 left-0 w-full h-2 bg-[#5A5A40] dark:bg-[#D4D4B8]" />
            
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
              <h3 className="text-3xl font-serif font-bold text-[#f5f5f0] dark:text-[#D4D4B8]">
                {currentName.meaning}
              </h3>
              <div className="w-12 h-1 bg-[#5A5A40] dark:bg-[#D4D4B8] rounded-full opacity-50" />
              <p className="text-lg leading-relaxed text-gray-300 font-light">
                {currentName.description}
              </p>

              <button
                onClick={openDeepDive}
                className="mt-4 px-5 py-2 bg-[#5A5A40]/20 dark:bg-[#D4D4B8]/20 hover:bg-[#5A5A40]/40 dark:hover:bg-[#D4D4B8]/40 border border-[#5A5A40]/50 dark:border-[#D4D4B8]/50 rounded-full text-sm text-[#f5f5f0] dark:text-[#D4D4B8] flex items-center gap-2 transition-colors"
              >
                <Sparkles size={16} /> Deep Dive
              </button>
            </div>

            <div className="absolute bottom-4 text-xs text-gray-600 font-medium uppercase tracking-widest">
              Tap to flip back
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Controls */}
      <div className="mt-12 flex items-center justify-center gap-6">
        <button 
          onClick={toggleShuffle}
          className={`p-3 rounded-full transition-colors ${
            isShuffled 
              ? 'bg-[#5A5A40] dark:bg-[#D4D4B8] text-white dark:text-[#1a1a1a]' 
              : 'bg-white dark:bg-[#1e1e1e] text-[#5A5A40] dark:text-[#D4D4B8] hover:bg-gray-100 dark:hover:bg-[#2a2a2a]'
          } shadow-sm border border-gray-200 dark:border-gray-700`}
          title="Shuffle"
        >
          <Shuffle size={20} />
        </button>

        <div className="flex items-center gap-4 bg-white dark:bg-[#1e1e1e] p-2 rounded-full shadow-lg border border-gray-100 dark:border-gray-700">
          <button 
            onClick={handlePrev}
            className="p-4 rounded-full hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-[#1a1a1a] dark:text-[#f5f5f0] transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
          <button 
            onClick={handleNext}
            className="p-4 rounded-full hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-[#1a1a1a] dark:text-[#f5f5f0] transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <button 
          onClick={() => {
            setShuffledIndices(Array.from({ length: 99 }, (_, i) => i));
            setCurrentIndex(0);
            setIsShuffled(false);
          }}
          className="p-3 rounded-full bg-white dark:bg-[#1e1e1e] text-[#5A5A40] dark:text-[#D4D4B8] hover:bg-gray-100 dark:hover:bg-[#2a2a2a] shadow-sm border border-gray-200 dark:border-gray-700 transition-colors"
          title="Reset"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      {/* Deep Dive Modal */}
      <AnimatePresence>
        {showDeepDive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeepDive(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#1e1e1e] rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl relative border border-gray-200 dark:border-gray-700"
            >
              <button 
                onClick={() => setShowDeepDive(false)}
                className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-[#2a2a2a] rounded-full hover:bg-gray-200 dark:hover:bg-[#333] transition-colors z-10 text-gray-500 dark:text-gray-400"
              >
                <X size={20} />
              </button>

              <div className="p-8">
                <div className="text-center mb-8 border-b border-gray-100 dark:border-gray-700 pb-6">
                  <h2 className="text-4xl font-arabic text-[#1a1a1a] dark:text-[#f5f5f0] mb-2">{currentName.arabic}</h2>
                  <h3 className="text-2xl font-serif text-[#5A5A40] dark:text-[#D4D4B8]">{currentName.transliteration}</h3>
                  <p className="text-gray-500 dark:text-gray-400">{currentName.meaning}</p>
                </div>

                {isLoadingDeepDive ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="w-8 h-8 border-4 border-[#5A5A40] dark:border-[#D4D4B8] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">Consulting knowledge base...</p>
                  </div>
                ) : deepDiveContent ? (
                  <div className="space-y-8">
                    <section>
                      <h4 className="text-sm font-bold uppercase tracking-widest text-[#5A5A40] dark:text-[#D4D4B8] mb-3 flex items-center gap-2">
                        <Info size={16} /> Meaning
                      </h4>
                      <div className="prose prose-stone dark:prose-invert text-gray-700 dark:text-gray-300 leading-relaxed">
                        <ReactMarkdown>{deepDiveContent.meaning}</ReactMarkdown>
                      </div>
                    </section>
                    
                    <section>
                      <h4 className="text-sm font-bold uppercase tracking-widest text-[#5A5A40] dark:text-[#D4D4B8] mb-3 flex items-center gap-2">
                        <BookOpen size={16} /> Significance
                      </h4>
                      <div className="prose prose-stone dark:prose-invert text-gray-700 dark:text-gray-300 leading-relaxed">
                        <ReactMarkdown>{deepDiveContent.significance}</ReactMarkdown>
                      </div>
                    </section>

                    <section className="bg-[#f5f5f0] dark:bg-[#2a2a2a] p-6 rounded-2xl border border-[#e5e5e5] dark:border-[#333]">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-[#5A5A40] dark:text-[#D4D4B8] mb-3 flex items-center gap-2">
                        <Sparkles size={16} /> Reflection
                      </h4>
                      <div className="prose prose-stone dark:prose-invert text-gray-700 dark:text-gray-300 leading-relaxed italic">
                        <ReactMarkdown>{deepDiveContent.reflection}</ReactMarkdown>
                      </div>
                    </section>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    Unable to load content. Please try again.
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
