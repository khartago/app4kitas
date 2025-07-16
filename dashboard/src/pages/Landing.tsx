import React from 'react';
import styled from 'styled-components';
import Footer from '../components/Footer';

const LandingWrapper = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Content = styled.div`
  text-align: center;
  max-width: 600px;
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: clamp(1rem, 3vw, 1.2rem);
  margin-bottom: 1rem;
  line-height: 1.5;
`;

const Status = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: clamp(0.8rem, 2vw, 0.9rem);
  margin-top: 2rem;
  opacity: 0.7;
`;

const Landing: React.FC = () => {
  return (
    <LandingWrapper>
      <MainContent>
        <Content>
          <Title>App4KITAs</Title>
          <Subtitle>
            DSGVO-konforme Kita-Management-Plattform
          </Subtitle>
          <Status>
            Landing page in Entwicklung...
          </Status>
        </Content>
      </MainContent>

      <Footer />
    </LandingWrapper>
  );
};

export default Landing; 