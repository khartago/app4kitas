import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../styles/theme';
import MascotBear from '../components/ui/MascotBear';
import AppLogo from '../components/ui/AppLogo';

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
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

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)' 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)'};
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 120px;
  position: relative;
  overflow-x: hidden;
`;

const BackgroundShapes = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 1;
`;

const Shape = styled.div<{ top: string; left: string; size: string; delay: string }>`
  position: absolute;
  top: ${props => props.top};
  left: ${props => props.left};
  width: ${props => props.size};
  height: ${props => props.size};
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: ${float} 6s ease-in-out infinite;
  animation-delay: ${props => props.delay};
`;

const Card = styled.div`
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(15, 15, 35, 0.95)' 
    : 'rgba(255, 255, 255, 0.95)'};
  backdrop-filter: blur(20px);
  border-radius: 30px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
  padding: 50px;
  max-width: 1000px;
  width: 100%;
  position: relative;
  overflow: hidden;
  z-index: 2;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.1)'};
  
  @media (max-width: 768px) {
    padding: 40px 25px;
    margin: 0 10px;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 50px;
  position: relative;
  animation: ${fadeInUp} 1s ease-out;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.3rem;
  font-weight: 300;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const MascotContainer = styled.div`
  position: absolute;
  top: 30px;
  right: 30px;
  animation: ${float} 4s ease-in-out infinite;
  
  @media (max-width: 768px) {
    position: static;
    text-align: center;
    margin-bottom: 30px;
  }
`;

const Section = styled.div`
  margin-bottom: 50px;
  padding: 40px;
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(0, 0, 0, 0.02)'};
  border-radius: 25px;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.1)'};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 15px;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
  margin-bottom: 25px;
`;

const InfoCard = styled.div`
  padding: 25px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.1)'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  }
`;

const InfoTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 15px;
`;

const InfoText = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.7;
  margin-bottom: 10px;
  font-size: 1rem;
`;

const TechList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const TechItem = styled.li`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 8px;
  padding-left: 20px;
  position: relative;
  font-size: 1rem;
  
  &:before {
    content: "▸";
    position: absolute;
    left: 0;
    color: ${({ theme }) => theme.colors.primary};
    font-weight: bold;
    font-size: 1.2rem;
  }
`;

const Button = styled.button`
  padding: 15px 30px;
  border: none;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin: 15px;
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 40px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const Highlight = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
`;

const DeveloperInfo = styled.div`
  text-align: center;
  padding: 40px;
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(76, 175, 80, 0.1)' 
    : 'rgba(76, 175, 80, 0.05)'};
  border-radius: 25px;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(76, 175, 80, 0.3)' 
    : 'rgba(76, 175, 80, 0.2)'};
  margin-bottom: 40px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  }
`;

const DeveloperName = styled.h2`
  font-size: 2.5rem;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 15px;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const DeveloperRole = styled.p`
  font-size: 1.4rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 20px;
  font-weight: 500;
`;

const DeveloperContact = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.1rem;
  line-height: 1.6;
`;

const LinkedInLink = styled.a`
  color: #0077b5;
  text-decoration: none;
  margin-top: 15px;
  display: inline-block;
  font-weight: 600;
  padding: 10px 20px;
  background: rgba(0, 119, 181, 0.1);
  border-radius: 25px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 119, 181, 0.2);
    transform: translateY(-2px);
  }
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

// Sub-Components
const BackgroundShapesComponent: React.FC = () => (
  <BackgroundShapes>
    <Shape top="5%" left="5%" size="80px" delay="0s" />
    <Shape top="15%" left="85%" size="120px" delay="2s" />
    <Shape top="70%" left="10%" size="100px" delay="4s" />
    <Shape top="85%" left="80%" size="90px" delay="1s" />
  </BackgroundShapes>
);

const DeveloperSection: React.FC = () => (
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
);

const TechStackSection: React.FC = () => (
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
);

const CoreFeaturesSection: React.FC = () => (
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
);

const SpecialFeaturesSection: React.FC = () => (
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
);

// Main Component
const Credits: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleBackToLanding = () => {
    navigate('/');
  };

  return (
    <Container>
      <BackgroundShapesComponent />

      <Card>
        <Header>
          <Title>Entwicklung & Credits</Title>
          <Subtitle>App4KITAs - DSGVO-konforme Kita-Management-Plattform</Subtitle>
          <MascotContainer>
            <MascotBear size={80} />
          </MascotContainer>
        </Header>

        <DeveloperSection />

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

        <TechStackSection />
        <CoreFeaturesSection />

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

        <SpecialFeaturesSection />

        <Section>
          <SectionTitle>📄 Lizenz & Support</SectionTitle>
          <InfoCard>
            <InfoTitle>Professionelle Lösung</InfoTitle>
            <InfoText>
              App4KITAs ist eine professionelle, DSGVO-konforme Lösung 
              mit umfassendem Support und kontinuierlicher Weiterentwicklung.
            </InfoText>
            <InfoText>
              © 2025 App4KITAs - Made in Europe 🇪🇺
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
      </Card>
    </Container>
  );
};

export default Credits; 