import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import AppLogo from '../components/ui/AppLogo'; // Added import for AppLogo

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

const SectionSubtitle = styled.h3`
  color: ${props => props.theme.colors.primary};
  font-size: 1.3rem;
  font-weight: 600;
  margin: 2rem 0 1rem 0;
  letter-spacing: -0.01em;
`;

const Text = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1.1rem;
  line-height: 1.7;
  margin-bottom: 1.5rem;
`;

const List = styled.ul`
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.7;
  margin: 1rem 0;
  padding-left: 1.5rem;
  
  @media (max-width: 768px) {
    padding-left: 1rem;
  }
`;

const ListItem = styled.li`
  margin-bottom: 0.8rem;
  font-size: 1.1rem;
`;

const ContactInfo = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}10, ${props => props.theme.colors.accent}10);
  border-radius: 16px;
  padding: 2rem;
  margin: 2rem 0;
  border: 1px solid ${props => props.theme.colors.primary}20;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const ContactTitle = styled.h4`
  color: ${props => props.theme.colors.primary};
  font-weight: 600;
  margin-bottom: 1rem;
  font-size: 1.2rem;
`;

const ContactText = styled.p`
  color: ${props => props.theme.colors.textPrimary};
  margin: 0.5rem 0;
  font-size: 1.1rem;
  line-height: 1.6;
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

const Privacy: React.FC = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString('de-DE', { month: 'long' });

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleContactDataProtection = () => {
    window.location.href = 'mailto:datenschutz@app4kitas.eu?subject=Datenschutz-Anfrage';
  };

  const handleExportData = () => {
    console.log('Data export requested');
  };

  return (
    <Container>
      <HeroSection>
        <LogoHeroWrapper>
          <AppLogo size={64} />
        </LogoHeroWrapper>
        <HeroTitle>Datenschutzerklärung</HeroTitle>
        <HeroSubtitle>
          Informationen zum Datenschutz bei App4KITAs
        </HeroSubtitle>
      </HeroSection>
      <MainContent>
        <Section>
          <SectionTitle>1. Verantwortlicher</SectionTitle>
          <Text>
            Verantwortlich für die Datenverarbeitung ist:<br />
            App4KITAs GmbH, Musterstraße 1, 12345 Berlin, support@app4kitas.de
          </Text>
        </Section>
        <Section>
          <SectionTitle>2. Verarbeitete Datenarten</SectionTitle>
          <List>
            <ListItem>Stammdaten (Kinder, Eltern, Pädagog:innen)</ListItem>
            <ListItem>Anwesenheitsdaten (Check-in/out, Gruppen)</ListItem>
            <ListItem>Kommunikationsdaten (Nachrichten, Benachrichtigungen)</ListItem>
            <ListItem>Einwilligungen (Fotos, Ausflüge, etc.)</ListItem>
            <ListItem>Protokolldaten (Audit-Log, Aktivitäten)</ListItem>
          </List>
        </Section>
        <Section>
          <SectionTitle>3. Zwecke der Datenverarbeitung</SectionTitle>
          <List>
            <ListItem>Digitale Verwaltung und Organisation des Kita-Alltags</ListItem>
            <ListItem>Kommunikation zwischen Eltern und Pädagog:innen</ListItem>
            <ListItem>Dokumentation von Anwesenheit und Aktivitäten</ListItem>
            <ListItem>Rechtssichere Einwilligungsverwaltung</ListItem>
            <ListItem>Erfüllung gesetzlicher Aufbewahrungs- und Nachweispflichten</ListItem>
          </List>
        </Section>
        <Section>
          <SectionTitle>4. Rechtsgrundlagen</SectionTitle>
          <List>
            <ListItem>Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO)</ListItem>
            <ListItem>Rechtliche Verpflichtung (Art. 6 Abs. 1 lit. c DSGVO)</ListItem>
            <ListItem>Berechtigtes Interesse (Art. 6 Abs. 1 lit. f DSGVO)</ListItem>
            <ListItem>Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)</ListItem>
          </List>
        </Section>
        <Section>
          <SectionTitle>5. Aufbewahrung & Löschung</SectionTitle>
          <List>
            <ListItem>Benutzerkonten: 30 Tage nach Kündigung</ListItem>
            <ListItem>Kinderdaten: 30 Tage nach Austritt</ListItem>
            <ListItem>Check-in-Daten: 3 Jahre</ListItem>
            <ListItem>Nachrichten: 2 Jahre</ListItem>
            <ListItem>Audit-Log: 3 Jahre</ListItem>
          </List>
          <Text>
            Nach Ablauf der Fristen werden die Daten automatisch gelöscht. Die Einrichtungsleitung kann Löschanfragen initiieren.
          </Text>
        </Section>
        <Section>
          <SectionTitle>6. Rechte der Betroffenen</SectionTitle>
          <List>
            <ListItem>Auskunft (Art. 15 DSGVO)</ListItem>
            <ListItem>Berichtigung (Art. 16 DSGVO)</ListItem>
            <ListItem>Löschung (Art. 17 DSGVO)</ListItem>
            <ListItem>Einschränkung (Art. 18 DSGVO)</ListItem>
            <ListItem>Datenübertragbarkeit (Art. 20 DSGVO)</ListItem>
            <ListItem>Widerspruch (Art. 21 DSGVO)</ListItem>
          </List>
          <Text>
            Sie können Ihre Rechte jederzeit im Bereich "Datenschutz" oder per E-Mail an support@app4kitas.de geltend machen.
          </Text>
        </Section>
        <Section>
          <SectionTitle>7. Datensicherheit</SectionTitle>
          <List>
            <ListItem>Verschlüsselte Speicherung (TLS 1.3, bcrypt)</ListItem>
            <ListItem>Serverstandort ausschließlich Europa (OVH VPS)</ListItem>
            <ListItem>Rollenbasierte Zugriffskontrolle</ListItem>
            <ListItem>Audit-Log für alle sensiblen Aktionen</ListItem>
            <ListItem>Regelmäßige Backups und Monitoring</ListItem>
          </List>
        </Section>
        <Section>
          <SectionTitle>8. Datenexport & Kontakt</SectionTitle>
          <Text>
            Sie können einen vollständigen Export Ihrer personenbezogenen Daten anfordern oder sich bei Fragen an support@app4kitas.de wenden.
          </Text>
        </Section>
        <Section>
          <SectionTitle>9. Aktualisierung</SectionTitle>
          <Text>
            Diese Datenschutzerklärung wird regelmäßig aktualisiert.<br />
            <strong>Letzte Aktualisierung:</strong> {currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)} {currentYear}
          </Text>
        </Section>
      </MainContent>
      <Footer />
    </Container>
  );
};

export default Privacy; 