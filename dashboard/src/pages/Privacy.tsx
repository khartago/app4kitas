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
      <Header>
        <Title>Datenschutzerklärung</Title>
        <Subtitle>
          App4KITAs - DSGVO-konforme Kita-Management-Plattform
        </Subtitle>
      </Header>

      <Section>
        <SectionTitle>1. Verantwortlicher</SectionTitle>
        <Text>
          Verantwortlich für die Datenverarbeitung im Sinne der DSGVO ist:
        </Text>
        <ContactInfo>
          <ContactTitle>App4KITAs GmbH</ContactTitle>
          <ContactText>E-Mail: datenschutz@app4kitas.eu</ContactText>
          <ContactText>Telefon: [Kontaktnummer]</ContactText>
          <ContactText>Adresse: [Eingetragene Geschäftsadresse]</ContactText>
        </ContactInfo>
      </Section>

      <Section>
        <SectionTitle>2. Verarbeitete personenbezogene Daten</SectionTitle>
        
        <SectionSubtitle>2.1 Benutzerdaten</SectionSubtitle>
        <Text>
          Wir verarbeiten folgende personenbezogene Daten unserer Benutzer:
        </Text>
        <List>
          <ListItem>Name und E-Mail-Adresse für die Registrierung</ListItem>
          <ListItem>Telefonnummer (optional, für Eltern)</ListItem>
          <ListItem>Profilbild (optional)</ListItem>
          <ListItem>Rolle im System (SUPER_ADMIN, ADMIN, EDUCATOR, PARENT)</ListItem>
          <ListItem>Zugehörigkeit zu Kindertagesstätten</ListItem>
          <ListItem>Geräte-Tokens für Push-Benachrichtigungen</ListItem>
        </List>

        <SectionSubtitle>2.2 Kinderdaten</SectionSubtitle>
        <Text>
          Für die Kinder in den Einrichtungen verarbeiten wir:
        </Text>
        <List>
          <ListItem>Name und Geburtsdatum</ListItem>
          <ListItem>Profilbilder (optional)</ListItem>
          <ListItem>QR-Code für Check-ins</ListItem>
          <ListItem>Zugehörigkeit zu Gruppen und Einrichtungen</ListItem>
        </List>

        <SectionSubtitle>2.3 Anwesenheitsdaten</SectionSubtitle>
        <Text>
          Wir protokollieren Check-in und Check-out Daten:
        </Text>
        <List>
          <ListItem>Ein- und Auscheckzeiten</ListItem>
          <ListItem>Methode (QR-Code oder manuell)</ListItem>
          <ListItem>Wer den Check-in durchgeführt hat</ListItem>
          <ListItem>Welches Kind eingecheckt wurde</ListItem>
        </List>
      </Section>

      <Section>
        <SectionTitle>3. Rechtsgrundlagen der Datenverarbeitung</SectionTitle>
        
        <SectionSubtitle>3.1 Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO)</SectionSubtitle>
        <Text>
          Die Verarbeitung von Benutzerprofilen, Kinderdaten und Check-ins erfolgt zur 
          Bereitstellung der Kita-Management-Plattform und ist für die Vertragserfüllung erforderlich.
        </Text>

        <SectionSubtitle>3.2 Berechtigte Interessen (Art. 6 Abs. 1 lit. f DSGVO)</SectionSubtitle>
        <Text>
          Die Verarbeitung von Login-Versuchen und Aktivitätsprotokollen erfolgt zur 
          Gewährleistung der Systemsicherheit und Betrugsbekämpfung.
        </Text>

        <SectionSubtitle>3.3 Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)</SectionSubtitle>
        <Text>
          Push-Benachrichtigungen werden nur mit Ihrer ausdrücklichen Einwilligung versendet. 
          Sie können diese jederzeit widerrufen.
        </Text>

        <SectionSubtitle>3.4 Öffentliche Interessen (Art. 6 Abs. 1 lit. e DSGVO)</SectionSubtitle>
        <Text>
          Die Verarbeitung von Anwesenheitsdaten und Notizen erfolgt zur Erfüllung der 
          Aufsichtspflicht und des Kinderschutzes.
        </Text>
      </Section>

      <Section>
        <SectionTitle>4. Aufbewahrungsfristen</SectionTitle>
        
        <Table>
          <thead>
            <tr>
              <TableHeader>Datenkategorie</TableHeader>
              <TableHeader>Aufbewahrung</TableHeader>
              <TableHeader>Löschung</TableHeader>
            </tr>
          </thead>
          <tbody>
            <TableRow>
              <TableCell>Aktive Benutzer</TableCell>
              <TableCell>Vertragslaufzeit</TableCell>
              <TableCell>30 Tage nach Kündigung</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Kinderdaten</TableCell>
              <TableCell>Kita-Zugehörigkeit</TableCell>
              <TableCell>30 Tage nach Austritt</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Check-in-Daten</TableCell>
              <TableCell>3 Jahre</TableCell>
              <TableCell>Automatisch</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Nachrichten</TableCell>
              <TableCell>2 Jahre</TableCell>
              <TableCell>Automatisch</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Login-Versuche</TableCell>
              <TableCell>12 Monate</TableCell>
              <TableCell>Automatisch</TableCell>
            </TableRow>
          </tbody>
        </Table>
      </Section>

      <Section>
        <SectionTitle>5. Ihre Rechte als Betroffener</SectionTitle>
        
        <SectionSubtitle>5.1 Recht auf Auskunft (Art. 15 DSGVO)</SectionSubtitle>
        <Text>
          Sie haben das Recht, eine Bestätigung darüber zu verlangen, ob personenbezogene 
          Daten verarbeitet werden, und auf Auskunft über diese Daten.
        </Text>

        <SectionSubtitle>5.2 Recht auf Berichtigung (Art. 16 DSGVO)</SectionSubtitle>
        <Text>
          Sie haben das Recht, die Berichtigung unrichtiger personenbezogener Daten zu verlangen.
        </Text>

        <SectionSubtitle>5.3 Recht auf Löschung (Art. 17 DSGVO)</SectionSubtitle>
        <Text>
          Sie haben das Recht, die Löschung Ihrer personenbezogenen Daten zu verlangen, 
          soweit keine gesetzlichen Aufbewahrungsfristen entgegenstehen.
        </Text>

        <SectionSubtitle>5.4 Recht auf Einschränkung (Art. 18 DSGVO)</SectionSubtitle>
        <Text>
          Sie haben das Recht, die Einschränkung der Verarbeitung Ihrer personenbezogenen 
          Daten zu verlangen.
        </Text>

        <SectionSubtitle>5.5 Recht auf Datenportabilität (Art. 20 DSGVO)</SectionSubtitle>
        <Text>
          Sie haben das Recht, Ihre personenbezogenen Daten in einem strukturierten, 
          gängigen und maschinenlesbaren Format zu erhalten.
        </Text>

        <SectionSubtitle>5.6 Widerspruchsrecht (Art. 21 DSGVO)</SectionSubtitle>
        <Text>
          Sie haben das Recht, der Verarbeitung Ihrer personenbezogenen Daten zu widersprechen.
        </Text>
      </Section>

      <Section>
        <SectionTitle>6. Technische Sicherheitsmaßnahmen</SectionTitle>
        
        <SectionSubtitle>6.1 Verschlüsselung</SectionSubtitle>
        <List>
          <ListItem>TLS 1.3 für alle Verbindungen</ListItem>
          <ListItem>Passwörter mit bcrypt gehashed</ListItem>
          <ListItem>PostgreSQL mit Verschlüsselung</ListItem>
          <ListItem>Verschlüsselte Backups</ListItem>
        </List>

        <SectionSubtitle>6.2 Zugriffskontrolle</SectionSubtitle>
        <List>
          <ListItem>JWT mit HttpOnly Cookies</ListItem>
          <ListItem>Rollenbasierte Zugriffskontrolle (RBAC)</ListItem>
          <ListItem>Sichere Session-Verwaltung</ListItem>
          <ListItem>Rate Limiting gegen Brute-Force-Angriffe</ListItem>
        </List>

        <SectionSubtitle>6.3 Datensicherheit</SectionSubtitle>
        <List>
          <ListItem>Input-Validierung gegen XSS und Injection</ListItem>
          <ListItem>Malware-Erkennung bei Datei-Uploads</ListItem>
          <ListItem>Whitelist-basierte CORS</ListItem>
          <ListItem>Security Headers (Helmet.js)</ListItem>
        </List>
      </Section>

      <Section>
        <SectionTitle>7. Hosting und Datenstandort</SectionTitle>
        <Text>
          App4KITAs wird auf Servern in Europa gehostet, um die DSGVO-Konformität zu gewährleisten:
        </Text>
        <List>
          <ListItem>Hosting: OVH VPS (Europa)</ListItem>
          <ListItem>Datenbank: PostgreSQL (Europa)</ListItem>
          <ListItem>Backup: Automatische Snapshots (Europa)</ListItem>
          <ListItem>Keine Datenübertragung außerhalb der EU</ListItem>
        </List>
      </Section>

      <Section>
        <SectionTitle>8. Kontakt und Beschwerden</SectionTitle>
        
        <SectionSubtitle>8.1 Datenschutzbeauftragter</SectionSubtitle>
        <ContactInfo>
          <ContactTitle>Datenschutzbeauftragter</ContactTitle>
          <ContactText>E-Mail: datenschutz@app4kitas.eu</ContactText>
          <ContactText>Telefon: [Kontaktnummer]</ContactText>
          <ContactText>Adresse: [Geschäftsadresse]</ContactText>
        </ContactInfo>

        <SectionSubtitle>8.2 Aufsichtsbehörde</SectionSubtitle>
        <Text>
          Sie haben das Recht, Beschwerden bei der zuständigen Aufsichtsbehörde einzulegen:
        </Text>
        <ContactInfo>
          <ContactTitle>Bundesbeauftragter für den Datenschutz und die Informationsfreiheit</ContactTitle>
          <ContactText>Adresse: Graurheindorfer Str. 153, 53117 Bonn</ContactText>
          <ContactText>E-Mail: poststelle@bfdi.bund.de</ContactText>
        </ContactInfo>
      </Section>

      <Section>
        <SectionTitle>9. Aktualisierungen</SectionTitle>
        <Text>
          Diese Datenschutzerklärung wird regelmäßig aktualisiert, um Änderungen in der 
          Datenverarbeitung oder rechtlichen Anforderungen zu berücksichtigen.
        </Text>
        <Text>
          <strong>Letzte Aktualisierung:</strong> {currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)} {currentYear}
        </Text>
      </Section>

      <ButtonGroup>
        <Button onClick={handleBackToDashboard}>
          Zurück zum Dashboard
        </Button>
        <Button onClick={handleContactDataProtection}>
          Datenschutz-Kontakt
        </Button>
        <Button onClick={handleExportData}>
          Meine Daten exportieren
        </Button>
      </ButtonGroup>
    </Container>
  );
};

export default Privacy; 