
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { RefreshCw, Shield } from 'lucide-react';

interface CaptchaChallenge {
  id: string;
  question: string;
}

interface CaptchaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (captchaId: string, captchaAnswer: string) => void;
  challenge?: CaptchaChallenge;
  error?: string;
}

export function CaptchaModal({ isOpen, onClose, onSuccess, challenge, error }: CaptchaModalProps) {
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (challenge && answer.trim()) {
      setIsLoading(true);
      onSuccess(challenge.id, answer.trim());
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      const response = await fetch('/api/captcha');
      const newChallenge = await response.json();
      // This would need to be handled by parent component
      console.log('New challenge:', newChallenge);
    } catch (error) {
      console.error('Failed to refresh CAPTCHA:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Verification Required
          </DialogTitle>
          <DialogDescription>
            Please solve this simple math problem to continue. This helps protect our service from automated requests.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {challenge && (
            <div className="space-y-2">
              <Label htmlFor="captcha-answer">
                {challenge.question}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="captcha-answer"
                  type="number"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter your answer"
                  required
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  title="Get new question"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!answer.trim() || isLoading}>
              {isLoading ? 'Verifying...' : 'Verify'}
            </Button>
          </div>
        </form>

        <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted rounded-lg">
          <strong>Why am I seeing this?</strong>
          <br />
          This verification appears when our system detects unusual activity patterns to protect against automated abuse.
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CaptchaModal;
