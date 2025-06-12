import React from 'react';

// Custom CSS for the thank you page - matching cozy style
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
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#3A3A3A',
    marginBottom: '1.5rem',
    textAlign: 'center' as const,
  },
  message: {
    fontSize: '1.3rem',
    fontWeight: 'normal',
    color: '#3A3A3A',
    marginBottom: '2rem',
    lineHeight: 1.5,
    textAlign: 'center' as const,
  },
  backButton: {
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
    textDecoration: 'none',
    display: 'inline-block',
  },
};

const ThankYouPage: React.FC = () => {
  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden"
      style={{ ...styles.body, ...styles.cozyBg }}
    >
      <div className="p-8 flex-1 flex flex-col items-center justify-center">
        <div className="max-w-md text-center">
          <h1 style={styles.title}>Спасибо!</h1>
          <p style={styles.message}>Мы всё учтём, ждите новостей</p>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;
