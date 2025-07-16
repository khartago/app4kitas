import React from 'react';
import styled from 'styled-components';
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

const ProfileCard = styled.section`
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

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const Name = styled.h2`
  color: ${props => props.theme.colors.textPrimary};
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.01em;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Role = styled.div`
  color: ${props => props.theme.colors.primary};
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const Description = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0;
`;

const SkillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
`;

const SkillCard = styled.div`
  background: ${props => props.theme.colors.background};
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid ${props => props.theme.colors.border};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  }
`;

const SkillIcon = styled.div`
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

const SkillTitle = styled.h3`
  color: ${props => props.theme.colors.textPrimary};
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
`;

const SkillDescription = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
`;

const ProjectHighlights = styled.section`
  background: ${props => props.theme.colors.surface};
  border-radius: 24px;
  padding: 3rem;
  margin-bottom: 3rem;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.05);
  border: 1px solid ${props => props.theme.colors.border};
  
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
  text-align: center;
`;

const HighlightGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const HighlightCard = styled.div`
  text-align: center;
  padding: 2rem;
  background: ${props => props.theme.colors.background};
  border-radius: 16px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const HighlightIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.primaryDark});
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
  font-size: 2rem;
  color: white;
`;

const HighlightTitle = styled.h3`
  color: ${props => props.theme.colors.textPrimary};
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
`;

const HighlightDescription = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1rem;
  margin: 0;
  line-height: 1.5;
`;

const CommunitySection = styled.section`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}10, ${props => props.theme.colors.accent}10);
  border-radius: 24px;
  padding: 3rem;
  margin-bottom: 3rem;
  text-align: center;
  border: 1px solid ${props => props.theme.colors.primary}20;
  
  @media (max-width: 768px) {
    padding: 2rem;
    border-radius: 16px;
  }
`;

const CommunityTitle = styled.h2`
  color: ${props => props.theme.colors.primary};
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
`;

const CommunityText = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1.1rem;
  margin: 0;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
`;

const ContactSection = styled.div`
  text-align: center;
  margin-top: 2rem;
`;

const LinkedInButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.primaryDark});
  color: white;
  text-decoration: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(67, 185, 127, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(67, 185, 127, 0.4);
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

const Credits: React.FC = () => {
  const skills = [
    {
      icon: '💻',
      title: 'Full-Stack Development',
      description: 'React, Node.js, PostgreSQL, Flutter - komplette technische Umsetzung'
    },
    {
      icon: '🎨',
      title: 'UI/UX Design',
      description: 'Moderne, benutzerfreundliche Interfaces und Design-Systeme'
    },
    {
      icon: '🔒',
      title: 'Datenschutz & DSGVO',
      description: 'Rechtskonforme Implementierung und Compliance-Management'
    },
    {
      icon: '🚀',
      title: 'Produktmanagement',
      description: 'Von der Idee bis zur produktiven Anwendung'
    }
  ];

  const highlights = [
    {
      icon: '🏢',
      title: 'Multi-Institutionen',
      description: 'Skalierbare Architektur für mehrere Kitas'
    },
    {
      icon: '📱',
      title: 'Cross-Platform',
      description: 'Web-Dashboard und mobile Flutter-App'
    },
    {
      icon: '🛡️',
      title: 'DSGVO-konform',
      description: 'Vollständige Compliance und Datenschutz'
    }
  ];

  return (
    <Container>
      <HeroSection>
        <LogoHeroWrapper>
          <AppLogo size={64} />
        </LogoHeroWrapper>
        <HeroTitle>Credits</HeroTitle>
        <HeroSubtitle>
          Die Menschen und Technologien hinter App4KITAs
        </HeroSubtitle>
      </HeroSection>

      <MainContent>
        <ProfileCard>
          <ProfileHeader>
            <ProfileInfo>
              <Name>Rayane Bouzir</Name>
              <Role>Gründer & Lead Developer</Role>
              <Description>
                App4KITAs wurde als Komplettlösung für moderne, datenschutzkonforme und benutzerfreundliche Kita-Organisation entwickelt. Alle Aspekte - von der Konzeption über das Design bis zur technischen Implementierung - stammen aus einer Hand.
              </Description>
            </ProfileInfo>
          </ProfileHeader>

          <SkillsGrid>
            {skills.map((skill, index) => (
              <SkillCard key={index}>
                <SkillIcon>{skill.icon}</SkillIcon>
                <SkillTitle>{skill.title}</SkillTitle>
                <SkillDescription>{skill.description}</SkillDescription>
              </SkillCard>
            ))}
          </SkillsGrid>

          <ContactSection>
            <LinkedInButton 
              href="https://www.linkedin.com/in/rayane-bouzir-594a09274/" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <span>🔗</span>
              LinkedIn-Profil ansehen
            </LinkedInButton>
          </ContactSection>
        </ProfileCard>

        <ProjectHighlights>
          <SectionTitle>Projekt-Highlights</SectionTitle>
          <HighlightGrid>
            {highlights.map((highlight, index) => (
              <HighlightCard key={index}>
                <HighlightIcon>{highlight.icon}</HighlightIcon>
                <HighlightTitle>{highlight.title}</HighlightTitle>
                <HighlightDescription>{highlight.description}</HighlightDescription>
              </HighlightCard>
            ))}
          </HighlightGrid>
        </ProjectHighlights>

        <CommunitySection>
          <CommunityTitle>Dank an die Community</CommunityTitle>
          <CommunityText>
            Besonderer Dank an alle Kitas, Eltern und Pädagog:innen, die mit ihrem wertvollen Feedback und Praxistests zur kontinuierlichen Weiterentwicklung von App4KITAs beitragen. Ihre Erfahrungen und Anregungen machen die Plattform jeden Tag besser.
          </CommunityText>
        </CommunitySection>
      </MainContent>

      <Footer />
    </Container>
  );
};

export default Credits; 