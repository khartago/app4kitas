import React, { useState } from 'react';
import styled from 'styled-components';
import Footer from '../components/Footer';
import AppLogo from '../components/ui/AppLogo';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${props => props.theme.colors.background} 0%, ${props => props.theme.colors.surface} 100%);
  padding: 0;
`;

const LogoWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 2rem auto;
  padding-top: 2.5rem;
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

const SearchContainer = styled.div`
  margin-bottom: 3.5rem;
  display: flex;
  justify-content: center;
`;

const SearchInput = styled.input`
  width: 100%;
  max-width: 540px;
  padding: 1.3rem 1.7rem;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 18px;
  font-size: 1.15rem;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  box-shadow: 0 4px 18px rgba(67,185,127,0.08);
  transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.colors.primary}22;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
    opacity: 0.8;
  }
`;

const CategorySection = styled.div`
  margin-bottom: 3.5rem;
  padding: 0 0 1.5rem 0;
  border-radius: 18px;
`;

const CategoryTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
`;

const FAQItem = styled.div`
  margin-bottom: 1.5rem;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 4px 18px rgba(67,185,127,0.07);
  transition: box-shadow 0.2s, border-color 0.2s;
  
  &:hover, &:focus-within {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 8px 32px rgba(67,185,127,0.13);
  }
`;

const FAQQuestion = styled.button`
  width: 100%;
  padding: 2rem 2.2rem;
  background: ${({ theme }) => theme.colors.surface};
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 1.15rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.2s;
  border-radius: 0;
  
  &:hover, &:focus {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const FAQAnswer = styled.div<{ isOpen: boolean }>`
  padding: ${({ isOpen }) => isOpen ? '1.7rem 2.2rem' : '0 2.2rem'};
  max-height: ${({ isOpen }) => isOpen ? '500px' : '0'};
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
  border-top: ${({ isOpen, theme }) => isOpen ? `1.5px solid ${theme.colors.border}` : 'none'};
  background: ${({ theme }) => theme.colors.background};
  
  p {
    margin: 0 0 1rem 0;
    line-height: 1.7;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 1.08rem;
  }
  
  ul {
    margin: 0 0 1rem 0;
    padding-left: 1.5rem;
  }
  
  li {
    margin-bottom: 0.5rem;
    line-height: 1.7;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 1.08rem;
  }
`;

const ChevronIcon = styled.span<{ isOpen: boolean }>`
  transform: rotate(${({ isOpen }) => isOpen ? '180deg' : '0deg'});
  transition: transform 0.2s ease;
  font-size: 1.2rem;
`;

const ContactSection = styled.div`
  margin-top: 4rem;
  padding: 2rem;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  text-align: center;
`;

const ContactTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.3rem;
  margin-bottom: 1rem;
`;

const ContactText = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const ContactEmail = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

interface FAQItem {
  id: string;
  question: string;
  answer: string | React.ReactNode;
}

const Help: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const faqData: { [key: string]: FAQItem[] } = {
    'Allgemein': [
      {
        id: 'was-ist-app4kitas',
        question: 'Was ist App4KITAs?',
        answer: 'App4KITAs ist eine DSGVO-konforme Kita-Management-Plattform für Kindertagesstätten, Eltern und Pädagog:innen. Sie unterstützt die digitale Verwaltung, Kommunikation und Dokumentation im Kita-Alltag.'
      },
      {
        id: 'welche-rollen-gibt-es',
        question: 'Welche Rollen gibt es in App4KITAs?',
        answer: 'Es gibt drei Rollen: Einrichtungsleitung, Pädagog:in und Elternteil. Jede Rolle hat eigene Zugriffsrechte und Funktionen.'
      },
      {
        id: 'wie-erreiche-ich-den-support',
        question: 'Wie erreiche ich den Support?',
        answer: 'Bei technischen oder rechtlichen Fragen wenden Sie sich bitte an support@app4kitas.de.'
      }
    ],
    'Anmeldung & Zugang': [
      {
        id: 'wie-registrieren',
        question: 'Wie registriere ich mich?',
        answer: 'Eltern können sich selbstständig in der App registrieren. Die Einrichtungsleitung weist Eltern ihren Kindern zu – entweder direkt bei der Kinderanlage oder nachträglich.'
      },
      {
        id: 'passwort-vergessen',
        question: 'Was tun bei vergessenem Passwort?',
        answer: 'Nutzen Sie die "Passwort vergessen"-Funktion auf der Login-Seite. Sie erhalten eine E-Mail zum Zurücksetzen.'
      },
      {
        id: 'konto-gesperrt',
        question: 'Mein Konto ist gesperrt – was tun?',
        answer: 'Nach mehreren Fehlversuchen wird das Konto vorübergehend gesperrt. Wenden Sie sich ggf. an die Einrichtungsleitung.'
      }
    ],
    'Datenschutz & Einwilligungen': [
      {
        id: 'datenschutz',
        question: 'Wie schützt App4KITAs meine Daten?',
        answer: 'Alle Daten werden verschlüsselt gespeichert und ausschließlich auf europäischen Servern verarbeitet. Zugriff besteht nur für berechtigte Nutzer:innen.'
      },
      {
        id: 'eltern-einwilligung',
        question: 'Wie funktioniert die Einwilligung der Eltern?',
        answer: 'Eltern können in der App Einwilligungen für Fotos, Ausflüge und weitere Zwecke digital erteilen oder widerrufen. Die Verwaltung erfolgt transparent und DSGVO-konform.'
      },
      {
        id: 'datenexport',
        question: 'Wie kann ich meine Daten exportieren?',
        answer: 'Im Bereich "Datenschutz" können Sie einen vollständigen Export Ihrer personenbezogenen Daten anfordern.'
      }
    ],
    'Check-in & Anwesenheit': [
      {
        id: 'checkin',
        question: 'Wie funktioniert das Ein- und Auschecken?',
        answer: 'Eltern checken ihre Kinder per QR-Code oder manuell ein/aus. Pädagog:innen können die Anwesenheit jederzeit einsehen und verwalten.'
      },
      {
        id: 'anwesenheitsprotokoll',
        question: 'Wer kann Anwesenheitsprotokolle sehen?',
        answer: 'Nur berechtigte Pädagog:innen und die Einrichtungsleitung haben Zugriff auf die Protokolle der eigenen Einrichtung.'
      }
    ],
    'Kommunikation & Benachrichtigungen': [
      {
        id: 'nachrichten',
        question: 'Wie funktioniert das Nachrichtensystem?',
        answer: 'Eltern und Pädagog:innen können sich direkt oder gruppenbasiert Nachrichten senden. Anhänge (Bilder, PDFs) sind möglich.'
      },
      {
        id: 'benachrichtigungen',
        question: 'Welche Benachrichtigungen erhalte ich?',
        answer: 'Sie erhalten Push- und E-Mail-Benachrichtigungen zu neuen Nachrichten, wichtigen Ereignissen und Terminen. Die Einstellungen können im Profil angepasst werden.'
      }
    ],
    'Administration': [
      {
        id: 'gruppen-und-kinder',
        question: 'Wie verwalte ich Gruppen und Kinder?',
        answer: 'Die Einrichtungsleitung kann Gruppen anlegen, Kinder zuweisen und Pädagog:innen verwalten. Änderungen werden protokolliert.'
      },
      {
        id: 'datenloeschung',
        question: 'Wie werden Daten gelöscht?',
        answer: 'Daten werden nach Ablauf der gesetzlichen Aufbewahrungsfristen automatisch gelöscht. Die Einrichtungsleitung kann zudem Löschanfragen initiieren.'
      }
    ]
  };

  const filteredData = Object.entries(faqData).reduce((acc, [category, items]) => {
    const filteredItems = items.filter(item =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof item.answer === 'string' && item.answer.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    if (filteredItems.length > 0) {
      acc[category] = filteredItems;
    }
    
    return acc;
  }, {} as { [key: string]: FAQItem[] });

  return (
    <Container>
      <HeroSection>
        <LogoHeroWrapper>
          <AppLogo size={64} />
        </LogoHeroWrapper>
        <HeroTitle>Hilfe & FAQ</HeroTitle>
        <HeroSubtitle>
          Finden Sie Antworten auf häufig gestellte Fragen und erhalten Sie Unterstützung bei der Nutzung von App4KITAs
        </HeroSubtitle>
      </HeroSection>
      <MainContent>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Suchen Sie nach Fragen oder Antworten..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>

        {Object.entries(filteredData).map(([category, items]) => (
          <CategorySection key={category}>
            <CategoryTitle>{category}</CategoryTitle>
            {items.map((item) => (
              <FAQItem key={item.id}>
                <FAQQuestion onClick={() => toggleItem(item.id)}>
                  {item.question}
                  <ChevronIcon isOpen={openItems.has(item.id)}>▼</ChevronIcon>
                </FAQQuestion>
                <FAQAnswer isOpen={openItems.has(item.id)}>
                  {typeof item.answer === 'string' ? (
                    <p>{item.answer}</p>
                  ) : (
                    item.answer
                  )}
                </FAQAnswer>
              </FAQItem>
            ))}
          </CategorySection>
        ))}

        {Object.keys(filteredData).length === 0 && searchTerm && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Keine Ergebnisse für "{searchTerm}" gefunden.</p>
            <p>Versuchen Sie andere Suchbegriffe oder kontaktieren Sie unseren Support.</p>
          </div>
        )}

        <ContactSection>
          <ContactTitle>Weitere Hilfe benötigt?</ContactTitle>
          <ContactText>
            Falls Sie hier keine Antwort auf Ihre Frage finden, stehen wir Ihnen gerne zur Verfügung.
          </ContactText>
          <ContactEmail href="mailto:support@app4kitas.de">
            support@app4kitas.de
          </ContactEmail>
        </ContactSection>
      </MainContent>
      <Footer />
    </Container>
  );
};

export default Help; 