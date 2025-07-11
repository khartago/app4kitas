import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../styles/theme';
import MascotBear from '../components/ui/MascotBear';
import AppLogo from '../components/ui/AppLogo';

// Clean, minimal animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const gradientShift = keyframes`
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
`;

// Main Container
const LandingWrapper = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.mode === 'dark' 
    ? '#000000' 
    : '#ffffff'};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

// Navigation - Clean and minimal like Apple
const Navigation = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(0, 0, 0, 0.8)' 
    : 'rgba(255, 255, 255, 0.8)'};
  backdrop-filter: blur(20px);
  border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.1)'};
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled.a`
  color: ${({ theme }) => theme.colors.textPrimary};
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: color 0.2s;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const LoginButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
    transform: translateY(-1px);
  }
`;

// Hero Section - Apple-inspired
const HeroSection = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 2rem;
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'linear-gradient(180deg, #000000 0%, #1a1a1a 100%)' 
    : 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)'};
`;

const HeroContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  animation: ${fadeIn} 1s ease-out;
`;

const HeroBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.05)'};
  color: ${({ theme }) => theme.colors.primary};
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 2rem;
`;

const HeroTitle = styled.h1`
  font-size: clamp(3rem, 8vw, 4.5rem);
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.textPrimary};
  
  .gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const HeroSubtitle = styled.p`
  font-size: clamp(1.2rem, 3vw, 1.5rem);
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 3rem;
  line-height: 1.6;
  font-weight: 400;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const HeroButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 4rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const PrimaryButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
    transform: translateY(-2px);
  }
`;

const SecondaryButton = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.colors.textPrimary};
  border: 1px solid ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.2)' 
    : 'rgba(0, 0, 0, 0.2)'};
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(0, 0, 0, 0.05)'};
    transform: translateY(-2px);
  }
`;

const HeroVisual = styled.div`
  margin-top: 4rem;
  animation: ${float} 3s ease-in-out infinite;
`;

// Features Section - Stripe-inspired
const FeaturesSection = styled.section`
  padding: 8rem 2rem;
  background: ${({ theme }) => theme.colors.background};
`;

const SectionContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 6rem;
`;

const SectionTitle = styled.h2`
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 1.5rem;
`;

const SectionSubtitle = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 3rem;
`;

const FeatureCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 2.5rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.1)'};
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
`;

const FeatureIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 1rem;
`;

const FeatureDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
  font-size: 1rem;
`;

// Stats Section - Linear-inspired
const StatsSection = styled.section`
  padding: 6rem 2rem;
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.02)' 
    : 'rgba(0, 0, 0, 0.02)'};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 3rem;
  max-width: 1000px;
  margin: 0 auto;
`;

const StatCard = styled.div`
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 3rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
`;

// Testimonials Section
const TestimonialsSection = styled.section`
  padding: 8rem 2rem;
  background: ${({ theme }) => theme.colors.background};
`;

const TestimonialsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
`;

const TestimonialCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.1)'};
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
`;

const TestimonialText = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  font-style: italic;
`;

const TestimonialAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const AuthorAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1rem;
`;

const AuthorInfo = styled.div``;

const AuthorName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 1rem;
`;

const AuthorRole = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
`;

// CTA Section - Clean and focused
const CTASection = styled.section`
  padding: 6rem 2rem;
  background: ${({ theme }) => theme.colors.primary};
  text-align: center;
`;

const CTAContent = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const CTATitle = styled.h2`
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 700;
  color: white;
  margin-bottom: 1.5rem;
`;

const CTASubtitle = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2.5rem;
  line-height: 1.6;
`;

const CTAButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const CTAButton = styled.button`
  background: white;
  color: ${({ theme }) => theme.colors.primary};
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
`;

// Footer - Minimal
const Footer = styled.footer`
  background: ${({ theme }) => theme.mode === 'dark' 
    ? '#000000' 
    : '#f8f9fa'};
  padding: 3rem 2rem;
  text-align: center;
  border-top: 1px solid ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.1)'};
`;

const FooterText = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  font-size: 0.9rem;
`;

const FooterLink = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  margin-left: 1rem;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { mode } = useDarkMode();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleDashboard = () => {
    navigate('/dashboard');
  };

  const handleCredits = () => {
    navigate('/credits');
  };

  return (
    <LandingWrapper>
      <Navigation>
        <AppLogo />
        <NavLinks>
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#testimonials">Erfahrungen</NavLink>
          <NavLink href="#pricing">Preise</NavLink>
          <NavLink onClick={handleDashboard} style={{ cursor: 'pointer' }}>Dashboard</NavLink>
          <LoginButton onClick={handleLogin}>
            Anmelden
          </LoginButton>
        </NavLinks>
      </Navigation>

      <HeroSection>
        <HeroContainer>
          <HeroBadge>
            ✨ #1 Kita-Management in Deutschland
          </HeroBadge>
          <HeroTitle>
            Die Zukunft der
            <br />
            <span className="gradient">Kita-Verwaltung</span>
          </HeroTitle>
          <HeroSubtitle>
            App4KITAs revolutioniert die Verwaltung von Kindertagesstätten. 
            DSGVO-konform, benutzerfreundlich und vollständig digital.
          </HeroSubtitle>
          
          <HeroButtons>
            <PrimaryButton onClick={handleDashboard}>
              Kostenlos testen
            </PrimaryButton>
            <SecondaryButton onClick={handleLogin}>
              Demo ansehen
            </SecondaryButton>
          </HeroButtons>
          
          <HeroVisual>
            <MascotBear size={120} />
          </HeroVisual>
        </HeroContainer>
      </HeroSection>

      <FeaturesSection id="features">
        <SectionContainer>
          <SectionHeader>
            <SectionTitle>Warum App4KITAs?</SectionTitle>
            <SectionSubtitle>
              Eine vollständige Lösung für moderne Kindertagesstätten
            </SectionSubtitle>
          </SectionHeader>
          
          <FeaturesGrid>
            <FeatureCard>
              <FeatureIcon>🔐</FeatureIcon>
              <FeatureTitle>100% DSGVO-konform</FeatureTitle>
              <FeatureDescription>
                Vollständige Einhaltung europäischer Datenschutzrichtlinien. 
                Ihre Daten sind sicher und geschützt.
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>⚡</FeatureIcon>
              <FeatureTitle>80% Zeitersparnis</FeatureTitle>
              <FeatureDescription>
                Automatisierte Prozesse reduzieren Verwaltungsaufwand drastisch. 
                Mehr Zeit für die pädagogische Arbeit.
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>📱</FeatureIcon>
              <FeatureTitle>Immer verfügbar</FeatureTitle>
              <FeatureDescription>
                Web-Dashboard und mobile App. Arbeiten Sie von überall - 
                auch offline mit automatischer Synchronisation.
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>💬</FeatureIcon>
              <FeatureTitle>Moderne Kommunikation</FeatureTitle>
              <FeatureDescription>
                Integriertes Chat-System, Nachrichten und Push-Benachrichtigungen. 
                Bleiben Sie mit Eltern und Team verbunden.
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>📊</FeatureIcon>
              <FeatureTitle>Intelligente Berichte</FeatureTitle>
              <FeatureDescription>
                Automatische Berichte, Statistiken und Export-Funktionen. 
                Behalten Sie den Überblick über Ihre Kita.
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>🎯</FeatureIcon>
              <FeatureTitle>Maßgeschneidert</FeatureTitle>
              <FeatureDescription>
                Anpassbar an Ihre Bedürfnisse. Verschiedene Rollen und 
                Berechtigungen für optimale Arbeitsabläufe.
              </FeatureDescription>
            </FeatureCard>
          </FeaturesGrid>
        </SectionContainer>
      </FeaturesSection>

      <StatsSection>
        <SectionContainer>
          <StatsGrid>
            <StatCard>
              <StatNumber>500+</StatNumber>
              <StatLabel>Zufriedene Kitas</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>50K+</StatNumber>
              <StatLabel>Verwaltete Kinder</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>80%</StatNumber>
              <StatLabel>Zeitersparnis</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>24/7</StatNumber>
              <StatLabel>Support verfügbar</StatLabel>
            </StatCard>
          </StatsGrid>
        </SectionContainer>
      </StatsSection>

      <TestimonialsSection id="testimonials">
        <SectionContainer>
          <SectionHeader>
            <SectionTitle>Das sagen unsere Kunden</SectionTitle>
            <SectionSubtitle>
              Echte Erfahrungen von Kita-Leitungen und Erziehern
            </SectionSubtitle>
          </SectionHeader>
          
          <TestimonialsGrid>
            <TestimonialCard>
              <TestimonialText>
                "App4KITAs hat unsere Verwaltung komplett revolutioniert. 
                Wir sparen täglich mehrere Stunden und können uns endlich 
                auf die pädagogische Arbeit konzentrieren."
              </TestimonialText>
              <TestimonialAuthor>
                <AuthorAvatar>SM</AuthorAvatar>
                <AuthorInfo>
                  <AuthorName>Sarah Müller</AuthorName>
                  <AuthorRole>Leiterin, Kita Sonnenschein</AuthorRole>
                </AuthorInfo>
              </TestimonialAuthor>
            </TestimonialCard>
            
            <TestimonialCard>
              <TestimonialText>
                "Die DSGVO-Konformität war uns wichtig. App4KITAs 
                bietet absolute Sicherheit und Transparenz. 
                Eltern sind begeistert von der modernen Kommunikation."
              </TestimonialText>
              <TestimonialAuthor>
                <AuthorAvatar>TW</AuthorAvatar>
                <AuthorInfo>
                  <AuthorName>Thomas Weber</AuthorName>
                  <AuthorRole>Geschäftsführer, Kinderhaus</AuthorRole>
                </AuthorInfo>
              </TestimonialAuthor>
            </TestimonialCard>
            
            <TestimonialCard>
              <TestimonialText>
                "Endlich eine Lösung, die wirklich funktioniert! 
                Die mobile App ist genial - Check-ins sind jetzt 
                ein Kinderspiel. Sehr empfehlenswert!"
              </TestimonialText>
              <TestimonialAuthor>
                <AuthorAvatar>LK</AuthorAvatar>
                <AuthorInfo>
                  <AuthorName>Lisa Klein</AuthorName>
                  <AuthorRole>Erzieherin, Waldkindergarten</AuthorRole>
                </AuthorInfo>
              </TestimonialAuthor>
            </TestimonialCard>
          </TestimonialsGrid>
        </SectionContainer>
      </TestimonialsSection>

      <CTASection>
        <CTAContent>
          <CTATitle>Bereit für die Zukunft?</CTATitle>
          <CTASubtitle>
            Schließen Sie sich über 500 zufriedenen Kitas an und 
            transformieren Sie Ihre Verwaltung noch heute.
          </CTASubtitle>
          <CTAButtons>
            <CTAButton onClick={handleDashboard}>
              Jetzt kostenlos testen
            </CTAButton>
            <CTAButton onClick={handleLogin}>
              Demo anfordern
            </CTAButton>
          </CTAButtons>
        </CTAContent>
      </CTASection>

      <Footer>
        <FooterText>
          © 2025 App4KITAs - Die moderne Kita-Management-Lösung aus Europa 🇪🇺
          <FooterLink onClick={handleCredits}>
            Entwicklung & Credits
          </FooterLink>
        </FooterText>
      </Footer>
    </LandingWrapper>
  );
};

export default Landing; 