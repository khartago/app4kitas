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
  margin-bottom: 2.5rem;
  background: ${props => props.theme.colors.surface};
  border-radius: 8px;
  padding: 2rem;
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    margin-bottom: 2rem;
  }
`;

const SectionTitle = styled.h2`
  color: ${props => props.theme.colors.primary};
  font-size: clamp(1.2rem, 4vw, 1.5rem);
  font-weight: 600;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
`;

const SectionSubtitle = styled.h3`
  color: ${props => props.theme.colors.textPrimary};
  font-size: clamp(1rem, 3vw, 1.2rem);
  font-weight: 600;
  margin: 1.5rem 0 1rem 0;
`;

const Text = styled.p`
  color: ${props => props.theme.colors.textPrimary};
  line-height: 1.7;
  margin-bottom: 1rem;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
`;

const List = styled.ul`
  color: ${props => props.theme.colors.textPrimary};
  line-height: 1.7;
  margin: 1rem 0;
  padding-left: 1.5rem;
  
  @media (max-width: 768px) {
    padding-left: 1rem;
  }
`;

const ListItem = styled.li`
  margin-bottom: 0.5rem;
  font-size: clamp(0.85rem, 2.5vw, 1rem);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  background: ${props => props.theme.colors.background};
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid ${props => props.theme.colors.border};
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const TableHeader = styled.th`
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: clamp(0.8rem, 2.5vw, 0.9rem);
  
  @media (max-width: 768px) {
    padding: 0.75rem 0.5rem;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.textPrimary};
  font-size: clamp(0.8rem, 2.5vw, 0.9rem);
  
  @media (max-width: 768px) {
    padding: 0.75rem 0.5rem;
  }
`;

const TableRow = styled.tr`
  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
  }
`;

const ContactInfo = styled.div`
  background: ${props => props.theme.colors.primary}10;
  border-left: 4px solid ${props => props.theme.colors.primary};
  padding: 1.5rem;
  border-radius: 6px;
  margin: 1rem 0;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ContactTitle = styled.h4`
  color: ${props => props.theme.colors.primary};
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: clamp(1rem, 3vw, 1.1rem);
`;

const ContactText = styled.p`
  color: ${props => props.theme.colors.textPrimary};
  margin: 0.25rem 0;
  font-size: clamp(0.85rem, 2.5vw, 0.95rem);
`;

const ButtonGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  @media (min-width: 769px) and (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const Button = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: clamp(0.85rem, 2.5vw, 0.95rem);
  width: 100%;
  
  &:hover {
    background: ${props => props.theme.colors.primaryDark};
    transform: translateY(-1px);
  }
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

const Terms: React.FC = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString('de-DE', { month: 'long' });

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleContactSupport = () => {
    window.location.href = 'mailto:support@app4kitas.eu?subject=Support-Anfrage';
  };

  const handlePrivacyPolicy = () => {
    navigate('/privacy');
  };

  return (
    <Container>
      <HeroSection>
        <LogoHeroWrapper>
          <AppLogo size={64} />
        </LogoHeroWrapper>
        <HeroTitle>Nutzungsbedingungen</HeroTitle>
        <HeroSubtitle>
          Allgemeine Nutzungsbedingungen für App4KITAs
        </HeroSubtitle>
      </HeroSection>
      <MainContent>
        <Section>
          <SectionTitle>1. Geltungsbereich</SectionTitle>
          <Text>
            Diese Nutzungsbedingungen gelten für die Nutzung der Plattform App4KITAs durch Kindertagesstätten, Eltern und Pädagog:innen.
          </Text>
        </Section>
        <Section>
          <SectionTitle>2. Registrierung & Zugang</SectionTitle>
          <Text>
            Eltern können sich selbstständig in der App registrieren. Die Einrichtungsleitung weist Eltern ihren Kindern zu – entweder direkt bei der Kinderanlage oder nachträglich. Pädagog:innen werden von der Einrichtungsleitung hinzugefügt. Die Zugangsdaten sind vertraulich zu behandeln.
          </Text>
        </Section>
        <Section>
          <SectionTitle>3. Rollen & Rechte</SectionTitle>
          <Text>
            Es gibt drei Rollen: Einrichtungsleitung, Pädagog:in und Elternteil. Die jeweiligen Rechte und Pflichten ergeben sich aus der Systemkonfiguration.
          </Text>
        </Section>
        <Section>
          <SectionTitle>4. Pflichten der Nutzer:innen</SectionTitle>
          <List>
            <ListItem>Vertrauliche Behandlung der Zugangsdaten</ListItem>
            <ListItem>Keine Weitergabe von Zugangsdaten an Dritte</ListItem>
            <ListItem>Verantwortungsvoller Umgang mit personenbezogenen Daten</ListItem>
            <ListItem>Keine missbräuchliche Nutzung der Plattform</ListItem>
          </List>
        </Section>
        <Section>
          <SectionTitle>5. Haftung</SectionTitle>
          <Text>
            App4KITAs haftet nur für Schäden, die auf vorsätzlicher oder grob fahrlässiger Pflichtverletzung beruhen. Für Datenverluste, die durch unsachgemäße Nutzung entstehen, wird keine Haftung übernommen.
          </Text>
        </Section>
        <Section>
          <SectionTitle>6. Datenschutz</SectionTitle>
          <Text>
            Die Verarbeitung personenbezogener Daten erfolgt gemäß der Datenschutzerklärung und den geltenden Datenschutzgesetzen (DSGVO).
          </Text>
        </Section>
        <Section>
          <SectionTitle>7. Änderungen der Nutzungsbedingungen</SectionTitle>
          <Text>
            App4KITAs behält sich das Recht vor, diese Nutzungsbedingungen jederzeit zu ändern. Über wesentliche Änderungen werden die Nutzer:innen rechtzeitig informiert.
          </Text>
        </Section>
        <Section>
          <SectionTitle>8. Support & Kontakt</SectionTitle>
          <Text>
            Bei Fragen oder Problemen wenden Sie sich bitte an support@app4kitas.de.
          </Text>
        </Section>
      </MainContent>
      <Footer />
    </Container>
  );
};

export default Terms; 