import { useState, useEffect, useCallback } from 'react';

/**
 * useKonamiCode - Hook to detect the Konami code sequence
 * Sequence: ↑ ↑ ↓ ↓ ← → ← → B A
 *
 * @param {Function} callback - Function to call when code is entered
 * @returns {Object} { isActivated, reset }
 */
// Using event.key values (case-insensitive for letters)
const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a'
];

const useKonamiCode = (callback) => {
  const [inputSequence, setInputSequence] = useState([]);
  const [isActivated, setIsActivated] = useState(false);

  const reset = useCallback(() => {
    setInputSequence([]);
    setIsActivated(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Don't trigger if user is typing in an input
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      // Use event.key and normalize letters to lowercase
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;

      setInputSequence((prev) => {
        const newSequence = [...prev, key].slice(-KONAMI_CODE.length);

        // Check if the sequence matches
        if (
          newSequence.length === KONAMI_CODE.length &&
          newSequence.every((k, i) => k === KONAMI_CODE[i])
        ) {
          setIsActivated(true);
          if (callback) {
            callback();
          }
          return [];
        }

        return newSequence;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callback]);

  return { isActivated, reset };
};

export default useKonamiCode;
