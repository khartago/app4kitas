import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../styles/theme';

// TODO: Complete landing page redesign
// Keep only footer for now

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

const Footer = styled.footer`
  background: ${({ theme }) => theme.colors.surface};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding: 3rem 0 2rem 0;
  
  @media (max-width: 768px) {
    padding: 2rem 0 1.5rem 0;
  }
`;

const FooterContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  
  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const FooterContent = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  align-items: center;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    text-align: center;
  }
`;

const FooterBrand = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const BrandName = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
`;

const BrandDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.4;
`;

const Copyright = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.85rem;
  margin: 0;
  opacity: 0.8;
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const LinkGroup = styled.div`
  display: flex;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
  }
`;

const FooterLink = styled.a`
  color: ${({ theme }) => theme.colors.textSecondary};
  text-decoration: none;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primary}08;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 2px;
    background: ${({ theme }) => theme.colors.primary};
    transition: all 0.2s ease;
    transform: translateX(-50%);
  }
  
  &:hover::after {
    width: 80%;
  }
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
    padding: 0.4rem 0.6rem;
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 20px;
  background: ${({ theme }) => theme.colors.border};
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const handleCredits = () => {
    navigate('/credits');
  };

  const handleCompliance = () => {
    navigate('/compliance');
  };

  const handlePrivacy = () => {
    navigate('/privacy');
  };

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

      <Footer>
        <FooterContainer>
          <FooterContent>
            <FooterBrand>
              <BrandName>App4KITAs</BrandName>
              <BrandDescription>
                Die moderne Kita-Management-Lösung aus Europa
              </BrandDescription>
              <Copyright>
                © {currentYear} App4KITAs. Alle Rechte vorbehalten.
              </Copyright>
            </FooterBrand>
            
            <FooterLinks>
              <LinkGroup>
                <FooterLink onClick={handleCredits}>
                  Entwicklung & Credits
                </FooterLink>
                <FooterLink onClick={handleCompliance}>
                  Compliance & Datenschutz
                </FooterLink>
                <FooterLink onClick={handlePrivacy}>
                  Datenschutzerklärung
                </FooterLink>
              </LinkGroup>
            </FooterLinks>
          </FooterContent>
        </FooterContainer>
      </Footer>
    </LandingWrapper>
  );
};

export default Landing; 