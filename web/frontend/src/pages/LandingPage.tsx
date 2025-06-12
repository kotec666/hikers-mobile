import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

// Custom CSS for the landing page
const styles = {
  body: {
    fontFamily: "'Poppins', sans-serif",
  },
  cozyBg: {
    backgroundColor: '#f9f0eb',
  },
  cozyPink: {
    backgroundColor: '#828f40',
  },
  cozyText: {
    color: '#3A3A3A',
  },
  cozyButton: {
    backgroundColor: '#FFFFFF',
    color: '#828f40',
  },
  cozyArrowBg: {
    backgroundColor: '#828f40',
  },
  cozyArrowIcon: {
    color: '#FFFFFF',
  },
  roundedTopFull: {
    borderTopLeftRadius: '150px',
    borderTopRightRadius: '150px',
  },
};

const LandingPage: React.FC = () => {
  return (
    <div
      className="flex flex-col justify-between h-screen w-screen overflow-hidden"
      style={{ ...styles.body, ...styles.cozyBg }}
    >
      <SEO
        title="Первая соцсеть для путешественников | hikers.su"
        description="Социальная сеть для путешественников, где вы можете найти попутчиков, поделиться впечатлениями или результатами физической активности, и просто пообщаться с единомышленниками!"
      />
      <div className="flex-1 p-8">
        <div>
          <h1
            className="text-5xl font-bold leading-tight mb-8"
            style={styles.cozyText}
          >
            Первая
            <br />
            соцсеть
            <br />
            для путе-
            <br />
            шественников
          </h1>
          <Link to="/form">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={styles.cozyArrowBg}
            >
              <span
                className="material-icons text-3xl"
                style={styles.cozyArrowIcon}
              >
                arrow_forward
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Smiley face at bottom */}
      <div className="w-full flex justify-center items-end">
        <div className="relative" style={{ width: '300px', height: '150px' }}>
          <div
            className="absolute bottom-0 w-full h-full rounded-t-full"
            style={{ ...styles.cozyPink, ...styles.roundedTopFull }}
          ></div>
          <div className="absolute" style={{ top: '30px', left: '90px' }}>
            <div className="w-10 h-10 bg-white rounded-full"></div>
          </div>
          <div className="absolute" style={{ top: '30px', left: '180px' }}>
            <div className="w-10 h-10 bg-white rounded-full"></div>
          </div>
          <div className="absolute" style={{ top: '34px', left: '97px' }}>
            <div className="w-8 h-8 bg-black rounded-full"></div>
          </div>
          <div className="absolute" style={{ top: '34px', left: '187px' }}>
            <div className="w-8 h-8 bg-black rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
