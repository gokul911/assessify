
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();
  return (
    <>
      <section className="hero" id="home">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Welcome to Exam Platform</h1>
            <p>
              Secure online examinations with real-time monitoring and advanced 
              proctoring features. Take your exams anytime, anywhere.
            </p>
            <a href="#features" className="cta-btn" onClick={() => navigate("/login")}>Get Started</a>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="features-grid">
          <div className="feature-card">
            <h3>Secure Exams</h3>
            <p>Advanced encryption and browser lockdown to ensure and prevent cheating.</p>
          </div>
          <div className="feature-card">
            <h3>Live Proctoring</h3>
            <p>Real-time monitoring with AI-powered suspicious activity detection.</p>
          </div>
          <div className="feature-card">
            <h3>Instant Results</h3>
            <p>Automated grading system with immediate result publication after exam completion.</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
