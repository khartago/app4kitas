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

const ComplianceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
`;

const ComplianceCard = styled.div`
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

const ComplianceIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.primaryDark});
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  font-size: 2rem;
  color: white;
`;

const ComplianceTitle = styled.h3`
  color: ${props => props.theme.colors.textPrimary};
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
`;

const ComplianceDescription = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1rem;
  margin: 0;
  line-height: 1.5;
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

const Compliance: React.FC = () => {
  return (
    <Container>
      <HeroSection>
        <LogoHeroWrapper>
          <AppLogo size={64} />
        </LogoHeroWrapper>
        <HeroTitle>Compliance & DSGVO</HeroTitle>
        <HeroSubtitle>
          Informationen zur Datenschutz- und Compliance-Umsetzung in App4KITAs
        </HeroSubtitle>
      </HeroSection>
      <MainContent>
        <Section>
          <SectionTitle>Verarbeitung personenbezogener Daten</SectionTitle>
          <Text>
            App4KITAs verarbeitet ausschließlich die für den Kita-Betrieb erforderlichen personenbezogenen Daten (Kinder, Eltern, Pädagog:innen, Anwesenheit, Nachrichten, Einwilligungen). Die Verarbeitung erfolgt ausschließlich auf Servern in Europa.
          </Text>
        </Section>
        <Section>
          <SectionTitle>Einwilligungen & Elternrechte</SectionTitle>
          <Text>
            Eltern können Einwilligungen für Fotos, Ausflüge und weitere Zwecke digital erteilen oder widerrufen. Alle Einwilligungen werden revisionssicher dokumentiert und können jederzeit eingesehen werden.
          </Text>
        </Section>
        <Section>
          <SectionTitle>Aufbewahrungsfristen & Löschung</SectionTitle>
          <Text>
            Personenbezogene Daten werden nach Ablauf der gesetzlichen Aufbewahrungsfristen automatisch gelöscht. Die Einrichtungsleitung kann Löschanfragen für Kinder- und Elternprofile initiieren. Alle Löschvorgänge werden protokolliert.
          </Text>
        </Section>
        <Section>
          <SectionTitle>Datenexport & Auskunft</SectionTitle>
          <Text>
            Jede:r Nutzer:in kann einen vollständigen Export der eigenen personenbezogenen Daten anfordern. Die Daten werden verschlüsselt bereitgestellt und können im Bereich "Datenschutz" heruntergeladen werden.
          </Text>
        </Section>
        <Section>
          <SectionTitle>Audit-Log & Nachvollziehbarkeit</SectionTitle>
          <Text>
            Alle relevanten Aktionen (z.B. Einwilligungen, Löschungen, Änderungen an Kinder-/Elternprofilen) werden revisionssicher im Audit-Log gespeichert und sind für die Einrichtungsleitung einsehbar.
          </Text>
        </Section>
        <Section>
          <SectionTitle>Ansprechpartner für Datenschutz</SectionTitle>
          <Text>
            Bei Fragen zum Datenschutz oder zur Compliance wenden Sie sich bitte an:
          </Text>
          <ContactInfo>
            <ContactTitle>Datenschutz & Compliance</ContactTitle>
            <ContactText>E-Mail: support@app4kitas.de</ContactText>
          </ContactInfo>
        </Section>
      </MainContent>
      <Footer />
    </Container>
  );
};

export default Compliance; 