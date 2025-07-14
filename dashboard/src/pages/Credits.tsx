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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  @media (min-width: 769px) and (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const InfoCard = styled.div`
  padding: 1.5rem;
  background: ${props => props.theme.colors.background};
  border-radius: 6px;
  border: 1px solid ${props => props.theme.colors.border};
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const InfoTitle = styled.h3`
  font-size: clamp(1rem, 3vw, 1.2rem);
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
  margin-bottom: 1rem;
`;

const InfoText = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.6;
  margin-bottom: 0.75rem;
  font-size: clamp(0.85rem, 2.5vw, 0.95rem);
`;

const TechList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const TechItem = styled.li`
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 0.5rem;
  padding-left: 1rem;
  position: relative;
  font-size: clamp(0.8rem, 2.5vw, 0.9rem);
  
  &:before {
    content: "▸";
    position: absolute;
    left: 0;
    color: ${props => props.theme.colors.primary};
    font-weight: bold;
  }
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
  font-weight: 500;
  font-size: clamp(0.85rem, 2.5vw, 0.95rem);
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

const DeveloperInfo = styled.div`
  text-align: center;
  padding: 2rem;
  background: ${props => props.theme.colors.primary}10;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.primary}30;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const DeveloperName = styled.h2`
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 0.75rem;
`;

const DeveloperRole = styled.p`
  font-size: clamp(1rem, 3vw, 1.1rem);
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 1rem;
  font-weight: 500;
`;

const DeveloperContact = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  line-height: 1.6;
`;

const LinkedInLink = styled.a`
  color: #0077b5;
  text-decoration: none;
  margin-top: 1rem;
  display: inline-block;
  font-weight: 500;
  padding: 0.5rem 1rem;
  background: rgba(0, 119, 181, 0.1);
  border-radius: 6px;
  transition: all 0.2s ease;
  font-size: clamp(0.85rem, 2.5vw, 0.9rem);
  
  &:hover {
    background: rgba(0, 119, 181, 0.2);
    transform: translateY(-1px);
  }
`;

const Highlight = styled.span`
  color: ${props => props.theme.colors.primary};
  font-weight: 600;
`;

// Component Data
const techStackData = {
  frontend: [
    'React 18 mit TypeScript',
    'Styled Components',
    'React Router v6',
    'Responsive Design',
    'Dark Mode Support',
    'Moderne UI/UX'
  ],
  backend: [
    'Node.js mit Express',
    'PostgreSQL Datenbank',
    'Prisma ORM',
    'JWT Authentifizierung',
    'Multer File Upload',
    'RESTful API Design'
  ],
  mobile: [
    'Flutter Framework',
    'Cross-Platform',
    'Offline-Funktionalität',
    'Push Notifications',
    'QR-Code Scanning',
    'Local Storage Sync'
  ],
  infrastructure: [
    'OVH VPS Hosting',
    'Europa-gehostet',
    'DSGVO-konform',
    'TLS Verschlüsselung',
    'Automatische Backups',
    'Skalierbare Architektur'
  ]
};

const coreFeaturesData = [
  {
    title: 'Multi-Rollen-System',
    description: 'Vollständige Rollenverwaltung für Super Admins, Admins, Erzieher und Eltern mit angepassten Dashboards und Berechtigungen.'
  },
  {
    title: 'Check-in/out System',
    description: 'QR-Code-basierte Anwesenheitskontrolle mit manueller Alternative, Echtzeit-Updates und umfassender Historie.'
  },
  {
    title: 'Kommunikation',
    description: 'Integriertes Chat-System mit Dateianhängen, Direktnachrichten, Gruppen-Chats und Push-Benachrichtigungen.'
  },
  {
    title: 'Berichte & Export',
    description: 'Umfassende Berichtsfunktionen mit CSV/PDF-Export, Statistiken und Analysen für alle Rollen.'
  }
];

const specialFeaturesData = [
  {
    title: 'Moderne UI/UX',
    description: 'Design-System mit Maskottchen, Dark Mode, responsive Layouts und barrierefreie Benutzeroberfläche.'
  },
  {
    title: 'Offline-Funktionalität',
    description: 'Mobile App funktioniert auch ohne Internetverbindung mit automatischer Synchronisation.'
  },
  {
    title: 'Skalierbarkeit',
    description: 'Architektur unterstützt mehrere Institutionen und wachsende Benutzerzahlen.'
  },
  {
    title: 'Wartbarkeit',
    description: 'Sauberer Code, TypeScript, modulare Architektur und umfassende Tests.'
  }
];

const Credits: React.FC = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleBackToLanding = () => {
    navigate('/');
  };

  return (
    <Container>
      <Header>
        <Title>Entwicklung & Credits</Title>
        <Subtitle>App4KITAs - DSGVO-konforme Kita-Management-Plattform</Subtitle>
      </Header>

      <DeveloperInfo>
        <DeveloperName>Rayane Bouzir</DeveloperName>
        <DeveloperRole>Full-Stack Developer</DeveloperRole>
        <DeveloperContact>
          Spezialisiert auf moderne Web-Technologien, DSGVO-konforme Lösungen und 
          skalierbare Systemarchitekturen für Bildungsplattformen.
          <br />
          <LinkedInLink 
            href="https://www.linkedin.com/in/rayane-bouzir-594a09274/" 
            target="_blank" 
            rel="noopener noreferrer">
            LinkedIn Profile
          </LinkedInLink>
        </DeveloperContact>
      </DeveloperInfo>

      <Section>
        <SectionTitle>👨‍💻 Projektleitung & Entwicklung</SectionTitle>
        <InfoCard>
          <InfoTitle>Konzept & Umsetzung</InfoTitle>
          <InfoText>
            <Highlight>App4KITAs</Highlight> wurde von Grund auf konzipiert und entwickelt, 
            um eine moderne, sichere und benutzerfreundliche Lösung für Kindertagesstätten zu schaffen.
          </InfoText>
          <InfoText>
            Das Projekt entstand aus der Notwendigkeit, eine vollständig digitale, 
            DSGVO-konforme Plattform zu entwickeln, die sowohl die administrativen 
            als auch die pädagogischen Anforderungen moderner Kitas erfüllt.
          </InfoText>
        </InfoCard>
      </Section>

      <Section>
        <SectionTitle>🛠️ Technologie-Stack</SectionTitle>
        <Grid>
          <InfoCard>
            <InfoTitle>Frontend</InfoTitle>
            <TechList>
              {techStackData.frontend.map((tech, index) => (
                <TechItem key={index}>{tech}</TechItem>
              ))}
            </TechList>
          </InfoCard>
          
          <InfoCard>
            <InfoTitle>Backend</InfoTitle>
            <TechList>
              {techStackData.backend.map((tech, index) => (
                <TechItem key={index}>{tech}</TechItem>
              ))}
            </TechList>
          </InfoCard>
          
          <InfoCard>
            <InfoTitle>Mobile App</InfoTitle>
            <TechList>
              {techStackData.mobile.map((tech, index) => (
                <TechItem key={index}>{tech}</TechItem>
              ))}
            </TechList>
          </InfoCard>
          
          <InfoCard>
            <InfoTitle>Infrastruktur</InfoTitle>
            <TechList>
              {techStackData.infrastructure.map((tech, index) => (
                <TechItem key={index}>{tech}</TechItem>
              ))}
            </TechList>
          </InfoCard>
        </Grid>
      </Section>

      <Section>
        <SectionTitle>🎯 Kernfunktionen</SectionTitle>
        <Grid>
          {coreFeaturesData.map((feature, index) => (
            <InfoCard key={index}>
              <InfoTitle>{feature.title}</InfoTitle>
              <InfoText>{feature.description}</InfoText>
            </InfoCard>
          ))}
        </Grid>
      </Section>

      <Section>
        <SectionTitle>🔒 Sicherheit & Compliance</SectionTitle>
        <InfoCard>
          <InfoTitle>DSGVO-Konformität</InfoTitle>
          <InfoText>
            Vollständige Einhaltung der europäischen Datenschutzrichtlinien mit 
            Datenminimierung, Recht auf Löschung und Transparenz.
          </InfoText>
          <InfoText>
            Alle Daten werden in Europa gehostet und verschlüsselt übertragen.
          </InfoText>
        </InfoCard>
      </Section>

      <Section>
        <SectionTitle>📚 Dokumentation</SectionTitle>
        <InfoCard>
          <InfoTitle>Umfassende Dokumentation</InfoTitle>
          <InfoText>
            Vollständige API-Dokumentation, Benutzerhandbücher, 
            Entwickler-Dokumentation und Deployment-Anleitungen.
          </InfoText>
          <InfoText>
            Alle Komponenten sind dokumentiert und folgen bewährten Praktiken.
          </InfoText>
        </InfoCard>
      </Section>

      <Section>
        <SectionTitle>🌟 Besondere Features</SectionTitle>
        <Grid>
          {specialFeaturesData.map((feature, index) => (
            <InfoCard key={index}>
              <InfoTitle>{feature.title}</InfoTitle>
              <InfoText>{feature.description}</InfoText>
            </InfoCard>
          ))}
        </Grid>
      </Section>

      <Section>
        <SectionTitle>📄 Lizenz & Support</SectionTitle>
        <InfoCard>
          <InfoTitle>Professionelle Lösung</InfoTitle>
          <InfoText>
            App4KITAs ist eine professionelle, DSGVO-konforme Lösung 
            mit umfassendem Support und kontinuierlicher Weiterentwicklung.
          </InfoText>
          <InfoText>
            © {currentYear} App4KITAs - Made in Europe 🇪🇺
          </InfoText>
        </InfoCard>
      </Section>

      <ButtonGroup>
        <Button onClick={handleBackToDashboard}>
          Zum Dashboard
        </Button>
        <Button onClick={handleBackToLanding}>
          Zur Startseite
        </Button>
      </ButtonGroup>
    </Container>
  );
};

export default Credits; 