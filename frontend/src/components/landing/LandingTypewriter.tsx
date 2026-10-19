import React, { useEffect, useMemo, useState } from 'react';

export const LANDING_TYPEWRITER_PHRASES: string[] = [
  'Turn Transactions into Insights.',
  'Detect Anomalies. Understand Why.',
  'Make Every Business Decision Count.',
  'From Business Data to Better Decisions.',
];

export interface LandingTypewriterProps {
  phrases?: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
  staticFallback?: string;
}

export const LandingTypewriter: React.FC<LandingTypewriterProps> = ({
  phrases = LANDING_TYPEWRITER_PHRASES,
  typingSpeed = 65,
  deletingSpeed = 35,
  pauseDuration = 2000,
  className = '',
  staticFallback = 'Turn Transactions into Insights.',
}) => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Check for prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  const currentPhrase = useMemo(() => {
    return phrases[phraseIndex % phrases.length] || '';
  }, [phrases, phraseIndex]);

  useEffect(() => {
    if (isReducedMotion || phrases.length === 0) {
      setDisplayedText(staticFallback);
      return;
    }

    let timer: ReturnType<typeof setTimeout>;

    if (!isDeleting) {
      // Typing phase
      if (displayedText.length < currentPhrase.length) {
        timer = setTimeout(() => {
          setDisplayedText(currentPhrase.slice(0, displayedText.length + 1));
        }, typingSpeed);
      } else {
        // Phrase complete, pause before deleting
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, pauseDuration);
      }
    } else {
      // Deleting phase
      if (displayedText.length > 0) {
        timer = setTimeout(() => {
          setDisplayedText(currentPhrase.slice(0, displayedText.length - 1));
        }, deletingSpeed);
      } else {
        // Deletion complete, move to next phrase
        timer = setTimeout(() => {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }, 400);
      }
    }

    return () => {
      clearTimeout(timer);
    };
  }, [displayedText, isDeleting, currentPhrase, phrases, typingSpeed, deletingSpeed, pauseDuration, isReducedMotion, staticFallback]);

  if (isReducedMotion) {
    return (
      <span className={`landing-typewriter-text ${className}`} style={{ minHeight: '1.5em', display: 'inline-block' }}>
        {staticFallback}
      </span>
    );
  }

  return (
    <span
      className={`landing-typewriter-wrap ${className}`}
      aria-live="polite"
      aria-atomic="true"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: '1.5em',
        verticalAlign: 'middle',
      }}
    >
      <span className="landing-typewriter-text">{displayedText}</span>
      <span
        className="landing-typewriter-cursor"
        aria-hidden="true"
        style={{
          display: 'inline-block',
          width: '2px',
          height: '1.15em',
          backgroundColor: 'var(--primary)',
          marginLeft: '4px',
          borderRadius: '1px',
          animation: 'typewriterBlink 0.9s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      />
    </span>
  );
};
