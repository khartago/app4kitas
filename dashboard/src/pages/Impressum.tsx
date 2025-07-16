import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import AppLogo from '../components/ui/AppLogo';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${props => props.theme.colors.background} 0%, ${props => props.theme.colors.surface} 100%);
  padding: 0;
`;

const HeroSection = styled.section`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryDark} 100%);
  padding: 4rem 2rem 6rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
    opacity: 0.3;
  }
  
  @media (max-width: 768px) {
    padding: 3rem 1rem 4rem 1rem;
  }
`;

const HeroTitle = styled.h1`
  color: white;
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 800;
  margin: 0 0 1rem 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: relative;
  z-index: 1;
  letter-spacing: -0.02em;
`;

const HeroSubtitle = styled.p`
  color: rgba(255,255,255,0.9);
  font-size: clamp(1.1rem, 3vw, 1.4rem);
  margin: 0;
  font-weight: 300;
  position: relative;
  z-index: 1;
  max-width: 600px;
  margin: 0 auto;
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  transform: translateY(-3rem);
  
  @media (max-width: 768px) {
    padding: 0 1rem;
    transform: translateY(-2rem);
  }
`;

const Section = styled.section`
  background: ${props => props.theme.colors.surface};
  border-radius: 24px;
  padding: 3rem;
  margin-bottom: 3rem;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.05);
  border: 1px solid ${props => props.theme.colors.border};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.accent});
  }
  
  @media (max-width: 768px) {
    padding: 2rem;
    border-radius: 16px;
  }
`;

const SectionTitle = styled.h2`
  color: ${props => props.theme.colors.textPrimary};
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
  letter-spacing: -0.01em;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Text = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1.1rem;
  line-height: 1.7;
  margin-bottom: 1.5rem;
`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
`;

const ContactCard = styled.div`
  background: ${props => props.theme.colors.background};
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid ${props => props.theme.colors.border};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  }
`;

const ContactIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}20, ${props => props.theme.colors.primary}10);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const ContactTitle = styled.h3`
  color: ${props => props.theme.colors.textPrimary};
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
`;

const ContactInfo = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1rem;
  margin: 0;
  line-height: 1.5;
`;

const ContactLink = styled.a`
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  font-weight: 600;
  
  &:hover {
    text-decoration: underline;
  }
`;

const HighlightBox = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.colors.accent}15, ${props => props.theme.colors.primary}10);
  border-radius: 16px;
  padding: 2rem;
  margin: 2rem 0;
  border-left: 4px solid ${props => props.theme.colors.primary};
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const HighlightTitle = styled.h4`
  color: ${props => props.theme.colors.primary};
  font-weight: 700;
  margin-bottom: 1rem;
  font-size: 1.2rem;
`;

const HighlightText = styled.p`
  color: ${props => props.theme.colors.textPrimary};
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.6;
`;

const LogoHeroWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 2rem auto;
  background: white;
  border-radius: 50%;
  width: 88px;
  height: 88px;
  box-shadow: 0 4px 24px rgba(44,62,80,0.10);
`;

const Impressum: React.FC = () => {
  return (
    <Container>
      <HeroSection>
        <LogoHeroWrapper>
          <AppLogo size={64} />
        </LogoHeroWrapper>
        <HeroTitle>Impressum</HeroTitle>
        <HeroSubtitle>Angaben gemäß § 5 TMG</HeroSubtitle>
      </HeroSection>
      <MainContent>
        <Section>
          <SectionTitle>App4KITAs GmbH</SectionTitle>
          <Text>
            Musterstraße 1<br />
            12345 Berlin<br />
            Deutschland
          </Text>
          <Text>
            Handelsregister: HRB 123456<br />
            Registergericht: Amtsgericht Berlin-Charlottenburg
          </Text>
          <Text>
            Vertreten durch: Max Mustermann
          </Text>
          <Text>
            Kontakt:<br />
            Telefon: +49 30 12345678<br />
            E-Mail: support@app4kitas.de
          </Text>
          <Text>
            Umsatzsteuer-ID: DE123456789<br />
            Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV: Max Mustermann, Adresse wie oben
          </Text>
        </Section>
        <ContactGrid>
          <ContactCard>
            <ContactIcon>📞</ContactIcon>
            <ContactTitle>Telefon</ContactTitle>
            <ContactInfo>+49 30 12345678</ContactInfo>
          </ContactCard>
          <ContactCard>
            <ContactIcon>✉️</ContactIcon>
            <ContactTitle>E-Mail</ContactTitle>
            <ContactInfo>support@app4kitas.de</ContactInfo>
          </ContactCard>
          <ContactCard>
            <ContactIcon>🌐</ContactIcon>
            <ContactTitle>Website</ContactTitle>
            <ContactInfo>www.app4kitas.de</ContactInfo>
          </ContactCard>
        </ContactGrid>
        <HighlightBox>
          <HighlightTitle>Haftungsausschluss</HighlightTitle>
          <HighlightText>
            Die Inhalte dieser Website werden mit größtmöglicher Sorgfalt und nach bestem Gewissen erstellt.
            Für die Richtigkeit, Vollständigkeit und Aktualität der bereitgestellten Informationen
            kann jedoch keine Gewähr übernommen werden.
          </HighlightText>
        </HighlightBox>
        <HighlightBox>
          <HighlightTitle>Datenschutz</HighlightTitle>
          <HighlightText>
            Die Nutzung unserer Webseite ist in der Regel ohne Angabe personenbezogener Daten
            möglich. Soweit auf unseren Seiten personenbezogene Daten (wie Name, Anschrift oder
            E-Mail-Adressen) erhoben werden, erfolgt dies, soweit möglich, stets auf freiwilliger
            Basis. Diese Daten werden ohne Ihre ausdrückliche Zustimmung nicht an Dritte weitergegeben.
          </HighlightText>
        </HighlightBox>
      </MainContent>
      <Footer />
    </Container>
  );
};

export default Impressum; 