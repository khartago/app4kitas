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
- **Ersteller**: Erzieher oder Admin
- **Kind**: Bezug zu spezifischem Kind

### Aktivitätsprotokoll (ActivityLog)
- **Aktionen**: Alle Benutzeraktivitäten
- **Metadaten**: Zeitstempel, Institution, Gruppe
- **Details**: Beschreibung der Aktion

## 🎯 Rechtsgrundlagen der Datenverarbeitung

### 1. Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO)
- **Zweck**: Bereitstellung der Kita-Management-Plattform
- **Daten**: Benutzerprofile, Kinderdaten, Check-ins
- **Dauer**: Vertragslaufzeit + gesetzliche Aufbewahrungsfristen

### 2. Berechtigte Interessen (Art. 6 Abs. 1 lit. f DSGVO)
- **Zweck**: System-Sicherheit, Betrugsbekämpfung
- **Daten**: Login-Versuche, Aktivitätsprotokoll
- **Dauer**: 12 Monate für Sicherheitsdaten

### 3. Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)
- **Zweck**: Push-Benachrichtigungen, Marketing (optional)
- **Daten**: Device-Tokens, E-Mail-Adressen
- **Dauer**: Bis Widerruf der Einwilligung

### 4. Öffentliche Interessen (Art. 6 Abs. 1 lit. e DSGVO)
- **Zweck**: Kinderschutz, Aufsichtspflicht
- **Daten**: Anwesenheitsdaten, Notizen
- **Dauer**: Gesetzliche Aufbewahrungsfristen

## 🔐 Technische Sicherheitsmaßnahmen

### Verschlüsselung
- **Übertragung**: TLS 1.3 für alle Verbindungen
- **Speicherung**: Passwörter mit bcrypt gehashed
- **Datenbank**: PostgreSQL mit Verschlüsselung
- **Backup**: Verschlüsselte Backups

### Zugriffskontrolle
- **Authentifizierung**: JWT mit HttpOnly Cookies
- **Autorisierung**: Rollenbasierte Zugriffskontrolle (RBAC)
- **Session-Management**: Sichere Token-Verwaltung
- **Rate Limiting**: Schutz vor Brute-Force-Angriffen

### Datensicherheit
- **Input-Validierung**: Schutz vor XSS und Injection
- **File-Upload-Sicherheit**: Malware-Erkennung
- **CORS-Schutz**: Whitelist-basierte CORS
- **Security Headers**: Helmet.js Implementation

## 📋 Betroffenenrechte (DSGVO Art. 12-22)

### 1. Recht auf Auskunft (Art. 15 DSGVO)
**API-Endpunkt**: `GET /api/gdpr/data-export/:userId`
**Funktionalität**: Export aller personenbezogenen Daten
**Format**: JSON mit strukturierten Daten

### 2. Recht auf Berichtigung (Art. 16 DSGVO)
**API-Endpunkte**:
- `PUT /api/profile` - Benutzerprofil bearbeiten
- `PUT /api/children/:id` - Kinderdaten bearbeiten
- `PUT /api/notes/:id` - Notizen bearbeiten

### 3. Recht auf Löschung (Art. 17 DSGVO)
**API-Endpunkt**: `DELETE /api/gdpr/delete-account/:userId`
**Funktionalität**: Vollständige Datenlöschung
**Einschränkungen**: Gesetzliche Aufbewahrungsfristen

### 4. Recht auf Einschränkung (Art. 18 DSGVO)
**API-Endpunkt**: `PATCH /api/gdpr/restrict/:userId`
**Funktionalität**: Temporäre Einschränkung der Verarbeitung

### 5. Recht auf Datenportabilität (Art. 20 DSGVO)
**API-Endpunkt**: `GET /api/gdpr/data-portability/:userId`
**Format**: Maschinenlesbares Format (JSON)

### 6. Widerspruchsrecht (Art. 21 DSGVO)
**API-Endpunkt**: `POST /api/gdpr/object/:userId`
**Funktionalität**: Widerspruch gegen Datenverarbeitung

## 🗂️ Datenkategorien und Aufbewahrungsfristen

### Benutzerdaten
| Datenkategorie | Aufbewahrung | Löschung |
|----------------|---------------|----------|
| **Aktive Benutzer** | Vertragslaufzeit | 30 Tage nach Kündigung |
| **Gelöschte Benutzer** | 7 Jahre (Steuerrecht) | Automatisch |
| **Login-Versuche** | 12 Monate | Automatisch |
| **Aktivitätsprotokoll** | 3 Jahre | Automatisch |

### Kinderdaten
| Datenkategorie | Aufbewahrung | Löschung |
|----------------|---------------|----------|
| **Aktive Kinder** | Kita-Zugehörigkeit | 30 Tage nach Austritt |
| **Check-in-Daten** | 3 Jahre | Automatisch |
| **Kinderfotos** | Kita-Zugehörigkeit | Sofort bei Austritt |
| **Notizen** | 3 Jahre | Automatisch |

### Nachrichten und Kommunikation
| Datenkategorie | Aufbewahrung | Löschung |
|----------------|---------------|----------|
| **Nachrichten** | 2 Jahre | Automatisch |
| **Dateianhänge** | 2 Jahre | Automatisch |
| **Benachrichtigungen** | 1 Jahr | Automatisch |

### Systemdaten
| Datenkategorie | Aufbewahrung | Löschung |
|----------------|---------------|----------|
| **Backup-Daten** | 30 Tage | Automatisch |
| **Log-Dateien** | 12 Monate | Automatisch |
| **Analytics** | 2 Jahre | Anonymisiert |

## 🔄 Datenverarbeitungsprozesse

### Automatische Löschung
```javascript
// Beispiel: Automatische Löschung alter Daten
const cleanupOldData = async () => {
  // Login-Versuche älter als 12 Monate
  await prisma.failedLogin.deleteMany({
    where: {
      createdAt: { lt: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) }
    }
  });
  
  // Aktivitätsprotokoll älter als 3 Jahre
  await prisma.activityLog.deleteMany({
    where: {
      createdAt: { lt: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000) }
    }
  });
};
```

### Datenexport-Funktionalität
```javascript
// Beispiel: Vollständiger Datenexport
const exportUserData = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      children: true,
      messages: true,
      notifications: true,
      activityLogs: true,
      personalTasks: true,
      notes: true
    }
  });
  
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    },
    children: user.children,
    messages: user.messages,
    notifications: user.notifications,
    activityLogs: user.activityLogs,
    personalTasks: user.personalTasks,
    notes: user.notes
  };
};
```

## 🚨 Datenschutzvorfälle

### Meldepflicht
- **Zeitrahmen**: 72 Stunden nach Bekanntwerden
- **Verantwortlicher**: Datenschutzbeauftragter
- **Betroffene**: Alle betroffenen Personen

### Vorfall-Kategorien
1. **Unbefugter Zugriff** auf personenbezogene Daten
2. **Verlust** von Datenträgern oder Geräten
3. **Cyber-Angriffe** auf das System
4. **Fehlerhafte Datenverarbeitung**

### Notfall-Prozeduren
```javascript
// Beispiel: Datenschutzvorfall-Protokollierung
const logDataBreach = async (incident) => {
  await prisma.dataBreach.create({
    data: {
      type: incident.type,
      description: incident.description,
      affectedUsers: incident.affectedUsers,
      discoveredAt: new Date(),
      reportedAt: new Date(),
      status: 'REPORTED'
    }
  });
};
```

## 📞 Kontakt und Beschwerden

### Datenschutzbeauftragter
- **E-Mail**: datenschutz@app4kitas.eu
- **Telefon**: [Kontaktnummer]
- **Adresse**: [Geschäftsadresse]

### Aufsichtsbehörde
- **Bundesbeauftragter für den Datenschutz und die Informationsfreiheit**
- **Adresse**: Graurheindorfer Str. 153, 53117 Bonn
- **E-Mail**: poststelle@bfdi.bund.de

### Beschwerderecht
Betroffene haben das Recht, Beschwerden bei der zuständigen Aufsichtsbehörde einzulegen.

## 📋 Compliance-Checkliste

### ✅ Implementiert
- [x] Datenschutzerklärung
- [x] Einwilligungsmanagement
- [x] Datenexport-Funktionalität
- [x] Datenlöschung-Funktionalität
- [x] Verschlüsselung aller Daten
- [x] Zugriffskontrolle
- [x] Aktivitätsprotokollierung
- [x] Backup-Strategie
- [x] Incident-Response-Plan

### 🔄 In Entwicklung
- [ ] Automatische Datenlöschung
- [ ] Erweiterte Audit-Logs
- [ ] DSGVO-Dashboard für Admins
- [ ] Automatische Compliance-Reports

### 📋 Geplant
- [ ] Privacy-by-Design-Implementierung
- [ ] Erweiterte Anonymisierung
- [ ] DSGVO-Training für Mitarbeiter
- [ ] Regelmäßige Compliance-Audits

## 📊 Monitoring und Reporting

### Automatische Überwachung
- **Datenzugriffe**: Alle Zugriffe werden protokolliert
- **Anomalien**: Automatische Erkennung verdächtiger Aktivitäten
- **Compliance**: Regelmäßige Prüfung der DSGVO-Konformität

### Berichterstattung
- **Monatlich**: Compliance-Status-Report
- **Vierteljährlich**: Detaillierter DSGVO-Report
- **Jährlich**: Vollständiger Compliance-Audit

## 🔄 Aktualisierungen

Diese DSGVO-Dokumentation wird regelmäßig aktualisiert:
- **Letzte Aktualisierung**: Januar 2025
- **Nächste Überprüfung**: März 2025
- **Version**: 1.0

---

**App4KITAs** - DSGVO-konforme Kita-Management-Plattform aus Europa 🇪🇺 