import { useState, useEffect, useRef } from 'react';

interface UseTypewriterAnimationProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export const useTypewriterAnimation = ({ 
  text, 
  speed = 30, 
  onComplete 
}: UseTypewriterAnimationProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const indexRef = useRef(0);

  // Function to get variable typing speed for more realistic animation
  const getTypingDelay = (char: string, index: number) => {
    // Slower for punctuation and line breaks
    if (char === '.' || char === '!' || char === '?') return speed * 3;
    if (char === ',' || char === ';' || char === ':') return speed * 2;
    if (char === '\n') return speed * 2;
    if (char === ' ') return speed * 0.5;
    
    // Add slight randomness for more natural feel
    const randomFactor = 0.5 + Math.random() * 0.5; // 0.5 to 1.0
    return speed * randomFactor;
  };

  const typeNextCharacter = () => {
    if (indexRef.current < text.length) {
      const nextChar = text[indexRef.current];
      setDisplayedText(text.slice(0, indexRef.current + 1));
      indexRef.current++;
      
      const delay = getTypingDelay(nextChar, indexRef.current);
      timeoutRef.current = setTimeout(typeNextCharacter, delay);
    } else {
      setIsAnimating(false);
      onComplete?.();
    }
  };

  useEffect(() => {
    if (!text) {
      setDisplayedText('');
      setIsAnimating(false);
      return;
    }

    setIsAnimating(true);
    setDisplayedText('');
    indexRef.current = 0;

    // Start typing animation
    timeoutRef.current = setTimeout(typeNextCharacter, speed);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, speed]);

  const skipAnimation = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setDisplayedText(text);
    setIsAnimating(false);
    onComplete?.();
  };

  return {
    displayedText,
    isAnimating,
    skipAnimation
  };
};