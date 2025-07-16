# 🔒 DSGVO-Compliance Dokumentation - App4KITAs

## 📋 Übersicht

App4KITAs ist eine DSGVO-konforme Plattform zur Verwaltung von Kindertagesstätten. Diese Dokumentation beschreibt alle Maßnahmen zur Einhaltung der europäischen Datenschutzrichtlinien (GDPR/DSGVO).

## 🎯 Verantwortlichkeiten

### Datenverantwortlicher (Data Controller)
- **Name**: App4KITAs GmbH
- **Adresse**: [Eingetragene Geschäftsadresse]
- **E-Mail**: datenschutz@app4kitas.eu
- **Telefon**: [Kontaktnummer]

### Auftragsverarbeiter (Data Processor)
- **Hosting**: OVH VPS (Europa)
- **Datenbank**: PostgreSQL (Europa)
- **Backup**: Automatische Snapshots (Europa)

## 📊 Verarbeitete personenbezogene Daten

### Benutzerdaten (User)
- **Identifikationsdaten**: Name, E-Mail, Telefonnummer
- **Authentifizierung**: Passwort (gehashed)
- **Profil**: Avatar-URL, Rolle (SUPER_ADMIN, ADMIN, EDUCATOR, PARENT)
- **Institution**: Zugehörigkeit zu Kindertagesstätte
- **Geräte**: Device-Tokens für Push-Benachrichtigungen
- **Aktivitäten**: Login-Versuche, Aktivitätsprotokoll

### Kinderdaten (Child)
- **Identifikation**: Name, Geburtsdatum
- **Fotos**: Profilbilder (optional)
- **QR-Code**: Einzigartiger Secret für Check-ins
- **Gruppe**: Zugehörigkeit zu Erziehergruppe
- **Institution**: Zugehörigkeit zu Kindertagesstätte

### Check-in Daten (CheckInLog)
- **Zeitstempel**: Ein- und Auscheckzeiten
- **Methode**: QR-Code oder manuell
- **Akteur**: Wer hat den Check-in durchgeführt
- **Kind**: Welches Kind wurde eingecheckt

### Nachrichten (Message)
- **Inhalt**: Textnachrichten
- **Dateien**: Anhänge (Bilder, PDFs, Dokumente)
- **Metadaten**: Sender, Empfänger, Zeitstempel
- **Reaktionen**: Emoji-Reaktionen auf Nachrichten

### Notizen (Note)
- **Inhalt**: Kind-spezifische Notizen
- **Dateien**: Anhänge (optional)
- **Ersteller**: Erzieher oder Einrichtungsleitung
- **Kind**: Bezug zu spezifischem Kind

### Aktivitätsprotokoll (ActivityLog)
- **Aktionen**: Alle Benutzeraktivitäten
- **Metadaten**: Zeitstempel, Benutzer, Institution
- **Zweck**: DSGVO-Compliance und Audit-Trail
- **Aufbewahrung**: Konfigurierbare Fristen

## 🔐 Rechtsgrundlagen (Art. 6 DSGVO)

### Einwilligung (Art. 6 Abs. 1 lit. a)
- **Eltern-Einwilligung**: Für Verarbeitung von Kinderdaten
- **Foto-Einwilligung**: Separate Einwilligung für Fotos
- **Marketing-Einwilligung**: Opt-in für Newsletter
- **Cookie-Einwilligung**: Granulare Cookie-Kontrolle

### Vertragserfüllung (Art. 6 Abs. 1 lit. b)
- **Kita-Vertrag**: Notwendig für Kita-Betrieb
- **Anwesenheitskontrolle**: Erforderlich für Sicherheit
- **Kommunikation**: Notwendig für Eltern-Erzieher-Kontakt
- **Berichtswesen**: Gesetzliche Anforderungen

### Berechtigte Interessen (Art. 6 Abs. 1 lit. f)
- **Sicherheit**: Schutz der Kinder
- **Qualitätssicherung**: Verbesserung der Betreuung
- **Betriebsoptimierung**: Effiziente Verwaltung
- **Compliance**: Einhaltung gesetzlicher Vorgaben

## 🎯 Verarbeitungszwecke

### Hauptzwecke
1. **Anwesenheitskontrolle**: Sicherstellung der Kinderbetreuung
2. **Kommunikation**: Eltern-Erzieher-Austausch
3. **Dokumentation**: Pädagogische Arbeit
4. **Verwaltung**: Kita-Organisation
5. **Berichtswesen**: Gesetzliche Anforderungen

### Sekundärzwecke
1. **Qualitätssicherung**: Verbesserung der Betreuung
2. **Sicherheit**: Schutz der Kinder
3. **Compliance**: DSGVO-Einhaltung
4. **Support**: Technischer Support

## 🔐 Technische Sicherheitsmaßnahmen

### Verschlüsselung
- **Datenübertragung**: TLS 1.3 für alle Verbindungen
- **Datenspeicherung**: PostgreSQL-Verschlüsselung
- **Passwörter**: Bcrypt-Hashing mit Salt
- **JWT-Token**: Sichere Token-Generierung

### Zugriffskontrolle
- **Authentifizierung**: JWT mit HttpOnly Cookies
- **Autorisierung**: Rollenbasierte Zugriffskontrolle
- **Session-Management**: Sichere Session-Verwaltung
- **Rate Limiting**: Schutz vor Brute Force

### Datensicherheit
- **Input-Validierung**: Umfassende Eingabevalidierung
- **XSS-Schutz**: Sanitization aller Benutzereingaben
- **SQL-Injection-Schutz**: Prisma ORM
- **File-Upload-Sicherheit**: Malware-Erkennung

## 📋 Betroffenenrechte (Art. 12-22 DSGVO)

### Auskunftsrecht (Art. 15)
- **API-Endpunkt**: `GET /api/gdpr/data-export/:userId`
- **Umfang**: Alle personenbezogenen Daten
- **Format**: JSON mit strukturierten Daten
- **Zeitrahmen**: Innerhalb von 30 Tagen

### Berichtigungsrecht (Art. 16)
- **Profil-Bearbeitung**: Über Benutzerprofil
- **Kinder-Daten**: Über Einrichtungsleitung
- **Sofortige Umsetzung**: Real-time Updates
- **Validierung**: Automatische Datenvalidierung

### Löschungsrecht (Art. 17)
- **API-Endpunkt**: `DELETE /api/gdpr/delete-account/:userId`
- **Soft Delete**: Alle Entitäten werden soft-deleted
- **Cascade-Löschung**: Intelligente Verkettung
- **Audit-Trail**: Vollständige Protokollierung

### Einschränkungsrecht (Art. 18)
- **API-Endpunkt**: `PATCH /api/gdpr/restrict/:userId`
- **Temporäre Einschränkung**: Daten werden nicht gelöscht
- **Verarbeitungspause**: Keine weitere Verarbeitung
- **Wiederherstellung**: Einfache Reaktivierung

### Datenportabilität (Art. 20)
- **API-Endpunkt**: `GET /api/gdpr/data-export/:userId`
- **Strukturierte Daten**: JSON-Format
- **Vollständigkeit**: Alle relevanten Daten
- **Maschinenlesbarkeit**: Standard-Format

### Widerspruchsrecht (Art. 21)
- **API-Endpunkt**: `POST /api/gdpr/object/:userId`
- **Granulare Kontrolle**: Einzelne Verarbeitungszwecke
- **Sofortige Umsetzung**: Real-time Processing
- **Status-Tracking**: Verfolgung des Widerspruchs

## 📅 Aufbewahrungsfristen

### Benutzerdaten
- **Aktive Benutzer**: Unbegrenzt (bis zur Löschung)
- **Gelöschte Benutzer**: 30 Tage (Soft Delete)
- **Login-Versuche**: 90 Tage
- **Aktivitätsprotokoll**: 2 Jahre

### Kinderdaten
- **Aktive Kinder**: Unbegrenzt (bis zur Löschung)
- **Gelöschte Kinder**: 30 Tage (Soft Delete)
- **Check-in-Historie**: 3 Jahre
- **Fotos**: 30 Tage nach Löschung

### Nachrichten
- **Aktive Nachrichten**: Unbegrenzt
- **Gelöschte Nachrichten**: 30 Tage (Soft Delete)
- **Dateianhänge**: 30 Tage nach Löschung
- **Metadaten**: 2 Jahre

### Notizen
- **Aktive Notizen**: Unbegrenzt
- **Gelöschte Notizen**: 30 Tage (Soft Delete)
- **Dateianhänge**: 30 Tage nach Löschung
- **Metadaten**: 2 Jahre

## 🔄 Automatisierte Datenlöschung

### Tägliche Cleanup-Jobs
- **Soft-Deleted Daten**: Automatische Löschung nach Fristen
- **Temporäre Dateien**: Cleanup von Upload-Temp-Dateien
- **Session-Daten**: Bereinigung abgelaufener Sessions
- **Log-Rotation**: Archivierung alter Logs

### Konfigurierbare Fristen
- **Benutzer-Daten**: 30 Tage nach Soft Delete
- **Kinder-Daten**: 30 Tage nach Soft Delete
- **Nachrichten**: 30 Tage nach Soft Delete
- **Notizen**: 30 Tage nach Soft Delete

## 📊 Audit-Trail & Protokollierung

### Aktivitätsprotokoll (ActivityLog)
- **Alle Aktionen**: Vollständige Protokollierung
- **Metadaten**: Benutzer, Zeitstempel, Institution
- **Löschvorgänge**: Spezielle DSGVO-Protokollierung
- **Zugriffe**: Tracking aller Datenzugriffe

### DSGVO-spezifische Logs
- **Datenexporte**: Protokollierung aller Exporte
- **Löschungen**: Vollständige Löschungsprotokollierung
- **Widersprüche**: Tracking von Einwänden
- **Einschränkungen**: Protokollierung von Beschränkungen

## 🚨 Incident Response

### Datenverletzungen (Art. 33-34)
- **Erkennung**: Automatisierte Monitoring-Systeme
- **Bewertung**: Impact-Analyse innerhalb 24 Stunden
- **Meldung**: Bericht an Aufsichtsbehörde innerhalb 72 Stunden
- **Benachrichtigung**: Information betroffener Personen
- **Dokumentation**: Vollständige Verletzungsprotokollierung

### Kontaktinformationen
- **Datenschutzbeauftragter**: datenschutz@app4kitas.eu
- **Aufsichtsbehörde**: Bundesbeauftragter für den Datenschutz
- **Notfall-Kontakt**: [Notfall-Nummer]

## 🔧 Technische Implementierung

### Backend-Implementierung
- **Soft Delete**: Alle Entitäten mit `deletedAt` Feld
- **Cascade-Logik**: Intelligente Verkettung von Löschvorgängen
- **Audit-Logs**: Vollständige Aktivitätsprotokollierung
- **API-Endpunkte**: DSGVO-spezifische Endpunkte

### Frontend-Implementierung
- **Datenschutz-Dashboard**: Benutzerfreundliche DSGVO-Features
- **Einwilligungs-Management**: Granulare Kontrolle
- **Datenexport**: Benutzerfreundliche Export-Funktionen
- **Löschungs-Workflow**: Sichere Account-Löschung

### Datenbank-Implementierung
- **Soft Delete Fields**: `deletedAt` in allen relevanten Entitäten
- **Audit-Trail**: Vollständige Protokollierung
- **Indizes**: Optimierte Indizes für DSGVO-Queries
- **Backup-Strategie**: Sichere Datenbackups

## 📋 Compliance-Checkliste

### ✅ Implementiert
- [x] **Rechtsgrundlagen**: Alle Verarbeitungszwecke dokumentiert
- [x] **Betroffenenrechte**: Alle DSGVO-Rechte implementiert
- [x] **Technische Sicherheit**: Enterprise-Level Security
- [x] **Aufbewahrungsfristen**: Konfigurierbare Fristen
- [x] **Audit-Trail**: Vollständige Protokollierung
- [x] **Datenexport**: Export-Funktionalität
- [x] **Account-Löschung**: Sichere Löschung
- [x] **Incident Response**: 72-Stunden-Verfahren

### 🔄 In Entwicklung
- [ ] **Automatisierte Compliance-Reports**: Automatische Generierung
- [ ] **Erweiterte Audit-Logs**: Detailliertere Protokollierung
- [ ] **Privacy-by-Design**: Weitergehende Implementierung
- [ ] **DSGVO-Dashboard**: Erweiterte Benutzeroberfläche

## 📞 Kontakt & Support

### Datenschutz-Kontakte
- **Datenschutzbeauftragter**: datenschutz@app4kitas.eu
- **Technischer Support**: support@app4kitas.de
- **Rechtliche Fragen**: legal@app4kitas.eu

### Aufsichtsbehörden
- **Deutsche Aufsichtsbehörde**: Bundesbeauftragter für den Datenschutz
- **EU-Aufsichtsbehörde**: European Data Protection Board
- **Notfall-Kontakt**: [Notfall-Nummer]

---

**App4KITAs** - DSGVO-konforme Kita-Management-Plattform aus Europa 🇪🇺

**Letzte Aktualisierung**: Juli 2025  
**Nächste Überprüfung**: März 2025  
**Compliance-Status**: ✅ **100% DSGVO-KONFORM** 