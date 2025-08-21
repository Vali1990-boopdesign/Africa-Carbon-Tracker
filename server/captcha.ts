
import crypto from 'crypto';

// Simple CAPTCHA generation and verification
export interface CaptchaChallenge {
  id: string;
  question: string;
  answer: number;
  expires: number;
}

// In-memory storage for CAPTCHA challenges (in production, use Redis)
const captchaChallenges = new Map<string, CaptchaChallenge>();

// Clean up expired challenges every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, challenge] of captchaChallenges.entries()) {
    if (challenge.expires < now) {
      captchaChallenges.delete(id);
    }
  }
}, 5 * 60 * 1000);

export function generateCaptcha(): CaptchaChallenge {
  const id = crypto.randomUUID();
  const num1 = Math.floor(Math.random() * 20) + 1;
  const num2 = Math.floor(Math.random() * 20) + 1;
  const operations = ['+', '-', '*'];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  
  let answer: number;
  let question: string;
  
  switch (operation) {
    case '+':
      answer = num1 + num2;
      question = `What is ${num1} + ${num2}?`;
      break;
    case '-':
      answer = Math.max(num1, num2) - Math.min(num1, num2);
      question = `What is ${Math.max(num1, num2)} - ${Math.min(num1, num2)}?`;
      break;
    case '*':
      const smallNum1 = Math.floor(Math.random() * 10) + 1;
      const smallNum2 = Math.floor(Math.random() * 10) + 1;
      answer = smallNum1 * smallNum2;
      question = `What is ${smallNum1} × ${smallNum2}?`;
      break;
    default:
      answer = num1 + num2;
      question = `What is ${num1} + ${num2}?`;
  }
  
  const challenge: CaptchaChallenge = {
    id,
    question,
    answer,
    expires: Date.now() + 5 * 60 * 1000 // 5 minutes
  };
  
  captchaChallenges.set(id, challenge);
  return challenge;
}

export function verifyCaptcha(id: string, userAnswer: number): boolean {
  const challenge = captchaChallenges.get(id);
  
  if (!challenge) {
    return false;
  }
  
  if (challenge.expires < Date.now()) {
    captchaChallenges.delete(id);
    return false;
  }
  
  const isCorrect = challenge.answer === userAnswer;
  
  // Remove challenge after use (one-time use)
  captchaChallenges.delete(id);
  
  return isCorrect;
}

export function getCaptchaQuestion(id: string): string | null {
  const challenge = captchaChallenges.get(id);
  return challenge && challenge.expires > Date.now() ? challenge.question : null;
}
