// FeedbackModal.jsx
import { useState } from 'react';
import './FeedbackModal.css';

const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL_HERE';

export default function FeedbackModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    q1_usefulness: null,
    q1_followup: '',
    q2_use_case: '',
    q2_other_specify: '',
    q3_future_feature: '',
    q4_follow_up: false,
    q4_email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const totalSteps = 3; // Dynamic based on responses

  const handleUsefulnessChange = (value) => {
    setFormData({ ...formData, q1_usefulness: value });
  };

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const payload = {
      sessionId: generateSessionId(),
      ...formData,
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      setSubmitted(true);
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose();
        resetForm();
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('There was an error submitting your feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      q1_usefulness: null,
      q1_followup: '',
      q2_use_case: '',
      q2_other_specify: '',
      q3_future_feature: '',
      q4_follow_up: false,
      q4_email: ''
    });
    setSubmitted(false);
  };

  const generateSessionId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  if (!isOpen) return null;

  if (submitted) {
    return (
      <div className="feedback-modal-overlay">
        <div className="feedback-modal">
          <div className="success-message">
            <svg className="success-icon" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <h2>Thank you for your feedback</h2>
            <p>Your insights help us continuously improve the dashboard's functionality and user experience. We review all feedback monthly and use it to inform our development roadmap.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-modal-overlay" onClick={onClose}>
      <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>Help Us Improve</h2>
          <p>Share your experience with the Africa Carbon Dashboard</p>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="modal-body">
          {/* Question 1: Usefulness Scale */}
          {currentStep === 1 && (
            <div className="question-section">
              <label className="question-label">
                How useful was the dashboard for your needs? <span className="required">*</span>
              </label>
              <div className="scale-container">
                <span className="scale-label">Not useful</span>
                <div className="scale-buttons">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      className={`scale-btn ${formData.q1_usefulness === num ? 'active' : ''}`}
                      onClick={() => handleUsefulnessChange(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <span className="scale-label">Extremely useful</span>
              </div>

              {/* Conditional follow-up */}
              {formData.q1_usefulness !== null && formData.q1_usefulness < 5 && (
                <div className="conditional-question">
                  <label className="question-label">
                    What might help make the dashboard more useful for your needs?
                  </label>
                  <textarea
                    value={formData.q1_followup}
                    onChange={(e) => setFormData({ ...formData, q1_followup: e.target.value })}
                    placeholder="Share your thoughts..."
                    maxLength={300}
                    rows={4}
                  />
                  <span className="char-count">{formData.q1_followup.length}/300</span>
                </div>
              )}

              <div className="button-group">
                <button 
                  className="btn-primary" 
                  onClick={handleNext}
                  disabled={formData.q1_usefulness === null}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Question 2: Use Case */}
          {currentStep === 2 && (
            <div className="question-section">
              <label className="question-label">
                What did you primarily use the dashboard for? <span className="required">*</span>
              </label>
              <div className="radio-group">
                {[
                  { value: 'identify_buyers', label: 'Identifying potential carbon credit buyers' },
                  { value: 'market_trends', label: 'Understanding market trends for a specific country/region' },
                  { value: 'project_scope', label: 'Exploring demand by project scope (e.g., cookstoves, boreholes)' },
                  { value: 'research_policy', label: 'Research or policy analysis' },
                  { value: 'other', label: 'Other' }
                ].map((option) => (
                  <label key={option.value} className="radio-option">
                    <input
                      type="radio"
                      name="use_case"
                      value={option.value}
                      checked={formData.q2_use_case === option.value}
                      onChange={(e) => setFormData({ ...formData, q2_use_case: e.target.value })}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>

              {formData.q2_use_case === 'other' && (
                <input
                  type="text"
                  value={formData.q2_other_specify}
                  onChange={(e) => setFormData({ ...formData, q2_other_specify: e.target.value })}
                  placeholder="Please specify..."
                  className="text-input"
                />
              )}

              <div className="button-group">
                <button className="btn-secondary" onClick={handlePrevious}>
                  Back
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleNext}
                  disabled={!formData.q2_use_case}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Question 3: Future Feature + Follow-up */}
          {currentStep === 3 && (
            <div className="question-section">
              <label className="question-label">
                If you could add ONE feature to make this dashboard 10x more useful, what would it be?
              </label>
              <textarea
                value={formData.q3_future_feature}
                onChange={(e) => setFormData({ ...formData, q3_future_feature: e.target.value })}
                placeholder="Describe your ideal feature..."
                maxLength={200}
                rows={4}
              />
              <span className="char-count">{formData.q3_future_feature.length}/200</span>

              <div className="checkbox-section">
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={formData.q4_follow_up}
                    onChange={(e) => setFormData({ ...formData, q4_follow_up: e.target.checked })}
                  />
                  <span>I'm open to a 10-minute follow-up conversation about my feedback</span>
                </label>

                {formData.q4_follow_up && (
                  <input
                    type="email"
                    value={formData.q4_email}
                    onChange={(e) => setFormData({ ...formData, q4_email: e.target.value })}
                    placeholder="your.email@example.com"
                    className="text-input"
                  />
                )}
              </div>

              <div className="button-group">
                <button className="btn-secondary" onClick={handlePrevious}>
                  Back
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}