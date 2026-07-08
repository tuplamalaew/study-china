import { PINYIN_INITIALS, PINYIN_FINALS, PINYIN_TONES } from '../data/pinyin';
import { GameLevel, Question, ActiveModule } from '../data/types';
import { shuffleArray } from './utils';

/**
 * Generates a question object with correctAnswer and multiple options.
 * Decoupled from React to ensure pure, testable logic.
 */
export function generateQuestion(
  queueItem: string, 
  focusSet: string[] | null, 
  level: GameLevel, 
  activeModule: ActiveModule
): Question {
  if (level === 'pairs') {
    const parts = queueItem.split(':');
    const isFirstCorrect = Math.random() > 0.5;
    const correctAnswer = isFirstCorrect ? parts[0] : parts[1];
    const wrongAnswer = isFirstCorrect ? parts[1] : parts[0];
    return {
      correctAnswer,
      options: Math.random() > 0.5 ? [correctAnswer, wrongAnswer] : [wrongAnswer, correctAnswer]
    };
  }

  const fullPool = activeModule === 'initials' ? PINYIN_INITIALS : activeModule === 'finals' ? PINYIN_FINALS : PINYIN_TONES;
  let pool = focusSet ? [...focusSet] : [...fullPool];

  // If focus set has less than 4 items, fill the rest with random items from full pool
  if (pool.length < 4) {
    const missing = 4 - pool.length;
    const others = shuffleArray(fullPool.filter(p => !pool.includes(p)));
    pool = [...pool, ...others.slice(0, missing)];
  }

  const otherOptions = pool.filter(p => p !== queueItem);
  const shuffledOthers = shuffleArray(otherOptions);
  const wrongOptions = shuffledOthers.slice(0, 3);
  const allOptions = shuffleArray([queueItem, ...wrongOptions]);

  return {
    correctAnswer: queueItem,
    options: allOptions
  };
}
