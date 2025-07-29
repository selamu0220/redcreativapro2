"use client";

import { useTypewriterAnimation } from '../hooks/useTypewriterAnimation';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
  showCursor?: boolean;
}

export const TypewriterText = ({ 
  text, 
  speed = 30, 
  onComplete, 
  className = '',
  showCursor = true 
}: TypewriterTextProps) => {
  const { displayedText, isAnimating, skipAnimation } = useTypewriterAnimation({
    text,
    speed,
    onComplete
  });

  return (
    <div className={`relative ${className}`}>
      <div className="whitespace-pre-wrap text-reveal">
        {displayedText}
        {showCursor && isAnimating && (
          <span className="typewriter-cursor text-primary font-normal">|</span>
        )}
      </div>
      {isAnimating && (
        <div className="flex justify-end mt-4">
          <button
            onClick={skipAnimation}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted border border-border/50"
          >
            ⏭️ Saltar animación
          </button>
        </div>
      )}
    </div>
  );
};