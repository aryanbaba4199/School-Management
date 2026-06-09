import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaBrain, FaFlask, FaChartLine } from 'react-icons/fa';

/*------------- Animations -------------*/

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
`;

/*------------- Styled Components -------------*/

const AdContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 4rem;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #c084fc 100%);
  color: #ffffff;
  position: relative;
  overflow: hidden;
`;

const BackgroundBlob = styled.div<{ $top: string; $left: string; $size: string; $delay: string }>`
  position: absolute;
  top: ${props => props.$top};
  left: ${props => props.$left};
  width: ${props => props.$size};
  height: ${props => props.$size};
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  filter: blur(40px);
  animation: ${float} 8s ease-in-out infinite;
  animation-delay: ${props => props.$delay};
  pointer-events: none;
`;

const ContentWrapper = styled.div`
  max-width: 580px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Tagline = styled.span`
  align-self: flex-start;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #ffffff;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.2;
  margin: 0;
  background: linear-gradient(to right, #ffffff, #f3e8ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Description = styled.p`
  font-size: 1.15rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
`;

const CardContainer = styled.div`
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  animation: ${fadeIn} 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
`;

const IconWrapper = styled.div`
  background: rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
`;

const Indicators = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const Dot = styled.button<{ $active: boolean }>`
  width: ${props => props.$active ? '1.5rem' : '0.5rem'};
  height: 0.5rem;
  border-radius: 9999px;
  background: ${props => props.$active ? '#ffffff' : 'rgba(255, 255, 255, 0.3)'};
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
`;

/*------------- Promo Data -------------*/

const AD_SLIDES = [
  {
    id: 1,
    tag: 'AI Intelligence',
    title: 'Adaptive Learning Path',
    desc: 'Auto-detect concept weaknesses across math, science, and grammar, delivering tailored quizzes and curated lessons.',
    icon: <FaBrain size={32} />
  },
  {
    id: 2,
    tag: 'Interactive STEM',
    title: 'Practical Simulation Labs',
    desc: 'Bring chemistry equations and physics vectors to life. Let students experiment safely in digital simulation labs.',
    icon: <FaFlask size={32} />
  },
  {
    id: 3,
    tag: 'SaaS Platform',
    title: 'Real-time School Dashboard',
    desc: 'Relied upon by school admins, teachers, and parents. Track attendance, manage fees via UPI, and review grading reports.',
    icon: <FaChartLine size={32} />
  }
];

export function AdSection() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % AD_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const current = AD_SLIDES[activeIdx];

  return (
    <AdContainer>
      <BackgroundBlob $top="-10%" $left="-10%" $size="400px" $delay="0s" />
      <BackgroundBlob $top="60%" $left="70%" $size="350px" $delay="-3s" />
      
      <ContentWrapper>
        <Title>School OS</Title>
        <Description>
          A unified, state-of-the-art system powering operations, diagnostics, and modern learning outcomes in Indian schools.
        </Description>
        
        <CardContainer key={current.id}>
          <IconWrapper>{current.icon}</IconWrapper>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Tagline>{current.tag}</Tagline>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{current.title}</h3>
            <p style={{ fontSize: '0.95rem', margin: 0, opacity: 0.9, lineHeight: 1.5 }}>{current.desc}</p>
          </div>
        </CardContainer>

        <Indicators>
          {AD_SLIDES.map((_, idx) => (
            <Dot 
              key={idx} 
              $active={idx === activeIdx} 
              onClick={() => setActiveIdx(idx)}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </Indicators>
      </ContentWrapper>
    </AdContainer>
  );
}
