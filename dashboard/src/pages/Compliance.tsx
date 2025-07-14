import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: ${props => props.theme.colors.background};
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem 0;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
  @media (max-width: 768px) {
    margin-bottom: 2rem;
    padding: 1rem 0;
  }
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.primary};
  font-size: clamp(2rem, 5vw, 2.5rem);
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: clamp(1rem, 3vw, 1.2rem);
  margin-bottom: 2rem;
  line-height: 1.5;
`;

const Section = styled.section`
  margin-bottom: 2.5rem;
  background: ${props => props.theme.colors.surface};
  padding: 2rem;
  border-radius: 8px;
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
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
`;

const Text = styled.p`
  color: ${props => props.theme.colors.textPrimary};
  line-height: 1.6;
  margin-bottom: 1rem;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
`;

const List = styled.ul`
  color: ${props => props.theme.colors.textPrimary};
  line-height: 1.6;
  margin-bottom: 1rem;
  padding-left: 1.5rem;
  
  @media (max-width: 768px) {
    padding-left: 1rem;
  }
`;

const ListItem = styled.li`
  margin-bottom: 0.5rem;
  font-size: clamp(0.85rem, 2.5vw, 1rem);
`;

const ContactInfo = styled.div`
  background: ${props => props.theme.colors.primary}10;
  padding: 1.5rem;
  border-radius: 6px;
  border-left: 4px solid ${props => props.theme.colors.primary};
  margin: 1rem 0;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ContactTitle = styled.h3`
  color: ${props => props.theme.colors.primary};
  margin-bottom: 0.5rem;
  font-size: clamp(1rem, 3vw, 1.1rem);
  font-weight: 600;
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
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: clamp(0.85rem, 2.5vw, 0.95rem);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.theme.colors.primary};
  color: white;
  width: 100%;
  
  &:hover {
    background: ${props => props.theme.colors.primaryDark};
    transform: translateY(-1px);
  }
`;

const SecondaryButton = styled(Button)`
  background: transparent;
  color: ${props => props.theme.colors.primary};
  border: 1px solid ${props => props.theme.colors.primary};
  
  &:hover {
    background: ${props => props.theme.colors.primary};
    color: white;
  }
`;

const Compliance: React.FC = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const handleBackToLanding = () => {
    navigate('/');
  };

  const handleContactDPO = () => {
    window.location.href = 'mailto:datenschutz@app4kitas.eu?subject=Compliance-Anfrage';
  };

  const handleDownloadDPA = () => {
    console.log('DPA template download requested');
  };

  const handleDownloadROPA = () => {
    console.log('RoPA template download requested');
  };

  return (
    <Container>
      <Header>
        <Title>Compliance & Datenschutz</Title>
        <Subtitle>
          App4KITAs - DSGVO-konforme Kita-Management-Plattform
        </Subtitle>
      </Header>

      <Section>
        <SectionTitle>📋 Datenschutz-Compliance</SectionTitle>
        <Text>
          App4KITAs ist vollständig DSGVO-konform und erfüllt alle europäischen Datenschutzrichtlinien. 
          Unsere Compliance-Maßnahmen umfassen technische Sicherheit, organisatorische Prozesse und 
          umfassende Dokumentation.
        </Text>
        
        <ContactInfo>
          <ContactTitle>Datenschutzbeauftragter</ContactTitle>
          <ContactText>E-Mail: datenschutz@app4kitas.eu</ContactText>
          <ContactText>Telefon: [Kontaktnummer]</ContactText>
          <ContactText>Adresse: [Geschäftsadresse]</ContactText>
        </ContactInfo>
      </Section>

      <Section>
        <SectionTitle>🔒 Technische Sicherheitsmaßnahmen</SectionTitle>
        <Text>
          App4KITAs implementiert umfassende technische Sicherheitsmaßnahmen:
        </Text>
        <List>
          <ListItem>TLS 1.3 Verschlüsselung für alle Verbindungen</ListItem>
          <ListItem>Passwort-Hashing mit bcrypt und Salt</ListItem>
          <ListItem>PostgreSQL-Datenbank mit Verschlüsselung</ListItem>
          <ListItem>JWT-Authentifizierung mit HttpOnly Cookies</ListItem>
          <ListItem>Rollenbasierte Zugriffskontrolle (RBAC)</ListItem>
          <ListItem>Input-Validierung gegen XSS und Injection</ListItem>
          <ListItem>Malware-Erkennung bei Datei-Uploads</ListItem>
          <ListItem>Rate Limiting gegen Brute-Force-Angriffe</ListItem>
          <ListItem>Security Headers (Helmet.js)</ListItem>
          <ListItem>Vollständige Aktivitätsprotokollierung</ListItem>
        </List>
      </Section>

      <Section>
        <SectionTitle>🌍 Hosting und Datenstandort</SectionTitle>
        <Text>
          App4KITAs wird ausschließlich in Europa gehostet, um die DSGVO-Konformität zu gewährleisten:
        </Text>
        <List>
          <ListItem>Hosting: OVH VPS (Europa)</ListItem>
          <ListItem>Datenbank: PostgreSQL (Europa)</ListItem>
          <ListItem>Backup: Automatische Snapshots (Europa)</ListItem>
          <ListItem>Keine Datenübertragung außerhalb der EU</ListItem>
          <ListItem>Alle Server in EU/EWR-Staaten</ListItem>
        </List>
      </Section>

      <Section>
        <SectionTitle>📊 Betroffenenrechte (DSGVO)</SectionTitle>
        <Text>
          App4KITAs implementiert alle DSGVO-Betroffenenrechte:
        </Text>
        <List>
          <ListItem><strong>Recht auf Auskunft (Art. 15):</strong> Vollständiger Datenexport</ListItem>
          <ListItem><strong>Recht auf Berichtigung (Art. 16):</strong> Profil- und Datenbearbeitung</ListItem>
          <ListItem><strong>Recht auf Löschung (Art. 17):</strong> Kontolöschung mit Datei-Cleanup</ListItem>
          <ListItem><strong>Recht auf Einschränkung (Art. 18):</strong> Temporäre Datenbeschränkung</ListItem>
          <ListItem><strong>Recht auf Datenportabilität (Art. 20):</strong> Maschinenlesbarer Export</ListItem>
          <ListItem><strong>Widerspruchsrecht (Art. 21):</strong> Verarbeitungstyp-spezifische Widersprüche</ListItem>
        </List>
      </Section>

      <Section>
        <SectionTitle>🍪 Cookie-Einwilligung (ePrivacy)</SectionTitle>
        <Text>
          App4KITAs implementiert vollständige Cookie-Einwilligung gemäß ePrivacy-Richtlinie:
        </Text>
        <List>
          <ListItem>Granulare Cookie-Kontrolle (Notwendig, Analytics, Marketing, Präferenzen)</ListItem>
          <ListItem>Opt-in für alle nicht-essentiellen Cookies</ListItem>
          <ListItem>Einfache Einwilligungswiderrufung</ListItem>
          <ListItem>Transparente Cookie-Kategorisierung</ListItem>
          <ListItem>Lokale Speicherung der Einwilligung</ListItem>
        </List>
      </Section>

      <Section>
        <SectionTitle>📋 Aufbewahrungsfristen</SectionTitle>
        <Text>
          Automatische Datenlöschung nach gesetzlichen Fristen:
        </Text>
        <List>
          <ListItem><strong>Login-Versuche:</strong> 12 Monate (automatisch)</ListItem>
          <ListItem><strong>Aktivitätsprotokoll:</strong> 3 Jahre (automatisch)</ListItem>
          <ListItem><strong>Nachrichten:</strong> 2 Jahre (automatisch)</ListItem>
          <ListItem><strong>Benachrichtigungen:</strong> 1 Jahr (automatisch)</ListItem>
          <ListItem><strong>Check-in-Daten:</strong> 3 Jahre (automatisch)</ListItem>
          <ListItem><strong>Benutzerkonten:</strong> 30 Tage nach Kündigung</ListItem>
          <ListItem><strong>Kinderdaten:</strong> 30 Tage nach Austritt</ListItem>
        </List>
      </Section>

      <Section>
        <SectionTitle>🚨 Incident Response</SectionTitle>
        <Text>
          App4KITAs verfügt über umfassende Incident-Response-Verfahren:
        </Text>
        <List>
          <ListItem>72-Stunden-Meldepflicht bei Datenschutzverletzungen</ListItem>
          <ListItem>Automatische Anomalie-Erkennung</ListItem>
          <ListItem>Vollständige Protokollierung aller Vorfälle</ListItem>
          <ListItem>Eskalations-Prozess mit definierten Kontakten</ListItem>
          <ListItem>Regelmäßige Security-Audits</ListItem>
        </List>
      </Section>

      <Section>
        <SectionTitle>📄 Compliance-Dokumentation</SectionTitle>
        <Text>
          App4KITAs stellt umfassende Compliance-Dokumentation zur Verfügung:
        </Text>
        <List>
          <ListItem>Vollständige Datenschutzerklärung</ListItem>
          <ListItem>Data Processing Agreement (DPA) Template</ListItem>
          <ListItem>Records of Processing Activities (RoPA) Template</ListItem>
          <ListItem>Incident Response Playbook</ListItem>
          <ListItem>Compliance-Checklisten</ListItem>
          <ListItem>Technische Sicherheitsdokumentation</ListItem>
        </List>
      </Section>

      <Section>
        <SectionTitle>📞 Kontakt und Beschwerden</SectionTitle>
        <Text>
          Für Datenschutz-Anfragen und Beschwerden:
        </Text>
        <ContactInfo>
          <ContactTitle>Datenschutzbeauftragter</ContactTitle>
          <ContactText>E-Mail: datenschutz@app4kitas.eu</ContactText>
          <ContactText>Telefon: [Kontaktnummer]</ContactText>
          <ContactText>Adresse: [Geschäftsadresse]</ContactText>
        </ContactInfo>
        
        <ContactInfo>
          <ContactTitle>Aufsichtsbehörde</ContactTitle>
          <ContactText>Bundesbeauftragter für den Datenschutz und die Informationsfreiheit</ContactText>
          <ContactText>Adresse: Graurheindorfer Str. 153, 53117 Bonn</ContactText>
          <ContactText>E-Mail: poststelle@bfdi.bund.de</ContactText>
        </ContactInfo>
      </Section>

      <ButtonGroup>
        <Button onClick={handleDownloadDPA}>
          DPA Template herunterladen
        </Button>
        <Button onClick={handleDownloadROPA}>
          RoPA Template herunterladen
        </Button>
        <SecondaryButton onClick={handleContactDPO}>
          DPO kontaktieren
        </SecondaryButton>
        <SecondaryButton onClick={handleBackToLanding}>
          Zurück zur Startseite
        </SecondaryButton>
      </ButtonGroup>
    </Container>
  );
};

export default Compliance; 