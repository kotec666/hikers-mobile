import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../constants/api';
import SEO from '../components/SEO';

// Custom CSS for the form page - matching landing page palette
const styles = {
  body: {
    fontFamily: "'Poppins', sans-serif",
  },
  cozyBg: {
    backgroundColor: '#f9f0eb',
  },
  cozyPrimary: {
    backgroundColor: '#828f40',
  },
  cozyText: {
    color: '#3A3A3A',
  },
  formContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.25rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    width: '100%',
  },
  formLabel: {
    fontSize: '0.9rem',
    marginBottom: '0.5rem',
    color: '#3A3A3A',
  },
  formInput: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '1rem',
    backgroundColor: 'white',
  },
  submitButton: {
    backgroundColor: '#828f40',
    border: 'none',
    borderRadius: '20px',
    padding: '12px 30px',
    fontSize: '16px',
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 500,
    color: 'white',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  submitButtonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  backArrow: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#828f40',
    color: 'white',
    fontSize: '1.5rem',
  },
  statusSuccess: {
    marginTop: '1rem',
    padding: '0.75rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    textAlign: 'center' as const,
    backgroundColor: '#c0cc9c',
    color: '#5c6835',
  },
  statusError: {
    marginTop: '1rem',
    padding: '0.75rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    textAlign: 'center' as const,
    backgroundColor: '#dca4ac',
    color: '#5c282e',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#3A3A3A',
    marginBottom: '1rem',
  },
  subtitle: {
    fontSize: '1rem',
    fontWeight: 'normal',
    color: '#3A3A3A',
    marginBottom: '2rem',
    lineHeight: 1.5,
  },
};

const FormPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;

    setIsSubmitting(true);

    try {
      await fetch(API_ENDPOINTS.FEEDBACK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          text: feedback,
        }),
      });

      navigate('/thank-you');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      navigate('/thank-you');
    }
  };

  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden"
      style={{ ...styles.body, ...styles.cozyBg }}
    >
      <SEO
        title="Оставить отзыв | hikers.su"
        description="Помогите нам стать лучше - оставьте свои пожелания и предложения. Мы всё прочтём, честно."
      />
      <div className="p-8 flex-1 relative">
        <Link to="/" className="absolute top-4 left-4">
          <div style={styles.backArrow}>
            <span className="material-icons">arrow_back</span>
          </div>
        </Link>

        <div className="flex flex-col items-center mt-20">
          <h1 style={styles.title}>Оставьте отзыв</h1>

          <p style={styles.subtitle}>
            Оставь свою почту ниже, если хочешь показать что сервис тебе нужен!
            Все пожелания пиши в поле Фидбек, спасибо.
          </p>

          <form onSubmit={handleSubmit} style={styles.formContainer}>
            <div style={styles.formGroup}>
              <label htmlFor="email" style={styles.formLabel}>
                Почта*
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Ваш email"
                style={styles.formInput}
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="feedback" style={styles.formLabel}>
                Фидбек
              </label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Ваши пожелания"
                rows={4}
                style={styles.formInput}
              />
            </div>

            <div className="flex justify-center mt-4">
              <button
                type="submit"
                disabled={isSubmitting || !email}
                style={
                  isSubmitting || !email
                    ? { ...styles.submitButton, ...styles.submitButtonDisabled }
                    : styles.submitButton
                }
              >
                {isSubmitting ? 'Отправка...' : 'Отправить'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bottom shape in the same style as the landing page */}
      <div className="w-full flex justify-center items-end">
        <div className="relative" style={{ width: '300px', height: '80px' }}>
          <div
            className="absolute bottom-0 w-full h-full rounded-t-full"
            style={{
              ...styles.cozyPrimary,
              borderTopLeftRadius: '150px',
              borderTopRightRadius: '150px',
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default FormPage;
