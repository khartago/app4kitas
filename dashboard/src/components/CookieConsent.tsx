import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const CookieBanner = styled.div<{ isVisible: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: 1rem;
  z-index: 1000;
  transform: translateY(${props => props.isVisible ? '0' : '100%'});
  transition: transform 0.3s ease-in-out;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
`;

const CookieContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

const CookieText = styled.div`
  flex: 1;
  min-width: 300px;
`;

const CookieTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
`;

const CookieDescription = styled.p`
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
  opacity: 0.9;
`;

const CookieButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
`;

const CookieButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: ${props.theme.colors.accent};
          color: white;
          &:hover {
            background: ${props.theme.colors.accentHover};
          }
        `;
      case 'secondary':
        return `
          background: transparent;
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          &:hover {
            background: rgba(255, 255, 255, 0.1);
          }
        `;
      case 'danger':
        return `
          background: #dc3545;
          color: white;
          &:hover {
            background: #c82333;
          }
        `;
      default:
        return `
          background: rgba(255, 255, 255, 0.2);
          color: white;
          &:hover {
            background: rgba(255, 255, 255, 0.3);
          }
        `;
    }
  }}
`;

const CookieSettings = styled.div<{ isOpen: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  color: ${props => props.theme.colors.text};
  padding: 2rem;
  z-index: 1001;
  transform: translateY(${props => props.isOpen ? '0' : '100%'});
  transition: transform 0.3s ease-in-out;
  box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.2);
  max-height: 80vh;
  overflow-y: auto;
`;

const SettingsContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const SettingsTitle = styled.h2`
  margin: 0 0 1rem 0;
  color: ${props => props.theme.colors.primary};
`;

const SettingsSection = styled.div`
  margin-bottom: 2rem;
`;

const SettingsSectionTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
`;

const SettingsDescription = styled.p`
  margin: 0 0 1rem 0;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
  line-height: 1.5;
`;

const CookieToggle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: ${props => props.theme.colors.background};
  border-radius: 8px;
  margin-bottom: 0.5rem;
`;

const ToggleLabel = styled.div`
  flex: 1;
`;

const ToggleTitle = styled.div`
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const ToggleDescription = styled.div`
  font-size: 0.85rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + span {
    background: ${props => props.theme.colors.accent};
  }
  
  &:checked + span:before {
    transform: translateX(26px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #ccc;
  transition: 0.3s;
  border-radius: 24px;
  
  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background: white;
    transition: 0.3s;
    border-radius: 50%;
  }
`;

interface CookieConsentProps {
  onConsentChange?: (consent: CookieConsentData) => void;
}

export interface CookieConsentData {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  timestamp: number;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ onConsentChange }) => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState<CookieConsentData>({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
    preferences: false,
    timestamp: Date.now()
  });

  useEffect(() => {
    // Check if user has already given consent
    const savedConsent = localStorage.getItem('cookieConsent');
    if (!savedConsent) {
      setShowBanner(true);
    } else {
      try {
        const parsedConsent = JSON.parse(savedConsent);
        setConsent(parsedConsent);
      } catch (error) {
        console.error('Error parsing saved cookie consent:', error);
        setShowBanner(true);
      }
    }
  }, []);

  const saveConsent = (newConsent: CookieConsentData) => {
    const consentData = {
      ...newConsent,
      timestamp: Date.now()
    };
    
    localStorage.setItem('cookieConsent', JSON.stringify(consentData));
    setConsent(consentData);
    setShowBanner(false);
    setShowSettings(false);
    
    if (onConsentChange) {
      onConsentChange(consentData);
    }
  };

  const handleAcceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
      timestamp: Date.now()
    });
  };

  const handleRejectAll = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
      timestamp: Date.now()
    });
  };

  const handleSaveSettings = () => {
    saveConsent(consent);
  };

  const updateConsent = (type: keyof CookieConsentData, value: boolean) => {
    setConsent(prev => ({
      ...prev,
      [type]: value
    }));
  };

  if (!showBanner && !showSettings) {
    return null;
  }

  return (
    <>
      {/* Cookie Banner */}
      <CookieBanner isVisible={showBanner}>
        <CookieContent>
          <CookieText>
            <CookieTitle>🍪 Cookie-Einstellungen</CookieTitle>
            <CookieDescription>
              Wir verwenden Cookies, um Ihre Erfahrung auf unserer Website zu verbessern. 
              Einige Cookies sind für die Funktionalität der Website erforderlich, während andere 
              uns helfen, die Website zu verbessern und Ihnen personalisierte Inhalte anzuzeigen.
            </CookieDescription>
          </CookieText>
          <CookieButtons>
            <CookieButton variant="secondary" onClick={() => setShowSettings(true)}>
              Einstellungen
            </CookieButton>
            <CookieButton variant="secondary" onClick={handleRejectAll}>
              Ablehnen
            </CookieButton>
            <CookieButton variant="primary" onClick={handleAcceptAll}>
              Alle akzeptieren
            </CookieButton>
          </CookieButtons>
        </CookieContent>
      </CookieBanner>

      {/* Cookie Settings Modal */}
      <CookieSettings isOpen={showSettings}>
        <SettingsContent>
          <SettingsTitle>Cookie-Einstellungen</SettingsTitle>
          
          <SettingsSection>
            <SettingsDescription>
              Sie können Ihre Cookie-Einstellungen jederzeit anpassen. 
              Notwendige Cookies können nicht deaktiviert werden, da sie für die 
              Grundfunktionen der Website erforderlich sind.
            </SettingsDescription>
          </SettingsSection>

          <SettingsSection>
            <SettingsSectionTitle>Notwendige Cookies</SettingsSectionTitle>
            <SettingsDescription>
              Diese Cookies sind für die Grundfunktionen der Website erforderlich und können nicht deaktiviert werden.
            </SettingsDescription>
            <CookieToggle>
              <ToggleLabel>
                <ToggleTitle>Notwendige Cookies</ToggleTitle>
                <ToggleDescription>
                  Authentifizierung, Sicherheit, Grundfunktionen
                </ToggleDescription>
              </ToggleLabel>
              <ToggleSwitch>
                <ToggleInput
                  type="checkbox"
                  checked={consent.necessary}
                  disabled
                />
                <ToggleSlider />
              </ToggleSwitch>
            </CookieToggle>
          </SettingsSection>

          <SettingsSection>
            <SettingsSectionTitle>Analyse-Cookies</SettingsSectionTitle>
            <SettingsDescription>
              Diese Cookies helfen uns zu verstehen, wie Besucher mit der Website interagieren.
            </SettingsDescription>
            <CookieToggle>
              <ToggleLabel>
                <ToggleTitle>Analytics Cookies</ToggleTitle>
                <ToggleDescription>
                  Website-Nutzung, Performance-Metriken
                </ToggleDescription>
              </ToggleLabel>
              <ToggleSwitch>
                <ToggleInput
                  type="checkbox"
                  checked={consent.analytics}
                  onChange={(e) => updateConsent('analytics', e.target.checked)}
                />
                <ToggleSlider />
              </ToggleSwitch>
            </CookieToggle>
          </SettingsSection>

          <SettingsSection>
            <SettingsSectionTitle>Marketing-Cookies</SettingsSectionTitle>
            <SettingsDescription>
              Diese Cookies werden verwendet, um Ihnen relevante Werbung und Marketing-Inhalte anzuzeigen.
            </SettingsDescription>
            <CookieToggle>
              <ToggleLabel>
                <ToggleTitle>Marketing Cookies</ToggleTitle>
                <ToggleDescription>
                  Personalisierte Werbung, Marketing-Kampagnen
                </ToggleDescription>
              </ToggleLabel>
              <ToggleSwitch>
                <ToggleInput
                  type="checkbox"
                  checked={consent.marketing}
                  onChange={(e) => updateConsent('marketing', e.target.checked)}
                />
                <ToggleSlider />
              </ToggleSwitch>
            </CookieToggle>
          </SettingsSection>

          <SettingsSection>
            <SettingsSectionTitle>Präferenz-Cookies</SettingsSectionTitle>
            <SettingsDescription>
              Diese Cookies ermöglichen es der Website, sich an Ihre Auswahl zu erinnern.
            </SettingsDescription>
            <CookieToggle>
              <ToggleLabel>
                <ToggleTitle>Präferenz Cookies</ToggleTitle>
                <ToggleDescription>
                  Sprache, Region, Benutzereinstellungen
                </ToggleDescription>
              </ToggleLabel>
              <ToggleSwitch>
                <ToggleInput
                  type="checkbox"
                  checked={consent.preferences}
                  onChange={(e) => updateConsent('preferences', e.target.checked)}
                />
                <ToggleSlider />
              </ToggleSwitch>
            </CookieToggle>
          </SettingsSection>

          <CookieButtons>
            <CookieButton variant="secondary" onClick={() => setShowSettings(false)}>
              Abbrechen
            </CookieButton>
            <CookieButton variant="primary" onClick={handleSaveSettings}>
              Einstellungen speichern
            </CookieButton>
          </CookieButtons>
        </SettingsContent>
      </CookieSettings>
    </>
  );
};

export default CookieConsent; 